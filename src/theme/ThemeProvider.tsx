import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeContext, type ResolvedTheme, type ThemeMode } from './context'

export const THEME_STORAGE_KEY = 'star-ui-theme'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * 全项目日夜模式 Provider。
 *
 * - 档位（light / dark / system）持久化在 localStorage；
 * - `system` 跟随 `prefers-color-scheme` 并实时响应系统切换；
 * - 解析结果写入 `<html data-theme>`，驱动 `global.module.scss` 里的
 *   `night-tokens` 令牌块翻转整套配色；写在使用方根节点之外的 portal
 *   内容（Dialog / Drawer）同样继承。
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<ThemeMode>(THEME_STORAGE_KEY, 'system')
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    document.documentElement.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  const setThemePersisted = useCallback(
    (mode: ThemeMode) => {
      setTheme(mode)
    },
    [setTheme],
  )

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme: setThemePersisted }),
    [theme, resolvedTheme, setThemePersisted],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
