import { describe, expect, it } from 'vitest'
import { createCardPalette } from './cardLighting'

describe('cardLighting', () => {
  it('creates the grouped palette contract for the default orange', () => {
    const palette = createCardPalette('#dc7b05')

    expect(palette).toEqual({
      frame: {
        borderBase: '#dc7b05',
        borderInner: '#b14e05',
        borderOuter: '#853605',
        highlightTop: '#d79f6f',
        shadowRight: expect.any(String),
      },
      header: {
        borderBase: expect.any(String),
        borderInner: expect.any(String),
        borderOuter: expect.any(String),
        highlightTop: expect.any(String),
        shadowRight: expect.any(String),
        stripes: ['#ffc576', '#fdbc6e', '#f5b56f', '#f4ab65'],
      },
      body: {
        borderBase: expect.any(String),
        borderInner: expect.any(String),
        borderOuter: expect.any(String),
        highlightTop: expect.any(String),
        shadowRight: expect.any(String),
        stripes: expect.any(Array),
      },
      text: {
        primary: expect.any(String),
        secondary: expect.any(String),
        shadow: expect.stringContaining('rgba('),
      },
    })

    expect(palette.body.stripes).toHaveLength(8)
    expect(palette.frame.borderBase).toBe('#dc7b05')
    expect(palette.frame.borderInner).toBe('#b14e05')
    expect(palette.frame.borderOuter).toBe('#853605')
    expect(palette.frame.highlightTop).toBe('#d79f6f')
    expect(palette.header.stripes).toEqual(['#ffc576', '#fdbc6e', '#f5b56f', '#f4ab65'])
  })

  it('returns a fresh palette copy for the default orange path', () => {
    const firstPalette = createCardPalette('#dc7b05')
    const secondPalette = createCardPalette('#dc7b05')

    firstPalette.frame.borderBase = '#000000'
    firstPalette.header.stripes[0] = '#000000'
    firstPalette.body.stripes[0] = '#000000'
    firstPalette.text.primary = '#000000'

    expect(secondPalette.frame.borderBase).toBe('#dc7b05')
    expect(secondPalette.header.stripes[0]).toBe('#ffc576')
    expect(secondPalette.body.stripes[0]).toBe('#f0b66b')
    expect(secondPalette.text.primary).toBe('#40210a')
  })

  it('supports raw hex input without a leading hash', () => {
    const fromHash = createCardPalette('#dc7b05')
    const fromRawHex = createCardPalette('dc7b05')

    expect(fromRawHex).toEqual(fromHash)
  })

  it('normalizes 3-digit hex input', () => {
    const shortHex = createCardPalette('#abc')
    const expandedHex = createCardPalette('#aabbcc')

    expect(shortHex).toEqual(expandedHex)
  })

  it('normalizes whitespace and letter case for hex input', () => {
    const normalized = createCardPalette('#dc7b05')
    const padded = createCardPalette('  #Dc7B05  ')

    expect(padded).toEqual(normalized)
  })

  it('falls back to the default orange palette for invalid colors', () => {
    const invalid = createCardPalette('not-a-color')
    const fallback = createCardPalette('#dc7b05')

    expect(invalid).toEqual(fallback)
  })

  it('creates the grouped palette structure for custom colors', () => {
    const palette = createCardPalette('#4a90e2')

    expect(palette).toEqual({
      frame: {
        borderBase: expect.any(String),
        borderInner: expect.any(String),
        borderOuter: expect.any(String),
        highlightTop: expect.any(String),
        shadowRight: expect.any(String),
      },
      header: {
        borderBase: expect.any(String),
        borderInner: expect.any(String),
        borderOuter: expect.any(String),
        highlightTop: expect.any(String),
        shadowRight: expect.any(String),
        stripes: expect.any(Array),
      },
      body: {
        borderBase: expect.any(String),
        borderInner: expect.any(String),
        borderOuter: expect.any(String),
        highlightTop: expect.any(String),
        shadowRight: expect.any(String),
        stripes: expect.any(Array),
      },
      text: {
        primary: expect.any(String),
        secondary: expect.any(String),
        shadow: expect.stringContaining('rgba('),
      },
    })

    expect(palette.body.stripes).toHaveLength(8)
    expect(palette.frame.borderBase).toBe('#4a90e2')
    expect(palette.header.stripes).toHaveLength(4)
    expect(palette.text.shadow).toContain('rgba(')
  })
})
