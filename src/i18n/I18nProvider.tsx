import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dictionaries, interpolate, type Lang } from './dictionaries'
import { parseLangParam, syncDocumentLang, writeLangParam } from './langParam'
import { I18nContext, type I18nContextValue } from './context'

const LANG_STORAGE_KEY = 'star-ui-lang'

/** Read the persisted choice. A blocked or malformed entry is not worth a failed paint. */
function storedLang(): Lang | null {
  if (typeof window === 'undefined') return null

  try {
    const item = window.localStorage.getItem(LANG_STORAGE_KEY)
    return item === '"zh"' || item === '"en"' ? (JSON.parse(item) as Lang) : null
  } catch {
    return null
  }
}

/**
 * Resolve the language for a fresh page load: **URL → stored → default**.
 *
 * The URL wins because it is the only one of the three the reader can see and
 * control. `localStorage` is per-browser and permanent, so without this a shared
 * `?lang=en` link would still open in whatever language the last person to use
 * that browser happened to pick — the reason every visit looked identical no
 * matter which link was followed.
 *
 * This is deliberately *not* routed through `useLocalStorage`: that hook prefers
 * the stored value over its `initialValue`, which is the right default for a text
 * field and exactly backwards for a URL meant to override it. Reading both sources
 * here keeps the precedence visible in one place instead of buried in a hook.
 */
function resolveInitialLang(): Lang {
  if (typeof window === 'undefined') return 'zh'
  return parseLangParam(window.location.search) ?? storedLang() ?? 'zh'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(resolveInitialLang)

  // Persist the resolved language, the mount write included: a `?lang=en` link
  // should leave the browser agreeing with it, so a later visit to the bare URL
  // does not snap back to the other language. Toggling writes here too, which is
  // what makes the globe button sticky.
  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(lang))
    } catch (error) {
      // Private mode and blocked storage both throw. The language still works for
      // this session — and still survives a reload via the URL param — so this is
      // a lost convenience, not a broken page.
      console.error('Failed to save language to localStorage:', error)
    }
  }, [lang])

  useEffect(() => {
    syncDocumentLang(lang)
  }, [lang])

  // Another tab switched language: follow it — unless this tab is holding a
  // `?lang=` link, which is an explicit instruction from whoever sent it and
  // should not be undone by an unrelated tab's stored preference.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LANG_STORAGE_KEY || event.newValue === null) return
      if (parseLangParam(window.location.search)) return

      try {
        const next = JSON.parse(event.newValue)
        if (next === 'zh' || next === 'en') setLangState(next)
      } catch {
        // Ignore a malformed payload from another tab.
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const setLang = useCallback((next: Lang) => {
    // The address bar moves before React re-renders, so a link copied right after
    // the click already matches the screen — and a reload keeps the choice even
    // where storage is unavailable, because the param round-trips on its own.
    writeLangParam(next)
    setLangState(next)
  }, [])

  const t = useCallback(
    // An unknown key falls through to the key itself rather than throwing, so a
    // typo degrades to visible-but-inert text instead of taking down the page.
    (key: string, values?: Record<string, string | number>) => {
      const dict = dictionaries[lang]
      return interpolate(dict[key] ?? key, values)
    },
    [lang]
  )

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export default I18nProvider