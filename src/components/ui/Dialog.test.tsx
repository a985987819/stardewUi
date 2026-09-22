import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Dialog from './Dialog'
import styles from './Dialog.module.scss'

describe('Dialog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基础渲染', () => {
    it('当open为false时不应该渲染', () => {
      render(<Dialog open={false} content="内容" typewriter={false} />)
      expect(screen.queryByText('内容')).not.toBeInTheDocument()
    })

    it('当open为true时应该渲染', async () => {
      render(<Dialog open={true} content="内容" typewriter={false} />)
      await waitFor(() => {
        expect(screen.getByText('内容')).toBeInTheDocument()
      })
    })

    it('应该渲染标题', async () => {
      render(<Dialog open={true} title="弹窗标题" content="内容" typewriter={false} />)
      await waitFor(() => {
        expect(screen.getByText('弹窗标题')).toBeInTheDocument()
      })
    })

    it('应该渲染内容', async () => {
      render(<Dialog open={true} content="弹窗内容" typewriter={false} />)
      await waitFor(() => {
        expect(screen.getByText('弹窗内容')).toBeInTheDocument()
      })
    })
  })

  describe('角色信息', () => {
    it('应该渲染角色名称', async () => {
      render(<Dialog open={true} content="内容" name="角色名" typewriter={false} />)
      await waitFor(() => {
        expect(screen.getByText('角色名')).toBeInTheDocument()
      })
    })

    it('应该渲染角色图片', async () => {
      render(
        <Dialog
          open={true}
          content="内容"
          name="角色名"
          image="/avatar.png"
          typewriter={false}
        />
      )
      await waitFor(() => {
        const img = screen.getByAltText('角色名')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', '/avatar.png')
      })
    })
  })

  describe('操作按钮', () => {
    it('应该渲染默认的确认和取消按钮', async () => {
      render(<Dialog open={true} content="内容" typewriter={false} />)
      await waitFor(() => {
        expect(screen.getByText('确认')).toBeInTheDocument()
        expect(screen.getByText('取消')).toBeInTheDocument()
      })
    })

    it('当actions为null时不应该渲染按钮', async () => {
      render(<Dialog open={true} content="内容" actions={null} typewriter={false} />)
      await waitFor(() => {
        expect(screen.queryByText('确认')).not.toBeInTheDocument()
        expect(screen.queryByText('取消')).not.toBeInTheDocument()
      })
    })

    it('应该渲染自定义按钮', async () => {
      const customActions = [
        { label: '自定义1', onClick: vi.fn() },
        { label: '自定义2', variant: 'danger' as const, onClick: vi.fn() },
      ]
      render(<Dialog open={true} content="内容" actions={customActions} typewriter={false} />)
      await waitFor(() => {
        expect(screen.getByText('自定义1')).toBeInTheDocument()
        expect(screen.getByText('自定义2')).toBeInTheDocument()
      })
    })

    it('点击确认按钮应该触发onClose', async () => {
      const handleClose = vi.fn()
      render(<Dialog open={true} content="内容" onClose={handleClose} typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('确认')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('确认'))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('点击取消按钮应该触发onClose', async () => {
      const handleClose = vi.fn()
      render(<Dialog open={true} content="内容" onClose={handleClose} typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('取消')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('取消'))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('分页功能', () => {
    it('应该显示分页指示器', async () => {
      const content = ['第一页', '第二页', '第三页']
      render(<Dialog open={true} content={content} typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('1 / 3')).toBeInTheDocument()
      })
    })

    it('单页时默认不渲染分页', async () => {
      render(<Dialog open={true} content="只有一页" typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('只有一页')).toBeInTheDocument()
      })
      expect(screen.queryByText('1 / 1')).not.toBeInTheDocument()
    })

    it('单页可以传 showPagination 强制显示分页', async () => {
      render(<Dialog open={true} content="只有一页" typewriter={false} showPagination />)

      await waitFor(() => {
        expect(screen.getByText('1 / 1')).toBeInTheDocument()
      })
    })

    it('多页可以传 showPagination={false} 关掉分页，键盘仍能翻页', async () => {
      render(<Dialog open={true} content={['第一页', '第二页']} typewriter={false} showPagination={false} />)

      await waitFor(() => {
        expect(screen.getByText('第一页')).toBeInTheDocument()
      })
      expect(screen.queryByText('1 / 2')).not.toBeInTheDocument()

      fireEvent.keyDown(window, { key: 'ArrowRight' })

      await waitFor(() => {
        expect(screen.getByText('第二页')).toBeInTheDocument()
      })
    })

    it('点击下一页应该切换到下一页内容', async () => {
      const content = ['第一页', '第二页']
      render(<Dialog open={true} content={content} typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('第一页')).toBeInTheDocument()
      })

      const nextButton = screen.getAllByRole('button').find(
        btn => btn.getAttribute('title') === '下一页'
      )

      if (nextButton) {
        fireEvent.click(nextButton)
        await waitFor(() => {
          expect(screen.getByText('第二页')).toBeInTheDocument()
          expect(screen.getByText('2 / 2')).toBeInTheDocument()
        })
      }
    })

    it('在最后一页时下一页按钮应该被禁用', async () => {
      const content = ['第一页', '第二页']
      render(<Dialog open={true} content={content} typewriter={false} />)

      const nextButton = screen.getAllByRole('button').find(
        btn => btn.getAttribute('title') === '下一页'
      )

      if (nextButton) {
        fireEvent.click(nextButton)
        await waitFor(() => {
          expect(nextButton).toBeDisabled()
        })
      }
    })

    it('在第一页时上一页按钮应该被禁用', async () => {
      render(<Dialog open={true} content={['第一页', '第二页']} typewriter={false} />)

      await waitFor(() => {
        const prevButton = screen.getAllByRole('button').find(
          btn => btn.getAttribute('title') === '已是第一页'
        )
        expect(prevButton).toBeDisabled()
      })
    })
  })

  describe('遮罩层关闭', () => {
    it('defaults to a viewport-centered dialog portal outside a transformed app root', async () => {
      const appRoot = document.createElement('div')
      appRoot.dataset.starApp = 'true'
      appRoot.style.transform = 'scale(0.965)'
      document.body.append(appRoot)

      const { unmount } = render(<Dialog open={true} content="内容" typewriter={false} />, { container: appRoot })

      await waitFor(() => {
        expect(screen.getByText('内容')).toBeInTheDocument()
      })

      const overlay = document.querySelector(`.${styles['stardew-dialog-overlay']}`)
      expect(overlay).toHaveClass(styles['stardew-dialog-overlay--center'])
      expect(overlay?.parentElement).toBe(document.body)

      unmount()
      appRoot.remove()
    })

    it('supports a full-width bottom-center placement', async () => {
      render(<Dialog open={true} placement="bottom" content="底部对话" typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('底部对话')).toBeInTheDocument()
      })

      const overlay = document.querySelector(`.${styles['stardew-dialog-overlay']}`)
      const dialog = document.querySelector(`.${styles['stardew-dialog']}`)
      expect(overlay).toHaveClass(styles['stardew-dialog-overlay--bottom'])
      expect(dialog).toHaveClass(styles['stardew-dialog--bottom'])
    })

    it('defaults to a dark backdrop mask', async () => {
      render(<Dialog open={true} content="内容" typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('内容')).toBeInTheDocument()
      })

      expect(document.querySelector(`.${styles['stardew-dialog-overlay--dark']}`)).toBeInTheDocument()
    })

    it('renders a light backdrop mask when requested', async () => {
      render(<Dialog open={true} content="内容" mask="light" typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('内容')).toBeInTheDocument()
      })

      expect(document.querySelector(`.${styles['stardew-dialog-overlay--light']}`)).toBeInTheDocument()
    })

    it('点击遮罩层应该触发onClose', async () => {
      const handleClose = vi.fn()
      const { container } = render(
        <Dialog open={true} content="内容" onClose={handleClose} maskClosable={true} typewriter={false} />
      )

      await waitFor(() => {
        expect(screen.getByText('内容')).toBeInTheDocument()
      })

      const overlay = container.querySelector('.stardew-dialog-overlay')
      if (overlay) {
        fireEvent.click(overlay)
        expect(handleClose).toHaveBeenCalledTimes(1)
      }
    })

    it('当maskClosable为false时点击遮罩层不应该触发onClose', async () => {
      const handleClose = vi.fn()
      const { container } = render(
        <Dialog open={true} content="内容" onClose={handleClose} maskClosable={false} typewriter={false} />
      )

      await waitFor(() => {
        expect(screen.getByText('内容')).toBeInTheDocument()
      })

      const overlay = container.querySelector('.stardew-dialog-overlay')
      if (overlay) {
        fireEvent.click(overlay)
        expect(handleClose).not.toHaveBeenCalled()
      }
    })
  })

  describe('键盘事件', () => {
    it('按Escape键应该关闭弹窗', async () => {
      const handleClose = vi.fn()
      render(<Dialog open={true} content="内容" onClose={handleClose} maskClosable={true} typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('内容')).toBeInTheDocument()
      })

      fireEvent.keyDown(window, { key: 'Escape' })
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('按右箭头键应该切换到下一页', async () => {
      render(<Dialog open={true} content={['第一页', '第二页']} typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('第一页')).toBeInTheDocument()
      })

      fireEvent.keyDown(window, { key: 'ArrowRight' })

      await waitFor(() => {
        expect(screen.getByText('第二页')).toBeInTheDocument()
      })
    })

    it('按左箭头键应该切换到上一页', async () => {
      render(<Dialog open={true} content={['第一页', '第二页']} typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('第一页')).toBeInTheDocument()
      })

      // 先切换到第二页
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      await waitFor(() => {
        expect(screen.getByText('第二页')).toBeInTheDocument()
      })

      // 再切换回第一页
      fireEvent.keyDown(window, { key: 'ArrowLeft' })
      await waitFor(() => {
        expect(screen.getByText('第一页')).toBeInTheDocument()
      })
    })

    it('按Enter键应该切换到下一页', async () => {
      render(<Dialog open={true} content={['第一页', '第二页']} typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('第一页')).toBeInTheDocument()
      })

      fireEvent.keyDown(window, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('第二页')).toBeInTheDocument()
      })
    })
  })

  describe('打开状态变化', () => {
    it('重新打开时应该重置到第一页', async () => {
      const { rerender } = render(
        <Dialog open={true} content={['第一页', '第二页']} typewriter={false} />
      )

      await waitFor(() => {
        expect(screen.getByText('第一页')).toBeInTheDocument()
      })

      // 切换到第二页
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      await waitFor(() => {
        expect(screen.getByText('第二页')).toBeInTheDocument()
      })

      // 关闭弹窗
      rerender(<Dialog open={false} content={['第一页', '第二页']} typewriter={false} />)

      // 重新打开
      rerender(<Dialog open={true} content={['第一页', '第二页']} typewriter={false} />)

      await waitFor(() => {
        expect(screen.getByText('第一页')).toBeInTheDocument()
      })
    })
  })
})
