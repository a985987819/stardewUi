/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Keeps both READMEs honest about the arrangement they now have.
 *
 * **What changed and why.** The Chinese README used to carry a hand-written
 * `### StarXxx` section per component plus a Props table per section — about
 * 1500 of its 2063 lines. It had its own guard suite for exactly that content:
 * `Message.position` listed 3 of 9 values, `StarCalendar`'s table was missing
 * `locale`, `StarRating` and `StarProgress` were listed but had no section at
 * all. Every one of those was a real drift that a user filed as a bug.
 *
 * The fix was not to maintain those tables better. It was to delete them: the
 * demo pages already render an API table per component, `demoApiCoverage.test.ts`
 * already validates those tables against the real prop declarations, and the
 * published `.d.ts` is the only thing that is actually authoritative. A second
 * hand-maintained copy can only ever lag behind it.
 *
 * **So this file no longer checks table *content*** — that job belongs to the
 * suite that owns the tables. What it protects is the shape of the new
 * arrangement, because the failure mode of deleting documentation is silent: the
 * README gets shorter, every test still passes, and an English reader quietly has
 * nowhere to look. Each test below names the dead end it prevents.
 */

/** Always `join` an already-resolved directory: on Windows `resolve` emits
 *  backslashes, and mixing those with `/` in a template literal produces a path
 *  that looks right and silently does not exist. */
const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const english = read('README.md')
const chinese = read('README_ZH.md')
const docsDir = resolve(process.cwd(), 'docs')

