import '@testing-library/jest-dom/vitest'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NineSliceButton from './NineSliceButton'

vi.mock('../../hooks/useNineSliceBackground', () => ({
  useNineSliceBackground: () => ({
    hostRef: vi.fn(),
    canvasProps: {
      className: 'nine-slice-button__canvas',
      'aria-hidden': true,
    },
    isReady: true,
    redraw: vi.fn(),
  }),
}))

class ResizeObserverMock {
  observe() {}

  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)

describe('NineSliceButton', () => {
  it('keeps the default appearance when no theme is provided', () => {
    render(<NineSliceButton>默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '默认按钮' })
    expect(button).toHaveClass('nine-slice-button--default')
    expect(button).not.toHaveClass('nine-slice-button--theme-spring')
    expect(button.style.getPropertyValue('--nine-slice-button-primary-color')).toBe('')
  })

  it('applies spring theme variables to themed buttons', () => {
    render(<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '春季默认按钮' })
    expect(button).toHaveClass('nine-slice-button--default', 'nine-slice-button--theme-spring')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#2F5233')
  })

  it('does not apply seasonal styles to special variants', () => {
    render(
      <NineSliceButton variant="primary" theme="winter">
        冬季主要按钮
      </NineSliceButton>
    )

    const button = screen.getByRole('button', { name: '冬季主要按钮' })
    expect(button).toHaveClass('nine-slice-button--primary')
    expect(button).not.toHaveClass('nine-slice-button--theme-winter')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('')
  })

  it('does not apply seasonal styles to disabled buttons', () => {
    render(
      <NineSliceButton theme="summer" disabled>
        夏季禁用按钮
      </NineSliceButton>
    )

    const button = screen.getByRole('button', { name: '夏季禁用按钮' })
    expect(button).toHaveClass('nine-slice-button--disabled')
    expect(button).not.toHaveClass('nine-slice-button--theme-summer')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('')
  })
})
