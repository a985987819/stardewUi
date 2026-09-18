import { describe, expect, it } from 'vitest'
import * as cardLighting from './cardLighting'

const { getCardLighting } = cardLighting

describe('getCardLighting', () => {
  it('derives the right edge shadow from the card edge color', () => {
    expect(getCardLighting('#fa9305').rightEdgeShadow).toBe('#d49667')
  })

  it('derives a subtle text shadow from the same edge color', () => {
    expect(getCardLighting('#fa9305').titleTextShadow).toBeDefined()
  })

  it('derives a full card palette, including 4 header stripes and 8 body stripes, from the base color', () => {
    expect(typeof cardLighting.createCardPalette).toBe('function')

    const palette = cardLighting.createCardPalette('#fa9305')

    expect(palette.headerStripes).toEqual(['#ffc576', '#fdbc6e', '#f5b565', '#f5ab65'])
    expect(palette.bodyStripes).toHaveLength(8)
    expect(palette.borderDark).toBe('#fa9305')
    expect(palette.rightEdgeShadow).toBe('#d49667')
  })

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
