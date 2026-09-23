import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StarPixelText from './PixelText'

describe('StarPixelText', () => {
  it('exposes the rasterized child text to assistive technology', () => {
    render(<StarPixelText pixelSize={10}>😄</StarPixelText>)

    expect(screen.getByRole('img', { name: '😄' })).toBeInTheDocument()
    expect(screen.getByTestId('star-pixel-text-canvas').tagName).toBe('CANVAS')
  })

  it('lets text override children and keeps native canvas attributes', () => {
    render(<StarPixelText text="😂" id="laughing-emoji">😄</StarPixelText>)

    expect(screen.getByRole('img', { name: '😂' })).toHaveAttribute('id', 'laughing-emoji')
  })
})
