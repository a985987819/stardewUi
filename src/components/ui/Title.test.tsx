import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StarTitle from './Title'

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

})
