import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getMonthStartTimestamp } from '../../utils/calendar'
import Calendar from './Calendar'

const MAY_2024 = new Date(2024, 4, 1).getTime()

function getDayButton(label: string) {
  return screen.getByRole('button', { name: label })
}

describe('Calendar', () => {
  it('renders event markers on the matching day', () => {
    render(
      <Calendar
        value={MAY_2024}
        items={[
          {
            date: '2024-05-13',
            title: 'Egg Festival',
            description: 'Town square gathering.',
          },
        ]}
      />,
    )

    const dayButton = getDayButton('2024-05-13')

    expect(within(dayButton).getByLabelText('Egg Festival')).toBeInTheDocument()
  })

  it('uses icon priority node over src over key', () => {
    render(
      <Calendar
        value={MAY_2024}
        iconMap={{
          seed: <span data-testid="key-icon">Key icon</span>,
        }}
        items={[
          {
            date: '2024-05-13',
            title: 'Node icon item',
            iconNode: <span data-testid="node-icon">Node icon</span>,
            iconSrc: '/icon-src.png',
            iconKey: 'seed',
          },
          {
            date: '2024-05-13',
            title: 'Src icon item',
            iconSrc: '/icon-src.png',
            iconKey: 'seed',
          },
          {
            date: '2024-05-13',
            title: 'Key icon item',
            iconKey: 'seed',
          },
        ]}
      />,
    )

    const dayButton = getDayButton('2024-05-13')

    expect(within(dayButton).getByTestId('node-icon')).toBeInTheDocument()
    expect(within(dayButton).getByAltText('Src icon item')).toHaveAttribute('src', '/icon-src.png')
    expect(within(dayButton).getByTestId('key-icon')).toBeInTheDocument()
    expect(within(dayButton).queryByAltText('Node icon item')).toBeNull()
  })

  it('shows +N summary when markers exceed visible limit', () => {
    render(
      <Calendar
        value={MAY_2024}
        maxVisibleMarkers={2}
        items={[
          { date: '2024-05-13', title: 'One' },
          { date: '2024-05-13', title: 'Two' },
          { date: '2024-05-13', title: 'Three' },
          { date: '2024-05-13', title: 'Four' },
        ]}
      />,
    )

    const dayButton = getDayButton('2024-05-13')

    expect(within(dayButton).getAllByLabelText(/^(One|Two)$/)).toHaveLength(2)
    expect(within(dayButton).getByText('+2')).toBeInTheDocument()
  })

  it('shows full item details on hover or focus', () => {
    render(
      <Calendar
        value={MAY_2024}
        items={[
          {
            date: '2024-05-13',
            title: 'Egg Festival',
            description: 'Town square gathering.',
          },
          {
            date: '2024-05-13',
            title: 'Harvey Visit',
            description: 'Clinic checkup reminder.',
          },
        ]}
      />,
    )

    const dayButton = getDayButton('2024-05-13')

    fireEvent.mouseEnter(dayButton)

    expect(screen.getByText('Egg Festival')).toBeInTheDocument()
    expect(screen.getByText('Town square gathering.')).toBeInTheDocument()
    expect(screen.getByText('Harvey Visit')).toBeInTheDocument()
    expect(screen.getByText('Clinic checkup reminder.')).toBeInTheDocument()

    fireEvent.mouseLeave(dayButton)

    expect(screen.queryByText('Egg Festival')).toBeNull()

    fireEvent.focus(dayButton)

    expect(screen.getByText('Egg Festival')).toBeInTheDocument()
    expect(screen.getByText('Town square gathering.')).toBeInTheDocument()
    expect(screen.getByText('Harvey Visit')).toBeInTheDocument()
    expect(screen.getByText('Clinic checkup reminder.')).toBeInTheDocument()
  })

  it('shows full item details on click for pointer users', () => {
    render(
      <Calendar
        value={MAY_2024}
        items={[
          {
            date: '2024-05-13',
            title: 'Luau Prep',
            description: 'Bring a gold-quality ingredient.',
          },
        ]}
      />,
    )

    const dayButton = getDayButton('2024-05-13')

    fireEvent.click(dayButton)

    expect(screen.getByText('Luau Prep')).toBeInTheDocument()
    expect(screen.getByText('Bring a gold-quality ingredient.')).toBeInTheDocument()
  })

  it('clears stale details when a controlled value changes to another month', () => {
    const { rerender } = render(
      <Calendar
        value={MAY_2024}
        items={[
          {
            date: '2024-05-13',
            title: 'Egg Festival',
            description: 'Town square gathering.',
          },
        ]}
      />,
    )

    fireEvent.click(getDayButton('2024-05-13'))

    expect(screen.getByText('Egg Festival')).toBeInTheDocument()

    rerender(
      <Calendar
        value={new Date(2024, 5, 1).getTime()}
        items={[
          {
            date: '2024-05-13',
            title: 'Egg Festival',
            description: 'Town square gathering.',
          },
        ]}
      />,
    )

    expect(screen.queryByText('Egg Festival')).toBeNull()
  })

  it('shows details for a valid day timestamp of zero', () => {
    render(
      <Calendar
        value={new Date(1970, 0, 1).getTime()}
        items={[
          {
            date: new Date(1970, 0, 1).getTime(),
            title: 'New Year',
            description: 'The first day of the Unix epoch.',
          },
        ]}
      />,
    )

    fireEvent.click(getDayButton('1970-01-01'))

    expect(screen.getByText('New Year')).toBeInTheDocument()
    expect(screen.getByText('The first day of the Unix epoch.')).toBeInTheDocument()
  })

  it('clicking month navigation triggers onMonthChange with the normalized month start timestamp', () => {
    const handleMonthChange = vi.fn()

    render(
      <Calendar
        value={MAY_2024}
        onMonthChange={handleMonthChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))

    expect(handleMonthChange).toHaveBeenCalledWith(getMonthStartTimestamp('2024-06-01'))
  })
})
