import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GapBorder from './GapBorder'

describe('GapBorder', () => {
  it('provides a surface clip path for the default broken-corner shape', () => {
    const { container } = render(<GapBorder>Pixel border</GapBorder>)
    const root = container.firstElementChild as HTMLElement

    expect(screen.getByText('Pixel border')).toBeInTheDocument()
    expect(root.style.getPropertyValue('--gap-border-surface-clip-path')).toContain('polygon(')
    expect(root.style.getPropertyValue('--gap-border-surface-clip-path')).toContain('8px 0')
  })

  it('keeps stepped corners on the four corners only when cornerLevel is set', () => {
    const { container } = render(<GapBorder cornerLevel={1}>Pixel border</GapBorder>)
    const root = container.firstElementChild as HTMLElement

    expect(root.style.getPropertyValue('--gap-border-surface-clip-path')).toBe(
      'polygon(24px 0, calc(100% - 24px) 0, calc(100% - 24px) 8px, calc(100% - 16px) 8px, calc(100% - 16px) 16px, calc(100% - 8px) 16px, calc(100% - 8px) 24px, calc(100% - 0px) 24px, 100% calc(100% - 24px), calc(100% - 8px) calc(100% - 24px), calc(100% - 8px) calc(100% - 16px), calc(100% - 16px) calc(100% - 16px), calc(100% - 16px) calc(100% - 8px), calc(100% - 24px) calc(100% - 8px), calc(100% - 24px) calc(100% - 0px), 24px 100%, 24px calc(100% - 8px), 16px calc(100% - 8px), 16px calc(100% - 16px), 8px calc(100% - 16px), 8px calc(100% - 24px), 0px calc(100% - 24px), 0 24px, 8px 24px, 8px 16px, 16px 16px, 16px 8px, 24px 8px, 24px 0px)'
    )
  })

  it('clips the surface layer with the generated surface clip path variable', () => {
    const scss = readFileSync(resolve(process.cwd(), 'src/components/ui/GapBorder.module.scss'), 'utf8')

    expect(scss).toContain('clip-path: var(--gap-border-surface-clip-path);')
  })
})
