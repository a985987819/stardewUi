import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
} from 'react'
import { classNames } from '../../utils/classNames'
import {
  BACK_TO_TOP_ART_INK,
  BACK_TO_TOP_ART_PATHS,
  BACK_TO_TOP_ART_SIZE,
  BACK_TO_TOP_VIEW_SIZE,
  type BackToTopInk,
} from './backToTopArt'
import styles from './BackToTop.module.scss'

/** Fixed distance kept from the viewport corner by default, in px. */
export const BACK_TO_TOP_DEFAULT_OFFSET = 32

/**
 * Length of the fly-away played on click, in ms.
 *
 * Exported because a caller that owns `visible` has to schedule its own hand-off
 * after the animation is over. `BackToTop.module.scss`'s `$flight-duration` must
 * stay equal to this number; a test locks the pair together.
 */
export const BACK_TO_TOP_FLIGHT_MS = 280

/**
 * How long the plane waits, in ms, after the page stops scrolling before it is
 * allowed back.
 *
 * The animation itself lasts only `BACK_TO_TOP_FLIGHT_MS`. After that the plane is
 * parked off-screen and waits for the page to really reach the top — the moment
 * `shown` flips to `false` and the hidden style takes over — and that wait has no
 * fixed length: a tall page takes over a second to get back up. So the return is
 * scheduled off the scrolling rather than off a deadline. This is the wait that
 * only starts once the page has come to rest, and it is what a caller that cancels
 * the scroll with `preventDefault` — so that nothing ever scrolls — ends up on.
 */
const FLIGHT_SETTLE_MS = 420

const INKS = Object.keys(BACK_TO_TOP_ART_INK) as BackToTopInk[]

export interface StarBackToTopProps extends HTMLAttributes<HTMLButtonElement> {
  /**
   * How far the page must be scrolled before the plane floats in, in px. The
   * default of `0` matches the brief exactly: hidden at the very top, shown the
   * moment the page moves.
   */
  threshold?: number
  /** Fixed distance from the viewport bottom edge, in px. */
  bottom?: number
  /** Fixed distance from the viewport right edge, in px. */
  right?: number
  /** Scroll animation. Reduced-motion users always get an instant jump. */
  scrollBehavior?: ScrollBehavior
  /**
   * Take the visibility over from the scroll listener. Useful for demos and for
   * pages that show the button on their own terms; leave it out to let the
   * component watch the scroll position itself.
   */
  visible?: boolean
  /**
   * The element that actually scrolls. Defaults to the window, which is what a
   * normal page uses; pass a scrollable panel to drive the button from inside it.
   */
  container?: HTMLElement | null
  /** Accessible name for the button. */
  label?: string
  /** Called whenever the plane appears or disappears, including on mount. */
  onVisibleChange?: (visible: boolean) => void
  /**
   * Plays the fly-away every time this value changes, for a caller that resets
   * the scroll itself. Pass a router's route key and the plane acknowledges the
   * jump it never made: the new page starts at the top and the plane leaves the
   * corner, exactly as if it had been clicked.
   *
   * A plane that is not on screen does not fly. There would be nothing to send
   * off, and starting the animation anyway would blink a fully opaque plane into
   * a corner it had never occupied — so a caller may bump this on every
   * navigation without checking first.
   */
  flightKey?: string | number
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/**
 * BackToTop — a pixel paper plane that floats in once the page scrolls and flies
 * you back to the top when clicked.
 *
 * The artwork is the staircase-drawn plane in `./backToTopArt`, nose pointing up
 * the page: two stair-stepped `#b2ccfa` right triangles, a 3px `#5899f1` outline,
 * and a `#308be2` ridge down the middle. It is rendered as three `<path>`s on a
 * `21 x 21` viewBox, so the pixel edges stay crisp at any device pixel ratio and
 * the whole button costs three DOM nodes per ink instead of one per art pixel.
 *
 * Visibility is its own, not the caller's: a passive scroll listener watches the
 * window (or `container`) and the plane appears only once the page has left the
 * top. The button stays mounted while hidden — that is what lets the entrance
 * transition run — but is taken out of the tab order and hidden from assistive
 * tech so it can never be reached when it cannot be seen.
 *
 * Clicking adds one more beat before the scroll finishes: the plane climbs out of
 * the corner and fades to nothing over `BACK_TO_TOP_FLIGHT_MS`, then stays out of
 * sight until the page actually lands back at the top. `flightKey` borrows that
 * same flight for a caller that does its own scrolling — a router, say, which
 * resets the document on navigation and wants the plane to take the credit.
 */
function StarBackToTop({
  threshold = 0,
  bottom = BACK_TO_TOP_DEFAULT_OFFSET,
  right = BACK_TO_TOP_DEFAULT_OFFSET,
  scrollBehavior = 'smooth',
  visible: visibleProp,
  container = null,
  label = 'Back to top',
  children,
  className,
  style,
  onClick,
  onVisibleChange,
  flightKey,
  ...rest
}: StarBackToTopProps) {
  const controlled = visibleProp !== undefined
  const [scrolled, setScrolled] = useState(false)
  const [flying, setFlying] = useState(false)
  const shown = controlled ? visibleProp : scrolled

  useEffect(() => {
    if (controlled) return undefined

    const scroller: HTMLElement | Window = container ?? window
    const sync = () => {
      const offset = container ? container.scrollTop : window.scrollY
      setScrolled(offset > threshold)
    }

    // Sync once on mount: a page restored mid-scroll must not start hidden.
    sync()
    // `passive` keeps the listener off the scroll-blocking path; the resize
    // listener covers content that grows under the plane without a scroll.
    scroller.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)

    return () => {
      scroller.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [container, controlled, threshold])

  useEffect(() => {
    onVisibleChange?.(shown)
  }, [onVisibleChange, shown])

  // The flight effect below has to read the current visibility without listing it
  // as a dependency: a navigation and the scroll listener's own update land in the
  // same commit, and re-running on `shown` would replay a flight that was already
  // decided. The sync effect is declared first, so it always runs before the reader.
  const shownRef = useRef(shown)
  const lastFlightKey = useRef(flightKey)

  useEffect(() => {
    shownRef.current = shown
  }, [shown])

  useEffect(() => {
    // Mounting is not a navigation — the first value seen is the baseline.
    if (lastFlightKey.current === flightKey) return

    lastFlightKey.current = flightKey
    // Nothing on screen to send off, and a plane that was never visible must stay
    // that way: the animation starts at full opacity, so firing it here would blink
    // the plane into a corner it had never occupied.
    if (!shownRef.current) return

    setFlying(true)
  }, [flightKey])

  // Hand the plane back over once it is safe to do so. The flight animation keeps
  // its end state (`forwards`), so the plane is invisible either way; what this
  // decides is *when* the flying state is dropped.
  useEffect(() => {
    if (!flying) return undefined

    // The page is back at the top: drop the state once the animation has had its
    // full run. Dropping it any earlier would cut the flight off halfway, which is
    // what a short scroll — or the instant jump reduced motion gets — would do. By
    // the time it is dropped the hidden style is already in charge, so nothing
    // blinks.
    if (!shown) {
      const timer = window.setTimeout(() => setFlying(false), BACK_TO_TOP_FLIGHT_MS)

      return () => window.clearTimeout(timer)
    }

    // The page has not arrived yet. Wait for the scrolling to stop before letting
    // the plane back: a tall page takes well over a second to climb back up, and a
    // fixed deadline would drop the state mid-scroll and pop the fully visible
    // plane into view again. Every scroll event pushes the deadline out, so it only
    // fires once the page has come to rest — which is exactly when the plane
    // belongs back on screen, either because the caller cancelled the scroll
    // (`preventDefault`, so nothing ever scrolls) or because the scroll was
    // interrupted part-way.
    const scroller: HTMLElement | Window = container ?? window
    let timer = window.setTimeout(() => setFlying(false), FLIGHT_SETTLE_MS)
    const reschedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setFlying(false), FLIGHT_SETTLE_MS)
    }

    scroller.addEventListener('scroll', reschedule, { passive: true })

    return () => {
      scroller.removeEventListener('scroll', reschedule)
      window.clearTimeout(timer)
    }
  }, [container, flying, shown])

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      // The flight is this click's receipt, so it plays even when the caller
      // takes the scroll over; only the scroll itself is theirs to cancel.
      setFlying(true)
      // A consumer that calls `preventDefault` owns the scroll instead.
      if (event.defaultPrevented) return

