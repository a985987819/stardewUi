import { createContext, useContext } from 'react'
import type { Lang } from './dictionaries'

export interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /**
   * Look up a dictionary key. An unknown key returns the key itself, so a typo
   * shows inert text rather than throwing. Pass `values` to fill `{{token}}`
   * placeholders in the string.
   */
  t: (key: string, values?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)

  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  return ctx
}

/**
 * Context read that does *not* throw when there is no provider.
 *
 * This exists for the components in `src/components/ui`, which ship as a
 * standalone package: an installed consumer renders `<StarDialog />` without
 * ever mounting our `I18nProvider`. A hard `useI18n()` there would throw, so
 * those components use this and fall back to the Chinese defaults instead —
 * the same strings they printed before i18n existed, but overridable.
 *
 * Layout components (`src/components/layout`) are app-internal and may keep
 * using the throwing `useI18n`.
 */
export function useOptionalI18n(): I18nContextValue | null {
  return useContext(I18nContext)
}
