import { describe, expect, it } from 'vitest'
import * as cardLighting from './cardLighting'

const { getCardLighting, createCardPalette, resolveCardThemeColor, CARD_DEFAULT_THEME_COLOR } = cardLighting

describe('getCardLighting', () => {
  it('derives the right edge shadow from the card edge color', () => {
    expect(getCardLighting('#fa9305').rightEdgeShadow).toBe('#d49667')
  })

  it('derives a subtle text shadow from the same edge color', () => {
    expect(getCardLighting('#fa9305').titleTextShadow).toBeDefined()
  })

  it('maps the theme color onto the full border lighting set', () => {
    const lighting = getCardLighting('#355123')

    expect(lighting.border).toBe('#355123')
    // Highlight is a dimmer, less saturated version of the same hue; the inner
    // shadow is the same hue pushed darker again.
    expect(lighting.borderHighlight).toMatch(/^#[0-9a-f]{6}$/)
    expect(lighting.borderInnerShadow).toMatch(/^#[0-9a-f]{6}$/)
    expect(lighting.borderOuterGlow).toBe(lighting.rightEdgeShadow)
    expect(lighting.borderHighlight).toBe(lighting.topHighlight)
    expect(lighting.borderInnerShadow).toBe(lighting.dividerShadow)
  })

  it('tints the outer shadow and the inner glow with the theme hue', () => {
    const lighting = getCardLighting('#274d70')
    const channels = (value: string) => value.match(/\d+/g)?.map(Number) ?? []

    expect(lighting.outerShadow).toMatch(/^rgba\(\d+, \d+, \d+, 0\.3\)$/)
    expect(lighting.innerGlow).toMatch(/^rgba\(\d+, \d+, \d+, 0\.22\)$/)

    // A blue theme must not produce a neutral grey shadow: blue stays the
    // dominant channel on both ends of the light range.
    const [shadowR, shadowG, shadowB] = channels(lighting.outerShadow)
    expect(shadowB).toBeGreaterThan(shadowR)
    expect(shadowB).toBeGreaterThan(shadowG)

    const [glowR, glowG, glowB] = channels(lighting.innerGlow)
    expect(glowB).toBeGreaterThan(glowR)
    expect(glowB).toBeGreaterThan(glowG)

    // ...and the warm default keeps its warm cast.
    const warm = getCardLighting(CARD_DEFAULT_THEME_COLOR)
    const [warmR, , warmB] = channels(warm.outerShadow)
    expect(warmR).toBeGreaterThan(warmB)
  })

  it('keeps the hover and active shadows lighter than the resting one', () => {
    const alpha = (value: string) => Number(value.match(/, ([\d.]+)\)$/)?.[1] ?? '0')
    const lighting = getCardLighting('#fa9305')

    expect(alpha(lighting.outerShadow)).toBeGreaterThan(alpha(lighting.outerShadowHover))
    expect(alpha(lighting.outerShadowHover)).toBeGreaterThan(alpha(lighting.outerShadowActive))
  })
})

describe('resolveCardThemeColor', () => {
  it('accepts hex with or without the leading hash, and #rgb shorthand', () => {
    expect(resolveCardThemeColor('#7A4E2D')).toBe('#7a4e2d')
    expect(resolveCardThemeColor('7a4e2d')).toBe('#7a4e2d')
    expect(resolveCardThemeColor('#f93')).toBe('#ff9933')
  })

  it('falls back to the default theme color instead of throwing on bad input', () => {
    expect(resolveCardThemeColor()).toBe(CARD_DEFAULT_THEME_COLOR)
    expect(resolveCardThemeColor('rebeccapurple')).toBe(CARD_DEFAULT_THEME_COLOR)
    expect(() => createCardPalette('not-a-color')).not.toThrow()
    expect(createCardPalette('not-a-color').borderDark).toBe(CARD_DEFAULT_THEME_COLOR)
  })
})

describe('createCardPalette', () => {
  it('derives a full card palette, including 4 header stripes and 8 body stripes, from the base color', () => {
    expect(typeof cardLighting.createCardPalette).toBe('function')

    const palette = cardLighting.createCardPalette('#fa9305')

    expect(palette.headerStripes).toEqual(['#ffc576', '#fdbc6e', '#f5b565', '#f5ab65'])
    expect(palette.bodyStripes).toHaveLength(8)
    expect(palette.borderDark).toBe('#fa9305')
    expect(palette.rightEdgeShadow).toBe('#d49667')
  })

  it('exposes the lighting roles alongside the surface colors', () => {
    const palette = cardLighting.createCardPalette('#274d70')

    expect(palette.border).toBe('#274d70')
    expect(palette.borderDark).toBe('#274d70')
    expect(palette.borderHighlight).toBe(palette.topHighlight)
    expect(palette.borderInnerShadow).toBe(palette.dividerShadow)
    expect(palette.borderOuterGlow).toBe(palette.rightEdgeShadow)
    expect(palette.outerShadow).toMatch(/^rgba\(/)
    expect(palette.innerGlow).toMatch(/^rgba\(/)
  })
})

// Merged from the surface-colour entry point that landed while this branch was
// reworking the card frame. Both entry points share one derivation path, so
// these assertions also lock the funnel described in `deriveCardPaletteFromFrameSeed`.
describe('deriveCardLightingFromSurface', () => {
  it('derives every directional Card layer from the exact visible surface colour', () => {
    const surface = '#7699b5'
    const palette = cardLighting.deriveCardLightingFromSurface(surface)

    expect(palette.background).toBe(surface)
    expect(palette.headerStripes).toHaveLength(4)
    expect(palette.bodyStripes).toHaveLength(8)
    expect(palette.borderDark).not.toBe(surface)
    expect(palette.topHighlight).not.toBe(surface)
    expect(palette.rightEdgeShadow).not.toBe(surface)
    expect(palette.footerTop).toMatch(/^rgba\(/)
    expect(palette.bodyBottomShadow).toMatch(/^rgba\(/)
  })

  it('normalizes shorthand subject colours before using them as the surface anchor', () => {
    expect(cardLighting.deriveCardLightingFromSurface('#d98').background).toBe('#dd9988')
  })

  it('keeps the inset frame as a deeper, hue-preserving shadow layer', () => {
    const palette = cardLighting.deriveCardLightingFromSurface('#4988c3')

    expect(palette.innerBorder).toBe('#1b364e')
    expect(palette.innerBorder).not.toBe(palette.borderLight)
    expect(palette.innerBorder).not.toBe(palette.borderDark)
  })
})
