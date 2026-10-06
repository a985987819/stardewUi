/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
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

// The prop tables and TOC live in the Chinese README: it is the hand-maintained
// document with one section per component, and this suite validates it against
// the TypeScript declarations. `README.md` is the English one and gets its
// tables generated from the demo sources by `scripts/gen-api-tables.mjs`.
const readme = read('README_ZH.md')
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

/**
 * The table of contents is the only navigation a 1800-line README has, so a
 * stale entry is worse than no entry: a reader clicks through to a component
 * that moved and concludes the component is gone.
 *
 * GitHub derives heading anchors by lowercasing, dropping most punctuation, and
 * replacing spaces with hyphens. `### StarCard - 卡片` therefore becomes
 * `starcard---卡片`: the hyphen before the space, the space, and the hyphen after
 * it all collapse into three hyphens. `message - 消息提示` and
 * `createGapBorderCorners - …` are the same shape.
 */
describe('README table of contents', () => {
  /** GitHub's anchor slug for a heading. */
  const slug = (heading: string) =>
    heading
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s/g, '-')

  const tocLinks = (): string[] => {
    const toc = readme.slice(readme.indexOf('## 目录'), readme.indexOf('## 组件列表'))
    return [...toc.matchAll(/\]\(#([^)]+)\)/g)].map((m) => m[1])
  }

  it('exists', () => {
    expect(tocLinks().length).toBeGreaterThan(30)
  })

  it('only links to headings that exist', () => {
    const headings = new Set(
      [...readme.matchAll(/^#{2,4}\s+(.+)$/gm)].map((m) => slug(m[1])),
    )

    const broken = tocLinks().filter((link) => !headings.has(link))

    expect(broken, `目录里的锚点指向不存在的标题：${broken.join(', ')}`).toEqual([])
  })

  it('links to every component section', () => {
    const links = new Set(tocLinks())
    const missing = readmeSections().filter((name) => {
      const heading = new RegExp(`^### ${name} - .*$`, 'm').exec(readme)
      return heading ? !links.has(slug(heading[0].replace(/^### /, ''))) : true
    })

    expect(missing, `组件有章节但目录里没有链接：${missing.join(', ')}`).toEqual([])
  })

  it('indexes every file under docs/', () => {
    // A doc nobody links to is a doc nobody finds. The README already links
    // three of them from the body; this catches the ones added without an index
    // entry, which is how `publishing.md` and `acknowledgements.md` drifted.
    const listed = [...readme.matchAll(/\]\((docs\/[^)]+\.md)\)/g)].map((m) => m[1])
    expect(listed.length).toBeGreaterThan(0)

    const onDisk = readdirSync(resolve(process.cwd(), 'docs'))
      .filter((name) => name.endsWith('.md'))
      .map((name) => `docs/${name}`)

    const missing = onDisk.filter((path) => !listed.includes(path))
    expect(missing, `docs/ 下有文件未被 README 索引：${missing.join(', ')}`).toEqual([])
  })

  it('gives every doc a link back to the README', () => {
    // The docs are written in Chinese, so they link back to the Chinese README.
    // Accept either file: a doc that links only to the English one is still
    // navigable, and rejecting it would push contributors toward dead links.
    const onDisk = readdirSync(resolve(process.cwd(), 'docs')).filter((name) => name.endsWith('.md'))

    const orphans = onDisk.filter((name) => {
      const text = read(`docs/${name}`)
      // Within the first few lines: a breadcrumb belongs at the top, not buried
      // in a paragraph halfway down.
      const head = text.slice(0, 400)
      return !head.includes('../README.md') && !head.includes('../README_ZH.md')
    })

    expect(orphans, `docs/ 下有文件没有回到 README 的链接：${orphans.join(', ')}`).toEqual([])
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
/**
 * The prop tables are generated against the declarations, so they cannot drift.
 * The `code` samples inside them can — they are hand-written prose-shaped
 * strings, and nothing compared them against the API until a reader copied
 * `<StarTag color="green">` from the 0.3.0 README into a project where
 * `color` now means a CSS color and preset names live on `tone`.
 *
 * Checking every prop name in every sample would be brittle (samples use
 * abbreviations and omit props deliberately). What must never appear is a
 * *removed* prop, because copying one produces code that silently does the
 * wrong thing rather than failing to compile.
 */
describe('README samples avoid removed APIs', () => {
  const REMOVED = [
    // 0.3.0 unified visibility on `open`; the old spellings were dropped.
    { name: 'defaultVisible', since: '0.3.0', instead: 'defaultOpen' },
    { name: 'onVisibleChange', since: '0.3.0', instead: 'onOpenChange' },
    // 0.3.0 split preset color names off `color`.
    { name: 'color="green"', since: '0.3.0', instead: 'tone="green"' },
    { name: 'color="red"', since: '0.3.0', instead: 'tone="red"' },
    { name: 'color="yellow"', since: '0.3.0', instead: 'tone="yellow"' },
    { name: 'color="blue"', since: '0.3.0', instead: 'tone="blue"' },
    { name: 'color="purple"', since: '0.3.0', instead: 'tone="purple"' },
  ]

  it.each(REMOVED)('$name is gone since $since (use $instead)', (removed) => {
    // The FAQ deliberately shows the old spelling to explain the migration, so
    // prose is exempt — only fenced code samples are checked.
    const codeBlocks = [...readme.matchAll(/```[\s\S]*?```/g)].map((m) => m[0])

    const offenders = codeBlocks.filter((block) => block.includes(removed.name))

    expect(
      offenders,
      `README code samples still use ${removed.name}, removed in ${removed.since}. ` +
        `Readers copy these verbatim and get code that silently misbehaves. Use ${removed.instead}.`,
    ).toEqual([])
  })
})

/**
 * Keeps the English README short and pointing at the real documentation.
 *
 * It used to inline generated prop tables for all 27 components — roughly
 * 31kB, 60% of the file. That put the licence, the acknowledgements and the
 * donation section about four screens down, which is the opposite of what a
 * README is for: a reader deciding whether to trust a project should not have
 * to scroll past every prop table to find out whether it is safe to use.
 *
 * The full API now lives in the Chinese README (hand-checked against the
 * declarations by the suite above) and on the demo site. What this suite
 * protects is the shape of that arrangement: the English README stays a
 * readable length, and it never becomes a dead end — if it drops the pointers,
 * an English reader has nowhere to look and silently concludes the library is
 * undocumented.
 */
describe('English README stays a short pointer, not a second manual', () => {
  const english = read('README.md')

  it('stays short enough to read in one sitting', () => {
    // Not a style preference: the whole point of trimming was that the licence
    // and donation sections sit within reach of the first screen.
    const lines = english.split('\n').length

    expect(
      lines,
      `README.md is ${lines} lines. The full API lives in README_ZH.md and on the demo site; ` +
        'inlining it here pushed the licence and donation sections out of reach.',
    ).toBeLessThan(520)
  })

  it('does not inline per-component prop tables', () => {
    // One `### StarXxx -` heading per component is what the trimmed version
    // looks like. If these come back, the API reference moved into this file.
    const sections = [...english.matchAll(/^### Star\w+\s*[-—]/gm)]

    expect(
      sections.length,
      `README.md has ${sections.length} per-component sections; it should link out instead.`,
    ).toBe(0)
  })

  it('points readers at the complete API reference', () => {
    // A trimmed README is only useful if what it removed is still reachable.
    expect(english).toMatch(/README_ZH\.md/)
    expect(english).toMatch(/live demo|github\.io/i)
    // And the Chinese document has to actually contain it.
    expect(read('README_ZH.md')).toMatch(/^## Hooks$/m)
  })

  it('keeps the licence, acknowledgements and donation reachable', () => {
    for (const heading of ['## License', '## Acknowledgements', '## Buy me a coffee']) {
      expect(english, `${heading} went missing from the English README`).toContain(heading)
    }
  })

  it('documents the language switch on both READMEs', () => {
    // npm and GitHub both render README.md, so the Chinese one has to be one
    // click away from the first screen — not buried at the bottom.
    expect(english.slice(0, 2000)).toMatch(/README_ZH\.md/)
    expect(read('README_ZH.md').slice(0, 2000)).toMatch(/README\.md/)
  })
})
