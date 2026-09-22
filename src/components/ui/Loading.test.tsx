import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import StarLoading from './Loading'

describe('StarLoading', () => {
  beforeEach(() => { vi.useFakeTimers() })

  it('renders a sprinkler centre and eight bare carrots without a progress bar', () => {
    const { container } = render(<StarLoading />)
    expect(screen.getByRole('status')).toHaveAccessibleName('正在加载')
    expect(container.querySelectorAll('img')).toHaveLength(9)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(container.querySelectorAll('[data-grown]')).toHaveLength(0)
  })

  it('uses a 600ms default interval between growth steps', () => {
    const { container } = render(<StarLoading text="" />)

    act(() => { vi.advanceTimersByTime(599) })
    expect(container.querySelectorAll('[data-grown]')).toHaveLength(0)

    act(() => { vi.advanceTimersByTime(1) })
    expect(container.querySelectorAll('[data-grown]')).toHaveLength(1)
  })

  it('grows carrots clockwise once every 600ms and advances the trailing dots', () => {
    const { container } = render(<StarLoading text="正在生长..." />)
    act(() => { vi.advanceTimersByTime(600) })
    expect(container.querySelectorAll('[data-grown]')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveAccessibleName('正在生长.')

    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.getByRole('status')).toHaveAccessibleName('正在生长..')

    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.getByRole('status')).toHaveAccessibleName('正在生长...')

    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.getByRole('status')).toHaveAccessibleName('正在生长')
  })

  it('uses speed as the millisecond interval between carrot growth steps', () => {
    const { container } = render(<StarLoading text="" speed={240} />)

    act(() => { vi.advanceTimersByTime(239) })
    expect(container.querySelectorAll('[data-grown]')).toHaveLength(0)

    act(() => { vi.advanceTimersByTime(1) })
    expect(container.querySelectorAll('[data-grown]')).toHaveLength(1)
  })

  it('resets all carrots one step after the eighth carrot has grown', () => {
    const { container } = render(<StarLoading text="" />)
    for (let index = 0; index < 8; index += 1) act(() => { vi.advanceTimersByTime(600) })
    const loading = screen.getByRole('status')
    expect(container.querySelectorAll('[data-grown]')).toHaveLength(8)
    expect(loading).toHaveAttribute('data-phase', 'complete')
    act(() => { vi.advanceTimersByTime(600) })
    expect(container.querySelectorAll('[data-grown]')).toHaveLength(0)
  })
})
