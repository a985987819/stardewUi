import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Divider from './Divider'
import styles from './Divider.module.scss'

describe('Divider', () => {
  it('renders a horizontal Card-lit fence separator by default', () => {
    const { container } = render(<Divider />)
    const divider = screen.getByRole('separator')

    expect(divider).toHaveAttribute('aria-orientation', 'horizontal')
    expect(divider).toHaveClass(styles['star-divider--horizontal'])
    expect(container.querySelectorAll('[class*="star-divider__post"]')).toHaveLength(2)
  })

  it('supports vertical rails and derives its lighting from a custom surface', () => {
    render(<Divider orientation="vertical" color="#7699B5" />)
    const divider = screen.getByRole('separator')

    expect(divider).toHaveAttribute('aria-orientation', 'vertical')
    expect(divider).toHaveClass(styles['star-divider--vertical'])
    expect(divider.style.getPropertyValue('--divider-border-dark')).not.toBe('#7699b5')
    expect(divider.style.getPropertyValue('--divider-stripe-1')).toMatch(/^#[0-9a-f]{6}$/)
  })
})
