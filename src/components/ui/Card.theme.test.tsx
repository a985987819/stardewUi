import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Card from './Card'

describe('Card theme variables', () => {
  it('injects the default header and body stripe variables from computed theme values', () => {
    const { container } = render(
      <Card title="Quest Board" showTitle>
        Content
      </Card>
    )

    const card = container.firstElementChild as HTMLElement

    expect(card.style.getPropertyValue('--card-header-stripe-1')).toBe('#ffc576')
    expect(card.style.getPropertyValue('--card-header-stripe-2')).toBe('#fdbc6e')
    expect(card.style.getPropertyValue('--card-header-stripe-3')).toBe('#f5b565')
    expect(card.style.getPropertyValue('--card-header-stripe-4')).toBe('#f5ab65')
    expect(card.style.getPropertyValue('--card-body-stripe-1')).not.toBe('')
    expect(card.style.getPropertyValue('--card-body-stripe-8')).not.toBe('')
  })

  it('renders dedicated canvas surfaces for both the header and body areas', () => {
    const { container } = render(
      <Card title="Quest Board" showTitle>
        Content
      </Card>
    )

    expect(container.querySelector('[data-slot="card-header-surface"] canvas')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="card-body-surface"] canvas')).toBeInTheDocument()
  })

  it('renders shadow overlay layers above the header and body surfaces', () => {
    const { container } = render(
      <Card title="Quest Board" showTitle>
        Content
      </Card>
    )

    expect(container.querySelector('[data-slot="card-header-overlay"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="card-body-overlay"]')).toBeInTheDocument()
  })

  it('exposes independent body lighting variables so the content area keeps its highlight structure', () => {
    const { container } = render(
      <Card title="Quest Board" showTitle>
        Content
      </Card>
    )

    const card = container.firstElementChild as HTMLElement

    expect(card.style.getPropertyValue('--card-body-top-glow')).not.toBe('')
    expect(card.style.getPropertyValue('--card-body-bottom-shadow')).not.toBe('')
    expect(card.style.getPropertyValue('--card-body-right-shadow')).not.toBe('')
  })

  it('keeps the title anchored to the left edge of the header', () => {
    const { container } = render(
      <Card title="Quest Board" showTitle>
        Content
      </Card>
    )

    expect(container.querySelector('[data-slot="card-header"]')).toHaveStyle({
      justifyContent: 'flex-start',
    })
  })

  it('derives the full palette from a raw hex color input', () => {
    const renderCard = () =>
      render(
        <Card color="#355123" title="Custom" showTitle>
          Content
        </Card>
      )

    expect(renderCard).not.toThrow()

    const { container } = renderCard()
    const card = container.firstElementChild as HTMLElement

    expect(card.style.getPropertyValue('--card-border-dark')).toBe('#355123')
    expect(card.style.getPropertyValue('--card-header-stripe-1')).not.toBe('')
    expect(card.style.getPropertyValue('--card-body-stripe-8')).not.toBe('')
  })
})
