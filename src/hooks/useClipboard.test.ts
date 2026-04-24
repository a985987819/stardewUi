import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useClipboard } from './useClipboard'

describe('useClipboard', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useClipboard())
    expect(result.current.copied).toBe(false)
  })

  it('should copy text to clipboard', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    })

    const { result } = renderHook(() => useClipboard())

    await act(async () => {
      await result.current.copy('test text')
    })

    expect(mockWriteText).toHaveBeenCalledWith('test text')
    expect(result.current.copied).toBe(true)
  })

  it('should reset copied state', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    })

    const { result } = renderHook(() => useClipboard())

    await act(async () => {
      await result.current.copy('test text')
    })

    expect(result.current.copied).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.copied).toBe(false)
  })
})
