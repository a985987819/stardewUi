import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { waitFor, act } from '@testing-library/react'
import { message } from './Message'

describe('Message', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const findMessageContent = (text: string): Element | null => {
    const allElements = Array.from(document.querySelectorAll('*'))
    return allElements.find((el) => el.textContent === text && el.children.length === 0) ?? null
  }

  const waitForMessage = async (text: string) => {
    await waitFor(() => {
      expect(findMessageContent(text)).not.toBeNull()
    })
  }

  const queryMessageContent = (text: string): Element | null => {
    const allElements = Array.from(document.querySelectorAll('*'))
    return allElements.find((el) => el.textContent === text && el.children.length === 0) ?? null
  }

  describe('basic rendering', () => {
    it('renders a normal message', async () => {
      await act(async () => {
        message.normal('普通消息')
      })

      await waitForMessage('普通消息')
    })

    it('renders messages for all message types', async () => {
      await act(async () => {
        message.success('操作成功')
        message.info('信息提示')
        message.warning('警告提示')
        message.error('错误提示')
      })

      await waitFor(() => {
        expect(findMessageContent('操作成功')).not.toBeNull()
        expect(findMessageContent('信息提示')).not.toBeNull()
        expect(findMessageContent('警告提示')).not.toBeNull()
        expect(findMessageContent('错误提示')).not.toBeNull()
      })
    })
  })

  describe('config invocation', () => {
    it('supports object-style calls', async () => {
      await act(async () => {
        message({ content: '配置对象消息', type: 'success' })
      })

      await waitForMessage('配置对象消息')
    })

    it('supports string shorthand calls', async () => {
      await act(async () => {
        message('字符串消息')
      })

      await waitForMessage('字符串消息')
    })

    it('applies position options passed to helper methods', async () => {
      await act(async () => {
        message.success('左下角消息', { position: 'bottom-left', duration: 0 })
        message.success('右下角消息', { position: 'bottom-right', duration: 0 })
      })

      await waitFor(() => {
        expect(findMessageContent('左下角消息')).not.toBeNull()
        expect(findMessageContent('右下角消息')).not.toBeNull()
      })

      const container = document.getElementById('star-message-root')
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

      await waitForMessage('配置位置消息')

      const container = document.getElementById('star-message-root')
      expect(container?.querySelector('[class*="stardew-message-container--bottom-right"]')).toBeTruthy()
    })

    it('keeps supporting the legacy bottom alias', async () => {
      await act(async () => {
        message.success('兼容底部位置', { bottom: 'left', duration: 0 })
      })

      await waitForMessage('兼容底部位置')

      const container = document.getElementById('star-message-root')
      expect(container?.querySelector('[class*="stardew-message-container--bottom-left"]')).toBeTruthy()
    })
  })

  describe('duration', () => {
    it('closes automatically after the default duration', async () => {
      await act(async () => {
        message.success('自动关闭', 3000)
      })

      await waitForMessage('自动关闭')

      await act(async () => {
        vi.advanceTimersByTime(3500)
      })

      await waitFor(() => {
        expect(queryMessageContent('自动关闭')).toBeNull()
      })
    })

    it('supports a custom duration', async () => {
      await act(async () => {
        message.success('自定义关闭', 1000)
      })

      await waitForMessage('自定义关闭')

      await act(async () => {
        vi.advanceTimersByTime(1500)
      })

      await waitFor(() => {
        expect(queryMessageContent('自定义关闭')).toBeNull()
      })
    })

    it('does not auto-close when duration is 0', async () => {
      await act(async () => {
        message.info('不自动关闭', 0)
      })

      await waitForMessage('不自动关闭')

      await act(async () => {
        vi.advanceTimersByTime(10000)
      })

      expect(queryMessageContent('不自动关闭')).not.toBeNull()
    })
  })

  describe('manual close', () => {
    it('closes when calling the returned close method', async () => {
      let instance: { close: () => void }

      await act(async () => {
        instance = message.success('通过方法关闭', 0)
      })

      await waitForMessage('通过方法关闭')

      await act(async () => {
        instance.close()
      })

      await waitFor(() => {
        expect(queryMessageContent('通过方法关闭')).toBeNull()
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

      await waitForMessage('带 emoji 图标')

      const allElements = Array.from(document.querySelectorAll('*'))
      const emojiElements = allElements.filter(
        (el) => el.textContent === '✅' && el.children.length === 0
      )
      expect(emojiElements.length).toBeGreaterThan(0)
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
        expect(findMessageContent('消息1')).not.toBeNull()
        expect(findMessageContent('消息2')).not.toBeNull()
        expect(findMessageContent('消息3')).not.toBeNull()
      })
    })
  })
})
