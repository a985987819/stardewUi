/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
// Type-only, so it contributes nothing at runtime: the helpers below parse page
// sources as text and must not pull the pages into the module graph.
import type * as ts from 'typescript'

const tsc: typeof ts = require('typescript')

/**
 * Keeps each demo page's API table honest about the component it documents.
 *
 * The failure this prevents is real and had already happened: `Popup` shipped
 * `onOpenChange` for months with no API row, `Rating` never documented its
 * `onChange` (which passes a `number`, not the DOM event, so a reader could not
 * have guessed it), and `NineSliceButton`'s `variant` listed 7 of its 12 values
 * — so the table actively lied about what the component accepts.
 *
 * How it works: parse the `export interface StarXxxProps` body for its member
 * names, parse the demo page's `apiData` for its `property` strings, and require
 * every documented-worthy prop to appear. Deliberately textual rather than
 * compiler-driven — a type-level approach would need each demo page exported
 * under a uniform name, and the value here is catching drift on every save.
 *
 * Two exclusions, both intentional:
 *   - Props whose only job is to forward to the DOM (`onClick` and friends,
 *     `className`, `style`, `ref`, `id`) — `POPOVER_ONLY` / `PASS_THROUGH`.
 *   - Props where the demo *does* exercise them but a table row adds nothing
 *     beyond noise. Each one below names its reason.
 */

const UI_DIR = resolve(process.cwd(), 'src/components/ui')
const PAGES_DIR = resolve(process.cwd(), 'src/pages')

const read = (path: string) => readFileSync(path, 'utf8')

/** Forwarded straight to the DOM with no component-specific meaning. */
const PASS_THROUGH = new Set([
  'className',
  'style',
  'id',
  'key',
  'ref',
  'tabIndex',
  'type',
])

/**
 * Documented in prose on the demo card but deliberately not given a table row,
 * because the row would only restate the prop's own name.
 */
const OMITTED_BUT_INTENTIONALLY_UNDOCUMENTED: Record<string, string[]> = {
  // The whole card is about labelling; a row per aria-label adds nothing.
  Badge: [],
  Checkbox: [],
  Radio: [],
  Rating: [],
  Select: [],
  Switch: [],
  // `index.ts` exports the type name; the row is on TabDemo's item table.
  Tab: [],
  // Positions are covered by the placement demo card.
  Popup: ['closeOnEscape'],
}

/** Members that are types or helpers rather than props. */
const NON_PROP_MEMBERS = new Set([
  'StarTabItem',
  'PopupPlacement',
  'DialogAction',
  'MessageAction',
  'CalendarItem',
  'CollapseItem',
])

interface ParsedApiRow {
  property: string
  hasType: boolean
  hasDefault: boolean
}

/**
 * Read one row object's fields.
 *
 * Both quote styles appear in the tables: a union of string literals has to be
 * written with double quotes so the inner single quotes survive
 * (`type: "'square' | 'circle'"`), while a plain type uses single quotes
 * (`type: 'string'`). Accepting only one of them made every union-typed row look
 * like it was missing its type.
 */
function parseRow(raw: string): ParsedApiRow {
  const property = raw.match(/property:\s*'([^']+)'/)?.[1] ?? ''

  return {
    property,
    hasType: /type:\s*['"]/.test(raw),
    hasDefault: /default:\s*/.test(raw),
  }
}

/**
 * Slice the rows out of one `zh: [...]` / `en: [...]` array.
 *
 * Anchored on `property:` rather than on braces because these rows contain
 * braces *inside* their type strings (`{ top: number; left: number }` for
 * `backgroundInsets`) and inside nested literals. Brace matching at one level of
 * nesting silently merged or truncated rows in the components that use them.
 */
