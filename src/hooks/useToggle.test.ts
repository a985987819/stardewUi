import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToggle } from './useToggle'

describe('useToggle', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useToggle(false))
    expect(result.current[0]).toBe(false)
  })

  it('should return default true value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current[0]).toBe(true)
  })

  it('should toggle value', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current[1]()
    })

    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1]()
    })

    expect(result.current[0]).toBe(false)
  })

  it('should set specific value', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current[2](true)
    })

    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[2](false)
    })

    expect(result.current[0]).toBe(false)
  })
})
