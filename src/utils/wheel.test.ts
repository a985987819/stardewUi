import { describe, expect, it } from 'vitest'
import {
  fromWheelOffset,
  getWheelStride,
  getWheelWindowSize,
  normalizeWheelIndex,
  resolveWheelIndex,
  toWheelOffset,
} from './wheel'

describe('wheel index math', () => {
  it('widens an even window so the selected row stays centred', () => {
    // 偶数行没有正中一行，必须补成奇数（6 → 7）；奇数原样保留。
    expect(getWheelWindowSize(5)).toBe(5)
    expect(getWheelWindowSize(6)).toBe(7)
    expect(getWheelWindowSize(1)).toBe(1)
  })

  it('keeps one alignment row of slack around the window', () => {
    // 接收器要比可见行数多一行：选中行两侧各铺 half 行上下文之后，
    // 窗口本身正好占满可见高度，多出来的那一行供 `baseOffset` 挪位。
    expect(getWheelStride(5)).toBe(6)
    expect(getWheelStride(6)).toBe(8)
    expect(getWheelStride(5)).toBe(getWheelWindowSize(5) + 1)
  })

  it('wraps a looping column past the end of its candidate list', () => {
    const count = 31
    const lastDayOfMonth = toWheelOffset(true, 0, 30, count)

    // 31 号之后是 1、2、3 —— 循环列靠连续坐标实现「无限滚动」，
    // DOM 里并没有真的多渲染一圈。
    expect(fromWheelOffset(true, lastDayOfMonth + 1, count).itemIndex).toBe(0)
    expect(fromWheelOffset(true, lastDayOfMonth + 2, count).itemIndex).toBe(1)
    expect(fromWheelOffset(true, lastDayOfMonth + 3, count).itemIndex).toBe(2)
  })

  it('wraps December back to January', () => {
    const count = 12
    const december = toWheelOffset(true, 0, 11, count)

    expect(fromWheelOffset(true, december + 1, count).itemIndex).toBe(0)
    expect(fromWheelOffset(true, december + 2, count).itemIndex).toBe(1)
  })

  it('carries the turn count across both directions', () => {
    // back → 11月；back 再一次 → 1月 的下一圈（同为 11 月，但圈数不同）。
    expect(fromWheelOffset(true, -1, 12)).toEqual({ turn: -1, itemIndex: 11 })
    expect(fromWheelOffset(true, 12, 12)).toEqual({ turn: 1, itemIndex: 0 })
    expect(toWheelOffset(true, 1, 0, 12)).toBe(12)
  })

  it('does not wrap a bounded column', () => {
    // 年份不循环：坐标就是下标本身，边界由候选列表的长度天然封住。
    expect(toWheelOffset(false, 0, 7, 12)).toBe(7)
    expect(fromWheelOffset(false, 7, 12)).toEqual({ turn: 0, itemIndex: 7 })
  })

  it('normalizes an out-of-range index while compensating the turn', () => {
    // 归一化只能改「怎么记账」，不能改逻辑值：{-1, 11} 与 {0, -1} 是同一项。
    expect(normalizeWheelIndex(true, 0, -1, 12)).toEqual({ turn: -1, itemIndex: 11 })
    expect(normalizeWheelIndex(true, 0, 12, 12)).toEqual({ turn: 1, itemIndex: 0 })
    expect(normalizeWheelIndex(false, 0, -1, 12)).toEqual({ turn: 0, itemIndex: -1 })
  })

  it('falls back to a neighbour when the value is missing from the candidates', () => {
    const days = Array.from({ length: 28 }, (_, index) => index + 1)

    expect(resolveWheelIndex(true, days, 15, 0)).toBe(14)
    // 2 月没有 30 号 → 落到补位值上，而不是让轮盘空转。
    expect(resolveWheelIndex(true, days, 30, 27)).toBe(27)
    // 非循环列越界时夹到边界，不会取模跑到另一端。
    expect(resolveWheelIndex(false, days, 30, 27)).toBe(27)
    expect(resolveWheelIndex(false, days, 0, 0)).toBe(0)
  })

  it('wraps the fallback for a looping column so it always lands in range', () => {
    const months = Array.from({ length: 12 }, (_, index) => index)

    expect(resolveWheelIndex(true, months, 99, 13)).toBe(1)
    expect(resolveWheelIndex(true, months, 99, -1)).toBe(11)
  })
})
