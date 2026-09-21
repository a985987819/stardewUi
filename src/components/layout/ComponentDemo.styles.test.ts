/// <reference types="node" />
import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('component demo frame styles', () => {
  it('keeps the card outer frame visible in the demo section', () => {
    const scss = readFileSync(resolve(process.cwd(), 'src/components/layout/ComponentDemo.module.scss'), 'utf8')

    expect(scss).not.toContain('overflow-hidden')
  })

  it('implements the card outer ring with an after pseudo-element', () => {
    const cardTsx = readFileSync(resolve(process.cwd(), 'src/components/ui/Card.tsx'), 'utf8')
    const cardScss = readFileSync(resolve(process.cwd(), 'src/components/ui/Card.module.scss'), 'utf8')

    expect(cardTsx).not.toContain("stardew-card__outline")

    const afterBlock = cardScss.match(/&::after\s*\{[^}]*\}/)
    expect(afterBlock).not.toBeNull()

    // The ring is an expanded pseudo-element, so it has to offset outwards from
    // the card box. The value moved to `calc(-1 * $card-halo-gap)` when the ring
    // became a gap frame; only the direction is a contract, not the pixels.
    expect(afterBlock?.[0]).toMatch(/inset:\s*(calc\(\s*-1|-\d+px)/)
  })
})
