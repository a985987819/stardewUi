import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../i18n'
import styles from '../ui/BackToTop.module.scss'
import StarLayout from './Layout'

/**
 * Note: this file never calls `vi.unstubAllGlobals()` — the shared setup stubs
 * `ResizeObserver` for the whole suite (the footer fence measures itself with it),
 * and unstubbing would take that stub down for every test after the first.
 */

let scrollTo: ReturnType<typeof vi.fn>

beforeEach(() => {
  scrollTo = vi.fn()
  vi.stubGlobal('scrollTo', scrollTo)
})

/** jsdom keeps `scrollY` read-only, so the page has to be scrolled by hand. */
const scrollPageTo = (value: number) => {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true })
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

/** Stand-in for a routed page: gives the shell something to render and to leave. */
function RouteBody({ title }: { title: string }) {
  const navigate = useNavigate()

  return (
    <div>
      <span>{title}</span>
      <button type="button" onClick={() => navigate('/components/card')}>
        go to card
      </button>
      <button type="button" onClick={() => navigate('/components/button#api')}>
        go to an anchor
      </button>
    </div>
  )
}

const renderLayout = (lang: 'zh' | 'en' = 'zh') => {
  window.localStorage.setItem('star-ui-lang', JSON.stringify(lang))

  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/components/button']}>
        <Routes>
          <Route path="/" element={<StarLayout />}>
            <Route path="components/button" element={<RouteBody title="button page" />} />
            <Route path="components/card" element={<RouteBody title="card page" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </I18nProvider>
  )
}

describe('documentation shell navigation', () => {
  afterEach(() => {
    scrollPageTo(0)
  })

  it('mounts the back-to-top plane once, on every page', () => {
    renderLayout()

    // One plane for the whole site, in the shell rather than in any one page.
    expect(screen.getAllByLabelText('回到顶部')).toHaveLength(1)

    // Navigating keeps the same instance instead of remounting one per route.
    fireEvent.click(screen.getByRole('button', { name: 'go to card' }))

    expect(screen.getAllByLabelText('回到顶部')).toHaveLength(1)
  })

  it('names the plane in the reader’s language', () => {
    renderLayout('en')

    expect(screen.getByLabelText('Back to top')).toBeInTheDocument()
  })

  it('jumps the document back to the top whenever the route changes', () => {
    renderLayout()
    scrollTo.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'go to card' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('leaves the scroll alone when only the hash changes', () => {
    renderLayout()
    scrollTo.mockClear()

    // An in-page anchor moves the reader down the same page; yanking them back to
    // the top would undo the very jump they asked for.
    fireEvent.click(screen.getByRole('button', { name: 'go to an anchor' }))

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('flies the plane away as the new page takes over', () => {
    renderLayout()

    scrollPageTo(1200)
    expect(screen.getByLabelText('回到顶部')).toHaveClass(styles['star-back-to-top--visible'])

    fireEvent.click(screen.getByRole('button', { name: 'go to card' }))

    const plane = screen.getByLabelText('回到顶部')

    expect(plane).toHaveAttribute('data-motion', 'flying')
    expect(plane).not.toHaveClass(styles['star-back-to-top--visible'])
  })
})
