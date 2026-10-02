import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Popup from './Popup'

describe('Popup', () => {
  it('renders content when open is true', () => {
    const { container } = render(
      <Popup open placement="right-start" title="标题" content="弹窗内容">
        <button type="button">trigger</button>
      </Popup>
    )

    expect(screen.getByText('标题')).toBeInTheDocument()
    expect(screen.getByText('弹窗内容')).toBeInTheDocument()
    expect(container.querySelector('[class*="stardew-card"]')).toBeNull()
  })

  it('does not render bubble when open is false', () => {
    render(
      <Popup open={false} placement="right-start" title="标题" content="弹窗内容">
        <button type="button">trigger</button>
      </Popup>
    )

    expect(screen.queryByText('标题')).not.toBeInTheDocument()
    expect(screen.queryByText('弹窗内容')).not.toBeInTheDocument()
  })

  it('renders action buttons and handles click', () => {
    const onConfirm = vi.fn()

    const { container } = render(
      <Popup
        open
        placement="bottom"
        content="弹窗内容"
        actions={[
          { label: '取消' },
          { label: '确认', variant: 'primary', onClick: onConfirm },
        ]}
      >
        <button type="button">trigger</button>
      </Popup>
    )

    expect(container.querySelector('[class*="stardew-card"]')).toBeNull()
    fireEvent.click(screen.getByText('确认'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('notifies controlled click popups when the trigger and outside area are clicked', () => {
    const onOpenChange = vi.fn()

    render(
      <div>
        <Popup
          open
          trigger="click"
          placement="bottom"
          title="标题"
          content="弹窗内容"
          onOpenChange={onOpenChange}
        >
          <button type="button">trigger</button>
        </Popup>
        <button type="button">outside</button>
      </div>
    )

    fireEvent.click(screen.getByRole('button', { name: 'trigger' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)

    fireEvent.click(screen.getByRole('button', { name: 'outside' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('Popup as a tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens after the enter delay and closes after the leave delay', async () => {
    render(
      <Popup mouseEnterDelay={300} mouseLeaveDelay={200} content="提示内容">
        <button type="button">trigger</button>
      </Popup>,
    )

    const root = screen.getByRole('button', { name: 'trigger' }).parentElement!.parentElement!

    fireEvent.mouseEnter(root)
    expect(screen.queryByText('提示内容')).not.toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(320)
    })
    expect(screen.getByText('提示内容')).toBeInTheDocument()

    fireEvent.mouseLeave(root)
    expect(screen.getByText('提示内容')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(220)
    })
    expect(screen.queryByText('提示内容')).not.toBeInTheDocument()
  })

  it('shows immediately when the enter delay is zero', () => {
    render(
      <Popup mouseEnterDelay={0} content="立刻出现">
        <button type="button">trigger</button>
      </Popup>,
    )

    const root = screen.getByRole('button', { name: 'trigger' }).parentElement!.parentElement!
    fireEvent.mouseEnter(root)

    expect(screen.getByText('立刻出现')).toBeInTheDocument()
  })

  it('raises the bubble on focus and drops it on blur with no delay', () => {
    render(
      <Popup content="聚焦提示">
        <button type="button">trigger</button>
      </Popup>,
    )

    const root = screen.getByRole('button', { name: 'trigger' }).parentElement!.parentElement!

    fireEvent.focus(root)
    expect(screen.getByText('聚焦提示')).toBeInTheDocument()

    fireEvent.blur(root)
    expect(screen.queryByText('聚焦提示')).not.toBeInTheDocument()
  })

  it('dismisses an open bubble on Escape', () => {
    render(
      <Popup content="按 Esc 收起">
        <button type="button">trigger</button>
      </Popup>,
    )

    const root = screen.getByRole('button', { name: 'trigger' }).parentElement!.parentElement!
    fireEvent.focus(root)
    expect(screen.getByText('按 Esc 收起')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByText('按 Esc 收起')).not.toBeInTheDocument()
  })

  it('starts open when defaultOpen is set', () => {
    render(
      <Popup defaultOpen content="默认展开">
        <button type="button">trigger</button>
      </Popup>,
    )

    expect(screen.getByText('默认展开')).toBeInTheDocument()
  })

  it('hides the arrow on request', () => {
    const { container } = render(
      <Popup defaultOpen content="无箭头">
        <button type="button">trigger</button>
      </Popup>,
    )
    expect(container.querySelector('[class*="arrow-host"]')).toBeInTheDocument()

    const { container: bare } = render(
      <Popup defaultOpen arrow={false} content="无箭头">
        <button type="button">trigger</button>
      </Popup>,
    )
    expect(bare.querySelector('[class*="arrow-host"]')).not.toBeInTheDocument()
  })
})

describe('Popup semantics and colour', () => {
  it('labels a plain hover bubble as a tooltip and wires aria-describedby', () => {
    render(
      <Popup defaultOpen content="纯提示">
        <button type="button">trigger</button>
      </Popup>,
    )

    const bubble = screen.getByRole('tooltip')
    expect(bubble).toHaveTextContent('纯提示')

    const root = screen.getByRole('button', { name: 'trigger' }).parentElement!.parentElement!
    expect(root.getAttribute('aria-describedby')).toBe(bubble.id)
  })

  it('switches to role dialog once the bubble carries actions', () => {
    render(
      <Popup defaultOpen content="带按钮" actions={[{ label: '确认' }]}>
        <button type="button">trigger</button>
      </Popup>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('honours an explicit role override', () => {
    render(
      <Popup defaultOpen role="none" content="不播报">
        <button type="button">trigger</button>
      </Popup>,
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('derives the plate palette from the color prop', () => {
    const { container } = render(
      <Popup defaultOpen color="#71964A" content="彩色气泡">
        <button type="button">trigger</button>
      </Popup>,
    )

    const wrap = container.querySelector('[class*="bubble-wrap"]') as HTMLElement
    expect(wrap.style.getPropertyValue('--wood-panel-surface')).toBe('#71964a')
    expect(wrap.style.getPropertyValue('--wood-panel-border')).not.toBe('')
  })
})
