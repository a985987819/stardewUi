import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import StarBackToTop, { BACK_TO_TOP_FLIGHT_MS } from './BackToTop'
import { BACK_TO_TOP_ART_INK } from './backToTopArt'
import styles from './BackToTop.module.scss'

/** jsdom keeps `scrollY` read-only, so the page has to be scrolled by hand. */
const setScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true })
}

const scrollPageTo = (value: number) => {
  act(() => {
    setScrollY(value)
    window.dispatchEvent(new Event('scroll'))
  })
}

/**
 * While the plane is hidden it carries `aria-hidden`, which takes it out of the
 * accessibility tree — and out of `getByRole`. The label query does not filter
 * on that, so both states can be reached through one helper.
 */
const getButton = () => screen.getByLabelText('Back to top')

describe('BackToTop', () => {
  afterEach(() => {
    setScrollY(0)
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('draws the plane as three ink layers', () => {
    const { container } = render(<StarBackToTop />)
    const paths = [...container.querySelectorAll('path')]

    expect(paths.map((path) => path.getAttribute('fill'))).toEqual([
      BACK_TO_TOP_ART_INK.S,
      BACK_TO_TOP_ART_INK.F,
      BACK_TO_TOP_ART_INK.M,
    ])
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 21 21')
  })

  it('hides the plane at the top of the page and shows it once the page scrolls', () => {
    render(<StarBackToTop />)
    const button = getButton()

    expect(button).not.toHaveClass(styles['star-back-to-top--visible'])
    expect(button).toHaveAttribute('aria-hidden', 'true')
    expect(button).toHaveAttribute('tabindex', '-1')

    scrollPageTo(240)

    expect(button).toHaveClass(styles['star-back-to-top--visible'])
    expect(button).not.toHaveAttribute('aria-hidden')
    expect(button).not.toHaveAttribute('tabindex')

    scrollPageTo(0)

    expect(button).not.toHaveClass(styles['star-back-to-top--visible'])
  })

  it('waits for the threshold before showing the plane', () => {
    render(<StarBackToTop threshold={400} />)

    scrollPageTo(399)
    expect(getButton()).not.toHaveClass(styles['star-back-to-top--visible'])

    scrollPageTo(401)
    expect(getButton()).toHaveClass(styles['star-back-to-top--visible'])
  })

  it('reports visibility changes to its caller', () => {
    const onVisibleChange = vi.fn()
    render(<StarBackToTop onVisibleChange={onVisibleChange} />)

    expect(onVisibleChange).toHaveBeenLastCalledWith(false)

    scrollPageTo(120)
    expect(onVisibleChange).toHaveBeenLastCalledWith(true)
  })

  it('scrolls the window back to the top when clicked', () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    render(<StarBackToTop />)

    scrollPageTo(600)
    fireEvent.click(getButton())

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('jumps instantly for reduced-motion users', () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener() {}, removeEventListener() {} })
    )
    render(<StarBackToTop />)

    scrollPageTo(600)
    fireEvent.click(getButton())

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('lets a caller cancel the scroll from onClick', () => {
    const scrollTo = vi.fn()
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault())
    vi.stubGlobal('scrollTo', scrollTo)
    render(<StarBackToTop onClick={onClick} />)

    scrollPageTo(600)
    fireEvent.click(getButton())

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('flies the plane out on click, and keeps flying until the page lands', () => {
    vi.useFakeTimers()
    vi.stubGlobal('scrollTo', vi.fn())
    render(<StarBackToTop />)

    scrollPageTo(600)

    const button = getButton()

    fireEvent.click(button)

    // Flying: `--visible` is gone, so the hidden style sits underneath and the
    // animation is what the eye sees. The plane also leaves the accessibility tree
    // at once — it is on its way out, not something to click again.
    expect(button).toHaveAttribute('data-motion', 'flying')
    expect(button).not.toHaveClass(styles['star-back-to-top--visible'])
    expect(button).toHaveAttribute('aria-hidden', 'true')

    // The page reaches the top while the animation is still running. That must not
    // drop the flying state: doing so would cut the flight off in the middle, which
    // is exactly what a short scroll or an instant jump would produce.
    scrollPageTo(0)
    expect(button).toHaveAttribute('data-motion', 'flying')

    act(() => {
      vi.advanceTimersByTime(BACK_TO_TOP_FLIGHT_MS)
    })

    expect(button).not.toHaveAttribute('data-motion')
    expect(button).not.toHaveClass(styles['star-back-to-top--visible'])
  })

  it('keeps the plane away for as long as the page is still scrolling', () => {
    vi.useFakeTimers()
    vi.stubGlobal('scrollTo', vi.fn())
    render(<StarBackToTop />)

    scrollPageTo(3600)

    const button = getButton()

    fireEvent.click(button)

    // A tall page takes well over a second to climb back up, so every scroll event
    // has to push the return out. A fixed deadline instead fires part way through
    // and pops the fully visible plane back into view in mid-scroll.
    for (let step = 0; step < 12; step += 1) {
      act(() => {
        vi.advanceTimersByTime(200)
      })
      scrollPageTo(3600 - step * 300)
    }

    expect(button).toHaveAttribute('data-motion', 'flying')

    // Landed: the flight wraps up on its own, much shorter schedule.
    scrollPageTo(0)

    act(() => {
      vi.advanceTimersByTime(BACK_TO_TOP_FLIGHT_MS)
    })

    expect(button).not.toHaveAttribute('data-motion')
    expect(button).not.toHaveClass(styles['star-back-to-top--visible'])
  })

  it('brings the plane back when the caller keeps the scroll', () => {
    vi.useFakeTimers()
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault())
    vi.stubGlobal('scrollTo', vi.fn())
    render(<StarBackToTop onClick={onClick} />)

    scrollPageTo(600)

    const button = getButton()

    fireEvent.click(button)
    expect(button).toHaveAttribute('data-motion', 'flying')

    // Nothing will ever report the top of the page here, so the backstop has to.
    // Without it the plane would stay parked off-screen for good.
    act(() => {
      vi.advanceTimersByTime(BACK_TO_TOP_FLIGHT_MS * 4)
    })

    expect(button).not.toHaveAttribute('data-motion')
    expect(button).toHaveClass(styles['star-back-to-top--visible'])
  })

  it('watches a scroll container instead of the window when given one', () => {
    const container = document.createElement('div')
    const scrollTo = vi.fn()
    container.scrollTo = scrollTo
    document.body.append(container)

    render(<StarBackToTop container={container} />)

    act(() => {
      container.scrollTop = 500
      container.dispatchEvent(new Event('scroll'))
    })
    expect(getButton()).toHaveClass(styles['star-back-to-top--visible'])

    fireEvent.click(getButton())
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    container.remove()
  })

  it('gives visibility over to the caller when `visible` is provided', () => {
    const { rerender } = render(<StarBackToTop visible />)

    expect(getButton()).toHaveClass(styles['star-back-to-top--visible'])

    rerender(<StarBackToTop visible={false} />)
    expect(getButton()).not.toHaveClass(styles['star-back-to-top--visible'])

    // A controlled plane ignores the scroll position in both directions.
    scrollPageTo(900)
    expect(getButton()).not.toHaveClass(styles['star-back-to-top--visible'])
  })

  it('flies away when the caller changes `flightKey`, without a click', () => {
    vi.useFakeTimers()
    vi.stubGlobal('scrollTo', vi.fn())
    const { rerender } = render(<StarBackToTop flightKey="/components/button" />)

    scrollPageTo(600)
    expect(getButton()).toHaveClass(styles['star-back-to-top--visible'])

    // A route change: the router does the scrolling itself, the plane takes the
    // credit and leaves the corner exactly as it would after a real click.
    rerender(<StarBackToTop flightKey="/components/card" />)

    const button = getButton()

    expect(button).toHaveAttribute('data-motion', 'flying')
    expect(button).not.toHaveClass(styles['star-back-to-top--visible'])

    // And it lands the same way: the new page is already at the top, so the plane
    // stays gone instead of blinking back into view.
    scrollPageTo(0)

    act(() => {
      vi.advanceTimersByTime(BACK_TO_TOP_FLIGHT_MS)
    })

    expect(button).not.toHaveAttribute('data-motion')
    expect(button).not.toHaveClass(styles['star-back-to-top--visible'])
  })

  it('does not fly for the `flightKey` it mounted with', () => {
    render(<StarBackToTop flightKey="/components/button" />)

    expect(getButton()).not.toHaveAttribute('data-motion')
  })

  it('stays parked when `flightKey` changes while the plane is hidden', () => {
    const { rerender } = render(<StarBackToTop flightKey="/a" />)

    rerender(<StarBackToTop flightKey="/b" />)
    rerender(<StarBackToTop flightKey="/c" />)

    // The animation starts at full opacity, so firing it here would blink a plane
    // into a corner it had never occupied — a router may bump this freely.
    expect(getButton()).not.toHaveAttribute('data-motion')
    expect(getButton()).not.toHaveClass(styles['star-back-to-top--visible'])
  })

  it('accepts a custom label, offsets, class, and artwork', () => {
    render(
      <StarBackToTop label="回到顶部" bottom={120} right={48} className="farm-top">
        <span>up</span>
      </StarBackToTop>
    )

    const button = screen.getByLabelText('回到顶部')

    expect(button).toHaveClass('farm-top')
    expect(button.style.getPropertyValue('--star-back-to-top-bottom')).toBe('120px')
    expect(button.style.getPropertyValue('--star-back-to-top-right')).toBe('48px')
    expect(button.querySelector('svg')).toBeNull()
    expect(screen.getByText('up')).toBeInTheDocument()
  })
})