function extractRows(body: string): ParsedApiRow[] {
  const starts = [...body.matchAll(/\{[^{}]*property:\s*'/g)]
  if (starts.length === 0) return []

  return starts.map((match, index) => {
    const start = match.index ?? 0
    const end = index + 1 < starts.length ? (starts[index + 1].index ?? body.length) : body.length
    return parseRow(body.slice(start, end))
  })
}

/**
 * Slice the rows out of one `zh: [...]` / `en: [...]` array.
 *
 * Three things this has to survive, all present in the repo:
 *   - Some demos declare `apiData` across multiple lines, others collapse it
 *     onto one (`EmptyStateDemo`, `CardDemo`, `TypewriterDemo`). Anchoring on a
 *     leading newline silently found nothing in the single-line files.
 *   - Several demos have more than one `zh:` key — a `copy` block above, a
 *     `QUEST_POOL`, seasonal labels. Searching the whole file matched the first
 *     one, which is frequently not the API table at all. So the search is scoped
 *     to the `apiData` declaration.
 *   - Row objects contain braces *inside* their type strings
 *     (`{ top: number; left: number }` for `backgroundInsets`). Brace matching
 *     silently merged or truncated those rows.
 *
 * The array is located by counting `[` / `]`, which is safe because none of the
 * type strings contain brackets.
 */
function sliceArray(text: string, lang: 'zh' | 'en'): string | null {
  const declIndex = text.indexOf('apiData')
  if (declIndex === -1) return null

  const region = text.slice(declIndex)
  const keyMatch = region.match(new RegExp(`\\b${lang}\\s*:\\s*\\[`))
  if (!keyMatch?.index) return null

  const open = region.indexOf('[', keyMatch.index)
  let depth = 0

  for (let i = open; i < region.length; i += 1) {
    if (region[i] === '[') depth += 1
    if (region[i] === ']') {
      depth -= 1
      if (depth === 0) return region.slice(open + 1, i)
    }
  }

  return null
}

function parseApiData(pageFile: string): { zh: ParsedApiRow[]; en: ParsedApiRow[] } {
  const text = read(pageFile)
  const side = (lang: 'zh' | 'en') => {
    const body = sliceArray(text, lang)
    return body ? extractRows(body) : []
  }

  return { zh: side('zh'), en: side('en') }
}

/**
 * A row may document two props at once as `value / defaultValue`. Expand those
 * so a covered prop is not reported as missing.
 */
function expandProperty(property: string) {
  return property
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
}

function parseProps(componentFile: string): string[] {
  const text = read(componentFile)
  // `StarXxxProps` is either `export interface StarXxxProps {...}` or
  // `export type StarXxxProps = {... & {...}}`.
  const iface = text.match(/export interface Star\w+Props[^{]*\{([\s\S]*?)\n\}/)
  const alias = text.match(/export type Star\w+Props\s*=\s*\{([\s\S]*?)\n\}/)
  const body = iface?.[1] ?? alias?.[1] ?? ''

  const members = new Set<string>()
  // Only line-initial members; indented lines are nested object literals.
  for (const line of body.split('\n')) {
    const member = line.match(/^\s{2}(\w+)\??:/)
    if (member) members.add(member[1])
    // Intersection members: `export type X = Base & { extra: ... }`
    const extra = line.match(/^\s{2}(\w+)\?:/)
    if (extra) members.add(extra[1])
  }

  return [...members].filter((name) => !PASS_THROUGH.has(name) && !NON_PROP_MEMBERS.has(name))
}

const uiFiles = readdirSync(UI_DIR).filter(
  (f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'),
)
const pageNames = new Set(readdirSync(PAGES_DIR).filter((f) => f.endsWith('Demo.tsx')))

/**
 * Components with a demo page, as bare base names (`Switch`, not `Switch.tsx`).
 *
 * The pairing must be `Switch.tsx` → `SwitchDemo.tsx`; internal helpers
 * (`CalendarGrid`, `MessageCard`, `WheelColumn`, …) have no page and are dropped.
 */
const documented = uiFiles
  .map((f) => f.replace(/\.tsx$/, ''))
  .filter((name) => pageNames.has(`${name}Demo.tsx`))

describe('demo API tables match their component props', () => {
  it('finds a demo page for most components (guard against a silent empty loop)', () => {
    // This assertion exists because `it.each([])` passes vacuously: an earlier
    // revision of this file had a filename-matching bug, produced an empty
    // list, and every per-component check below silently reported success.
    expect(documented.length).toBeGreaterThanOrEqual(25)
  })

  it.each(documented)('%s documents every non-passthrough prop', (componentName) => {
    const props = parseProps(resolve(UI_DIR, `${componentName}.tsx`))
    const { zh, en } = parseApiData(resolve(PAGES_DIR, `${componentName}Demo.tsx`))

    // A demo page that ships no apiData at all is a different failure; skip
    // rather than report every prop as missing.
    if (zh.length === 0 && en.length === 0) return

    const ignored = new Set(OMITTED_BUT_INTENTIONALLY_UNDOCUMENTED[componentName] ?? [])
    const documentedProps = new Set(zh.flatMap((row) => expandProperty(row.property)))
    const missing = props.filter((name) => !ignored.has(name) && !documentedProps.has(name))

    expect(
      missing,
      `${componentName}: these props are missing from the API table — add a zh+en row, or list them in OMITTED_BUT_INTENTIONALLY_UNDOCUMENTED with a reason`,
    ).toEqual([])
  })

  it.each(documented)('%s has the same property set on both language sides', (componentName) => {
    const { zh, en } = parseApiData(resolve(PAGES_DIR, `${componentName}Demo.tsx`))
    if (zh.length === 0 && en.length === 0) return

    // Compare counts and positions, not the literal names: one row is itself
    // localized (`（固定外观）` vs `(fixed look)`), so a strict set comparison
    // reported a false mismatch on a table that was already correct.
    expect(en).toHaveLength(zh.length)
    for (const [index, row] of zh.entries()) {
      const other = en[index]
      expect(other, `row ${index} (${row.property}) exists on zh but not en`).toBeDefined()
      expect(other.hasType, `en row ${index} missing type`).toBe(row.hasType)
      expect(other.hasDefault, `en row ${index} missing default`).toBe(row.hasDefault)
    }
  })

  it.each(documented)('%s gives every row a type and a default', (componentName) => {
    const { zh, en } = parseApiData(resolve(PAGES_DIR, `${componentName}Demo.tsx`))
    if (zh.length === 0 && en.length === 0) return

    const incomplete = [...zh, ...en].filter((row) => !row.hasType || !row.hasDefault)
    expect(
      incomplete.map((r) => r.property),
      `${componentName}: rows missing type or default`,
    ).toEqual([])
  })

  it('NineSliceButton lists every variant value the component accepts', () => {
    // A one-off guard with a specific history: the table advertised
    // `default | primary | warning | danger | dashed | text | link` while the
    // component also accepted secondary, info, success, disabled, and concise.
    const page = read(resolve(PAGES_DIR, 'NineSliceButtonDemo.tsx'))

    // Pull the raw type string rather than a parsed field: the row is
    // double-quoted (its value contains single quotes) and the earlier regex
    // only matched single-quoted types.
    const rowText = page.match(/property: 'variant', description: '按钮类型', type: "([^"]+)"/)?.[1]
    expect(rowText, 'the zh variant row no longer matches; re-check this guard').toBeDefined()

    expect(declaredVariants().length).toBeGreaterThan(7)
    for (const value of declaredVariants()) {
      expect(rowText, `variant '${value}' is accepted by the component but absent from the table`).toContain(value)
    }
  })

  it('NineSliceButton renders every variant in the gallery, not just a few', () => {
    // The table listed twelve while the page showed four, so the documented
    // options could not be discovered by clicking. The gallery is a const array
    // whose entries are single-quoted literals; its length must match the
    // component's own union exactly.
    const page = read(resolve(PAGES_DIR, 'NineSliceButtonDemo.tsx'))
    const gallery = page.match(/const ALL_VARIANTS = \[([\s\S]*?)\] as const/)?.[1]
    expect(gallery, 'the ALL_VARIANTS gallery disappeared; re-check this guard').toBeDefined()

    const shown = (gallery!.match(/'([a-z]+)'/g) ?? []).map((m) => m.replace(/'/g, ''))

    expect(shown).toEqual(declaredVariants())
  })

  it('every demo array has the same length in both languages', () => {
    // `satisfies Record<Lang, …>` already guarantees matching *keys*, so a
    // length mismatch inside an array is the one class of desync it cannot
    // catch: `t.labels[5]` would silently be `undefined` on the shorter side
    // rather than a compile error. Reported here so a desync is a red test.
    //
    // Counted by parsing rather than by `split(',')`. That shortcut was wrong
    // in two ways, both of which had already produced false results here:
    //   - A comma *inside* an element inflates the count. English copy is full
    //     of them ("Wednesday, 9 AM"), so the English side read longer than the
    //     Chinese and the test blamed a desync that did not exist.
    //   - The block boundaries were matched with `\n\s*`, which never fires on
    //     this repo's CRLF files, so the whole check silently skipped several
    //     pages — a green test that had never looked.
    const pageFiles = readdirSync(PAGES_DIR).filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))

    for (const file of pageFiles) {
      const text = read(resolve(PAGES_DIR, file))
      const counts = arrayLengthsByLang(text)
      if (!counts) continue

      for (const [key, count] of Object.entries(counts.zh)) {
        if (!(key in counts.en)) continue
        expect(
          counts.en[key],
          `${file}: array '${key}' has ${count} zh entries but ${counts.en[key]} en entries`,
        ).toBe(count)
      }
    }
  })
})

/**
 * Entry counts for every array literal in a demo page's `copy.zh` / `copy.en`,
 * or `null` when the page has no such pair.
 *
 * Uses the TypeScript parser so nested arrays, commas inside strings, and CRLF
 * line endings are all handled the way the language actually reads them.
 */
function arrayLengthsByLang(text: string): { zh: Record<string, number>; en: Record<string, number> } | null {
  const source = tsc.createSourceFile('page.tsx', text, tsc.ScriptTarget.ESNext, true, tsc.ScriptKind.TSX)

  const result: { zh: Record<string, number>; en: Record<string, number> } = { zh: {}, en: {} }

  const visit = (node: ts.Node) => {
    if (tsc.isVariableDeclaration(node) && tsc.isIdentifier(node.name) && node.name.text === 'copy') {
      // `const copy = {…} satisfies Record<…>` parses as a SatisfiesExpression
      // wrapping the literal, so unwrap before looking for zh / en.
      const init = unwrapSatisfies(node.initializer)
      if (init && tsc.isObjectLiteralExpression(init)) {
        for (const lang of ['zh', 'en'] as const) {
          const prop = init.properties.find(
            (p): p is ts.PropertyAssignment =>
              tsc.isPropertyAssignment(p) &&
              tsc.isIdentifier(p.name) &&
              p.name.text === lang,
          )
          if (!prop || !tsc.isObjectLiteralExpression(prop.initializer)) continue
          for (const entry of prop.initializer.properties) {
            if (!tsc.isPropertyAssignment(entry) || !tsc.isIdentifier(entry.name)) continue
            if (!tsc.isArrayLiteralExpression(entry.initializer)) continue
            result[lang][entry.name.text] = entry.initializer.elements.length
          }
        }
      }
    }
    tsc.forEachChild(node, visit)
  }

  visit(source)
  return Object.keys(result.zh).length > 0 || Object.keys(result.en).length > 0 ? result : null
}

/** Peel `expr satisfies T` / `expr as T` wrappers off an initializer. */
function unwrapSatisfies(node: ts.Expression | undefined): ts.Expression | undefined {
  if (!node) return undefined
  if (tsc.isSatisfiesExpression(node) || tsc.isAsExpression(node) || tsc.isParenthesizedExpression(node)) {
    return unwrapSatisfies(node.expression)
  }
  return node
}

/** The `variant` union as declared by the component. */
function declaredVariants(): string[] {
  const component = read(resolve(UI_DIR, 'NineSliceButton.tsx'))
  const body = component.match(/export type NineSliceButtonVariant\s*=\s*([\s\S]*?)\nexport type/)?.[1] ?? ''

  return body
    .split('\n')
    .map((line) => line.trim().replace(/^[|]\s*/, '').replace(/^'|'$/g, ''))
    .filter(Boolean)
}