import { useCallback, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { dictionaries } from './dictionaries'
import { I18nContext } from './context'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<'zh' | 'en'>('star-ui-lang', 'zh')

  const t = useCallback(
    (key: string) => {
      const dict = dictionaries[lang]
      return dict[key] ?? key
    },
    [lang]
  )

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export default I18nProvider
