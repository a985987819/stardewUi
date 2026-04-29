import { describe, expect, it } from 'vitest'
import { getCardLighting } from './cardLighting'

describe('getCardLighting', () => {
  it('derives the right edge shadow from the card edge color', () => {
    expect(getCardLighting('#fa9305').rightEdgeShadow).toBe('#d49667')
  })

  it('derives a subtle text shadow from the same edge color', () => {
    expect(getCardLighting('#fa9305').titleTextShadow).toBeDefined()
  })
})
