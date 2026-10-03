import '@testing-library/jest-dom/vitest'
import { act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { message } from './Message'

/**
 * `message()` returns a handle. It used to carry only `close`, which forced the
 * standard "it changed while I was working" flow into two toasts: close the
 * first, open a second. The user then reads the failure twice, and the stack
 * order no longer reflects what actually happened.
 *
 * `update` fixes that by mutating the record in place, keeping its id, its
 * position, and its remaining duration.
 */
describe('message handle', () => {
  afterEach(() => {
    act(() => {
      document.getElementById('star-message-root')?.remove()
    })
    vi.restoreAllMocks()
  })

  it('exposes close and update', () => {
    const handle = message.info('上传中…', { duration: 0 })

    expect(typeof handle.close).toBe('function')
    expect(typeof handle.update).toBe('function')

    act(() => {
      handle.close()
    })
  })

  it('replaces the copy in place rather than adding a second toast', () => {
    const handle = message.info('上传中…', { duration: 0 })

    act(() => {
      handle.update({ content: '上传失败', type: 'error' })
    })

    const root = document.getElementById('star-message-root')!
    expect(root.textContent).toContain('上传失败')
    expect(root.textContent).not.toContain('上传中')
    // One message, not two. Counted by the copy node rather than a state class,
    // which only exists partway through the entrance animation.
    expect(root.querySelectorAll('[class*="stardew-message__content"]')).toHaveLength(1)

    act(() => {
      handle.close()
    })
  })

  it('keeps fields the update does not mention', () => {
    // An update usually only knows the new copy. Replacing the whole record
    // would silently drop the position and duration chosen at creation.
    const handle = message.info('上传中…', { duration: 0, position: 'bottom-left' })

    act(() => {
      handle.update({ content: '完成' })
    })

    const root = document.getElementById('star-message-root')!
    const slot = root.querySelector('[class*="bottom-left"]')
    expect(slot, 'the original position wrapper should still be present').not.toBeNull()
    expect(root.textContent).toContain('完成')

    act(() => {
      handle.close()
    })
  })

  it('ignores an update to a message that was already closed', () => {
    // Resurrecting a dismissed toast would be worse than dropping the update:
    // the user has already seen it go.
    const handle = message.info('上传中…', { duration: 0 })

    act(() => {
      handle.close()
    })
    act(() => {
      handle.update({ content: '不该出现' })
    })

    const root = document.getElementById('star-message-root')
    expect(root?.textContent ?? '').not.toContain('不该出现')
  })
})
