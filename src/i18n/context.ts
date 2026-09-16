import { createContext, useContext } from 'react'
import type { Lang } from './dictionaries'

export interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)

  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  return ctx
}
