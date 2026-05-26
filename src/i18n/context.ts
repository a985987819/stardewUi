import { createContext } from 'react'

export type Lang = 'zh' | 'en'

export interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)
