import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NineSliceButton from './NineSliceButton'

const { drawDefaultButtonBackground } = vi.hoisted(() => ({
  drawDefaultButtonBackground: vi.fn(),
}))
const canvasContextStub = new Proxy(
  {},
  {
    get: () => vi.fn(),
    set: () => true,
  }
) as CanvasRenderingContext2D

vi.mock('../../hooks/useNineSliceBackground', () => ({
  useNineSliceBackground: ({
    src,
    insets,
  }: {
    src: string
    insets: { top: number; right: number; bottom: number; left: number }
  }) => ({
    hostRef: vi.fn(),
    canvasProps: {
      className: 'nine-slice-button__canvas',
      'aria-hidden': true,
      'data-src': src,
      'data-insets': `${insets.top},${insets.right},${insets.bottom},${insets.left}`,
    },
    isReady: true,
    redraw: vi.fn(),
  }),
}))

vi.mock('../../utils/defaultButtonCanvas', () => ({
  drawDefaultButtonBackground,
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
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
  () => canvasContextStub
)

describe('NineSliceButton', () => {
  it('keeps the regular default appearance when no theme is provided', () => {
    render(<NineSliceButton>默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '默认按钮' })
    expect(button).toBeEnabled()
    expect(button.style.getPropertyValue('--nine-slice-button-primary-color')).toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')
  })

  it('renders the default button with a dedicated canvas background', () => {
    render(<NineSliceButton>默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '默认按钮' })
    const image = button.querySelector('img')
    const canvas = button.querySelector('canvas[class*="nine-slice-button__canvas--default"]')
    const label = button.querySelector('span[class*="nine-slice-button__label"]')

    expect(image).toBeNull()
    expect(canvas).not.toBeNull()
    expect(label).not.toBeNull()
    expect(getComputedStyle(label as Element).textShadow).not.toBe('none')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('transparent')
  })

  it('exposes derived border and text variables when a custom default color is provided', () => {
    render(<NineSliceButton color="#2E6F40">custom button</NineSliceButton>)

    const button = screen.getByRole('button', { name: 'custom button' })

    expect(button.style.getPropertyValue('--nine-slice-button-default-outer-border')).toBe('#2E6F40')
    expect(button.style.getPropertyValue('--nine-slice-button-default-inner-border')).not.toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).not.toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#FDF4E6')
  })

  it('updates regular default text colors on hover and active states', () => {
    render(<NineSliceButton>状态按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '状态按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')
    expect(button.style.fontWeight).toBe('')

    fireEvent.pointerEnter(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#3E2723')
    expect(button.style.fontWeight).toBe('')

    fireEvent.pointerDown(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#2E1B15')
    expect(button.style.fontWeight).toBe('700')

    fireEvent.pointerUp(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#3E2723')
    expect(button.style.fontWeight).toBe('')

    fireEvent.pointerLeave(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')
  })

  it('applies spring palette to themed buttons', () => {
    render(<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '春季默认按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-primary-color')).toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#2E7D32')
  })

  it('uses the regular button image for primary buttons unless classical is requested', () => {
    render(<NineSliceButton variant="primary">主要按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '主要按钮' })
    const image = button.querySelector('img')
    const canvas = button.querySelector('canvas')

    expect(image).toHaveAttribute('src', '/defaultBtn.png')
    expect(canvas).toBeNull()
  })

  it('uses btnImg.png only when the classical appearance is requested', () => {
    render(
      <NineSliceButton variant="primary" appearance="classical">
        古典按钮
      </NineSliceButton>
    )

    const button = screen.getByRole('button', { name: '古典按钮' })
    const canvas = button.querySelector('canvas')
    const image = button.querySelector('img')

    expect(image).toBeNull()
    expect(canvas).toHaveAttribute('data-src', '/btnImg.png')
    expect(canvas).toHaveAttribute('data-insets', '8,8,8,8')
  })

  it('switches to square icon layout and keeps the default background on the dedicated canvas path', () => {
    render(
      <NineSliceButton icon={<svg aria-hidden="true" data-testid="button-icon" />}>
        图标按钮
      </NineSliceButton>
    )

    const button = screen.getByRole('button', { name: '图标按钮' })
    const content = button.querySelector('span[class*="nine-slice-button__content"]')
    const icon = screen.getByTestId('button-icon')
    const iconWrapper = button.querySelector('span[class*="nine-slice-button__icon"]')
    const label = button.querySelector('span[class*="nine-slice-button__label"]')
    const image = button.querySelector('img')
    const canvas = button.querySelector('canvas[class*="nine-slice-button__canvas--default"]')

    expect(button.className).toContain('nine-slice-button--icon')
    expect(content?.className).toContain('nine-slice-button__content--stacked')
    expect(iconWrapper).not.toBeNull()
    expect(icon).toBeInTheDocument()
    expect(image).toBeNull()
    expect(canvas).not.toBeNull()
    expect(label?.compareDocumentPosition(iconWrapper as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('accepts a string icon and renders it inside the icon wrapper', () => {
    render(<NineSliceButton icon="★">字符串图标按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '字符串图标按钮' })
    const iconWrapper = button.querySelector('span[class*="nine-slice-button__icon"]')

    expect(button.className).toContain('nine-slice-button--icon')
    expect(iconWrapper).not.toBeNull()
    expect(iconWrapper).toHaveTextContent('★')
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

  it('applies disabled overlay and disabled text color to regular default buttons', () => {
    render(<NineSliceButton disabled>禁用默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '禁用默认按钮' })
    const image = button.querySelector('img')

    expect(button).toBeDisabled()
    expect(image).toBeNull()
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#B0BEC5')
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe(
      'rgba(240, 230, 210, 0.6)'
    )
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

  it('keeps seasonal default buttons on seasonal styling instead of regular or classical assets', () => {
    render(<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '春季默认按钮' })
    const canvas = button.querySelector('canvas')

    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#2E7D32')
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('')
    expect(canvas).not.toHaveAttribute('data-src', '/defaultBtn.png')
    expect(canvas).not.toHaveAttribute('data-src', '/btnImg.png')
  })
})
