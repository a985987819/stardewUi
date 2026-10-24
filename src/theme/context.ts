import { createContext, useContext } from 'react'

/** 用户选择的主题档位；`system` 跟随 `prefers-color-scheme`。 */
export type ThemeMode = 'light' | 'dark' | 'system'

/** 实际生效的主题（`system` 解析后的结果）。 */
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** 当前档位（未解析）。 */
  theme: ThemeMode
  /** 解析后的实际主题，已写入 `<html data-theme>`。 */
  resolvedTheme: ResolvedTheme
  setTheme: (mode: ThemeMode) => void
}

/**
 * 默认值让组件（如 `StarCard`）在没有 Provider 的消费方里也能安全地
 * `useTheme` —— 拿到 light 且 setTheme 是空操作，不会崩溃。
 */
export const DEFAULT_THEME_CONTEXT: ThemeContextValue = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
}

export const ThemeContext = createContext<ThemeContextValue>(DEFAULT_THEME_CONTEXT)

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
