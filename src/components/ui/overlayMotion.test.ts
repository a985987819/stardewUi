/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  MASK_ENTER_MS,
  MASK_EXIT_MS,
  OVERLAY_ENTER_MS,
  OVERLAY_EXIT_DELAY_MS,
  OVERLAY_EXIT_MS,
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
    expect(motionScss).toContain('--star-motion-ease-exit')
    expect(motionScss).toContain('--star-motion-ease-enter')
    expect(motionScss).toContain('--star-motion-ease-spring')
    expect(drawerScss).toContain('var(--star-motion-ease-spring)')
    expect(dialogScss).toContain('var(--star-motion-ease-spring)')
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
    }
  })
})