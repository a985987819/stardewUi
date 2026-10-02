/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const radioStyles = read('src/components/ui/Radio.module.scss')
const radioSource = read('src/components/ui/Radio.tsx')
const checkboxStyles = read('src/components/ui/Checkbox.module.scss')

/** Every size tier the two controls must agree on to render as one material. */
const SHARED_CHECK_SIZES = ['17.28px', '23.04px', '28.8px']

/**
 * Radio deliberately mirrors Checkbox's appearance: same square wooden tile,
 * same red check. These assertions keep the pair from drifting apart — change
 * one tile and the other must follow.
 */
describe('Radio matches the Checkbox look', () => {
  it('keeps the square wooden tile instead of the former round seal', () => {
    expect(radioStyles).toContain('border-radius: 4px')
    expect(radioStyles).not.toContain('border-radius: 50%')
  })

  it('reuses Checkbox control scale, size tiers, and red check', () => {
    expect(radioStyles).toContain('--radio-control-size: calc(var(--radio-check-size) * 0.8)')
    expect(checkboxStyles).toContain('--checkbox-control-size: calc(var(--checkbox-check-size) * 0.8)')

    for (const size of SHARED_CHECK_SIZES) {
      expect(radioStyles).toContain(`--radio-check-size: ${size}`)
      expect(checkboxStyles).toContain(`--checkbox-check-size: ${size}`)
    }

    // The red check token is shared; the green seed dot is gone.
    expect(radioStyles).toContain('var(--star-raw-hex-e53935)')
    expect(radioStyles).not.toContain('var(--star-raw-hex-71964a)')
  })

  it('offsets and times the check exactly like Checkbox', () => {
    expect(radioStyles).toContain('calc(var(--radio-check-size) * -0.48 + 3px)')
    expect(radioStyles).toContain('calc(var(--radio-check-size) * -0.14 - 3px)')
    expect(checkboxStyles).toContain('calc(var(--checkbox-check-size) * -0.48 + 3px)')
    expect(checkboxStyles).toContain('calc(var(--checkbox-check-size) * -0.14 - 3px)')

    // The JS unmount timer and the CSS loss animation must share one duration.
    expect(radioStyles).toContain('--radio-loss-duration: 150ms')
    expect(radioSource).toContain('const MARK_OUT_DURATION_MS = 150')
  })

  it('paints the same check glyph rather than a dot core', () => {
    expect(radioSource).toContain('star-radio__mark-glyph')
    expect(radioSource).toContain('✔')
    expect(radioSource).not.toContain('star-radio__dot')
  })
})
