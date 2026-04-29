import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearNineSliceImageCache, useNineSliceBackground } from './useNineSliceBackground'

class ResizeObserverMock {
  observe() {}

  disconnect() {}
}

class MockImage {
  decoding = 'async'
  naturalWidth = 24
  naturalHeight = 24
  onload: null | (() => void) = null
  onerror: null | (() => void) = null

  set src(_value: string) {
    queueMicrotask(() => {
      this.onload?.()
    })
  }
}

describe('useNineSliceBackground', () => {
  beforeEach(() => {
    clearNineSliceImageCache()
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    vi.stubGlobal('Image', MockImage as unknown as typeof Image)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts as not ready when disabled and becomes ready after enabling', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useNineSliceBackground({
          enabled,
          src: '/panel.png',
          insets: { top: 8, right: 8, bottom: 8, left: 8 },
        }),
      {
        initialProps: { enabled: false },
      }
    )

    expect(result.current.isReady).toBe(false)

    rerender({ enabled: true })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
  })
})
