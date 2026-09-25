import { describe, expect, it } from 'vitest'
import { DEFAULT_DIVIDER_COLOR, DEFAULT_DIVIDER_FRAME, DEFAULT_DIVIDER_HIGHLIGHT, DEFAULT_DIVIDER_SHADOW, deriveDividerPalette } from './dividerPalette'

/** WCAG relative luminance, so the tests can talk about "darker" and "lighter". */
function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
  const linear = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))

  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

describe('deriveDividerPalette', () => {
  it('keeps the hand-tuned wood palette for the default colour', () => {
    expect(deriveDividerPalette()).toEqual({
      body: DEFAULT_DIVIDER_COLOR,
      frame: DEFAULT_DIVIDER_FRAME,
      highlight: DEFAULT_DIVIDER_HIGHLIGHT,
      shadow: DEFAULT_DIVIDER_SHADOW,
    })
    expect(deriveDividerPalette(DEFAULT_DIVIDER_COLOR)).toEqual(deriveDividerPalette())
  })

  it('normalizes custom colours and derives all three lighting layers', () => {
    const palette = deriveDividerPalette('#7699B5')

    expect(palette.body).toBe('#7699b5')
    expect(palette.frame).toBe('#4c4f55')
    expect(palette.highlight).toBe('#d9dcd8')
    expect(palette.shadow).toBe('#2c2b34')
  })

  // 关键不变量：不管什么色相进来，外框和投影永远比主体暗、高光永远比主体亮，
  // 否则换个颜色就会出现"高光比主体还暗"这种读反了光照的结果。
  it('always brackets the body in lightness, whatever hue comes in', () => {
    const samples = ['#78ad55', '#d96b57', '#5c3a57', '#e8b95b', '#2e4057', '#f0e0c0', '#67b8c8', '#3d3d20']

    for (const color of samples) {
      const palette = deriveDividerPalette(color)
      const body = luminance(palette.body)

      expect(luminance(palette.frame), `${color} frame`).toBeLessThan(body)
      expect(luminance(palette.shadow), `${color} shadow`).toBeLessThan(body)
      expect(luminance(palette.highlight), `${color} highlight`).toBeGreaterThan(body)
    }
  })

  it('keeps a custom colour in its own family instead of tinting it brown', () => {
    const palette = deriveDividerPalette('#78ad55')

    // 绿色进来，外框和投影都该是暗绿而不是木头那种红棕。
    expect(palette.frame).toBe('#4d582a')
    expect(palette.shadow).toBe('#2d2f21')
    expect(luminance(palette.highlight)).toBeGreaterThan(luminance(palette.body))
  })

  it('falls back to the default wood for invalid values', () => {
    for (const invalid of ['', 'not-a-colour', '#12345', undefined]) {
      expect(deriveDividerPalette(invalid).body).toBe(DEFAULT_DIVIDER_COLOR)
    }
  })

  it('expands three-digit hex', () => {
    expect(deriveDividerPalette('#abc').body).toBe('#aabbcc')
  })
})
