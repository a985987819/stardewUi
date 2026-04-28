import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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

vi.mock('../../utils/seasonalButtonCanvas', () => ({
  drawSeasonalButtonBackground: vi.fn(),
  getSeasonalButtonTextColor: (theme: string, state: string) => {
    const colors: Record<string, Record<string, string>> = {
      spring: {
        normal: '#2E7D32',
        hover: '#1B5E20',
        active: '#1B5E20',
        disabled: '#B0BEC5',
      },
      summer: {
        normal: '#01579B',
        hover: '#004D80',
        active: '#004D80',
        disabled: '#B0BEC5',
      },
      autumn: {
        normal: '#BF360C',
        hover: '#9E2C00',
        active: '#9E2C00',
        disabled: '#B0BEC5',
      },
      winter: {
        normal: '#0D47A1',
        hover: '#0D47A1',
        active: '#0D47A1',
        disabled: '#CFD8DC',
      },
    }

    return colors[theme][state]
  },
  loadSeasonalButtonImage: vi.fn(() =>
    Promise.resolve({
      element: {} as HTMLImageElement,
      width: 120,
      height: 48,
    })
  ),
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
    expect(button).not.toHaveClass('nine-slice-button--seasonal')
    expect(button.style.getPropertyValue('--nine-slice-button-primary-color')).toBe('')
  })

  it('applies spring theme variables to themed buttons', () => {
    render(<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '春季默认按钮' })
    expect(button).toHaveClass('nine-slice-button--default', 'nine-slice-button--seasonal')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#2E7D32')
  })

  it('does not apply seasonal styles to special variants', () => {
    render(
      <NineSliceButton variant="primary" theme="winter">
        冬季主要按钮
      </NineSliceButton>
    )

    const button = screen.getByRole('button', { name: '冬季主要按钮' })
    expect(button).toHaveClass('nine-slice-button--primary')
    expect(button).not.toHaveClass('nine-slice-button--seasonal')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('')
  })

  it('keeps seasonal styles on disabled default buttons', () => {
    render(
      <NineSliceButton theme="summer" disabled>
        夏季禁用按钮
      </NineSliceButton>
    )

    const button = screen.getByRole('button', { name: '夏季禁用按钮' })
    expect(button).toHaveClass('nine-slice-button--disabled', 'nine-slice-button--seasonal')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#B0BEC5')
  })

  it('updates seasonal text color on hover and active states', () => {
    render(<NineSliceButton theme="autumn">秋季按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '秋季按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#BF360C')

    fireEvent.pointerEnter(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#9E2C00')

    fireEvent.pointerDown(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#9E2C00')

    fireEvent.pointerUp(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#9E2C00')

    fireEvent.pointerLeave(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#BF360C')
  })
})
