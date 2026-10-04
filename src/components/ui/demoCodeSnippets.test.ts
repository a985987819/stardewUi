/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
// Type-only, so it contributes nothing at runtime: the snippets are parsed as
// text and must not pull the demo pages into the module graph.
import type * as ts from 'typescript'

const tsc: typeof ts = require('typescript')

/**
 * Every `code` string on a demo page is a copy-paste target, so it has to be
 * valid code.
 *
 * These are template literals in the page source, never compiled and never
 * rendered — nothing in the build touches them. That is exactly why they drift:
 * a demo page renders fine while the snippet next to it is broken, and the only
 * person who finds out is a user who pastes it.
 *
 * What actually shipped broken:
 *   - TextareaDemo had `<StarTextarea ... message="Too short.">` with no closing
 *     bracket or tag, so the snippet was a JSX parse error.
 *   - The same file's async-validation example used `const status = ...` — not
 *     valid JavaScript — and referenced `message` and `pack`, which were never
 *     declared anywhere in the snippet.
 *   - NineSliceButtonDemo's array-length guard (in demoApiCoverage) only checks
 *     that a variant *count* matches; it never looks at whether the surrounding
 *     snippet parses.
 *
 * So this file parses each snippet as JavaScript/JSX and fails on a syntax
 * error, then separately checks for the specific "copied but undeclared" shape
 * that parses fine yet cannot run.
 *
 * The parse uses the TypeScript compiler already in the dependency tree rather
 * than a hand-rolled JSX stripper: hand-rolled strippers are the thing that
 * lets broken code through in the first place.
 */

const PAGES_DIR = resolve(process.cwd(), 'src/pages')

/**
 * `const fooCode = \`...\``
 *
 * Hand-rolled rather than a regex, because a snippet may legitimately contain
 * an *escaped* backtick or `${...}`: `const key = \`\${page}-\${index}\``. A
 * non-greedy `` `([\s\S]*?)` `` stops at that escaped backtick and silently
 * yields half a snippet — which then reads as a syntax error in the snippet
 * rather than as a bug in the extractor. (That cost a debugging round here.)
 *
 * So: find the opening backtick, then walk forward tracking escapes until an
 * unescaped backtick closes it.
 */
