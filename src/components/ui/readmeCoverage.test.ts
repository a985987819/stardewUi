/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Keeps the README honest about the props the components actually accept.
 *
 * The demo pages were already covered by `demoApiCoverage.test.ts`, but the
 * README was not, and it drifted in ways that actively misled:
 *
 *   - `Message.position` listed 3 of its 9 values, so `center` looked unsupported
 *   - `StarCalendar`'s table was missing `locale` entirely, even though the
 *     prop carries the whole i18n story for month names and weekday headers
 *   - `StarRating` and `StarProgress` appeared in the component list but had no
 *     section at all — and `allowHalf` needs a *precise double-click*, which is
 *     undiscoverable without documentation
 *
 * This is a documentation test rather than a code test, but the cost of the
 * drift it prevents is a user filing "the docs say X" bug reports.
 */

/** Always `join` an already-resolved directory: on Windows `resolve` emits backslashes,
 *  and mixing those with `/` in a template literal produces a path that looks right
 *  and silently does not exist. */
const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

/**
 * Read a component source file.
 *
 * Every read goes through here. Three earlier revisions each built the path
 * slightly differently — `read(`${uiDir}/X.tsx`)`, `readFileSync(join(...))`,
 * a template literal mixing `resolve`'s backslashes with `/` — and each failed
 * in its own way, most of them as an ENOENT swallowed by a `catch` that turned
 * a real check into a vacuous pass. One helper, one way to be wrong.
 */
function readComponent(name: string) {
  // README headings carry the `Star` prefix; component files do not.
  const file = name.replace(/^Star/, '')
  // `unionValues` passes real filenames (`messageConfig.ts`), which must not
  // get a second extension appended — that read ENOENT'd and, worse, would
  // have been easy to miss behind a `catch`.
  const path = file.endsWith('.ts') || file.endsWith('.tsx') ? file : `${file}.tsx`
  return readFileSync(join(uiDir, path), 'utf8')
}

const readme = read('README.md')
const uiDir = resolve(process.cwd(), 'src/components/ui')

