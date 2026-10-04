/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Demo pages ship in two languages, so any user-facing string written inline
 * shows up in the wrong language for half the audience.
 *
 * `aria-label` is the sharpest case: it is not visible on the page, so a
 * reviewer scanning the rendered demo sees nothing wrong, and the only person
 * who finds out is a screen-reader user on the English site hearing Chinese. The
 * repo had 21 of these across BadgeDemo / RatingDemo / SwitchDemo / Welcome,
 * three of them in PaginationDemo's `ariaLabel` (which lands on `<nav>` and
 * names the whole landmark).
 *
 * Visible text is a different matter — most of it legitimately comes from the
 * page's `copy[lang]` table, and the Chinese literals that remain are the zh
 * side of that table, which is correct. So this only checks `aria-label` and
 * friends: attributes with no visual fallback and no table behind them.
 *
 * Code snippets are exempt by design. They are copy-paste targets, and the
 * project convention (see TitleDemo and AvatarDemo) is that they stay English
 * so they can be pasted unchanged; `demoCodeSnippets.test.ts` checks those
 * separately.
 */

const PAGES_DIR = resolve(process.cwd(), 'src/pages')

/** Attributes a screen reader announces but a sighted user never sees. */
const SPOKEN_ATTRS = ['aria-label', 'aria-description', 'aria-roledescription', 'aria-placeholder']

/**
 * Strip the parts of a demo page that are *supposed* to hold Chinese: the
 * `copy[lang]` tables and the code snippets.
 *
 * `codeStrings` is reused from the snippet test's rules in spirit — a snippet is
 * a template literal, and matching naively would slice it at an escaped
 * backtick. Rather than duplicate that scanner, blank out every template
 * literal wholesale: a snippet has no JSX in it that the rest of the scan
 * should care about.
 */
function withoutCodeSnippets(source: string): string {
  let out = ''
  let index = 0

  while (index < source.length) {
    const backtick = source.indexOf('`', index)
    if (backtick === -1) {
      out += source.slice(index)
      break
    }
    out += source.slice(index, backtick)

    // Walk to the closing backtick, honouring escapes.
    let cursor = backtick + 1
    let escaped = false
    while (cursor < source.length) {
      const char = source[cursor]
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '`') {
        break;
      }
      cursor += 1;
    }
    index = cursor + 1
  }

  return out
}

/** JSX attribute occurrences, ignoring the ones inside a `copy[lang]` table. */
function spokenLiteralsIn(source: string): { line: number; text: string }[] {
  const found: { line: number; text: string }[] = []

  for (const match of source.matchAll(/(aria-[a-z]+)\s*=\s*"([^"]*)"/g)) {
    if (!SPOKEN_ATTRS.includes(match[1])) continue
    // A label with no CJK in it is not a localisation problem.
    if (!/[\u4e00-\u9fff]/.test(match[2])) continue
    const line = source.slice(0, match.index).split('\n').length
    found.push({ line, text: `${match[1]}="${match[2]}"` })
  }

  return found
}

const pageFiles = readdirSync(PAGES_DIR).filter((name) => name.endsWith('.tsx'))

describe('demo pages do not hard-code spoken Chinese', () => {
  it('finds the pages to check', () => {
    expect(pageFiles.length).toBeGreaterThan(30)
  })

  it.each(pageFiles)('%s keeps screen-reader labels out of the source', (file) => {
    const source = readFileSync(resolve(PAGES_DIR, file), 'utf8')
    // Code snippets are English by convention, so they are removed first.
    const scannable = withoutCodeSnippets(source)
    const offenders = spokenLiteralsIn(scannable)

    expect(
      offenders,
      `${file} 里的无障碍文案写死了中文，切到英文后读屏会读出中文：\n` +
        offenders.map((o) => `  第 ${o.line} 行 ${o.text}`).join('\n') +
        '\n请改用 copy[lang].xxx（同时补 dictionaries.ts 的 zh/en 两侧）。',
    ).toEqual([])
  })
})
