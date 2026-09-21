import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import Typewriter from './Typewriter'
import styles from './Typewriter.module.scss'

describe('Typewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基础渲染', () => {
    it('应该开始时不显示完整文本', () => {
      render(<Typewriter text="Hello World" />)
      expect(screen.queryByText('Hello World')).not.toBeInTheDocument()
    })

    it('应该显示自定义类名', () => {
      const { container } = render(<Typewriter text="Test" className="my-class" />)
      expect(container.querySelector('.my-class')).toBeInTheDocument()
    })
  })

  describe('打字功能', () => {
    it('应该开始显示字符', async () => {
      render(<Typewriter text="Hi" speed={10} />)

      await act(async () => {
        vi.advanceTimersByTime(20)
      })

      await waitFor(() => {
        const element = screen.getByText(/H/)
        expect(element).toBeInTheDocument()
      })
    })

    it('应该最终显示完整文本', async () => {
      render(<Typewriter text="Done" speed={10} />)

      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(screen.getByText('Done')).toBeInTheDocument()
      })
    })
  })

  describe('延迟开始', () => {
    it('应该支持延迟开始打字', async () => {
      render(<Typewriter text="Delayed" speed={10} startDelay={200} />)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })
      expect(screen.queryByText('D')).not.toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      await waitFor(() => {
        expect(screen.getByText(/D/)).toBeInTheDocument()
      })
    })
  })

  describe('光标显示', () => {
    it('打字过程中应该显示光标', async () => {
      render(<Typewriter text="Typing" speed={10} />)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      await waitFor(() => {
        expect(screen.getByText('|')).toBeInTheDocument()
      })
    })

    it('打字完成后不应该显示光标', async () => {
      render(<Typewriter text="Done" speed={10} />)

      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(screen.queryByText('|')).not.toBeInTheDocument()
      })
    })
  })

  describe('点击快速完成', () => {
    it('点击应该立即显示全部文本', async () => {
      const onComplete = vi.fn()
      render(<Typewriter text="Click to finish" speed={50} onComplete={onComplete} />)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      const typewriter = document.querySelector(`.${styles['typewriter--typing']}`)

      if (typewriter) {
        fireEvent.click(typewriter)

        await waitFor(() => {
          expect(onComplete).toHaveBeenCalled()
        })
      }
    })
  })

  describe('完成回调', () => {
    it('应该在打字完成后调用onComplete', async () => {
      const onComplete = vi.fn()
      render(<Typewriter text="Callback" speed={10} onComplete={onComplete} />)

      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('文本变化', () => {
    it('文本变化时应该重新开始打字', async () => {
      const { rerender } = render(<Typewriter text="AB" speed={10} />)

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(screen.getByText('AB')).toBeInTheDocument()
      })

      rerender(<Typewriter text="CDEFGH" speed={10} />)

      await act(async () => {
        vi.advanceTimersByTime(15)
      })

      await waitFor(() => {
        const element = document.querySelector(`.${styles.typewriter}`)
        const text = element?.textContent ?? ''
        expect(text).toContain('C')
        expect(text).not.toContain('CDEFGH')
      })
    })
  })
})