      const behavior = prefersReducedMotion() ? 'auto' : scrollBehavior

      if (container) {
        container.scrollTo({ top: 0, behavior })
      } else {
        window.scrollTo({ top: 0, behavior })
      }
    },
    [container, onClick, scrollBehavior]
  )

  // A plane that has flown away is invisible and untouchable, exactly like one
  // that has never appeared: it leaves the tab order and the accessibility tree
  // the moment the click lands.
  const reachable = shown && !flying

  return (
    <button
      {...rest}
      type="button"
      aria-label={label}
      aria-hidden={reachable ? undefined : true}
      tabIndex={reachable ? undefined : -1}
      data-motion={flying ? 'flying' : undefined}
      onClick={handleClick}
      className={classNames(
        styles['star-back-to-top'],
        reachable && styles['star-back-to-top--visible'],
        className
      )}
      style={
        {
          '--star-back-to-top-bottom': `${bottom}px`,
          '--star-back-to-top-right': `${right}px`,
          ...style,
        } as CSSProperties
      }
    >
      <span className={styles['star-back-to-top__art']}>
        {children ?? (
          <svg
            className={styles['star-back-to-top__plane']}
            viewBox={`0 0 ${BACK_TO_TOP_ART_SIZE} ${BACK_TO_TOP_ART_SIZE}`}
            width={BACK_TO_TOP_VIEW_SIZE}
            height={BACK_TO_TOP_VIEW_SIZE}
            shapeRendering="crispEdges"
            focusable="false"
            aria-hidden="true"
          >
            {INKS.map((ink) => (
              <path key={ink} d={BACK_TO_TOP_ART_PATHS[ink]} fill={BACK_TO_TOP_ART_INK[ink]} />
            ))}
          </svg>
        )}
      </span>
    </button>
  )
}

export { StarBackToTop }
export default StarBackToTop
