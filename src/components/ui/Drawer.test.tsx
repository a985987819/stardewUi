import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Drawer from './Drawer'
import styles from './Drawer.module.scss'

const DRAWER_TRANSITION_MS = 200

describe('Drawer', () => {
  afterEach(() => {
    vi.useRealTimers()
  })
  it('does not render while closed', () => {
    render(<Drawer open={false}>抽屉内容</Drawer>)

    expect(screen.queryByText('抽屉内容')).not.toBeInTheDocument()
  })

  it.each(['top', 'right', 'bottom', 'left'] as const)('renders from the %s edge', async (placement) => {
    render(<Drawer open placement={placement}>抽屉内容</Drawer>)

    await waitFor(() => expect(screen.getByText('抽屉内容')).toBeInTheDocument())

    expect(document.querySelector(`.${styles[`stardew-drawer--${placement}`]}`)).toBeInTheDocument()
  })

  it.each(['top', 'right', 'bottom', 'left'] as const)(
    'keeps the %s entry state for the full transition duration',
    async (placement) => {
      vi.useFakeTimers()
      render(<Drawer open placement={placement}>抽屉内容</Drawer>)

      await act(async () => {
        vi.advanceTimersByTime(32)
      })

      const drawer = document.querySelector(`.${styles['stardew-drawer']}`)
      expect(drawer).toHaveAttribute('data-placement', placement)
      expect(drawer).toHaveAttribute('data-state', 'opening')

      await act(async () => {
        vi.advanceTimersByTime(DRAWER_TRANSITION_MS)
      })

      expect(drawer).toHaveAttribute('data-state', 'open')
    }
  )

  it.each(['top', 'right', 'bottom', 'left'] as const)(
    'uses the explicit %s closing state while it exits',
    async (placement) => {
      vi.useFakeTimers()
      const { rerender } = render(<Drawer open placement={placement}>抽屉内容</Drawer>)

      await act(async () => {
        vi.advanceTimersByTime(32)
      })

      rerender(<Drawer open={false} placement={placement}>抽屉内容</Drawer>)

      await act(async () => {
        vi.advanceTimersByTime(16)
      })

      const drawer = document.querySelector(`.${styles['stardew-drawer']}`)
      expect(drawer).toHaveAttribute('data-placement', placement)
      expect(drawer).toHaveAttribute('data-state', 'closing')
      expect(drawer).toHaveClass(styles[`stardew-drawer--${placement}`])
    }
  )

  it.each(['top', 'right', 'bottom', 'left'] as const)(
    'keeps the %s placement while closing after its caller resets the prop',
    async (placement) => {
      vi.useFakeTimers()
      const { rerender } = render(<Drawer open placement={placement}>抽屉内容</Drawer>)

      await act(async () => {
        vi.advanceTimersByTime(32)
      })

      rerender(<Drawer open={false}>抽屉内容</Drawer>)

      await act(async () => {
        vi.advanceTimersByTime(16)
      })

      const drawer = document.querySelector(`.${styles['stardew-drawer']}`)
      expect(drawer).toHaveAttribute('data-placement', placement)
      expect(drawer).toHaveClass(styles[`stardew-drawer--${placement}`])
      expect(drawer).toHaveAttribute('data-state', 'closing')
    }
  )

  it('renders an optional title, footer, and caller class name', async () => {
    render(
      <Drawer open title="背包" footer={<button type="button">保存</button>} className="farm-drawer">
        种子清单
      </Drawer>
    )

    await waitFor(() => expect(screen.getByText('种子清单')).toBeInTheDocument())

    expect(screen.getByText('背包')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
    expect(document.querySelector('.farm-drawer')).toBeInTheDocument()
  })

  it('applies caller maskStyle directly to the backdrop', async () => {
    render(<Drawer open maskStyle={{ backgroundColor: 'rgb(1, 2, 3)' }}>内容</Drawer>)

    await waitFor(() => expect(screen.getByText('内容')).toBeInTheDocument())

    const mask = document.querySelector(`.${styles['stardew-drawer__mask']}`) as HTMLElement
    expect(mask.style.backgroundColor).toBe('rgb(1, 2, 3)')
  })

  it('focuses the app page by default and can disable that effect', async () => {
    const { rerender } = render(
      <div data-star-app="true">
        <Drawer open>内容</Drawer>
      </div>
    )

    await waitFor(() => expect(screen.getByText('内容')).toBeInTheDocument())
    expect(document.querySelector('[data-star-app="true"]')).toHaveClass('stardew-drawer-page-focused')

    rerender(
      <div data-star-app="true">
        <Drawer open focusEffect={false}>内容</Drawer>
      </div>
    )

    expect(document.querySelector('[data-star-app="true"]')).not.toHaveClass('stardew-drawer-page-focused')
  })

  it('requests closing from the close button, mask, and Escape key', async () => {
    const onClose = vi.fn()
    render(<Drawer open title="设置" onClose={onClose}>内容</Drawer>)

    await waitFor(() => expect(screen.getByText('内容')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }))
    fireEvent.click(document.querySelector(`.${styles['stardew-drawer__mask']}`) as Element)
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('does not close from the mask when maskClosable is false', async () => {
    const onClose = vi.fn()
    render(<Drawer open maskClosable={false} onClose={onClose}>内容</Drawer>)

    await waitFor(() => expect(screen.getByText('内容')).toBeInTheDocument())
    fireEvent.click(document.querySelector(`.${styles['stardew-drawer__mask']}`) as Element)

    expect(onClose).not.toHaveBeenCalled()
  })
})
