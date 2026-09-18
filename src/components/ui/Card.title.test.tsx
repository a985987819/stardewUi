import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card'

describe('Card title area', () => {
  it('does not render title area by default', () => {
    render(<Card title="榛樿鍗＄墖">鍐呭</Card>)

    expect(screen.queryByRole('heading', { name: '榛樿鍗＄墖' })).not.toBeInTheDocument()
  })

  it('renders title area when showTitle is enabled', () => {
    render(
      <Card title="榛樿鍗＄墖" showTitle>
        鍐呭
      </Card>
    )

    expect(screen.getByRole('heading', { name: '榛樿鍗＄墖' })).toBeInTheDocument()
  })

  it('applies derived card lighting variables from the visible surface color', () => {
    const { container } = render(
      <Card title="Big Chest" showTitle>
        Content
      </Card>
    )

    expect(container.firstElementChild).toHaveStyle({
      '--card-right-edge-shadow': '#d49667',
    })
  })

  it('exposes a derived title shadow variable for card text', () => {
    const { container } = render(
      <Card title="Big Chest" showTitle>
        Content
      </Card>
    )

    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--card-title-text-shadow')).toBe(
      'rgba(154, 82, 9, 0.28)'
    )
  })
})
