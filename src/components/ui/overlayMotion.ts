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
 * Hold before the panel starts leaving. A one-frame hold lets the press that
 * dismissed the overlay register visually before the panel starts moving, which
 * is what stops a close from reading as an input glitch. It also gives the
 * focus-effect class on the app root time to start releasing, so the page
 * behind and the panel in front do not both move on the same millisecond.
 */
export const OVERLAY_EXIT_DELAY_MS = 40
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