/** Every `### StarXxx` heading in the README. */
function readmeSections(): string[] {
  return [...readme.matchAll(/^### (Star\w+)/gm)].map((m) => m[1])
}

/** Table rows for one component's section, as raw markdown lines. */
function sectionRows(component: string): string[] {
  const start = readme.indexOf(`### ${component}`)
  if (start === -1) return []

  const rest = readme.slice(start + 3)
  // Section ends at the next `###` or `##`.
  const end = rest.search(/^#{2,3} /m)
  const body = end === -1 ? rest : rest.slice(0, end)

  return body.split('\n').filter((line) => /^\|\s*[\w'`]/.test(line.trim()))
}

function propsInterface(component: string): string {
  const text = readComponent(component)
  const iface = text.match(/export interface Star\w+Props[^{]*\{([\s\S]*?)\n\}/)
  const alias = text.match(/export type Star\w+Props\s*=\s*\{([\s\S]*?)\n\}/)
  return iface?.[1] ?? alias?.[1] ?? ''
}

function propNames(component: string): string[] {
  const found = new Set<string>()

  for (const line of propsInterface(component).split('\n')) {
    // Two-space indent marks a top-level member; nested object literals are
    // indented further and are not props of this component.
    const member = line.match(/^ {2}(\w+)\??:/)
    if (member) found.add(member[1])
  }

  return [...found]
}

/**
 * Read the members of a string-union type alias.
 *
 * Line-based rather than regex-based because these files are CRLF: any pattern
 * that assumes `\n\n` as a block separator silently fails to match, and a
 * pattern loose enough to tolerate that happily runs past the end of the union
 * and swallows the next `export`.
 */
function unionValues(file: string, typeName: string): string[] {
  const lines = readComponent(file).split(/\r?\n/)
  const start = lines.findIndex((line) => new RegExp(`export type ${typeName}\\s*=`).test(line))
  if (start === -1) return []

  const values: string[] = []
  for (const line of lines.slice(start + 1)) {
    // The union ends at the first line that is not a `| 'value'` member.
    const member = line.match(/^\s*\|\s*'([^']+)'\s*$/)
    if (!member) break
    values.push(member[1])
  }

  return values
}

/** Props that are documented on the demo page rather than the README table. */
const README_OMISSIONS: Record<string, string[]> = {
  // The README documents these in prose or on the demo site; a table row would
  // only restate the prop's own name.
  StarMessage: ['MessageOptions', 'MessagePosition', 'MessageType', 'MessageAction'],
}

describe('README component sections', () => {
  it('has a section for every component in the component list', () => {
    // The list at the top of the README promises these; a listed component with
    // no section is a dead end for anyone reading it.
    // The component list is a markdown table of `Star*` backticks, one row per
    // category — not a bullet list. Restricted to the table itself: later prose
    // mentions removed components (`StarGapBorder` and friends, which the README
    // explicitly documents as gone) and those must not count as listed.
    const table = readme.slice(readme.indexOf('| 容器与展示'), readme.indexOf('完整 Props 类型'))
    const listed = [...new Set([...table.matchAll(/`(Star\w+)`/g)].map((m) => m[1]))]
    expect(listed.length).toBeGreaterThan(20)

    const sections = new Set(readmeSections())
    const missing = listed.filter((name) => !sections.has(name))

    expect(missing, `listed in the README but with no section: ${missing.join(', ')}`).toEqual([])
  })

  it.each(['StarProgress', 'StarRating'])('%s has a section', (component) => {
    // Both were listed in the component list with no section at all. `allowHalf`
    // in particular needs a documented double-click.
    expect(readmeSections()).toContain(component)
  })
})

describe('README prop tables match the components', () => {
  // Only sections backed by a component file: `### 主题与许可` and friends are
  // not components and have no props to check.
  //
  // The two names differ: the README heading is `### StarCard` while the file is
  // `Card.tsx`. Dropping the prefix is what makes the lookup land on a real
  // file — an earlier revision looked for `StarCard.tsx`, every read threw
  // ENOENT, and the `it.each` below silently reported success on an empty list.
  const documented = readmeSections().filter((name) => {
    try {
      return readComponent(name).includes(`export interface ${name}Props`)
    } catch {
      return false
    }
  })

  it('found component sections to check', () => {
    // Guards the `it.each` below from passing vacuously on an empty list, which
    // is exactly what happened in an earlier revision of this file.
    expect(documented.length).toBeGreaterThan(10)
  })

  it.each(documented)('%s documents every public prop', (component) => {
    const rows = sectionRows(component)
    // Components whose README section carries prose instead of a table.
    if (rows.length === 0) return

    const documentedProps = new Set(
      rows
        .map((line) => line.trim().replace(/^\|\s*/, '').split('|')[0].trim())
        // `value / defaultValue` documents two props in one row.
        .flatMap((cell) => cell.split('/').map((part) => part.replace(/`/g, '').trim()))
        .filter(Boolean),
    )

    const omitted = new Set(README_OMISSIONS[component] ?? [])
    const missing = propNames(component).filter(
      (name) => !omitted.has(name) && !documentedProps.has(name),
    )

    expect(
      missing,
      `${component}: props missing from the README table — add a row, or list them in README_OMISSIONS with a reason`,
    ).toEqual([])
  })
})

describe('README enum values match the components', () => {
  it('lists every MessagePosition value', () => {
    const declared = unionValues('messageConfig.ts', 'MessagePosition')
    expect(declared.length).toBeGreaterThan(3)

    const row = readme
      .split('\n')
      .find((line) => /^\|\s*position\s*\|/.test(line.trim()))

    expect(row, 'the Message position row vanished from the README').toBeDefined()
    for (const value of declared) {
      expect(row, `MessagePosition '${value}' is missing from the README`).toContain(value)
    }
  })

  it('lists every NineSliceButton variant', () => {
    const declared = unionValues('NineSliceButton.tsx', 'NineSliceButtonVariant')

    const row = readme
      .split('\n')
      .find((line) => /^\|\s*variant\s*\|/.test(line.trim()) && line.includes('danger'))

    expect(row, 'the variant row vanished from the README').toBeDefined()
    for (const value of declared) {
      expect(row, `variant '${value}' is missing from the README`).toContain(value)
    }
  })
})

describe('README documents the non-obvious gestures', () => {
  it('explains that allowHalf needs a double-click', () => {
    // A hidden gesture that is not written down is the same as a feature that
    // does not exist. This is the single most surprising interaction in the kit.
    const section = readme.slice(readme.indexOf('### StarRating'))
    expect(section).toMatch(/双击|double-click/i)
  })

  it('warns that color props only accept hex', () => {
    // The palette derives borders and shadows by mixing channels, which needs
    // parsed RGB. `red` and `var(--brand)` now warn in development, and the
    // README should say so before someone hits the warning.
    expect(readme).toMatch(/只接受|hex/i)
  })
})