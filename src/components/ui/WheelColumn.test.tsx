import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import WheelColumn from './WheelColumn'

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1)

/** jsdom 里 scrollTop 赋值会被当成 0，所以用显式的 setter 让滚动真的「动」。 */
function makeScrollerScrollable(element: HTMLElement) {
  let scrollTop = 0

  Object.defineProperty(element, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = value
    },
  })
}

function getScroller(label: string) {
  return screen.getByRole('listbox', { name: label })
}

describe('WheelColumn', () => {
  it('renders the whole window with the selected value in the middle', () => {
    render(<WheelColumn values={MONTHS} value={5} onChange={() => {}} ariaLabel="月" visibleCount={5} />)

    const options = screen.getAllByRole('option')

    // 可见 5 行 + 1 行对齐冗余 = stride 6，选中行落在正中（下标 2）。
    expect(options).toHaveLength(6)
    expect(options[2]).toHaveTextContent('5')
    expect(options[2]).toHaveAttribute('aria-selected', 'true')
    expect(options[1]).toHaveTextContent('4')
    expect(options[3]).toHaveTextContent('6')
  })

  it('loops the window past the end of the candidate list', () => {
    const days = Array.from({ length: 31 }, (_, index) => index + 1)

    render(
      <WheelColumn values={days} value={30} onChange={() => {}} ariaLabel="日" visibleCount={5} loop />,
    )

    const labels = screen.getAllByRole('option').map((option) => option.textContent)

    // 选中 30 号时，窗口已经翻到 31 号之后 —— 后两行是 1、2，而不是留空。
    expect(labels).toEqual([28, 29, 30, 31, 1, 2].map(String))
    expect(screen.getAllByRole('option')[2]).toHaveAttribute('aria-selected', 'true')
  })

  it('wraps the window across the December/January seam', () => {
    render(<WheelColumn values={MONTHS} value={12} onChange={() => {}} ariaLabel="月" visibleCount={5} loop />)

    const labels = screen.getAllByRole('option').map((option) => option.textContent)

    // 12 月**本身**就是那张牌：它后面接的是 1、2，翻过去不用重开一圈。
    expect(labels).toEqual(['10', '11', '12', '1', '2', '3'])
  })

  it('pads a bounded column with blanks instead of wrapping', () => {
    // 年份不循环：最老的那一年再往上应该是空白，而不是跳到最新的一年。
    render(<WheelColumn values={MONTHS} value={1} onChange={() => {}} ariaLabel="年" visibleCount={5} />)

    // 空行是 `role="presentation"`，所以要连窗口一起取，不能只取 option。
    const rows = screen.getByRole('listbox', { name: '年' }).children

    expect(rows).toHaveLength(6)
    expect(rows[0]).toHaveTextContent('')
    expect(rows[1]).toHaveTextContent('')
    expect(rows[2]).toHaveTextContent('1')
    expect(rows[2]).toHaveAttribute('aria-selected', 'true')
    expect(rows[3]).toHaveTextContent('2')
  })

  it('moves one step per arrow key', () => {
    const handleChange = vi.fn()

    render(<WheelColumn values={MONTHS} value={5} onChange={handleChange} ariaLabel="月" visibleCount={5} />)

    fireEvent.keyDown(getScroller('月'), { key: 'ArrowDown' })

    expect(handleChange).toHaveBeenCalledWith(6)
  })

  it('crosses the loop boundary with the arrow keys', () => {
    const handleChange = vi.fn()

    render(
      <WheelColumn values={MONTHS} value={12} onChange={handleChange} ariaLabel="月" visibleCount={5} loop />,
    )

    fireEvent.keyDown(getScroller('月'), { key: 'ArrowDown' })

    // 12 月之后再走一格就是 1 月。
    expect(handleChange).toHaveBeenCalledWith(1)
  })

  it('selects the clicked row', () => {
    const handleChange = vi.fn()

    render(<WheelColumn values={MONTHS} value={5} onChange={handleChange} ariaLabel="月" visibleCount={5} />)

    fireEvent.click(screen.getAllByRole('option')[3])

    expect(handleChange).toHaveBeenCalledWith(6)
  })

  it('does not emit a change while a drag is in flight', () => {
    const handleChange = vi.fn()

    render(<WheelColumn values={MONTHS} value={5} onChange={handleChange} ariaLabel="月" visibleCount={5} />)

    const scroller = getScroller('月')
    makeScrollerScrollable(scroller)

    fireEvent.pointerDown(scroller, { pointerId: 1, pointerType: 'touch', clientY: 100 })
    fireEvent.pointerMove(scroller, { pointerId: 1, pointerType: 'touch', clientY: 40 })

    // 拖动过程中不提交：等抬手吸附到整数行之后才回写，否则中间每一帧都是一次
    // 上游 setState。
    expect(handleChange).not.toHaveBeenCalled()

    fireEvent.pointerUp(scroller, { pointerId: 1, pointerType: 'touch', clientY: 40 })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('ignores clicks on the blank padding rows of a bounded column', () => {
    const handleChange = vi.fn()

    render(<WheelColumn values={MONTHS} value={1} onChange={handleChange} ariaLabel="年" visibleCount={5} />)

    fireEvent.click(screen.getAllByRole('presentation')[1])

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('stays inert when disabled', () => {
    const handleChange = vi.fn()

    render(
      <WheelColumn values={MONTHS} value={5} onChange={handleChange} ariaLabel="月" visibleCount={5} disabled />,
    )

    const scroller = getScroller('月')

    expect(scroller).toHaveAttribute('aria-disabled', 'true')
    expect(scroller).toHaveAttribute('tabindex', '-1')

    fireEvent.keyDown(scroller, { key: 'ArrowDown' })
    fireEvent.click(screen.getAllByRole('option')[3])

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('parks on the fallback value when the real value is not a candidate', () => {
    const february = Array.from({ length: 28 }, (_, index) => index + 1)

    render(
      <WheelColumn
        values={february}
        value={30}
        fallbackValue={28}
        onChange={() => {}}
        ariaLabel="日"
        visibleCount={5}
        loop
      />,
    )

    const selected = screen.getAllByRole('option').find(
      (option) => option.getAttribute('aria-selected') === 'true',
    )

    // 2 月没有 30 号 → 高亮落在 28 号上，但上层值仍是 30（未定）。
    expect(selected).toHaveTextContent('28')
  })

  it('exposes the value as the accessible name of every row', () => {
    render(
      <WheelColumn
        values={MONTHS}
        value={3}
        onChange={() => {}}
        ariaLabel="月"
        visibleCount={5}
        format={(item) => `${item}月`}
      />,
    )

    expect(screen.getByRole('option', { name: '3月' })).toHaveAttribute('aria-selected', 'true')
  })
})
