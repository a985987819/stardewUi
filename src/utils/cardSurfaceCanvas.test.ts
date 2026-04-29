import { describe, expect, it, vi } from 'vitest'
import { drawCardSurfaceStripes, getCardStripeSegments } from './cardSurfaceCanvas'

describe('cardSurfaceCanvas', () => {
  it('splits the section height into equal stripe segments', () => {
    expect(getCardStripeSegments(40, ['#1', '#2', '#3', '#4'])).toEqual([
      { color: '#1', start: 0, size: 10 },
      { color: '#2', start: 10, size: 10 },
      { color: '#3', start: 20, size: 10 },
      { color: '#4', start: 30, size: 10 },
    ])
  })

  it('draws hard stripe fills without smoothing', () => {
    const clearRect = vi.fn()
    const fillRect = vi.fn()
    const ctx = {
      clearRect,
      fillRect,
      fillStyle: '',
      imageSmoothingEnabled: true,
    } as unknown as CanvasRenderingContext2D

    drawCardSurfaceStripes(ctx, {
      width: 120,
      height: 80,
      stripes: ['#a', '#b', '#c', '#d'],
    })

    expect(clearRect).toHaveBeenCalledWith(0, 0, 120, 80)
    expect(ctx.imageSmoothingEnabled).toBe(false)
    expect(fillRect).toHaveBeenNthCalledWith(1, 0, 0, 120, 20)
    expect(fillRect).toHaveBeenNthCalledWith(2, 0, 20, 120, 20)
    expect(fillRect).toHaveBeenNthCalledWith(3, 0, 40, 120, 20)
    expect(fillRect).toHaveBeenNthCalledWith(4, 0, 60, 120, 20)
  })
})
