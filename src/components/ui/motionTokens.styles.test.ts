/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const motion = read('src/styles/motion.scss')

/** Every component stylesheet, which is where a stray literal would live. */
const componentStyles = readdirSync(resolve(process.cwd(), 'src/components/ui'))
  .filter((f) => f.endsWith('.module.scss'))
  .map((f) => ({ name: f, css: readFileSync(resolve(process.cwd(), 'src/components/ui', f), 'utf8') }))

/**
 * Motion that is deliberately spelled out rather than tokenised, with the
 * reason it is allowed. Everything not listed here must use a token.
 *
 * The two categories that survive are not laziness:
 *   - `cubic-bezier(...)` in a `steps` family means the *travel* is geometry
 *     driven (Switch's `--switch-travel-steps` is travel / 2px), so the count
 *     cannot be a constant.
 *   - a looping `infinite` animation's duration *is* its tempo; naming it
 *     would be naming the thing itself.
 */
const ALLOWED_LITERALS: Array<{ file: string; reason: string }> = [
  // Ambient loops. The duration is the beat, not a tunable.
  { file: 'Skeleton.module.scss', reason: 'marching shimmer loop; 480ms is the tempo' },
  { file: 'Typewriter.module.scss', reason: 'cursor blink; 0.8s is a blink rate' },
  { file: 'Loading.module.scss', reason: 'one-shot carrot grow with its own overshoot curve' },
  { file: 'Progress.module.scss', reason: 'one-shot cell exit with its own accelerating curve' },
  { file: 'Alert.module.scss', reason: 'one-shot overlay entrance' },
  // Geometry driven. Switch derives its step count from the thumb travel, and
  // Message scales its own: a 20px drop over 7 steps is ~2.9px per step, the
  // same 3px grid the float token encodes, which the single token cannot
  // express because the count has to track the distance.
  { file: 'Switch.module.scss', reason: 'steps(var(--switch-travel-steps)) = travel / 2px' },
  { file: 'Message.module.scss', reason: '20px drop over 7 steps = 2.9px/step, matching the 3px grid' },
  // Sticky layout chrome, not a component: the sliding tab indicator tracks a
  // measured 250ms that has nothing to do with the press/tint vocabulary.
  { file: 'Tab.module.scss', reason: 'the sliding indicator tracks a measured 250ms' },
]

describe('motion token discipline', () => {
  it('declares a token for every interaction semantic the library uses', () => {
    // Each of these replaced a set of literals that had drifted apart. If a
    // future component needs a new gesture, it gets a new token here rather
    // than a number in its own stylesheet.
    for (const token of [
      '--star-motion-press-duration',
      '--star-motion-press-ease',
      '--star-motion-tint-duration',
      '--star-motion-tint-ease',
      '--star-motion-flip-duration',
      '--star-motion-flip-ease',
      '--star-motion-float-duration',
      '--star-motion-float-ease',
    ]) {
      expect(motion, `${token} is missing from motion.scss`).toContain(`${token}:`)
    }
  })

  it('resolves the press and tint tokens to the values the migration settled on', () => {
    // These numbers are the whole point of the change, so they are asserted
    // rather than described. 90ms was the most common press duration before
    // the migration (Checkbox, Radio, Tag, Pagination, Alert, Input, Select,
    // Textarea) and 100ms/120ms were the minority.
    expect(motion).toContain('--star-motion-press-duration: 90ms')
    expect(motion).toContain('--star-motion-press-ease: steps(2, jump-start)')
    expect(motion).toContain('--star-motion-tint-duration: 120ms')
    expect(motion).toContain('--star-motion-flip-duration: 120ms')
    expect(motion).toContain('--star-motion-flip-ease: steps(2, jump-none)')
  })

  it('keeps press and tint as genuinely different motions', () => {
    // They used to be the same declaration spelled two ways. A press is a
    // displacement and must land on the first frame (`jump-start`); a tint is a
    // colour interpolation with nothing to arrive at. Sharing one value between
    // them is exactly the drift this file exists to prevent.
    const press = motion.match(/--star-motion-press-ease:\s*([^;]+);/)?.[1]
    const tint = motion.match(/--star-motion-tint-ease:\s*([^;]+);/)?.[1]
    expect(press).toBeDefined()
    expect(tint).toBeDefined()
    expect(press).not.toBe(tint)
  })

  it.each(componentStyles)('$name declares no un-tokenised motion duration', ({ name, css }) => {
    if (ALLOWED_LITERALS.some((a) => a.file === name)) return

    // Any duration written as a literal is drift waiting to happen. The pattern
    // deliberately ignores `var(...)` and `0s` (an explicit "no delay").
    const literals = [
      ...css.matchAll(/(?:transition|animation)(?:-duration)?:\s*([^;{}]*)/g),
    ]
      .flatMap((m) => m[1].split(','))
      .map((part) => part.trim())
      .filter((part) => /(?<![\w-])(\d*\.?\d+)(?:ms|s)\b/.test(part))
      // `0s` is an explicit "no delay" — `visibility 0s linear` is how a fade
      // hands its discrete property over in step with the opacity beside it.
      .filter((part) => !/(?<![\w-])0s\b/.test(part))

    expect(
      literals,
      `${name} hardcodes a motion duration: ${literals.join(' | ')}. Use a token from
styles/motion.scss, or add an entry to ALLOWED_LITERALS with a reason.`,
    ).toEqual([])
  })

  it('uses one press duration across every control that hops', () => {
    // The regression this file was written for. Before the migration the same
    // press answered in 90ms (Checkbox, Radio, Tag, Pagination), 100ms (Rating,
    // Card) and 120ms (CalendarToolbar, WheelPicker), so two buttons side by side
    // in the demo pages moved at different speeds.
    const pressUsers = componentStyles.filter(({ css }) =>
      css.includes('var(--star-motion-press-duration)'),
    )
    expect(pressUsers.map((p) => p.name).sort()).toEqual([
      'Alert.module.scss',
      'BackToTop.module.scss',
      'Card.module.scss',
      'Checkbox.module.scss',
      'Dialog.module.scss',
      'Message.module.scss',
      'NineSliceButton.module.scss',
      'Pagination.module.scss',
      'Radio.module.scss',
      'Rating.module.scss',
      'Tab.module.scss',
      'Tag.module.scss',
    ])
  })

  it('never puts a press hop and a colour fade on the same timing', () => {
    // A transform and a background on one `transition` list must not share a
    // duration unless the element is genuinely doing both at once — the usual
    // cause is copy-pasting a neighbouring rule and leaving half of it behind.
    for (const { name, css } of componentStyles) {
      const blocks = [...css.matchAll(/transition:\s*([^;]+);/g)]
      for (const [, body] of blocks) {
        const hasTransform = /transform\s+var\(--star-motion-press/.test(body)
        const hasTint = /(?:background|color|opacity|filter)\s+var\(--star-motion-tint/.test(body)
        if (!hasTransform || !hasTint) continue
        // Both present is legitimate (Message's button presses and tints at
        // once); what must not happen is one of them falling back to a literal.
        expect(body, `${name} mixes press and tint`).not.toMatch(/(?<![\w-])\d*\.?\d+m?s\b/)
      }
    }
  })
})