function* codeStrings(text: string): Generator<{ name: string; source: string }> {
  const decl = /const\s+(\w*[cC]ode\w*)\s*=\s*`/g

  for (const match of text.matchAll(decl)) {
    const name = match[1]
    let index = match.index + match[0].length

    let source = ''
    let escaped = false
    for (; index < text.length; index += 1) {
      const char = text[index]
      if (escaped) {
        source += char
        escaped = false
        continue
      }
      if (char === '\\') {
        // Keep the backslash: the parser downstream needs to see the escape.
        source += char
        escaped = true
        continue
      }
      if (char === '`') break
      source += char
    }

    // What gets *rendered* is the template literal's value, not its source: a
    // snippet containing `` const key = `\`${page}\`` `` shows up on the page
    // without the backslashes. Unescape the three forms a template literal
    // defines so the parser sees what a reader would copy.
    yield { name, source: source.replace(/\\`/g, '`').replace(/\\\$\{/g, '${').replace(/\\\\/g, '\\') }
  }
}

interface ParsedSnippet {
  file: string
  name: string
  source: string
}

function collectSnippets(): ParsedSnippet[] {
  const files = readdirSync(PAGES_DIR).filter((name) => name.endsWith('Demo.tsx'))
  const snippets: ParsedSnippet[] = []

  for (const file of files) {
    const text = readFileSync(resolve(PAGES_DIR, file), 'utf8')
    for (const snippet of codeStrings(text)) {
      snippets.push({ file, ...snippet })
    }
  }

  return snippets
}

const snippets = collectSnippets()

describe('demo code snippets', () => {
  it('finds the snippets to check', () => {
    // If this ever drops to zero the regex silently stopped matching and every
    // test below would pass without checking anything.
    expect(snippets.length).toBeGreaterThan(50)
  })

  it.each(snippets.map((s) => [`${s.file}: ${s.name}`, s] as const))(
    '%s parses as valid TSX',
    (_label, snippet) => {
      const errors = parseTsx(snippet.source)
      expect(
        errors,
        `${snippet.file} → ${snippet.name} has a syntax error:\n${errors}`,
      ).toEqual([])
    },
  )

  it.each(snippets.map((s) => [`${s.file}: ${s.name}`, s] as const))(
    '%s has no undeclared identifier in a JSX body',
    (_label, snippet) => {
      // A snippet can parse and still be unrunnable: `<Foo onClick={pack} />`
      // is syntactically perfect with `pack` never defined. The bundler's
      // component names are treated as declared, since a snippet is a fragment
      // that imports them from the published package.
      const free = findFreeReferences(snippet.source)
      expect(
        free,
        `${snippet.file} → ${snippet.name} references identifiers it never declares or imports: ${free.join(', ')}`,
      ).toEqual([])
    },
  )
})

/**
 * Parse with the bundled TypeScript. Returns formatted **syntax** diagnostics,
 * empty when the source is valid.
 *
 * `ts.getPreEmitDiagnostics` also reports semantic errors ("Cannot find name
 * 'StarCard'"), which are expected here: a snippet is a fragment that imports
 * from a package that is not installed in this context. Only
 * `category === DiagnosticCategory.Error` *within the source file* counts, and
 * the lib is left on so the parser still knows JSX and the global grammar.
 */
function parseTsx(source: string): string[] {
  const fileName = 'snippet.tsx'
  const sourceFile = tsc.createSourceFile(
    fileName,
    source,
    tsc.ScriptTarget.ESNext,
    true,
    tsc.ScriptKind.TSX,
  )

  // `parseDiagnostics` is marked internal on `SourceFile`, so reach for it
  // deliberately: a full `Program` would report semantic errors too, which is
  // the wrong question here.
  const parseDiagnostics = (sourceFile as unknown as {
    parseDiagnostics?: ts.DiagnosticWithLocation[]
  }).parseDiagnostics ?? []

  return parseDiagnostics.map((d) => {
    const message = tsc.flattenDiagnosticMessageText(d.messageText, ' ')
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(d.start ?? 0)
    return `line ${line + 1}:${character + 1} ${message}`
  })
}

/**
 * Names a snippet *reads* without declaring or importing them.
 *
 * The first cut of this was a regex over `{...}` expressions, and it was
 * useless: it flagged object-literal keys (`{ type: 'info' }`), JSX text
 * (`{notices.map(...)}` neighbours), and every word inside a string. 39 of 80
 * snippets "failed" and the signal was zero.
 *
 * So this asks the compiler instead. A `Program` with an ambient module
 * declaration gives every `import ... from 'stardew-valley-ui'` a real symbol,
 * and the checker's "cannot find name" diagnostic then means exactly one thing:
 * a genuinely free reference. That is the same class of error `tsc` reports when
 * a user pastes the snippet into a file that has the package installed.
 */
function findFreeReferences(source: string): string[] {
  const fileName = 'snippet.tsx'

  // Stand-in for the published package: anything a snippet imports from it
  // resolves, so the only unresolved names left are the interesting ones.
  const ambient = `
declare module 'stardew-valley-ui' {
  const anything: any
  export = anything
}
declare const __jsx: any
declare namespace JSX { interface IntrinsicElements { [name: string]: any } }
`

  const files: Record<string, string> = {
    [fileName]: source,
    '__ambient.d.ts': ambient,
  }

  const options: ts.CompilerOptions = {
    noEmit: true,
    jsx: tsc.JsxEmit.React,
    target: tsc.ScriptTarget.ESNext,
    module: tsc.ModuleKind.ESNext,
    moduleResolution: tsc.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    // Type errors are not the question; only unresolved names are. Turning
    // this off keeps the diagnostic list down to what we actually inspect.
    noImplicitAny: false,
  }

  const host = tsc.createCompilerHost(options)
  const originalGet = host.getSourceFile.bind(host)
  host.getSourceFile = (name, languageVersion, onError, shouldCreate) => {
    if (files[name] !== undefined) {
      return tsc.createSourceFile(name, files[name], languageVersion, true, tsc.ScriptKind.TSX)
    }
    return originalGet(name, languageVersion, onError, shouldCreate)
  }
  host.fileExists = (name) => files[name] !== undefined || tsc.sys.fileExists(name)
  host.readFile = (name) => files[name] ?? tsc.sys.readFile(name)

  const program = tsc.createProgram([fileName, '__ambient.d.ts'], options, host)
  const checker = program.getTypeChecker()
  const snippet = program.getSourceFile(fileName)
  if (!snippet) return ['<could not parse>']

  const free = new Set<string>()

  /**
   * A JSX tag name is not a variable reference — `<StarCard />` resolves
   * through JSX.IntrinsicElements or the import, and the checker has no symbol
   * for the element name itself. Same for a property access tail (`a.b`), an
   * object-literal key (`{ type: 'info' }`), and a binding name. All of those
   * are positions where a name is *written*, not read.
   */
  const isWrittenPosition = (node: ts.Identifier): boolean => {
    const parent = node.parent
    if (tsc.isJsxOpeningElement(parent) || tsc.isJsxClosingElement(parent) || tsc.isJsxSelfClosingElement(parent)) {
      return parent.tagName === node
    }
    if (tsc.isJsxAttribute(parent)) return parent.name === node
    if (tsc.isPropertyAccessExpression(parent)) return parent.name === node
    if (tsc.isPropertyAssignment(parent)) return parent.name === node
    if (tsc.isShorthandPropertyAssignment(parent)) return parent.name === node
    if (tsc.isBindingElement(parent)) return parent.propertyName === node
    if (tsc.isVariableDeclaration(parent) || tsc.isParameter(parent) || tsc.isFunctionDeclaration(parent)) {
      return parent.name === node
    }
    if (tsc.isTypeReferenceNode(parent) || tsc.isTypeQueryNode(parent)) return true
    return false
  }

  const visit = (node: ts.Node) => {
    if (tsc.isIdentifier(node)) {
      // Only names in *value* position that resolve to nothing. Type positions
      // are skipped wholesale: a snippet's annotations are often loose, and
      // "cannot find name Foo" for a type is not what a reader trips over.
      if (!isWrittenPosition(node) && !checker.getSymbolAtLocation(node)) {
        free.add(node.text)
      }
    }
    tsc.forEachChild(node, visit)
  }

  visit(snippet)
  return [...free]
}
