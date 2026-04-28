import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NineSliceButton from './NineSliceButton'

vi.mock('../../hooks/useNineSliceBackground', () => ({
  useNineSliceBackground: ({ src }: { src: string }) => ({
    hostRef: vi.fn(),
    canvasProps: {
      className: 'nine-slice-button__canvas',
      'aria-hidden': true,
      'data-src': src,
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
    expect(button).toBeEnabled()
    expect(button.style.getPropertyValue('--nine-slice-button-primary-color')).toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')
  })

  it('uses defaultBtn.png and the default normal text color for plain default buttons', () => {
    render(<NineSliceButton>默认按钮</NineSliceButton>)
    const button = screen.getByRole('button', { name: '默认按钮' })
    const canvas = button.querySelector('canvas')
    expect(canvas).toHaveAttribute('data-src', '/defaultBtn.png')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('transparent')
  })

  it('updates plain default text colors on hover and active states', () => {
    render(<NineSliceButton>状态按钮</NineSliceButton>)
    const button = screen.getByRole('button', { name: '状态按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')
    fireEvent.pointerEnter(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#3E2723')
    fireEvent.pointerDown(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#2E1B15')
    fireEvent.pointerUp(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#3E2723')
    fireEvent.pointerLeave(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')
  })

  it('applies spring palette to themed buttons', () => {
    render(<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '春季默认按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-primary-color')).toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#2E7D32')
  })

  it('keeps using the shared default image source for non-default image variants', () => {
    render(<NineSliceButton variant="primary">主要按钮</NineSliceButton>)
    const button = screen.getByRole('button', { name: '主要按钮' })
    const canvas = button.querySelector('canvas')
    expect(canvas).toHaveAttribute('data-src', '/btnImg.png')
  })

  it('keeps seasonal styles on disabled default buttons', () => {
    render(
      <NineSliceButton theme="summer" disabled>
        夏季禁用按钮
      </NineSliceButton>
    )

    const button = screen.getByRole('button', { name: '夏季禁用按钮' })
    expect(button).toBeDisabled()
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#B0BEC5')
  })

  it('applies disabled overlay and disabled text color to plain default buttons', () => {
    render(<NineSliceButton disabled>禁用默认按钮</NineSliceButton>)
    const button = screen.getByRole('button', { name: '禁用默认按钮' })
    const canvas = button.querySelector('canvas')
    expect(button).toBeDisabled()
    expect(canvas).toHaveAttribute('data-src', '/defaultBtn.png')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#B0BEC5')
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('rgba(240, 230, 210, 0.6)')
  })

  it('uses the disabled seasonal palette while loading', () => {
    render(
      <NineSliceButton theme="spring" loading>
        春季加载按钮
      </NineSliceButton>
    )

    const button = screen.getByRole('button', { name: '春季加载按钮' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
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

  it('keeps seasonal default buttons on seasonal styling instead of defaultBtn.png', () => {
    render(<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>)
    const button = screen.getByRole('button', { name: '春季默认按钮' })
    const canvas = button.querySelector('canvas')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#2E7D32')
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('')
    expect(canvas).not.toHaveAttribute('data-src', '/defaultBtn.png')
  })
})
