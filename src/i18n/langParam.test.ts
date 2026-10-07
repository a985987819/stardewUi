/// <reference types="node" />
import { afterEach, describe, expect, it } from 'vitest'
import { LANG_PARAM, parseLangParam, syncDocumentLang, writeLangParam } from './langParam'

describe('parseLangParam', () => {
  it('reads both supported languages', () => {
    expect(parseLangParam('?lang=en')).toBe('en')
    expect(parseLangParam('?lang=zh')).toBe('zh')
  })

  it('accepts the regional forms a locale string reports', () => {
    // `zh-CN` is what `navigator.language` hands back and what a reader in
    // Singapore or Hong Kong would type into a hand-written link; rejecting it
    // would make the parameter look broken for exactly the audience most likely
    // to paste a URL rather than click the globe.
    expect(parseLangParam('?lang=zh-CN')).toBe('zh')
    expect(parseLangParam('?lang=zh-Hant')).toBe('zh')
    expect(parseLangParam('?lang=en-GB')).toBe('en')
    expect(parseLangParam('?lang=EN')).toBe('en')
  })

  it('returns null for anything it does not recognise', () => {
    // Guessing here would be worse than falling through: `?lang=fr` silently
    // becoming English or Chinese hides the typo instead of surfacing it, and
    // the caller can fall back to the stored choice.
    expect(parseLangParam('?lang=fr')).toBeNull()
    expect(parseLangParam('?lang=')).toBeNull()
    expect(parseLangParam('?language=en')).toBeNull()
    expect(parseLangParam('')).toBeNull()
  })

  it('finds the parameter among others', () => {
    // Position must not matter, and neighbours must survive: the next feature to
    // add a query param should not have to know that `lang` reads first.
    expect(parseLangParam('?a=1&lang=en&b=2')).toBe('en')
  })

  it('ignores a parameter that only appears in the fragment', () => {
    // `?` starts the query; a `#` fragment is not part of the URL the server or
    // `location.search` ever sees, and reading it would mean a link like
    // `…/#?lang=en` silently switched language.
    expect(parseLangParam('#?lang=en')).toBeNull()
  })
})

describe('writeLangParam', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('adds the parameter and keeps the existing query', () => {
    window.history.replaceState(null, '', '/components?page=2')

    writeLangParam('en')

    expect(window.location.search).toBe('?page=2&lang=en')
  })

  it('replaces the previous language rather than appending a second one', () => {
    window.history.replaceState(null, '', '/?lang=zh')

    writeLangParam('en')

    expect(window.location.search).toBe('?lang=en')
  })

  it('leaves the URL untouched when it already says this', () => {
    // A redundant `replaceState` rewrites the entry, and with it the scroll
    // position a reader had scrolled to — for no visible change.
    window.history.replaceState(null, '', '/components?lang=en')

    writeLangParam('en')

    expect(window.location.search).toBe('?lang=en')
  })

  it('does not push a history entry', () => {
    // Toggling the language is a setting change, not a navigation. A history
    // entry per toggle would make the back button walk through language flips
    // instead of leaving the site.
    const before = window.history.length
    writeLangParam('en')

    expect(window.history.length).toBe(before)
  })

  it('exports the parameter name it reads and writes', () => {
    // The README documents `?lang=`; a rename that skipped this would leave the
    // documentation promising a parameter the site ignores.
    expect(LANG_PARAM).toBe('lang')
  })
})

describe('syncDocumentLang', () => {
  it('maps the language onto a real BCP 47 tag', () => {
    // `zh` alone is not a valid document language for Chinese content: browsers
    // and screen readers match against region-specific rules, and the generic tag
    // falls back inconsistently.
    syncDocumentLang('zh')
    expect(document.documentElement.lang).toBe('zh-CN')

    syncDocumentLang('en')
    expect(document.documentElement.lang).toBe('en')
  })
})