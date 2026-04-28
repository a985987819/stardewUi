import '@testing-library/jest-dom'
import { vi } from 'vitest'

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

class IntersectionObserverMock {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds = [0]

  observe() {}

  unobserve() {}

  disconnect() {}

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () =>
    new Proxy(
      {},
      {
        get(_target, key) {
          if (key === 'measureText') {
            return () => ({ width: 0 })
          }

          return () => {}
        },
      }
    ) as CanvasRenderingContext2D,
})
