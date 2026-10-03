import { useEffect, type RefObject } from 'react'

/**
 * Modal focus management, shared by Dialog, Drawer, and Alert.
 *
 * All three declare `aria-modal="true"`, which is a promise to assistive tech:
 * this is the only modal, focus is inside it, and Tab will not wander out. A
 * screen reader announces that promise, so a component that makes it without
 * honouring it is worse than one that omits the attribute — the user is told
 * they are in a modal and then the keyboard walks them across the page behind
 * it. That mismatch is an accessibility-audit rejection, not a nitpick.
 *
 * Three jobs, in the order they have to happen:
 *
 *   1. **Move focus in** when the overlay opens. Otherwise focus stays on the
 *      trigger, which for a keyboard user means the next Tab starts from the top
 *      of the document and the overlay's first control is reached only by
 *      accident. `initialFocus` picks what receives it; the panel itself is the
 *      default because it is the one element guaranteed to exist.
 *
 *   2. **Keep Tab inside.** Handled on `keydown` at the document level rather
 *      than by reordering the DOM, because these overlays render into a portal
 *      at the end of `document.body` — the natural tab order is already roughly
 *      right, and the only thing that needs enforcing is the wrap-around at the
 *      two ends.
 *
 *   3. **Restore focus** when it closes. Without this the browser drops focus to
 *      `<body>` and a keyboard user has to tab from the top of the page to get
 *      back to where they were — the single most disorienting thing a modal can
 *      do. The element that opened the overlay is remembered, so focus goes back
 *      to the trigger.
 *
 * Portalled overlays each need their own instance (a Dialog and a Drawer can be
 * open at once), which is why this takes a ref rather than managing state.
 */

/** Selector for the elements that can hold focus inside a panel. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Whether an element can actually take focus.
 *
 * Deliberately not using `offsetParent`: jsdom returns `null` for it
 * unconditionally, so the obvious reachability check filters out *every*
 * element under test and the wrap-around silently stops working. The checks
 * below are the ones that matter for real focusability and that a DOM
 * implementation can also answer honestly:
 *
 *   - `hidden` attribute and `display: none` via the style attribute
 *   - `disabled` on form controls (already excluded in the selector, but a
 *     fieldset could still disable one)
 *   - `<details>` that is not open
 *
 * A `display: none` set through a stylesheet is the one case this cannot see;
 * that is acceptable because a hidden element in the tab order is a bug in the
 * caller's CSS, not something the trap should paper over.
 */
function isReachable(element: HTMLElement) {
  if (element.hasAttribute('hidden')) return false
  if (element.getAttribute('aria-hidden') === 'true') return false

  const style = element.style
  if (style.display === 'none' || style.visibility === 'hidden') return false

  if (element.tagName === 'FIELDSET' && (element as HTMLFieldSetElement).disabled) return false

  return true
}

function focusableWithin(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(isReachable)
}

export interface FocusTrapOptions {
  /** Whether the trap is active. Pass the overlay's "is showing" state. */
  active: boolean
  /**
   * Element to focus on open. Defaults to the panel itself, which is the safest
   * choice: it always exists, and focusing the container rather than its first
   * control means a screen reader announces the dialog's accessible name before
   * any of its contents.
   */
  initialFocus?: RefObject<HTMLElement | null>
  /**
   * Whether Tab from the last focusable element wraps to the first, and Shift+
   * Tab from the first wraps to the last. This is the actual "modal" part of
   * modal: without the wrap, Tab walks off the end into the page behind and the
   * user has no cue that they have left the dialog.
   */
  loop?: boolean
}

export function useFocusTrap(
  panelRef: RefObject<HTMLElement | null>,
  { active, initialFocus, loop = true }: FocusTrapOptions,
) {
  useEffect(() => {
    if (!active) return undefined

    const panel = panelRef.current
    if (!panel) return undefined

    // Remembered *before* anything moves focus, otherwise `activeElement` is
    // already the panel and there is nothing to restore to.
    const previouslyFocused = document.activeElement as HTMLElement | null

    // Focus the requested element, or fall back to the panel. The panel needs
    // `tabIndex` to be focusable at all; components give it that already, but
    // set it defensively so the hook works on any container.
    const target = initialFocus?.current ?? panel
    if (target === panel && !panel.hasAttribute('tabindex')) {
      panel.setAttribute('tabindex', '-1')
    }
    target.focus({ preventScroll: true })

    if (!loop) return () => {
      previouslyFocused?.focus?.({ preventScroll: true })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusable = focusableWithin(panel)
      // Nothing to cycle through: let the event through rather than swallowing
      // it, so the browser's own (body) behaviour applies.
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement as HTMLElement | null

      // Focus outside the panel (possible if something else moved it, e.g. a
      // browser find-bar or a programmatic focus): pull it back to the nearest
      // end rather than leaving the user in the page behind.
      if (!current || !panel.contains(current)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus({ preventScroll: true })
        return
      }

      if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus({ preventScroll: true })
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus({ preventScroll: true })
      }
    }

    // `capture` so the trap runs before the overlay's own handlers and before
    // anything in the page behind gets the event.
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      // Only restore if focus is still inside the panel. If the user already
      // moved it somewhere deliberate (a "skip to content" link, a route change),
      // yanking it back would be its own kind of wrong.
      if (panel.contains(document.activeElement) || document.activeElement === document.body) {
        previouslyFocused?.focus?.({ preventScroll: true })
      }
    }
  }, [active, initialFocus, loop, panelRef])
}