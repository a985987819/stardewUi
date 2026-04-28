import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import StarLoading, { getBunJoltOffset } from './Loading'

const context2dMock = {
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  clip: vi.fn(),
  drawImage: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  ellipse: vi.fn(),
  set fillStyle(_: string) {},
  set strokeStyle(_: string) {},
  set lineWidth(_: number) {},
  set lineJoin(_: string) {},
  set lineCap(_: string) {},
  set globalCompositeOperation(_: string) {},
} as unknown as CanvasRenderingContext2D

describe('StarLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context2dMock)
  })

  it('keeps zero offset before the first bite and resets after the animation completes', () => {
    expect(getBunJoltOffset(28, 0, 1)).toEqual({ x: 0, y: 0 })
    expect(getBunJoltOffset(28, 1, 0)).toEqual({ x: 0, y: 0 })
  })

  it('adds a brief jolt when a new bite appears and lets it decay back to rest', () => {
    render(<StarLoading text="" size={28} />)

    const status = screen.getByRole('status')
    expect(status.style.getPropertyValue('--star-loading-jolt-x')).toBe('0px')
    expect(status.style.getPropertyValue('--star-loading-jolt-y')).toBe('0px')

    act(() => {
      vi.advanceTimersByTime(240)
    })

    const joltX = status.style.getPropertyValue('--star-loading-jolt-x')
    const joltY = status.style.getPropertyValue('--star-loading-jolt-y')

    expect(joltX).not.toBe('0px')
    expect(joltY).not.toBe('0px')

    act(() => {
      vi.advanceTimersByTime(120)
    })

    expect(status.style.getPropertyValue('--star-loading-jolt-x')).toBe('0px')
    expect(status.style.getPropertyValue('--star-loading-jolt-y')).toBe('0px')
  })
})
