import type { CSSProperties } from 'react'

/**
 * One timing source for both overlay lifecycles (Drawer and Dialog).
 *
 * The problem this solves: each overlay runs a CSS animation *and* a JS timer
 * that flips `data-state` from `opening`/`closing` to `open`/`closed`. The
 * timer decides when React unmounts the portal; the animation decides what the
 * user sees. When those two numbers disagree the panel either gets yanked out
 * mid-flight or lingers on screen for a beat after it has finished moving —
 * both read as a dropped frame, and neither is visible in code review because
 * the duration lives in two different files.
 *
 * So the numbers live here, are injected onto the overlay element as CSS
 * custom properties, and are used directly as the timer deadlines. A test
 * asserts the stylesheet consumes the variables rather than hardcoding
 * literals; if someone reintroduces a literal the test goes red.
 *
 * The asymmetric in/out pair is deliberate. Entering should feel instant and
 * then settle; leaving should be out of the gate. A symmetric 200ms both ways
 * is what made the drawer feel sluggish on open and sticky on close.
 */

/** Panel entering: 240ms. Long enough to read as travel, short enough to feel like a response. */
export const OVERLAY_ENTER_MS = 240
/** Panel leaving: 170ms. Roughly 1/1.4 of the enter time — departure should never outlast arrival. */
export const OVERLAY_EXIT_MS = 170
/**
 * Hold before the panel starts leaving.
 *
 * It was 40ms, and that number was doing two contradictory jobs. It was meant to
 * let the press that dismissed the overlay register visually — but it was
 * stacked on top of an exit curve whose initial velocity is *zero*
 * (`cubic-bezier(0.32, 0, 0.67, 0)`, which is correct for a fade and wrong for
 * travel). Measured in a real browser, the two together meant the panel sat
 * frozen for ~75ms after the click and then covered 265px in the final 60ms.
 * The hold was doing the opposite of its purpose: it read as lag, then a lurch.
 *
 * The curve is now `--star-motion-ease-overlay-out`, which moves on frame one,
 * so the hold is the only thing between the click and the first pixel of
 * movement. 24ms is about 1.5 frames at 60Hz — enough to register as a
 * deliberate beat, short enough that the panel never appears to stall.
 */
export const OVERLAY_EXIT_DELAY_MS = 24
/** Scrim fade: shorter than the panel so the backdrop is never the last thing standing. */
export const MASK_EXIT_MS = 150
/** Scrim fade-in. Deliberately a touch slower than the panel: the dimming should trail the arrival. */
export const MASK_ENTER_MS = 200

/**
 * `style` prop type for an overlay root. React's `CSSProperties` has no index
 * signature for custom properties, so the two have to be crossed explicitly.
 */
export type OverlayMotionStyle = Partial<CSSProperties> & OverlayMotionCssVariables

/** Total wall time the panel occupies from the close request to unmount. */
export const OVERLAY_EXIT_TOTAL_MS = OVERLAY_EXIT_DELAY_MS + OVERLAY_EXIT_MS
/** Total wall time from the open request to the settled `open` state. */
export const OVERLAY_ENTER_TOTAL_MS = OVERLAY_ENTER_MS

export interface OverlayMotionCssVariables {
  '--stardew-overlay-enter': string
  '--stardew-overlay-exit': string
  '--stardew-overlay-exit-delay': string
  '--stardew-overlay-mask-enter': string
  '--stardew-overlay-mask-exit': string
}

/**
 * The custom properties to spread onto an overlay's root element. Shared by
 * Drawer and Dialog so the two lifecycles cannot drift apart.
 *
 * Only the *portal's own* timings live here. The page behind gets its durations
 * from `--star-motion-duration-overlay-{in,out}` in `styles/motion.scss` instead,
 * because the portal is mounted on `document.body` and `[data-star-app]` is its
 * sibling — a custom property set here does not inherit across, and the
 * resulting undefined `var()` silently collapsed the page's `transition` to
 * `all 0s`. The two are kept in step by a test.
 *
 * Typed as the crossed `OverlayMotionStyle` rather than a bare interface:
 * React's `CSSProperties` has no index signature for `--*` names, so passing a
 * plain custom-property interface straight into a `style` prop is a type error
 * ("no properties in common"), even though it is perfectly valid at runtime.
 */
export const overlayMotionStyle: OverlayMotionStyle = {
  '--stardew-overlay-enter': `${OVERLAY_ENTER_MS}ms`,
  '--stardew-overlay-exit': `${OVERLAY_EXIT_MS}ms`,
  '--stardew-overlay-exit-delay': `${OVERLAY_EXIT_DELAY_MS}ms`,
  '--stardew-overlay-mask-enter': `${MASK_ENTER_MS}ms`,
  '--stardew-overlay-mask-exit': `${MASK_EXIT_MS}ms`,
}