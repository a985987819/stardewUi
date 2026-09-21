import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import StarLoading from './Loading'
import {
  BITE_STRIKE_DURATION,
  LOADING_EMPTY_HOLD_DURATION,
  LOADING_FRAME_COUNT,
  LOADING_FRAME_DURATION,
  LOADING_VANISH_DURATION,
  RESTING_IMPULSE,
  getBiteImpulse,
} from './loadingCanvas'

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

const jolt = (element: HTMLElement) => ({
  x: element.style.getPropertyValue('--star-loading-jolt-x'),
  y: element.style.getPropertyValue('--star-loading-jolt-y'),
  scale: element.style.getPropertyValue('--star-loading-jolt-scale'),
})

describe('StarLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context2dMock)
  })

  it('starts from a settled pose', () => {
    expect(RESTING_IMPULSE).toEqual({ x: 0, y: 0, rotate: 0, scale: 1 })
  })

  it('scales a fresh bun up rather than snapping it in', () => {
    const spawn = getBiteImpulse(28, 0)

    expect(spawn.x).toBe(0)
    expect(spawn.y).toBe(0)
    expect(spawn.scale).toBeLessThan(1)
  })

  it('recolls away from each bite instead of hopping in a random direction', () => {
    // First bite lands at the top of the circle, so the bun leans downwards.
    const first = getBiteImpulse(28, 1)

    expect(first.y).toBeGreaterThan(0)
    expect(Math.abs(first.x)).toBeLessThan(0.001)
    expect(first.scale).toBeLessThan(1)

    // ...and a quarter turn later the recoil has rotated with the bite: the
    // bite is now on the right, so the bun is pushed left instead.
    const fourth = getBiteImpulse(28, 4)

    expect(fourth.x).toBeLessThan(-0.001)
    expect(Math.abs(fourth.y)).toBeLessThan(0.001)
  })

  it('shrinks the leftovers away once the circle is finished', () => {
    expect(getBiteImpulse(28, LOADING_FRAME_COUNT).scale).toBeLessThan(0.2)
  })

  it('is a smooth eased transition, not a stepped jitter', () => {
    render(<StarLoading text="" size={28} />)

    const status = screen.getByRole('status')

    expect(status.style.getPropertyValue('--star-loading-jolt-easing')).toContain('cubic-bezier')
    expect(status.style.getPropertyValue('--star-loading-jolt-duration')).not.toBe('')
  })

  it('hands over a fresh impulse on each bite and settles back to rest', () => {
    render(<StarLoading text="" size={28} />)

    const status = screen.getByRole('status')

    act(() => {
      vi.advanceTimersByTime(LOADING_FRAME_DURATION)
    })

    const bitten = jolt(status)

    expect(bitten.scale).not.toBe('1')
    expect(bitten.x !== '0px' || bitten.y !== '0px').toBe(true)

    act(() => {
      vi.advanceTimersByTime(BITE_STRIKE_DURATION)
    })

    expect(jolt(status)).toEqual({ x: '0px', y: '0px', scale: '1' })
  })

  it('eats all the way around, then holds an empty beat before restarting', () => {
    render(<StarLoading text="" size={28} />)

    const status = screen.getByRole('status')

    // One act() per bite: React batches every update inside a single act(), so
    // the effect that arms the next bite only re-runs after a commit.
    for (let bite = 0; bite <= LOADING_FRAME_COUNT; bite += 1) {
      act(() => {
        vi.advanceTimersByTime(LOADING_FRAME_DURATION)
      })
    }

    // Everything is eaten: the leftovers shrink out.
    expect(Number(status.style.getPropertyValue('--star-loading-jolt-scale'))).toBeLessThan(0.2)

    act(() => {
      vi.advanceTimersByTime(LOADING_VANISH_DURATION)
    })

    act(() => {
      vi.advanceTimersByTime(LOADING_EMPTY_HOLD_DURATION)
    })

    // A fresh bun pops back in.
    expect(Number(status.style.getPropertyValue('--star-loading-jolt-scale'))).toBeLessThan(1)
  })
})
