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

  // The header and body used to each render a dedicated <canvas> surface layer.
  // Those were dropped in the card styling rework: the header now gets its inset
  // highlights from CSS, and only the body keeps an explicit overlay element.
  it('keeps the header slot and the dedicated body overlay layer', () => {
    const { container } = render(
      <Card title="Quest Board" showTitle>
        Content
      </Card>
    )

    expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument()

    const bodyOverlay = container.querySelector('[data-slot="card-body-overlay"]')
    expect(bodyOverlay).toBeInTheDocument()
    expect(bodyOverlay).toHaveAttribute('aria-hidden')
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

  it('derives the full palette from a raw visible-surface color input', () => {
    const renderCard = () =>
      render(
        <Card color="#355123" title="Custom" showTitle>
          Content
        </Card>
      )

    expect(renderCard).not.toThrow()

    const { container } = renderCard()
    const card = container.firstElementChild as HTMLElement

    expect(card.style.getPropertyValue('--card-bg')).toBe('#355123')
    expect(card.style.getPropertyValue('--card-border-dark')).not.toBe('#000000')
    expect(card.style.getPropertyValue('--card-header-stripe-1')).not.toBe('')
    expect(card.style.getPropertyValue('--card-body-stripe-8')).not.toBe('')
  })

  it('exposes the border / highlight / inner-shadow / outer-shadow roles as theme variables', () => {
    const { container } = render(
      <Card color="#274d70" title="Custom" showTitle>
        Content
      </Card>
    )

    const card = container.firstElementChild as HTMLElement

    expect(card.style.getPropertyValue('--card-bg')).toBe('#274d70')
    // The frame is derived from the body swatch, so it must not equal the value
    // the caller passed in.
    expect(card.style.getPropertyValue('--card-border')).toMatch(/^#[0-9a-f]{6}$/)
    expect(card.style.getPropertyValue('--card-border')).not.toBe('#274d70')
    expect(card.style.getPropertyValue('--card-border-highlight')).toBe(
      card.style.getPropertyValue('--card-top-highlight')
    )
    expect(card.style.getPropertyValue('--card-border-inner-shadow')).toBe(
      card.style.getPropertyValue('--card-divider-shadow')
    )
    expect(card.style.getPropertyValue('--card-border-outer-glow')).toBe(
      card.style.getPropertyValue('--card-right-edge-shadow')
    )
    expect(card.style.getPropertyValue('--card-outer-shadow')).toMatch(/^rgba\(/)
    expect(card.style.getPropertyValue('--card-outer-shadow-hover')).toMatch(/^rgba\(/)
    expect(card.style.getPropertyValue('--card-outer-shadow-active')).toMatch(/^rgba\(/)
    expect(card.style.getPropertyValue('--card-inner-glow')).toMatch(/^rgba\(/)
  })

  it('keeps the rounded inner frame without gap-border decoration layers', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstElementChild as HTMLElement
    const plate = card.querySelector('[class*="stardew-card__plate"]')
    const frame = card.querySelector('[class*="stardew-card__frame"]')
    const border = card.querySelector('[class*="stardew-card__border"]')

    expect(frame).toBeInTheDocument()
    expect(plate).not.toBeInTheDocument()
    expect(border).not.toBeInTheDocument()
    expect(card.style.getPropertyValue('--card-gap-clip')).toBe('')
  })

  it('falls back to the default theme instead of blanking out on an invalid color', () => {
    const { container } = render(
      <Card color="not-a-color" title="Custom" showTitle>
        Content
      </Card>
    )
    const { container: defaultContainer } = render(
      <Card title="Custom" showTitle>
        Content
      </Card>
    )

    const invalid = container.firstElementChild as HTMLElement
    const fallback = defaultContainer.firstElementChild as HTMLElement

    // A bad value must land on exactly the default card, not on a broken palette.
    expect(invalid.style.getPropertyValue('--card-border-dark')).toBe(
      fallback.style.getPropertyValue('--card-border-dark')
    )
    expect(invalid.style.getPropertyValue('--card-bg')).toBe(fallback.style.getPropertyValue('--card-bg'))
  })
})
