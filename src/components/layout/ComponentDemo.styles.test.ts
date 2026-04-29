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

  it('implements the card outer frame with pseudo-elements instead of an outline node', () => {
    const cardTsx = readFileSync(resolve(process.cwd(), 'src/components/ui/Card.tsx'), 'utf8')
    const cardScss = readFileSync(resolve(process.cwd(), 'src/components/ui/Card.module.scss'), 'utf8')

    expect(cardTsx).not.toContain('stardew-card__outline')
    expect(cardScss).toContain('&::before')
    expect(cardScss).toContain('&::after')
    expect(cardScss).toContain('inset: calc(var(--card-frame-ring-width) * -1)')
  })
})