/** Per-component headings, in either README. The trimmed shape has none. */
function componentSections(markdown: string): string[] {
  return [...markdown.matchAll(/^### (Star\w+)\s*[-—]/gm)].map((m) => m[1])
}

/** Markdown table rows whose first cell is `| prop |`, i.e. a Props table. */
function propTableRows(markdown: string): string[] {
  return markdown
    .split('\n')
    .filter((line) => /^\|\s*`?\w+`?\s*\|\s*`?[^|]*`?\s*\|/.test(line) && /\|/.test(line))
}

describe('READMEs delegate the API reference instead of inlining it', () => {
  it.each([
    ['README.md', english],
    ['README_ZH.md', chinese],
  ])('%s has no per-component sections', (_name, markdown) => {
    // One `### StarXxx - …` heading per component is what the old shape looked
    // like. If these come back, the API reference has moved back into the README
    // and will start drifting from the declarations again.
    const sections = componentSections(markdown)

    expect(
      sections,
      `${_name} has ${sections.length} per-component sections (${sections.slice(0, 5).join(', ')}…); ` +
        'the demo pages own that surface.',
    ).toEqual([])
  })

  it.each([
    ['README.md', english],
    ['README_ZH.md', chinese],
  ])('%s keeps no Props table', (_name, markdown) => {
    // Belt to the braces above: a component section could come back in a shape
    // the heading matcher misses, and an inline table is the actual harm — it
    // reads as authoritative and is not.
    const suspicious = propTableRows(markdown).filter((line) =>
      /^\|\s*`(variant|open|color|size|value|on[A-Z]\w+)`\s*\|/.test(line.trim()),
    )

    expect(
      suspicious,
      `${_name} inlines what look like Props rows:\n${suspicious.join('\n')}`,
    ).toEqual([])
  })

  it.each([
    ['README.md', english],
    ['README_ZH.md', chinese],
  ])('%s still indexes the component catalogue', (_name, markdown) => {
    // A name index is not a Props table: it costs three lines, cannot drift in
    // any way a reader would act on, and it is the only way to answer "does this
    // library have a date picker?" without opening the demo site.
    expect(markdown, `${_name} lost its component index`).toMatch(/StarNineSliceButton/)
    expect(markdown, `${_name} lost its component index`).toMatch(/StarDatePicker/)
    expect(markdown, `${_name} lost its component index`).toMatch(/StarDialog/)
  })
})

describe('the trimmed READMEs are not dead ends', () => {
  it('point at the demo pages that carry the full API', () => {
    // The specific failure this trim risks: an English reader copies the props
    // from nowhere, or concludes the library is undocumented. Both READMEs must
    // name the demo and link into its component section.
    //
    // The catalogue, not a per-component page: a direct `/components/<name>` link
    // is a dead end today. Deep links bounce to the home page when the splash
    // hands over to the router (the route table's catch-all matches while the
    // matched route's lazy chunk is still suspended), so the READMEs point at
    // `/components` and let the reader click through. Fixing the deep link is
    // tracked separately; until then, a link that lands on the catalogue and works
    // beats one that silently drops them on the home page.
    for (const [name, markdown] of [
      ['README.md', english],
      ['README_ZH.md', chinese],
    ] as const) {
      expect(markdown, `${name} does not link the demo site`).toMatch(/a985987819\.github\.io/)
      expect(
        markdown,
        `${name} does not link the demo's component section, so the API tables are out of reach`,
      ).toMatch(/github\.io\/stardewUi\/components/)
    }
  })

  it('does not link a per-component page the site cannot open', () => {
    // Regression guard for the decision above, in the form that would bite: a
    // per-component link looks more helpful and works nowhere. If the deep-link
    // fix lands, this test is what should be revisited — deliberately, not
    // forgotten.
    for (const [name, markdown] of [
      ['README.md', english],
      ['README_ZH.md', chinese],
    ] as const) {
      const deep = [...markdown.matchAll(/github\.io\/stardewUi\/components\/\w+/g)].map((m) => m[0])

      expect(
        deep,
        `${name} links straight to a component page (${deep.join(', ')}). ` +
          'Deep links currently redirect to the home page — link the catalogue instead, ' +
          'or drop this test once that is fixed.',
      ).toEqual([])
    }
  })

  it('carry the language parameter on every demo link', () => {
    // Each README is written in one language, so a bare demo link drops the
    // reader into whichever language their browser last used — which is how a
    // Chinese reader ends up staring at an English component page. The parameter
    // is what makes a link from this document mean what it says.
    for (const [name, markdown] of [
      ['README.md', english],
      ['README_ZH.md', chinese],
    ] as const) {
      const links = [...markdown.matchAll(/https:\/\/a985987819\.github\.io\/stardewUi[^)\s>"]*/g)].map(
        (m) => m[0],
      )

      expect(links.length, `${name} has no demo links to check`).toBeGreaterThan(0)

      const bare = links.filter((link) => !link.includes('lang='))
      expect(
        bare,
        `${name} links to the demo without ?lang=, so the reader may land in the other language:\n` +
          bare.join('\n'),
      ).toEqual([])
    }
  })

  it('point each language at the other within the first screen', () => {
    // npm and GitHub both render README.md. A reader who cannot find the other
    // language concludes the project only ships one.
    expect(english.slice(0, 2000)).toMatch(/README_ZH\.md/)
    expect(chinese.slice(0, 2000)).toMatch(/README\.md/)
  })

  it.each([
    ['README.md', english, ['## License', '## Acknowledgements', '## Buy me a coffee']],
    ['README_ZH.md', chinese, ['## 版权说明', '## 致谢', '## 请我喝杯咖啡']],
  ])('%s keeps the licence and donation reachable', (name, markdown, headings) => {
    // What the trim was originally for: a reader deciding whether to trust the
    // project should not have to scroll past an API reference to find out
    // whether it is safe to use.
    for (const heading of headings) {
      expect(markdown, `${heading} went missing from ${name}`).toContain(heading)
    }
  })

  it('keeps the licence section in the first 80% of the English README', () => {
    // Measured as a fraction rather than an absolute line count so the check
    // survives ordinary editing. 0.95 before the trim, when the generated tables
    // made up most of the file.
    const lines = english.split('\n')
    const at = lines.findIndex((l) => l.startsWith('## License'))

    expect(at, '## License not found').toBeGreaterThan(-1)
    expect(
      at / lines.length,
      'the licence should be reachable without scrolling through the whole file',
    ).toBeLessThan(0.8)
  })

  it('explains the non-obvious gestures somewhere a reader will meet them', () => {
    // `allowHalf` needs a *double-click*, which is undiscoverable without being
    // written down. It moved out of the README with the rest of the Props
    // material, so the guard follows it to the page that now owns it — and would
    // fail if a future trim deleted the sentence instead of relocating it.
    const ratingDemo = read(join(resolve(process.cwd(), 'src/pages'), 'RatingDemo.tsx'))
    expect(
      ratingDemo,
      'RatingDemo no longer explains the double-click that allowHalf depends on',
    ).toMatch(/double.?click|双击|second time|second click/i)
  })
})

describe('README table of contents', () => {
  /** GitHub's anchor slug for a heading. */
  const slug = (heading: string) =>
    heading
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s/g, '-')

  const tocLinks = (markdown: string): string[] => {
    const start = markdown.search(/^## (目录|Table of contents)$/m)
    if (start === -1) return []

    const rest = markdown.slice(start)
    const end = rest.slice(1).search(/^## /m)
    const body = end === -1 ? rest : rest.slice(0, end + 1)

    return [...body.matchAll(/\]\(#([^)]+)\)/g)].map((m) => m[1])
  }

  it.each([
    ['README.md', english],
    ['README_ZH.md', chinese],
  ])('%s has a table of contents', (_name, markdown) => {
    expect(tocLinks(markdown).length, `${_name} has no table of contents`).toBeGreaterThan(5)
  })

  it.each([
    ['README.md', english],
    ['README_ZH.md', chinese],
  ])('%s only links to headings that exist', (_name, markdown) => {
    // A stale TOC entry is worse than none: the reader clicks through to a
    // section that moved and concludes the topic was deleted.
    const headings = new Set([...markdown.matchAll(/^#{2,4}\s+(.+)$/gm)].map((m) => slug(m[1])))
    const broken = tocLinks(markdown).filter((link) => !headings.has(link))

    expect(broken, `${_name} 目录里的锚点指向不存在的标题：${broken.join(', ')}`).toEqual([])
  })

  it('indexes every file under docs/', () => {
    // A doc nobody links to is a doc nobody finds. This catches the ones added
    // without an index entry, which is how `publishing.md` and
    // `acknowledgements.md` drifted.
    const onDisk = readdirSync(docsDir)
      .filter((name) => name.endsWith('.md'))
      .map((name) => `docs/${name}`)

    const listed = new Set(
      [...chinese.matchAll(/\]\((docs\/[^)]+\.md)\)/g)].map((m) => m[1]),
    )
    const missing = onDisk.filter((path) => !listed.has(path))

    expect(missing, `docs/ 下有文件未被 README 索引：${missing.join('、')}`).toEqual([])
  })

  it('gives every doc a link back to a README near its top', () => {
    // The docs are written in Chinese, so they link back to the Chinese README.
    // Either file is accepted — what must not happen is a doc with no way back,
    // which is how the previous anchors rotted unnoticed: they pointed at
    // `README.md#目录`, an anchor that stopped existing when the English README
    // became the default, and nothing failed.
    const onDisk = readdirSync(docsDir).filter((name) => name.endsWith('.md'))

    const orphans = onDisk.filter((name) => {
      // Within the first few lines: a breadcrumb belongs at the top, not buried
      // in a paragraph halfway down.
      const head = read(`docs/${name}`).slice(0, 400)
      return !head.includes('../README.md') && !head.includes('../README_ZH.md')
    })

    expect(orphans, `docs/ 下有文件没有回到 README 的链接：orphans.join('、')`).toEqual([])
  })

  it('resolves each doc backlink to a heading that actually exists', () => {
    // The orphan check above only proves the string is present. This proves the
    // anchor lands: `README.md#目录` is a well-formed link to nothing at all,
    // and it is exactly what five docs pointed at before.
    const broken: string[] = []

    for (const name of readdirSync(docsDir).filter((n) => n.endsWith('.md'))) {
      const text = read(`docs/${name}`)
      const link = /\]\(\.\.\/(README(?:_ZH)?\.md)#([^)]+)\)/.exec(text)
      if (!link) continue

      const target = link[1] === 'README.md' ? english : chinese
      if (!new Set([...target.matchAll(/^#{2,4}\s+(.+)$/gm)].map((m) => slug(m[1]))).has(slug(link[2]))) {
        broken.push(`${name} -> ${link[1]}#${link[2]}`)
      }
    }

    expect(broken, `docs/ 的回链指向不存在的锚点：\n${broken.join('\n')}`).toEqual([])
  })
})

/**
 * The samples in both READMEs get copied verbatim into a real project, so a
 * removed prop in one is not a documentation nit — it produces code that
 * silently misbehaves instead of failing to compile.
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
    const offenders = [english, chinese].flatMap((markdown, index) =>
      [...markdown.matchAll(/```[\s\S]*?```/g)]
        .map((m) => m[0])
        .filter((block) => block.includes(removed.name))
        .map((block) => `${index === 0 ? 'README.md' : 'README_ZH.md'}: ${block.split('\n')[0]}`),
    )

    expect(
      offenders,
      `README code samples still use ${removed.name}, removed in ${removed.since}. ` +
        `Readers copy these verbatim and get code that silently misbehaves. Use ${removed.instead}.`,
    ).toEqual([])
  })
})