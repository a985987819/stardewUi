import { render, screen, fireEvent, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, THEME_STORAGE_KEY } from './ThemeProvider'
import { useTheme } from './context'

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <div>
      <span data-testid="mode">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => setTheme('system')}>system</button>
    </div>
  )
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  )
}

describe('ThemeProvider', () => {
  afterEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
    vi.restoreAllMocks()
  })

  it('defaults to system, resolves light in a light test environment and mirrors it onto <html>', () => {
    renderProvider()

    expect(screen.getByTestId('mode').textContent).toBe('system')
    expect(screen.getByTestId('resolved').textContent).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('writes the explicit mode onto <html data-theme> and persists it', () => {
    renderProvider()

    fireEvent.click(screen.getByText('dark'))

    expect(screen.getByTestId('resolved').textContent).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(JSON.stringify('dark'))

    fireEvent.click(screen.getByText('light'))

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(JSON.stringify('light'))
  })

  it('follows live prefers-color-scheme changes while in system mode', () => {
    const listeners = new Set<(event: { matches: boolean }) => void>()
    const media = {
      matches: false,
      addEventListener: (_: string, listener: (event: { matches: boolean }) => void) => {
        listeners.add(listener)
      },
      removeEventListener: (_: string, listener: (event: { matches: boolean }) => void) => {
        listeners.delete(listener)
      },
    }
    // jsdom 没有 matchMedia，这里手动提供一个可控的假实现。
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn(() => media as unknown as MediaQueryList),
    })

    renderProvider()

    expect(screen.getByTestId('resolved').textContent).toBe('light')

    act(() => {
      listeners.forEach((listener) => listener({ matches: true }))
    })

    expect(screen.getByTestId('resolved').textContent).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('restores the persisted mode instead of system on remount', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify('dark'))

    renderProvider()

    expect(screen.getByTestId('mode').textContent).toBe('dark')
    expect(screen.getByTestId('resolved').textContent).toBe('dark')
  })
})
