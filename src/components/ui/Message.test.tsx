import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { message } from './Message'

describe('Message', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const existingContainer = document.getElementById('stardew-message-root')
    if (existingContainer) {
      existingContainer.remove()
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  describe('basic rendering', () => {
    it('renders a normal message', async () => {
      await act(async () => {
        message.normal('普通消息')
      })

      await waitFor(() => {
        expect(screen.getByText('普通消息')).toBeInTheDocument()
      })
    })

    it('renders messages for all message types', async () => {
      await act(async () => {
        message.success('操作成功')
        message.info('信息提示')
        message.warning('警告提示')
        message.error('错误提示')
      })

      await waitFor(() => {
        expect(screen.getByText('操作成功')).toBeInTheDocument()
        expect(screen.getByText('信息提示')).toBeInTheDocument()
        expect(screen.getByText('警告提示')).toBeInTheDocument()
        expect(screen.getByText('错误提示')).toBeInTheDocument()
      })
    })
  })

  describe('config invocation', () => {
    it('supports object-style calls', async () => {
      await act(async () => {
        message({ content: '配置对象消息', type: 'success' })
      })

      await waitFor(() => {
        expect(screen.getByText('配置对象消息')).toBeInTheDocument()
      })
    })

    it('supports string shorthand calls', async () => {
      await act(async () => {
        message('字符串消息')
      })

      await waitFor(() => {
        expect(screen.getByText('字符串消息')).toBeInTheDocument()
      })
    })

    it('applies position options passed to helper methods', async () => {
      await act(async () => {
        message.success('左下角消息', { position: 'bottom-left', duration: 0 })
        message.success('右下角消息', { position: 'bottom-right', duration: 0 })
      })

      await waitFor(() => {
        expect(screen.getByText('左下角消息')).toBeInTheDocument()
        expect(screen.getByText('右下角消息')).toBeInTheDocument()
      })

      const container = document.getElementById('stardew-message-root')
      expect(container?.querySelector('[class*="stardew-message-container--bottom-left"]')).toBeTruthy()
      expect(container?.querySelector('[class*="stardew-message-container--bottom-right"]')).toBeTruthy()
    })

    it('supports position in the config object', async () => {
      await act(async () => {
        message({
          content: '配置位置消息',
          type: 'info',
          position: 'bottom-right',
          duration: 0,
        })
      })

      await waitFor(() => {
        expect(screen.getByText('配置位置消息')).toBeInTheDocument()
      })

      const container = document.getElementById('stardew-message-root')
      expect(container?.querySelector('[class*="stardew-message-container--bottom-right"]')).toBeTruthy()
    })

    it('keeps supporting the legacy bottom alias', async () => {
      await act(async () => {
        message.success('兼容底部位置', { bottom: 'left', duration: 0 })
      })

      await waitFor(() => {
        expect(screen.getByText('兼容底部位置')).toBeInTheDocument()
      })

      const container = document.getElementById('stardew-message-root')
      expect(container?.querySelector('[class*="stardew-message-container--bottom-left"]')).toBeTruthy()
    })
  })

  describe('duration', () => {
    it('closes automatically after the default duration', async () => {
      await act(async () => {
        message.success('自动关闭', 3000)
      })

      await waitFor(() => {
        expect(screen.getByText('自动关闭')).toBeInTheDocument()
      })

      await act(async () => {
        vi.advanceTimersByTime(3500)
      })

      await waitFor(() => {
        expect(screen.queryByText('自动关闭')).not.toBeInTheDocument()
      })
    })

    it('supports a custom duration', async () => {
      await act(async () => {
        message.success('5秒后关闭', 5000)
      })

      await waitFor(() => {
        expect(screen.getByText('5秒后关闭')).toBeInTheDocument()
      })

      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      expect(screen.getByText('5秒后关闭')).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(screen.queryByText('5秒后关闭')).not.toBeInTheDocument()
      })
    })

    it('does not auto-close when duration is 0', async () => {
      await act(async () => {
        message.info('不自动关闭', 0)
      })

      await waitFor(() => {
        expect(screen.getByText('不自动关闭')).toBeInTheDocument()
      })

      await act(async () => {
        vi.advanceTimersByTime(10000)
      })

      expect(screen.getByText('不自动关闭')).toBeInTheDocument()
    })
  })

  describe('manual close', () => {
    it('closes on close button click', async () => {
      await act(async () => {
        message.normal('可关闭消息', 0)
      })

      await waitFor(() => {
        expect(screen.getByText('可关闭消息')).toBeInTheDocument()
      })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: '关闭消息' }))
      })

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(screen.queryByText('可关闭消息')).not.toBeInTheDocument()
      })
    })

    it('closes when calling the returned close method', async () => {
      let instance: { close: () => void }

      await act(async () => {
        instance = message.success('通过方法关闭', 0)
      })

      await waitFor(() => {
        expect(screen.getByText('通过方法关闭')).toBeInTheDocument()
      })

      await act(async () => {
        instance.close()
      })

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(screen.queryByText('通过方法关闭')).not.toBeInTheDocument()
      })
    })
  })

  describe('callbacks and layout', () => {
    it('calls onClose after auto closing', async () => {
      const onClose = vi.fn()

      await act(async () => {
        message({ content: '带回调的消息', duration: 1000, onClose })
      })

      await act(async () => {
        vi.advanceTimersByTime(1500)
      })

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1)
      })
    })

    it('renders the emoji icon area', async () => {
      await act(async () => {
        message.success('带 emoji 图标', 0)
      })

      await waitFor(() => {
        expect(screen.getByText('带 emoji 图标')).toBeInTheDocument()
      })

      expect(screen.getByText('✅')).toBeInTheDocument()
    })
  })

  describe('multiple messages', () => {
    it('renders multiple messages at once', async () => {
      await act(async () => {
        message('消息1', 0)
        message('消息2', 0)
        message('消息3', 0)
      })

      await waitFor(() => {
        expect(screen.getByText('消息1')).toBeInTheDocument()
        expect(screen.getByText('消息2')).toBeInTheDocument()
        expect(screen.getByText('消息3')).toBeInTheDocument()
      })
    })
  })
})
