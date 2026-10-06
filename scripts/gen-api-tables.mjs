// Generates the API reference tables in README.md from the demo sources.
//
// Why generate instead of hand-writing both READMEs:
//
// The demo pages already carry their prop tables twice — `apiData.zh` and
// `apiData.en` — because the site itself switches language. The prop *names*
// and *types* are therefore identical across languages by construction, and
// only the `description` text differs. That makes a translated table a pure
// function of data that already exists.
//
// Hand-maintaining it meant ~1600 lines of English tables that nothing
// checked. A prop renamed in the source left the README describing a prop
// that no longer existed, which is worse than no table: the reader trusts it.
// `readmeCoverage.test.ts` catches a *missing* row but never a wrong one.
//
// So: parse `apiData` out of each demo page, emit the English table, and let
// the test suite verify the output still matches the declarations. Run with
// `--check` in CI to fail when the generated file is stale.
//
//   node scripts/gen-api-tables.mjs           # rewrite the English section
//   node scripts/gen-api-tables.mjs --check   # exit 1 if stale

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const projectRoot = path.resolve(import.meta.dirname, '..')
const pagesDir = path.join(projectRoot, 'src/pages')
const targetPath = path.join(projectRoot, 'README.md')

const MARKER_START = '<!-- API-TABLES:START -->'
const MARKER_END = '<!-- API-TABLES:END -->'

/**
 * Extract the `en` array from a demo page's `apiData` literal.
 *
 * Rather than parse the file as a module (it imports React, SCSS and JSX),
 * this reads the object literal textually: find `apiData`, then walk braces
 * from the `en:` key to its matching close. Good enough for a file the
 * project controls, and it fails loudly when the shape changes instead of
 * silently emitting nothing.
 */
function extractEnglishRows(source, file) {
  const anchor = source.indexOf('apiData')
  if (anchor === -1) return null

  // `indexOf('en:')` is not good enough: DialogDemo has the text "en:" inside a
  // description string, and a plain substring search happily locks onto it and
  // then reads `[]` as the row array. Require the key to be followed by an
  // array literal, which excludes prose occurrences like "…often: [" while
  // still matching both the multi-line and the single-line object forms.
  const enOffset = source.slice(anchor).search(/\ben:\s*\[/)
  if (enOffset === -1) return null

  const bracket = source.indexOf('[', anchor + enOffset)
  if (bracket === -1) return null

  let depth = 0
  // Start one character *before* the bracket so the loop counts it on the first
  // iteration; starting at the bracket itself would read its own closer as the
  // matching end and produce an empty body.
  let i = bracket - 1
  for (; i < source.length; i++) {
    const ch = source[i]
    if (ch === '{' || ch === '[' || ch === '(') depth++
    else if (ch === '}' || ch === ']' || ch === ')') {
      depth--
      if (depth === 0) break
    } else if (ch === "'" || ch === '"') {
      // Skip string literals so a `']'` inside a description cannot end the walk.
      const quote = ch
      i++
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i++
        i++
      }
    }
  }

  const body = source.slice(bracket + 1, i)

  const rows = []
  // Each row is `{ property: '…', description: '…', type: '…', default: '…' }`.
  const rowRe = /\{\s*property:\s*'([^']*)'\s*,\s*description:\s*'([^']*)'\s*,\s*type:\s*(.*?)\s*,\s*default:\s*(.*?)\s*(?:,\s*required:\s*(true)\s*)?\}/gs

  for (const m of body.matchAll(rowRe)) {
    const [, property, description, type, defValue, required] = m

    // Types and defaults arrive already quoted because that is how the source
    // literal stores them — unions use single quotes inside a double-quoted
    // string (`type: "'small' | 'medium'"`), plain values use a bare literal
    // (`default: '600'` is `'600'`, `default: 600` is bare). Strip exactly one
    // layer of either quote style; the markdown backticks re-quote for display.
    const unquote = (text) => {
      const trimmed = text.trim()
      if (/^"[\s\S]*"$/.test(trimmed)) return trimmed.slice(1, -1)
      if (/^'[\s\S]*'$/.test(trimmed)) return trimmed.slice(1, -1)
      return trimmed
    }

    rows.push({
      property,
      description,
      type: unquote(type),
      default: unquote(defValue),
      required: Boolean(required),
    })
  }

  if (rows.length === 0) {
    throw new Error(`${file}: found apiData but parsed 0 English rows — the literal's shape changed.`)
  }

  return rows
}

/** Escape the pipes inside a union type so they do not break the table. */
const cell = (text) => String(text).replace(/\|/g, '\\|')

function renderTable(rows) {
  const lines = [
    '| Property | Type | Default | Description |',
    '| --- | --- | --- | --- |',
  ]

  for (const row of rows) {
    lines.push(
      `| \`${row.property}\` | \`${cell(row.type)}\` | \`${cell(row.default)}\` | ${row.description}${row.required ? ' **Required.**' : ''} |`,
    )
  }

  return lines.join('\n')
}

const { readdir } = await import('node:fs/promises')
const demoFiles = (await readdir(pagesDir)).filter((n) => n.endsWith('Demo.tsx')).sort()

const sections = []
const skipped = []

for (const file of demoFiles) {
  const source = await readFile(path.join(pagesDir, file), 'utf8')
  const rows = extractEnglishRows(source, file)
  if (!rows) {
    skipped.push(file)
    continue
  }

  // Heading text comes from the page's own English title so the two never
  // disagree about a component's name. Anchored to the start of a line for the
  // same reason as the `en:` lookup above.
  const titleMatch = /\ben:\s*\{[^{}]*?\btitle:\s*'([^']*)'/.exec(source)
  const title = titleMatch ? titleMatch[1] : file.replace(/Demo\.tsx$/, '')

  sections.push(`<details>\n<summary><b>${title}</b> — ${rows.length} props</summary>\n\n${renderTable(rows)}\n\n</details>`)
}

if (skipped.length) {
  console.log(`[gen-api] no apiData found in: ${skipped.join(', ')}`)
}

const block = [
  MARKER_START,
  '<!-- Generated by scripts/gen-api-tables.mjs from src/pages/*Demo.tsx. Do not edit by hand. -->',
  '',
  ...sections,
  MARKER_END,
].join('\n')

const readme = await readFile(targetPath, 'utf8')

if (!readme.includes(MARKER_START) || !readme.includes(MARKER_END)) {
  console.error(
    `[gen-api] ${path.relative(projectRoot, targetPath)} has no ${MARKER_START} / ${MARKER_END} markers.\n` +
      '          Add them around the API reference so this script has somewhere to write.',
  )
  process.exit(1)
}

const start = readme.indexOf(MARKER_START)
const end = readme.indexOf(MARKER_END) + MARKER_END.length
const next = readme.slice(0, start) + block + readme.slice(end)

if (process.argv.includes('--check')) {
  if (next !== readme) {
    console.error('[gen-api] README.md API tables are stale. Run: node scripts/gen-api-tables.mjs')
    process.exit(1)
  }
  console.log('[gen-api] README.md API tables are up to date.')
} else {
  await writeFile(targetPath, next, 'utf8')
  console.log(`[gen-api] wrote ${sections.length} component tables to README.md`)
}