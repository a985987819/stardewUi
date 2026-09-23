import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StarTitle, { deriveTitlePalette } from './Title'

describe('StarTitle', () => {
  it('renders an h2 by default and keeps the content accessible', () => {
    render(<StarTitle>Harvest board</StarTitle>)
    expect(screen.getByRole('heading', { level: 2, name: 'Harvest board' })).toBeInTheDocument()
    expect(screen.getByTestId('star-title-canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  it('supports another heading level and native heading attributes', () => {
    render(
      <StarTitle level={1} id="page-title" aria-describedby="title-help">
        Spring festival
      </StarTitle>,
    )
    const heading = screen.getByRole('heading', { level: 1, name: 'Spring festival' })
    expect(heading).toHaveAttribute('id', 'page-title')
    expect(heading).toHaveAttribute('aria-describedby', 'title-help')
  })

  it('keeps Chinese title text in the semantic heading name', () => {
    render(<StarTitle>太中了</StarTitle>)
    expect(screen.getByRole('heading', { level: 2, name: '太中了' })).toBeInTheDocument()
  })

  it('accepts the visual controls while keeping the heading semantic', () => {
    render(
      <StarTitle color="#5f8f7a" fontSize={34} letterSpacing={10} showShadow={false}>
        Forest ledger
      </StarTitle>,
    )

    const heading = screen.getByRole('heading', { level: 2, name: 'Forest ledger' })
    expect(heading).toHaveStyle({ fontSize: '34px' })
  })

  it('derives high and low surface colors from the requested fill', () => {
    const palette = deriveTitlePalette([95, 143, 122])

    expect(palette.fill).toEqual([95, 143, 122])
    expect(palette.highlight).not.toEqual(palette.fill)
    expect(palette.fleckLight).not.toEqual(palette.fill)
    expect(palette.fleckDark).not.toEqual(palette.fill)
    expect(palette.highlight[0] + palette.highlight[1] + palette.highlight[2]).toBeGreaterThan(
      palette.fill[0] + palette.fill[1] + palette.fill[2],
    )
  })

})
