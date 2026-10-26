import { useCallback, useEffect, useRef, useState } from 'react'

export interface RevealState<T extends HTMLElement> {
  ref: React.RefObject<T | null>
  /** True once the element has entered the viewport (or IO is unavailable). */
  revealed: boolean
  /** True after the reveal transition finished — safe to drop its transform. */
  settled: boolean
  onTransitionEnd: (event: React.TransitionEvent<T>) => void
}

/**
 * Reveal-on-scroll, one element at a time.
 *
 * The element stays invisible until it first intersects the viewport, then the
 * caller transitions it in. Because a lingering `transform` on an ancestor
 * would trap `position: fixed` children (the calendar tooltip), the hook also
 * reports `settled` once the transform transition finished, so callers can
 * drop the reveal styles entirely afterwards.
 *
 * Elements already on screen at mount reveal immediately; without
 * IntersectionObserver everything reveals at once.
 */
export function useRevealOnScroll<T extends HTMLElement>(): RevealState<T> {
  const ref = useRef<T | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const node = ref.current

    if (!node || typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      setSettled(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true)
            observer.disconnect()
          }
        }
      },
      // Start the reveal slightly before the element is fully on screen so the
      // motion is already underway when the user notices the slot.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const onTransitionEnd = useCallback((event: React.TransitionEvent<T>) => {
    if (event.target === event.currentTarget && event.propertyName === 'transform') {
      setSettled(true)
    }
  }, [])

  return { ref, revealed, settled, onTransitionEnd }
}
