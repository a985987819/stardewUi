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
})
