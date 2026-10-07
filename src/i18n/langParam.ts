import type { Lang } from './dictionaries'

/**
 * The query-string key that carries the language into a fresh page load.
 *
 * `localStorage` alone cannot do this job. It is per-browser and it survives
 * forever, so the very first visitor to a shared link gets whatever language the
 * last person to use that browser happened to pick — the demo opened in English
 * for a reader who only ever reads Chinese, and no link could fix it.
 * `?lang=en` makes the language part of the URL: shareable, bookmarkable, and
 * identical for everyone who opens it.
 */
export const LANG_PARAM = 'lang'

/**
 * Parse a language out of a search string.
 *
 * Accepts `?lang=en`, `?lang=zh`, and the regional forms a browser or an OS
 * locale string would hand us (`zh-CN`, `en-GB`), because `zh-CN` is what
 * `navigator.language` reports and a hand-written link is not the only caller.
 * Anything unrecognised returns `null` rather than guessing, so a typo degrades
 * to the stored/default language instead of a blank page.
 */
export function parseLangParam(search: string): Lang | null {
  const raw = new URLSearchParams(search).get(LANG_PARAM)
  if (!raw) return null

  const value = raw.trim().toLowerCase()
  if (value === 'zh' || value.startsWith('zh-')) return 'zh'
  if (value === 'en' || value.startsWith('en-')) return 'en'
  return null
}

/**
 * Write `lang` into the address bar without adding a history entry.
 *
 * `replaceState` rather than `pushState`: toggling the language is a setting
 * change, not a navigation, and a history entry per toggle would make the back
 * button walk through language flips. The existing query string is preserved —
 * the demo uses `lang` alongside nothing else today, but a param that silently
 * ate its neighbours would be a trap for the next one.
 *
 * Also does nothing when the param already says the same thing, so a redundant
 * render cannot rewrite the URL and, with it, the scroll position.
 */
export function writeLangParam(lang: Lang): void {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  if (url.searchParams.get(LANG_PARAM) === lang) return

  url.searchParams.set(LANG_PARAM, lang)
  window.history.replaceState(window.history.state, '', url)
}

/**
 * Keep `<html lang>` in step with the rendered language.
 *
 * The attribute ships as `lang="en"` in `index.html` and nothing ever touched
 * it, so Chinese copy shipped inside a document that claims to be English:
 * screen readers picked the wrong pronunciation rules and browsers offered
 * translation on text that was already in the reader's language.
 */
export function syncDocumentLang(lang: Lang): void {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
}