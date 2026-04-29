import { useCallback, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { I18nContext, type Lang } from './context'
import { dictionaries } from './dictionaries'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Lang>('star-ui-lang', 'zh')

  const t = useCallback(
    (key: string) => {
      const dict = dictionaries[lang]
      return dict[key] ?? key
    },
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}
