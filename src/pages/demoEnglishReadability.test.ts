/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards the English experience of the demo site.
 *
 * Every demo page keeps its prose in a `copy.zh` / `copy.en` pair, so the
 * narrative is translated. What that pattern does *not* cover is the code
 * samples: `code={'...'}` strings are plain literals, and three of them had
 * drifted into Chinese-only content. In English mode a reader copies the
 * sample, pastes it into their project, and gets `<StarSelect
 * placeholder="选择工具">` — a component whose visible copy contradicts the
 * page they read it on.
 *
 * A code sample is different from prose in one important way: it gets copied.
 * A Chinese sentence on screen is a translation gap; a Chinese string literal
 * inside a copy button is a bug in the artifact the reader walks away with.
 *
 * Deliberately narrow. The demo pages hold ~14k Chinese characters, almost all
 * of it inside the `zh` half of those pairs, and a blanket "no Chinese here"
 * rule would fail on every page. This only inspects `code={...}` literals, and
 * allows the ones that exist to show CJK text on purpose.
 */

/** Samples whose subject *is* Chinese text, so Chinese is the payload. */
const INTENTIONAL_CJK_SAMPLES = new Set([
  // TitleDemo demonstrates that StarTitle renders CJK glyphs at the same pixel
  // weight as latin ones. The Chinese is the example, not untranslated chrome.
  'TitleDemo.tsx',
])

const pagesDir = resolve(process.cwd(), 'src/pages')

/**
 * The Chinese that an English reader would actually receive.
 *
 * A `lang === 'zh' ? '<Chinese>' : '<English>'` ternary is the *fix*, not a
 * violation: the Chinese sits in the branch that English mode never selects.
 * Scanning the whole literal flagged it anyway, and scanning only string
 * literals could not tell the two apart, so the ternary branches are split
 * first and the English branch is checked on its own.
 *
 * Matching a single-line `code={...}` also has to survive nested `}` in JSX
 * expressions (`options={[{ value: "hoe" }]}`), which is why this walks to the
 * matching brace rather than stopping at the first one.
 */
function codeLiterals(file: string): string[] {
  const source = readFileSync(join(pagesDir, file), 'utf8')
  const out: string[] = []

  for (const m of source.matchAll(/code=\{/g)) {
    let depth = 1
    let i = m.index + m[0].length

    while (i < source.length && depth > 0) {
      const ch = source[i]
      if (ch === '{') depth++
      else if (ch === '}') depth--
      i++
    }

    out.push(source.slice(m.index + m[0].length, i - 1))
  }

  // A `//` line comment can precede the expression inside the braces, and it is
  // never rendered. Strip them so the BackToTopDemo's `// 换页时替路由飞走一次`
  // does not read as an untranslated code sample.
  return out.map((literal) => literal.replace(/^\s*\/\/[^\n]*\n/gm, ''))
}

/**
 * Reduce a code-sample literal to the text an English reader would see.
 *
 * Splitting on the first `:` is wrong: the Chinese branch is full of them
 * (`label: "锄头"`), as is any object literal inside a ternary result. The scan
 * therefore tracks quote state and bracket depth so only a colon sitting at the
 * top level of the ternary counts as the separator.
 */
function englishBranch(literal: string): string {
  const condition = /lang\s*===\s*'zh'\s*\?/.exec(literal)
  if (!condition) return literal

  let depth = 0
  let quote: string | null = null

  for (let i = condition.index + condition[0].length; i < literal.length; i++) {
    const ch = literal[i]

    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = null
      continue
    }

    if (ch === "'" || ch === '"' || ch === '`') quote = ch
    else if (ch === '{' || ch === '[' || ch === '(') depth++
    else if (ch === '}' || ch === ']' || ch === ')') depth--
    else if (ch === ':' && depth === 0) return literal.slice(i + 1)
  }

  return literal
}

const demoPages = readdirSync(pagesDir).filter((n) => n.endsWith('Demo.tsx'))

describe('demo code samples are copy-pasteable in English', () => {
  it('found code samples to check', () => {
    // Guards against the matchers above silently degrading to zero matches,
    // which would make every assertion below pass for the wrong reason.
    const total = demoPages.reduce((sum, f) => sum + codeLiterals(f).length, 0)
    expect(total).toBeGreaterThan(50)
  })

  it.each(demoPages.filter((f) => !INTENTIONAL_CJK_SAMPLES.has(f)))(
    '%s has no Chinese hardcoded in a code sample',
    (file) => {
      const offenders = codeLiterals(file).filter((literal) =>
        /[\u4e00-\u9fa5]/.test(englishBranch(literal)),
      )

      expect(
        offenders,
        `${file}: code sample contains Chinese, so English-mode readers copy Chinese copy into their project.\n` +
          '           Gate it on `lang` like SelectDemo does, or add the file to INTENTIONAL_CJK_SAMPLES\n' +
          `           if the sample is specifically about CJK rendering:\n${offenders.join('\n')}`,
      ).toEqual([])
    },
  )

  it('intentional CJK samples still contain the CJK they claim to demo', () => {
    // The allowlist must not rot into "we stopped checking this file".
    for (const file of INTENTIONAL_CJK_SAMPLES) {
      const offenders = codeLiterals(file).filter((l) => /[\u4e00-\u9fa5]/.test(l))
      expect(offenders.length, `${file} is allowlisted but no longer has a CJK sample`).toBeGreaterThan(0)
    }
  })
})

describe('demo pages pair their prose in both languages', () => {
  it.each(demoPages)('%s declares both zh and en copy', (file) => {
    const source = readFileSync(join(pagesDir, file), 'utf8')

    // A page that lost its English half would still render, just monolingually,
    // and nothing else would notice. Every page opts into the `copy` shape via
    // `satisfies Record<Lang, ...>`, so both keys are structurally required.
    expect(source, `${file} lost its en copy`).toMatch(/\ben:\s*\{/)
    expect(source, `${file} lost its zh copy`).toMatch(/\bzh:\s*\{/)
  })

  it('keeps the two languages structurally in step', () => {
    // Catches the drift that actually happens: a key added to zh and forgotten
    // in en, which surfaces to English readers as `undefined` in the page.
    const mismatches: string[] = []

    for (const file of demoPages) {
      const source = readFileSync(join(pagesDir, file), 'utf8')

      // Only the top-level `const copy = { zh: {...}, en: {...} }` literal.
      const start = source.indexOf('zh: {')
      const enStart = source.indexOf('en: {', start)
      if (start === -1 || enStart === -1) continue

      const zhBody = source.slice(start, enStart)
      const enBody = source.slice(enStart, source.indexOf('} satisfies', enStart))

      const keysOf = (body: string) =>
        new Set([...body.matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1]))

      const zhKeys = keysOf(zhBody)
      const enKeys = keysOf(enBody)

      for (const key of zhKeys) {
        if (!enKeys.has(key)) mismatches.push(`${file}: zh has "${key}" but en does not`)
      }
    }

    expect(mismatches, mismatches.join('\n')).toEqual([])
  })
})