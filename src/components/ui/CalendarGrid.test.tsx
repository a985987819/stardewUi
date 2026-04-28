import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { buildCalendarCells } from '../../utils/calendar'
import CalendarGrid from './CalendarGrid'

const MAY_2024_LABEL = '2024\u5e745\u6708'
const WEEKDAY_LABELS = ['\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d', '\u65e5']

describe('CalendarGrid', () => {
  it('renders Monday-first weekday headers and 42 date cells', () => {
    const cells = buildCalendarCells('2024-05-01')

    render(<CalendarGrid monthLabel={MAY_2024_LABEL} cells={cells} />)

    expect(screen.getByText(MAY_2024_LABEL)).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(
      WEEKDAY_LABELS,
    )
    expect(screen.getAllByRole('gridcell')).toHaveLength(42)
  })

  it('uses rowgroups and rows for the grid structure', () => {
    const cells = buildCalendarCells('2024-05-01')

    render(<CalendarGrid monthLabel={MAY_2024_LABEL} cells={cells} />)

    const grid = screen.getByRole('grid', { name: MAY_2024_LABEL })
    const rowgroups = within(grid).getAllByRole('rowgroup')
    const headerRows = within(rowgroups[0]).getAllByRole('row')
    const bodyRows = within(rowgroups[1]).getAllByRole('row')

    expect(rowgroups).toHaveLength(2)
    expect(headerRows).toHaveLength(1)
    expect(within(headerRows[0]).getAllByRole('columnheader')).toHaveLength(7)
    expect(bodyRows).toHaveLength(6)
    bodyRows.forEach((row) => {
      expect(within(row).getAllByRole('gridcell')).toHaveLength(7)
    })
  })

  it('hides outside-month values as non-interactive cells when showOutsideDays is false', () => {
    const cells = buildCalendarCells('2024-05-01')
    const outsideMonthIndex = cells.findIndex((cell) => !cell.inCurrentMonth)

    render(<CalendarGrid monthLabel={MAY_2024_LABEL} cells={cells} showOutsideDays={false} />)

    const gridcells = screen.getAllByRole('gridcell')
    const outsideCell = gridcells[outsideMonthIndex]

    expect(outsideCell).toHaveTextContent('')
    expect(within(outsideCell).queryByRole('button')).toBeNull()
  })

  it('clicking a cell calls onSelectDay with the correct timestamp', () => {
    const cells = buildCalendarCells('2024-05-01')
    const handleSelectDay = vi.fn()
    const targetCellIndex = 10
    const targetCell = cells[targetCellIndex]

    render(
      <CalendarGrid
        monthLabel={MAY_2024_LABEL}
        cells={cells}
        onSelectDay={handleSelectDay}
      />,
    )

    const gridcells = screen.getAllByRole('gridcell')

    fireEvent.click(within(gridcells[targetCellIndex]).getByRole('button'))

    expect(handleSelectDay).toHaveBeenCalledWith(targetCell.dateTimestamp)
  })

  it('disabled cell does not trigger click callback', () => {
    const cells = buildCalendarCells('2024-05-01')
    const handleSelectDay = vi.fn()
    const disabledCellIndex = 12
    const disabledCell = cells[disabledCellIndex]

    render(
      <CalendarGrid
        monthLabel={MAY_2024_LABEL}
        cells={cells}
        onSelectDay={handleSelectDay}
        isDisabled={(dayTimestamp) => dayTimestamp === disabledCell.dateTimestamp}
      />,
    )

    const gridcells = screen.getAllByRole('gridcell')

    fireEvent.click(within(gridcells[disabledCellIndex]).getByRole('button'))

    expect(handleSelectDay).not.toHaveBeenCalled()
  })

  it('applies semantic button props from getCellButtonProps', () => {
    const cells = buildCalendarCells('2024-05-01')
    const targetCellIndex = 14
    const targetCell = cells[targetCellIndex]

    render(
      <CalendarGrid
        monthLabel={MAY_2024_LABEL}
        cells={cells}
        getCellButtonProps={(cell) =>
          cell.dateTimestamp === targetCell.dateTimestamp
            ? {
                'aria-label': '2024-05-13',
                'aria-selected': true,
                'aria-current': 'date',
                tabIndex: -1,
              }
            : {}
        }
      />,
    )

    const gridcells = screen.getAllByRole('gridcell')
    const button = within(gridcells[targetCellIndex]).getByRole('button', {
      name: '2024-05-13',
    })

    expect(button).toHaveAttribute('aria-selected', 'true')
    expect(button).toHaveAttribute('aria-current', 'date')
    expect(button).toHaveAttribute('tabindex', '-1')
  })
})
