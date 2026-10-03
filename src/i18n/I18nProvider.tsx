import { useCallback, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { dictionaries, interpolate } from './dictionaries'
import { I18nContext, type I18nContextValue } from './context'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<'zh' | 'en'>('star-ui-lang', 'zh')

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
