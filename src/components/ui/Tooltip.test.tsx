import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Tooltip from './Tooltip'
import styles from './Tooltip.module.scss'

function openTooltip(props: Record<string, unknown> = {}) {
  return render(
    <Tooltip title="挖矿小贴士" mouseEnterDelay={0} mouseLeaveDelay={0} {...props}>
      <button type="button">矿车</button>
    </Tooltip>,
  )
}

describe('Tooltip', () => {
  it('renders the trigger without a bubble until hovered', () => {
    openTooltip()

    expect(screen.getByRole('button', { name: '矿车' })).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows the bubble on hover and hides it on leave', () => {
    openTooltip()
    const trigger = screen.getByRole('button', { name: '矿车' })

    fireEvent.mouseEnter(trigger.parentElement!)
    expect(screen.getByRole('tooltip')).toHaveTextContent('挖矿小贴士')

    fireEvent.mouseLeave(trigger.parentElement!)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows the bubble on keyboard focus and hides it on blur', () => {
    openTooltip()

    fireEvent.focus(screen.getByRole('button', { name: '矿车' }))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.blur(screen.getByRole('button', { name: '矿车' }))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('links the bubble to the trigger through aria-describedby', () => {
    openTooltip()

    const trigger = screen.getByRole('button', { name: '矿车' })
    expect(trigger.parentElement).not.toHaveAttribute('aria-describedby')

    fireEvent.mouseEnter(trigger.parentElement!)
    const bubble = screen.getByRole('tooltip')
    expect(trigger.parentElement).toHaveAttribute('aria-describedby', bubble.id)
  })

  it('applies one placement modifier per side', () => {
    const { rerender } = openTooltip({ open: true, placement: 'left' })
    expect(screen.getByRole('tooltip')).toHaveClass(styles['star-tooltip__bubble--left'])

    rerender(
      <Tooltip title="挖矿小贴士" open placement="bottom">
        <button type="button">矿车</button>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip')).toHaveClass(styles['star-tooltip__bubble--bottom'])
  })

  it('respects controlled open without hover involvement', () => {
    const onOpenChange = vi.fn()
    const { rerender } = openTooltip({ open: false, onOpenChange })

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    fireEvent.mouseEnter(screen.getByRole('button', { name: '矿车' }).parentElement!)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenCalledWith(true)

    rerender(
      <Tooltip title="挖矿小贴士" open mouseEnterDelay={0} mouseLeaveDelay={0} onOpenChange={onOpenChange}>
        <button type="button">矿车</button>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('delays showing the bubble by mouseEnterDelay', () => {
    vi.useFakeTimers()
    try {
      openTooltip({ mouseEnterDelay: 300 })
      const trigger = screen.getByRole('button', { name: '矿车' })

      fireEvent.mouseEnter(trigger.parentElement!)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('dismisses the bubble with Escape while focus sits inside the trigger', () => {
    const onOpenChange = vi.fn()
    openTooltip({ defaultOpen: true, onOpenChange })

    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('button', { name: '矿车' }), { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('keeps running after unmounting mid-hover without timer warnings', () => {
    vi.useFakeTimers()
    try {
      const { unmount } = openTooltip({ mouseEnterDelay: 300 })
      fireEvent.mouseEnter(screen.getByRole('button', { name: '矿车' }).parentElement!)

      expect(() => unmount()).not.toThrow()
      expect(() => vi.advanceTimersByTime(300)).not.toThrow()
    } finally {
      vi.useRealTimers()
    }
  })
})
