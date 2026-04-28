import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BUTTON_FILL,
  createDefaultButtonPalette,
  deriveInnerBorderColor,
  getContrastRatio,
  getReadableButtonTextColor,
} from './defaultButtonTheme'

describe('defaultButtonTheme', () => {
  it('lightens the inner border from the outer border color', () => {
    const innerBorder = deriveInnerBorderColor('#8B4513')

    expect(innerBorder).not.toBe('#8B4513')
    expect(getContrastRatio(innerBorder, DEFAULT_BUTTON_FILL)).toBeLessThan(
      getContrastRatio('#8B4513', DEFAULT_BUTTON_FILL)
    )
  })

  it('returns a readable text color against the default fill', () => {
    const textColor = getReadableButtonTextColor('#E0C58D')
    expect(getContrastRatio(textColor, DEFAULT_BUTTON_FILL)).toBeGreaterThanOrEqual(4.5)
  })

  it('creates a default palette from a custom outer border color', () => {
    const palette = createDefaultButtonPalette('#2E6F40')

    expect(palette.outerBorder).toBe('#2E6F40')
    expect(palette.innerBorder).not.toBe(palette.outerBorder)
    expect(getContrastRatio(palette.text.normal, palette.fill)).toBeGreaterThanOrEqual(4.5)
    expect(getContrastRatio(palette.text.hover, palette.fill)).toBeGreaterThanOrEqual(4.5)
    expect(getContrastRatio(palette.text.active, palette.fill)).toBeGreaterThanOrEqual(4.5)
  })
})
