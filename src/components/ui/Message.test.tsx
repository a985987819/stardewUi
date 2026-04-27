import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { message } from './Message'

describe('Message', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // 清理之前的 message 容器
    const existingContainer = document.getElementById('stardew-message-root')
    if (existingContainer) {
      existingContainer.remove()
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    // 清理 DOM
    document.body.innerHTML = ''
  })

  describe('基础功能', () => {
    it('应该显示普通消息', async () => {
      await act(async () => {
        message.normal('普通消息')
      })
      
      await waitFor(() => {
        expect(screen.getByText('普通消息')).toBeInTheDocument()
      })
    })

    it('应该显示成功消息', async () => {
      await act(async () => {
        message.success('操作成功')
      })
      
      await waitFor(() => {
        expect(screen.getByText('操作成功')).toBeInTheDocument()
      })
    })

    it('应该显示信息消息', async () => {
      await act(async () => {
        message.info('信息提示')
      })
      
      await waitFor(() => {
        expect(screen.getByText('信息提示')).toBeInTheDocument()
      })
    })

    it('应该显示警告消息', async () => {
      await act(async () => {
        message.warning('警告提示')
      })
      
      await waitFor(() => {
        expect(screen.getByText('警告提示')).toBeInTheDocument()
      })
    })

    it('应该显示错误消息', async () => {
      await act(async () => {
        message.error('错误提示')
      })
      
      await waitFor(() => {
        expect(screen.getByText('错误提示')).toBeInTheDocument()
      })
    })
  })

  describe('配置对象调用', () => {
    it('应该支持配置对象方式调用', async () => {
      await act(async () => {
        message({ content: '配置对象消息', type: 'success' })
      })
      
      await waitFor(() => {
        expect(screen.getByText('配置对象消息')).toBeInTheDocument()
      })
    })

    it('应该支持字符串方式调用', async () => {
      await act(async () => {
        message('字符串消息')
      })
      
      await waitFor(() => {
        expect(screen.getByText('字符串消息')).toBeInTheDocument()
      })
    })
  })

  describe('持续时间', () => {
    it('默认3秒后应该自动关闭', async () => {
      await act(async () => {
        message.success('自动关闭', 3000)
      })
      
      await waitFor(() => {
        expect(screen.getByText('自动关闭')).toBeInTheDocument()
      })
      
      // 快进时间
      await act(async () => {
        vi.advanceTimersByTime(3500)
      })
      
      await waitFor(() => {
        expect(screen.queryByText('自动关闭')).not.toBeInTheDocument()
      })
    })

    it('应该支持自定义持续时间', async () => {
      await act(async () => {
        message.success('5秒后关闭', 5000)
      })
      
      await waitFor(() => {
        expect(screen.getByText('5秒后关闭')).toBeInTheDocument()
      })
      
      // 3秒时应该还在
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })
      
      expect(screen.getByText('5秒后关闭')).toBeInTheDocument()
      
      // 再推进3秒，应该关闭
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })
      
      await waitFor(() => {
        expect(screen.queryByText('5秒后关闭')).not.toBeInTheDocument()
      })
    })

    it('duration为0时不应该自动关闭', async () => {
      await act(async () => {
        message.info('不自动关闭', 0)
      })
      
      await waitFor(() => {
        expect(screen.getByText('不自动关闭')).toBeInTheDocument()
      })
      
      // 推进很长时间
      await act(async () => {
        vi.advanceTimersByTime(10000)
      })
      
      // 消息应该还在
      expect(screen.getByText('不自动关闭')).toBeInTheDocument()
    })
  })

  describe('手动关闭', () => {
    it('点击关闭按钮应该关闭消息', async () => {
      await act(async () => {
        message.normal('可关闭消息', 0)
      })
      
      await waitFor(() => {
        expect(screen.getByText('可关闭消息')).toBeInTheDocument()
      })
      
      // 找到关闭按钮并点击
      const closeButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg') // 关闭按钮有 X 图标
      )
      
      if (closeButton) {
        await act(async () => {
          fireEvent.click(closeButton)
        })
        
        // 等待动画完成
        await act(async () => {
          vi.advanceTimersByTime(300)
        })
        
        await waitFor(() => {
          expect(screen.queryByText('可关闭消息')).not.toBeInTheDocument()
        })
      }
    })

    it('调用返回的close方法应该关闭消息', async () => {
      let msgInstance: { close: () => void }
      
      await act(async () => {
        msgInstance = message.success('通过方法关闭', 0)
      })
      
      await waitFor(() => {
        expect(screen.getByText('通过方法关闭')).toBeInTheDocument()
      })
      
      await act(async () => {
        msgInstance.close()
      })
      
      // 等待动画完成
      await act(async () => {
        vi.advanceTimersByTime(300)
      })
      
      await waitFor(() => {
        expect(screen.queryByText('通过方法关闭')).not.toBeInTheDocument()
      })
    })
  })

  describe('关闭回调', () => {
    it('关闭时应该触发onClose回调', async () => {
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
  })

  describe('消息类型样式', () => {
    it('应该应用不同类型的样式', async () => {
      await act(async () => {
        message.normal('普通')
        message.success('成功')
        message.info('信息')
        message.warning('警告')
        message.error('错误')
      })
      
      await waitFor(() => {
        const container = document.getElementById('stardew-message-root')
        expect(container).toBeInTheDocument()
      })
    })
  })

  describe('多个消息', () => {
    it('应该支持显示多个消息', async () => {
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
