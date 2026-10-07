import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { dictionaries, enDict, interpolate, zhDict } from './dictionaries'

const SRC = resolve(process.cwd(), 'src')

/** Every source file, so a key can be proven dead rather than merely unseen here. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : []
  })
}

const allSource = sourceFiles(SRC).map((file) => ({ file, text: readFileSync(file, 'utf8') }))

/**
 * Keys whose English value is legitimately the empty string: English does not
 * suffix date parts the way Chinese does, and an empty suffix is what makes the
 * inline picker's wheels read correctly without a second code path.
 */
const MAY_BE_EMPTY_IN_EN = new Set([
  'ui.datePicker.yearSuffix',
  'ui.datePicker.monthSuffix',
  'ui.datePicker.daySuffix',
])

describe('dictionary integrity', () => {
  it('keeps zh and en key sets identical', () => {
    expect(Object.keys(enDict).sort()).toEqual(Object.keys(zhDict).sort())
  })

  it('has a non-empty value on both sides for every key', () => {
    for (const [key, zh] of Object.entries(zhDict)) {
      expect(zh.trim(), `zh.${key}`).not.toBe('')

      const en = enDict[key] ?? ''
      if (MAY_BE_EMPTY_IN_EN.has(key)) continue
      expect(en.trim(), `en.${key}`).not.toBe('')
    }
  })

  it('has no key that nothing reads', () => {
    // 22 keys sat unused for months: the whole `sidebar.*` and `home.*` families
    // became dead when Sidebar and Home moved to inline copy, and `api.required`
    // was never rendered at all. They looked maintained but nothing could tell.
    const dictionaryFile = join(SRC, 'i18n', 'dictionaries.ts')
    const dead = Object.keys(zhDict).filter((key) =>
      allSource.every(({ file, text }) => file === dictionaryFile || !text.includes(key)),
    )

    expect(dead, `unused dictionary keys: ${dead.join(', ')}`).toEqual([])
  })

  it('namespaces component-owned copy under ui.*', () => {
    // A `ui.` prefix is what lets a reader tell "the docs site says this" from
    // "the component says this", and it is what `useComponentCopy` looks up.
    //
    // The two doc-chrome families that are neither of those: `issue.*` is the
    // reporting routes, which have to match the template names in
    // `.github/ISSUE_TEMPLATE/` — the key and the file are read together by the
    // launcher, and renaming one without the other silently drops the reader onto
    // a blank form.
    const DOC_CHROME = /^(nav|guide|components|demo|api|toc|search|copy|header|issue)\./

    for (const key of Object.keys(zhDict)) {
      expect(key.startsWith('ui.') || DOC_CHROME.test(key), `unexpected namespace: ${key}`).toBe(true)
    }
  })

  it('pairs every issue route with its own hint', () => {
    // Each entry in the launcher offers a label and, separately, a line saying
    // what that template will ask for. Half the value of routing by intent is
    // knowing *before* you leave, so the hint is not optional copy: a label with no
    // hint sends the reader to GitHub to find out what they just committed to.
    const label = (key: string) => `issue.template.${key}`
    const hint = (key: string) => `${label(key)}Hint`

    for (const key of ['bug', 'error', 'style', 'request']) {
      expect(zhDict[label(key)]?.trim(), `zh ${label(key)}`).not.toBe('')
      expect(zhDict[hint(key)]?.trim(), `zh ${hint(key)}`).not.toBe('')
      expect(enDict[label(key)]?.trim(), `en ${label(key)}`).not.toBe('')
      expect(enDict[hint(key)]?.trim(), `en ${hint(key)}`).not.toBe('')
    }
  })

  it('uses matching placeholder tokens on both sides of every key', () => {
    const tokens = (text: string) => (text.match(/\{\{\w+\}\}/g) ?? []).sort()

    for (const [key, zh] of Object.entries(zhDict)) {
      expect(tokens(enDict[key]), `placeholders differ for ${key}`).toEqual(tokens(zh))
    }
  })
})

describe('interpolate', () => {
  it('fills known tokens', () => {
    expect(interpolate('Loading {{loaded}} of {{total}}', { loaded: 3, total: 9 })).toBe('Loading 3 of 9')
  })

  it('leaves the template untouched when no values are given', () => {
    expect(interpolate('Loading {{loaded}}')).toBe('Loading {{loaded}}')
  })

  it('keeps unknown tokens verbatim instead of printing undefined', () => {
    // Printing `undefined` into a progress readout is worse than showing the raw
    // token: the reader can see what was expected and diagnose the missing value.
    expect(interpolate('{{missing}}', { other: 1 })).toBe('{{missing}}')
  })

  it('stringifies numeric values', () => {
    expect(interpolate('{{n}}', { n: 0 })).toBe('0')
  })

  it('exposes both languages under the same shape', () => {
    expect(Object.keys(dictionaries)).toEqual(['zh', 'en'])
  })
})