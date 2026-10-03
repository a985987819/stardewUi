/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  MASK_ENTER_MS,
  MASK_EXIT_MS,
  OVERLAY_ENTER_MS,
  OVERLAY_ENTER_TOTAL_MS,
  OVERLAY_EXIT_DELAY_MS,
  OVERLAY_EXIT_MS,
  OVERLAY_EXIT_TOTAL_MS,
  overlayMotionStyle,
} from './overlayMotion'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const drawerScss = read('src/components/ui/Drawer.module.scss')
const dialogScss = read('src/components/ui/Dialog.module.scss')
const motionScss = read('src/styles/motion.scss')
const drawerTsx = read('src/components/ui/Drawer.tsx')
const dialogTsx = read('src/components/ui/Dialog.tsx')

describe('shared overlay motion', () => {
  it('keeps the enter/exit pair asymmetric so departure never outlasts arrival', () => {
    // A symmetric pair is what made the drawer feel sluggish open and sticky
    // shut. The ratio is the house number, not an arbitrary one: measured to
    // one decimal because 240/170 is not a round 1.4.
    expect(OVERLAY_EXIT_MS).toBeLessThan(OVERLAY_ENTER_MS)
    expect(OVERLAY_ENTER_MS / OVERLAY_EXIT_MS).toBeCloseTo(1.4, 1)
  })

  it('clears the backdrop faster than the panel travels', () => {
    expect(MASK_EXIT_MS).toBeLessThan(OVERLAY_EXIT_MS)
    expect(MASK_ENTER_MS).toBeLessThan(OVERLAY_ENTER_MS)
  })

  it('exposes every duration as a custom property so the stylesheet cannot drift', () => {
    expect(overlayMotionStyle).toEqual({
      '--stardew-overlay-enter': `${OVERLAY_ENTER_MS}ms`,
      '--stardew-overlay-exit': `${OVERLAY_EXIT_MS}ms`,
      '--stardew-overlay-exit-delay': `${OVERLAY_EXIT_DELAY_MS}ms`,
      '--stardew-overlay-mask-enter': `${MASK_ENTER_MS}ms`,
      '--stardew-overlay-mask-exit': `${MASK_EXIT_MS}ms`,
    })
  })

  it('keeps the page-behind durations identical in :root and in the module', () => {
    // The page behind is a *sibling* of the overlay portal (both hang off
    // `document.body`), so custom properties injected on the portal do not
    // inherit to it. The numbers therefore have to exist in `motion.scss` as
    // well, and an undefined `var()` does not fall back — it invalidates the
    // whole declaration, which silently collapsed the page's `transition` to
    // `all 0s` and made the focus effect snap. Found by reading
    // `getComputedStyle(appRoot).transition` in a real browser, not by reading
    // the SCSS, because the SCSS looked perfectly correct.
    const rootDuration = (name: string) =>
      motionScss.match(new RegExp(`${name}:\\s*(\\d+)ms`))?.[1]

    expect(rootDuration('--star-motion-duration-overlay-in')).toBe(
      `${OVERLAY_ENTER_TOTAL_MS}`,
    )
    // The page must cover the *whole* exit, hold included, or it is still
    // settling after the panel has unmounted.
    expect(rootDuration('--star-motion-duration-overlay-out')).toBe(
      `${OVERLAY_EXIT_TOTAL_MS}`,
    )
  })

  it('keeps the close hold short enough to read as a beat rather than a stall', () => {
    // The hold used to be 40ms *on top of* a zero-initial-velocity curve, and
    // the two compounded into ~75ms of a frozen panel followed by a 265px
    // lunge. Now the curve moves on frame one, so the hold is the only thing
    // between the click and the first pixel of movement — which means it has to
    // be short. 24ms is ~1.5 frames at 60Hz.
    expect(OVERLAY_EXIT_DELAY_MS).toBeLessThanOrEqual(32)
    // And it must stay a meaningful fraction of the exit, or it stops being a
    // deliberate beat at all.
    expect(OVERLAY_EXIT_DELAY_MS / OVERLAY_EXIT_MS).toBeGreaterThan(0.1)
  })

  it.each([
    ['Drawer.module.scss', drawerScss],
    ['Dialog.module.scss', dialogScss],
  ])('%s reads its overlay timing from the shared variables', (_name, scss) => {
    expect(scss).toContain('var(--stardew-overlay-enter)')
    expect(scss).toContain('var(--stardew-overlay-exit)')
    expect(scss).toContain('var(--stardew-overlay-exit-delay)')
    expect(scss).toContain('var(--stardew-overlay-mask-enter)')
    expect(scss).toContain('var(--stardew-overlay-mask-exit)')

    // A hardcoded `animation-duration: 0.2s` here is precisely the regression
    // this module exists to prevent, so assert the literals are gone.
    expect(scss).not.toMatch(/animation-duration:\s*0?\.\d+s/)
    expect(scss).not.toMatch(/transition:\s*opacity 0?\.\d+s/)
  })

  it.each([
    ['Drawer.tsx', drawerTsx],
    ['Dialog.tsx', dialogTsx],
  ])('%s injects the variables and times its own state flips from them', (_name, tsx) => {
    expect(tsx).toContain('overlayMotionStyle')
    expect(tsx).toContain('OVERLAY_ENTER_TOTAL_MS')
    expect(tsx).toContain('OVERLAY_EXIT_TOTAL_MS')
    // A local millisecond literal in the timer is the same drift in TS form.
    expect(tsx).not.toMatch(/setTimeout\([^)]*,\s*\d{3}\)/)
  })

  it('holds the panel still during the close delay instead of pre-flighting the exit keyframe', () => {
    // `fill-mode: both` is what makes this safe: during the hold it paints the
    // exit's 0% keyframe, which is the resting position.
    expect(drawerScss).toMatch(/\[data-state='closing'\]\s*\{[\s\S]*?animation-delay:\s*var\(--stardew-overlay-exit-delay\)/)
    expect(dialogScss).toMatch(/\[data-state='closing'\]\s*\{[\s\S]*?animation-delay:\s*var\(--stardew-overlay-exit-delay\)/)
    expect(drawerScss).toMatch(/&\[data-state='opening'\],\s*&\[data-state='closing'\]\s*\{\s*animation-fill-mode: both;/)
  })

  it('shares one easing vocabulary with the rest of the library', () => {
    expect(motionScss).toContain('--star-motion-ease-standard')
    expect(motionScss).toContain('--star-motion-ease-overlay-in')
    expect(motionScss).toContain('--star-motion-ease-overlay-out')
    expect(motionScss).toContain('--star-motion-ease-overlay-veil')

    for (const scss of [drawerScss, dialogScss]) {
      expect(scss).toContain('var(--star-motion-ease-overlay-in)')
      expect(scss).toContain('var(--star-motion-ease-overlay-out)')
      expect(scss).toContain('var(--star-motion-ease-overlay-veil)')
      // The curves that caused the two measured bugs must not come back on a
      // travelling panel. `ease-exit` reads progress 0.001 at 10% of its
      // duration; `spring` overshoots 1.037, which is 16px of bounce on a
      // 444px drawer slide.
      expect(scss).not.toMatch(/animation-timing-function:[^;]*star-motion-ease-exit\b/)
      expect(scss).not.toMatch(/animation-timing-function:[^;]*star-motion-ease-spring\b/)
    }
  })

  it('transitions the page behind per direction so it cannot outlive the panel', () => {
    // Regression with a measured history: the background used to transition on
    // the panel's raw enter duration in *both* directions, so on close it ran
    // 240ms of springy scale while the panel had already left at 170ms — the
    // farm behind was still settling for ~70ms after the drawer was gone.
    for (const scss of [drawerScss, dialogScss]) {
      // Resting state = the release half, so it must read the total-exit var.
      expect(scss).toMatch(
        /:global\(\[data-star-app='true'\]\)\s*\{[\s\S]*?var\(--star-motion-duration-overlay-out\)/,
      )
      // Focused state = arriving, so it must read the enter var.
      expect(scss).toMatch(
        /page-focused\)\s*\{[\s\S]*?var\(--star-motion-duration-overlay-in\)/,
      )
      // And neither half may reach for the portal's inline variables: those do
      // not reach this element at all.
      expect(scss).not.toMatch(/--stardew-overlay-out-/)
      expect(scss).not.toMatch(/transform var\(--stardew-overlay-enter\)/)
    }
  })

  it('makes the reopen rule outrank the placement rules', () => {
    // Regression guard with a real history: `&[data-skip-enter='true']` has two
    // attributes, exactly like `&--right[data-state='opening']`, so the later
    // placement rule won on source order and the skip rule was silently dead.
    // Reopening mid-exit therefore played the entrance from a full viewport away
    // and yanked the drawer off-screen. Caught by driving a real browser, not by
    // jsdom — which never composites a transform and so cannot see it at all.
    expect(drawerScss).toMatch(
      /&\[data-state='opening'\]\[data-skip-enter='true'\]/,
    )
    // Guard the ordering assumption too: the placement rules must not be allowed
    // to grow a third attribute, or this would need re-checking.
    const placementSelectors = [
      ...drawerScss.matchAll(/&--(\w+)\[data-state='(\w+)'\]\s*\{\s*animation-name/g),
    ]
    expect(placementSelectors.length).toBe(8)
    for (const match of placementSelectors) {
      expect(match[0]).not.toContain('data-skip-enter')
    }
  })

  it('fades the drawer out on exit instead of sliding a fully opaque panel off screen', () => {
    // Four exit keyframes, one per edge; each must fade or the panel hangs on
    // screen at full opacity for the last third of its travel.
    for (const edge of ['right', 'left', 'top', 'bottom']) {
      const block = drawerScss.match(
        new RegExp(`@keyframes stardew-drawer-exit-${edge}\\s*\\{[\\s\\S]*?\\n\\}`),
      )?.[0]

      expect(block, `missing exit keyframe for ${edge}`).toBeDefined()
      expect(block).toContain('opacity: 0')
      // The opaque hold is 20%, not 40%. The old 40% was tuned against the
      // zero-velocity exit curve, which needed a long opaque stretch to avoid
      // looking like it faded while stationary. Now that the curve moves
      // immediately, 40% would be a second stall on top of the close delay.
      expect(block).toMatch(/20%\s*\{\s*opacity:\s*1;/)
      expect(block).not.toMatch(/40%\s*\{\s*opacity:\s*1;/)
    }
  })

  it('gives the panel curves a velocity envelope that neither stalls nor lunges', () => {
    // The real regression guard. Both bugs in this change were invisible to
    // every other assertion here — the durations were fine, the custom
    // properties were wired up, the keyframes faded. What was wrong was the
    // *shape* of the progress curve, so this decodes the tokens out of
    // motion.scss and measures them the way a browser would.
    const curve = (name: string) => {
      const match = motionScss.match(
        new RegExp(`--star-motion-ease-${name}:\\s*cubic-bezier\\(([^)]+)\\)`),
      )
      expect(match, `--star-motion-ease-${name} is not a cubic-bezier`).toBeDefined()
      return match![1].split(',').map((part) => Number.parseFloat(part))
    }

    const progress = (c: number[], x: number) => {
      const [x1, y1, x2, y2] = c
      const cx = 3 * x1
      const bx = 3 * (x2 - x1) - cx
      const ax = 1 - cx - bx
      const cy = 3 * y1
      const by = 3 * (y2 - y1) - cy
      const ay = 1 - cy - by
      const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
      const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
      const derivX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
      let t = x
      for (let i = 0; i < 16; i += 1) {
        const d = derivX(t)
        if (Math.abs(d) < 1e-7) break
        const err = sampleX(t) - x
        if (Math.abs(err) < 1e-9) break
        t -= err / d
      }
      return sampleY(t)
    }

    /** Largest progress above 1 — i.e. how far past the target it travels. */
    const overshoot = (c: number[]) => {
      let max = 0
      for (let i = 0; i <= 4000; i += 1) max = Math.max(max, progress(c, i / 4000))
      return max - 1
    }

    // On a 444px slide, the old spring's 1.037 overshoot was 16px of bounce.
    const TRAVEL = 444
    expect(overshoot(curve('overlay-in')) * TRAVEL).toBeLessThan(6)
    // The exit must not overshoot at all: it is leaving, not arriving.
    expect(overshoot(curve('overlay-out'))).toBeLessThan(0.001)

    // The exit must be visibly moving early. This is the assertion that would
    // have caught the original bug: at 10% of its duration the old curve read
    // 0.001, and at 25% it read 0.02 — a panel frozen for a fifth of its
    // travel, on top of a 40ms hold.
    const out = curve('overlay-out')
    expect(progress(out, 0.1)).toBeGreaterThan(0.04)
    expect(progress(out, 0.25)).toBeGreaterThan(0.15)

    // And it must still accelerate away rather than crawl out at constant speed.
    expect(progress(out, 0.9) - progress(out, 0.8)).toBeGreaterThan(
      progress(out, 0.2) - progress(out, 0.1),
    )

    // The enter should cover a real distance immediately (responsive) without
    // sprinting. Measured at 10% of the duration on a 444px travel: the old
    // spring read 0.45 — it had covered nearly half the distance by the second
    // frame, which is what read as a snap rather than a slide. The new curve
    // reads 0.29. The ceiling sits below the old value on purpose, so swapping
    // the spring back in fails here.
    const enter = curve('overlay-in')
    expect(progress(enter, 0.1)).toBeGreaterThan(0.15)
    expect(progress(enter, 0.1)).toBeLessThan(0.32)

    // Scrim and page-behind fade opacity and scale — there is nothing to
    // overshoot past, so they must arrive without exceeding 1.
    expect(overshoot(curve('overlay-veil'))).toBeLessThan(0.001)
  })
})