import { describe, expect, it } from 'vitest'
import { DEFAULT_PROGRESS_BORDER, DEFAULT_PROGRESS_COLOR, DEFAULT_PROGRESS_HIGHLIGHT, DEFAULT_PROGRESS_SHADOW, deriveProgressPalette } from './progressPalette'

describe('deriveProgressPalette', () => {
  it('keeps the hand-tuned health palette for the default crimson fill', () => {
    expect(deriveProgressPalette()).toMatchObject({ fill: DEFAULT_PROGRESS_COLOR, border: DEFAULT_PROGRESS_BORDER, shadow: DEFAULT_PROGRESS_SHADOW, highlight: DEFAULT_PROGRESS_HIGHLIGHT })
  })

  it('normalizes custom colours and derives distinct bevel layers', () => {
    const palette = deriveProgressPalette('#7699B5')
    expect(palette.fill).toBe('#7699b5')
    expect(palette.border).not.toBe(palette.fill)
    expect(palette.shadow).not.toBe(palette.fill)
    expect(palette.highlight).not.toBe(palette.fill)
  })

  it('falls back to crimson for invalid values', () => {
    expect(deriveProgressPalette('not-a-colour').fill).toBe(DEFAULT_PROGRESS_COLOR)
  })
})
