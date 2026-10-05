import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Alert from './Alert'
import Tag from './Tag'
import Calendar from './Calendar'

/**
 * The three "can it be undone / can it be driven from outside" gaps.
 *
 * Each of these was a one-way door: once dismissed or clicked, the component
 * kept its own state and no prop could get the content back. That breaks the
 * most ordinary uses — a filter chip the user re-adds, a form error that returns
 * on the next bad keystroke, a toast whose copy changes.
 */
describe('Tag visibility can be driven from outside', () => {
  it('does not hide itself while the caller holds it open', () => {
    // The controlled contract: `open` is the source of truth, so clicking
    // the × reports intent through `onClose` but does not yank the tag away.
    // The caller decides — that is the whole point of the controlled mode.
    const onClose = vi.fn()
    render(
      <Tag open closable onClose={onClose} closeLabel="Remove">
        农场
      </Tag>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByText('农场')).toBeInTheDocument()
  })

  it('hides and restores as the caller flips open', () => {
    const { rerender } = render(
      <Tag open={false} closable closeLabel="Remove">
        农场
      </Tag>,
    )
    expect(screen.queryByText('农场')).not.toBeInTheDocument()

    rerender(
      <Tag open closable closeLabel="Remove">
        农场
      </Tag>,
    )
    expect(screen.getByText('农场')).toBeInTheDocument()
  })

  it('keeps self-dismissing in the uncontrolled mode', () => {
    render(
      <Tag closable closeLabel="Remove">
        农场
      </Tag>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.queryByText('农场')).not.toBeInTheDocument()
  })

  it('honours defaultOpen for the uncontrolled start state', () => {
    render(
      <Tag defaultOpen={false} closable closeLabel="Remove">
        农场
      </Tag>,
    )
    expect(screen.queryByText('农场')).not.toBeInTheDocument()
  })
})

describe('Alert visibility can be driven from outside', () => {
  it('brings a form error back when the field goes bad again', () => {
    // The canonical case: user fixes the field, alert dismissed; user breaks
    // it again, the message must return.
    const { rerender } = render(
      <Alert open type="error" closable closeLabel="知道了">
        种子名称不能为空
      </Alert>,
    )
    expect(screen.getByText('种子名称不能为空')).toBeInTheDocument()

    rerender(
      <Alert open={false} type="error" closable closeLabel="知道了">
        种子名称不能为空
      </Alert>,
    )
    expect(screen.queryByText('种子名称不能为空')).not.toBeInTheDocument()

    rerender(
      <Alert open type="error" closable closeLabel="知道了">
        种子名称不能为空
      </Alert>,
    )
    expect(screen.getByText('种子名称不能为空')).toBeInTheDocument()
  })

  it('still dismisses itself when uncontrolled', () => {
    const onClose = vi.fn()
    render(
      <Alert type="warning" closable closeLabel="知道了" onClose={onClose}>
        背包快满了
      </Alert>,
    )

    fireEvent.click(screen.getByRole('button', { name: '知道了' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('背包快满了')).not.toBeInTheDocument()
  })
})

describe('Calendar reports the selected day', () => {
  it('fires onSelect with the clicked day timestamp', () => {
    // The calendar previously had no way to report a selection at all: clicking
    // set an internal tooltip state and nothing else, so `value` could never be
    // driven from a click and `onMonthChange` only covered paging.
    const onSelect = vi.fn()
    render(<Calendar defaultValue={new Date(2026, 4, 1).getTime()} onSelect={onSelect} />)

    const grid = screen.getByRole('grid')
    const day = grid.querySelector('button[data-day="15"]') ?? screen.getAllByRole('button')[8]
    fireEvent.click(day)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(typeof onSelect.mock.calls[0][0]).toBe('number')
  })
})
