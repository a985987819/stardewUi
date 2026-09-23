import '@testing-library/jest-dom/vitest'
import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n'
import StarBackToTopDemoPage from './BackToTopDemo'

const originalScrollTo = window.scrollTo
const originalRequestAnimationFrame = window.requestAnimationFrame
const originalCancelAnimationFrame = window.cancelAnimationFrame
const originalScrollHeight = Object.getOwnPropertyDescriptor(document.documentElement, 'scrollHeight')

afterEach(() => {
  vi.useRealTimers()
  vi.stubGlobal('scrollTo', originalScrollTo)
  vi.stubGlobal('requestAnimationFrame', originalRequestAnimationFrame)
  vi.stubGlobal('cancelAnimationFrame', originalCancelAnimationFrame)

  if (originalScrollHeight) {
    Object.defineProperty(document.documentElement, 'scrollHeight', originalScrollHeight)
  } else {
    delete (document.documentElement as { scrollHeight?: number }).scrollHeight
  }
})

describe('BackToTop demo page', () => {
  it('lets the page arrive, then smoothly travels to the bottom so the plane becomes usable', () => {
    vi.useFakeTimers()
    const scrollTo = vi.fn()
    const scrollHeight = 4800
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: scrollHeight,
    })
    vi.stubGlobal('scrollTo', scrollTo)
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    render(
      <I18nProvider>
        <StarBackToTopDemoPage />
      </I18nProvider>,
    )

    expect(scrollTo).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(420)
    })

    expect(scrollTo).toHaveBeenCalledWith({ top: scrollHeight, left: 0, behavior: 'smooth' })
  })
})
