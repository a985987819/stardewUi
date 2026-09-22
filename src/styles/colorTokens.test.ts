import { describe, expect, it } from 'vitest'
import { BUTTON_VARIANT_COLORS, STAR_COLORS } from './colorTokens'

describe('STAR_COLORS', () => {
  it('keeps every standard button tone in one shared palette', () => {
    expect(BUTTON_VARIANT_COLORS.primary.bg).toBe(STAR_COLORS.button.primary.fill)
    expect(BUTTON_VARIANT_COLORS.success.text).toBe(STAR_COLORS.button.success.text)
    expect(STAR_COLORS.button.default.fill).toBe('#F8E6B0')
  })
})
