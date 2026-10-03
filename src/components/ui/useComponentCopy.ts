import { useMemo } from 'react'
import { enDict, zhDict, interpolate, useOptionalI18n } from '../../i18n'

/**
 * Copy resolution for the components in `src/components/ui`.
 *
 * Two hard requirements pull in opposite directions here:
 *
 *   1. These components ship as a standalone package. A consumer installs
 *      `stardew-valley-ui`, renders `<StarDialog />`, and has never heard of
 *      our `I18nProvider`. Reading the context must therefore be optional.
 *   2. The docs site *is* bilingual, and Dialog's default footer used to read
 *      确认/取消 even with `lang="en"`. The components have to follow the app.
 *
 * So: read the context if it exists, fall back to Chinese if it does not, and
 * let every string be overridden by a prop. That keeps the library usable
 * standalone while making it correct inside a bilingual app.
 *
 * Resolved once per render into a plain object rather than calling `t()` at
 * each use site: the keys are static, so the lookup table costs one `useMemo`
 * and makes the component body read as `copy.confirmLabel` rather than as a
 * key string that a typo would silently turn into the key.
 */
export interface ComponentCopy {
  lang: 'zh' | 'en'
  /**
   * Look up a `ui.*` key, optionally filling `{{token}}` placeholders. Unknown
   * keys return the key itself, matching the app-level `t()`.
   */
  t: (key: string, values?: Record<string, string | number>) => string
  /** Alias of `t`, named for call sites that interpolate runtime values. */
  format: (key: string, values?: Record<string, string | number>) => string
}

export function useComponentCopy(): ComponentCopy {
  const i18n = useOptionalI18n()
  const lang = i18n?.lang ?? 'zh'

  return useMemo(() => {
    // The app's own `t()` wins so a consumer can reword a string without
    // patching this file; the static dictionaries are the fallback for the
    // standalone-package case where there is no provider at all.
    const dict = lang === 'en' ? enDict : zhDict

    const t = (key: string, values?: Record<string, string | number>) => {
      const raw = i18n?.t(key) ?? dict[key] ?? key
      return interpolate(raw, values)
    }

    return {
      lang,
      t,
      format: t,
    }
  }, [i18n, lang])
}