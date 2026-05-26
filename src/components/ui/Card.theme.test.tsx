import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Card from './Card'
import { createCardPalette } from '../../utils/cardLighting'

const REQUIRED_CARD_VARIABLES = [
  '--card-frame-border-base',
  '--card-frame-border-inner',
  '--card-frame-border-outer',
  '--card-frame-highlight-top',
  '--card-frame-shadow-right',
  '--card-header-border-base',
  '--card-header-border-inner',
  '--card-header-border-outer',
  '--card-header-highlight-top',
  '--card-header-shadow-right',
  '--card-header-stripe-1',
  '--card-header-stripe-2',
  '--card-header-stripe-3',
  '--card-header-stripe-4',
  '--card-body-border-base',
  '--card-body-border-inner',
  '--card-body-border-outer',
  '--card-body-highlight-top',
  '--card-body-shadow-right',
  '--card-body-stripe-1',
  '--card-body-stripe-2',
  '--card-body-stripe-3',
  '--card-body-stripe-4',
  '--card-body-stripe-5',
  '--card-body-stripe-6',
  '--card-body-stripe-7',
  '--card-body-stripe-8',
  '--card-text-primary',
  '--card-text-secondary',
  '--card-text-shadow',
] as const

describe('Card theme variables', () => {
  it('injects all required grouped CSS variables', () => {
    const { container } = render(<Card color="night-village">内容</Card>)
    const card = container.firstElementChild as HTMLElement

    for (const variableName of REQUIRED_CARD_VARIABLES) {
      expect(card.style.getPropertyValue(variableName)).not.toBe('')
    }
  })

  it('maps preset key input through createCardPalette', () => {
    const { container } = render(<Card color="night-village">内容</Card>)
    const card = container.firstElementChild as HTMLElement
    const palette = createCardPalette('#2f1e27')

    expect(card.style.getPropertyValue('--card-frame-border-base')).toBe(palette.frame.borderBase)
    expect(card.style.getPropertyValue('--card-header-stripe-1')).toBe(palette.header.stripes[0])
    expect(card.style.getPropertyValue('--card-body-stripe-8')).toBe(palette.body.stripes[7])
    expect(card.style.getPropertyValue('--card-text-primary')).toBe(palette.text.primary)
  })

  it('maps raw hex input through createCardPalette', () => {
    const { container } = render(<Card color="#4a67d6">内容</Card>)
    const card = container.firstElementChild as HTMLElement
    const palette = createCardPalette('#4a67d6')

    expect(card.style.getPropertyValue('--card-frame-border-base')).toBe(palette.frame.borderBase)
    expect(card.style.getPropertyValue('--card-header-stripe-1')).toBe(palette.header.stripes[0])
    expect(card.style.getPropertyValue('--card-body-stripe-8')).toBe(palette.body.stripes[7])
    expect(card.style.getPropertyValue('--card-text-primary')).toBe(palette.text.primary)
  })
})
