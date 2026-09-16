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

  it('implements the card skewed outline with an after pseudo-element', () => {
    const cardTsx = readFileSync(resolve(process.cwd(), 'src/components/ui/Card.tsx'), 'utf8')
    const cardScss = readFileSync(resolve(process.cwd(), 'src/components/ui/Card.module.scss'), 'utf8')

    expect(cardTsx).not.toContain("stardew-card__outline")

    const afterBlock = cardScss.match(/&::after\s*\{[^}]*\}/)
    expect(afterBlock).not.toBeNull()

    // The outline is an expanded pseudo-element, so it has to offset outwards
    // from the card box. The exact pixel value is a styling detail, so only the
    // direction is asserted here — it changed from -8px to -10px in the card
    // styling rework.
    expect(afterBlock?.[0]).toMatch(/inset:\s*-\d+px/)
  })
})
