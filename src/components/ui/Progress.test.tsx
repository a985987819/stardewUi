import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Progress from './Progress'

describe('Progress', () => {
  it('renders an accessible clamped progress value and custom color', () => {
    render(<Progress value={48} max={80} color="#7699B5" showLabel />)

    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveAttribute('aria-valuenow', '48')
    expect(progress).toHaveAttribute('aria-valuemax', '80')
    expect(progress.style.getPropertyValue('--star-progress-color')).toBe('#7699B5')
    expect(screen.getByText('48 / 80')).toBeInTheDocument()
  })

  it('clamps values above the maximum', () => {
    render(<Progress value={120} max={100} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })
})
