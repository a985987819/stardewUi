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
  SEASONAL_BUTTON_PALETTES: {
    spring: { normalFill: '#D9899A', pressedFill: '#985565', disabledFill: '#BDA6A0', border: '#67412F', text: { normal: '#FFF4E7', hover: '#FFF4E7', active: '#FFF4E7', disabled: '#FFF4E7' } },
    summer: { normalFill: '#6F9E4B', pressedFill: '#456B32', disabledFill: '#A5AE99', border: '#4B3925', text: { normal: '#FFF4D6', hover: '#FFF4D6', active: '#FFF4D6', disabled: '#FFF4D6' } },
    autumn: { normalFill: '#B85C3E', pressedFill: '#773A2D', disabledFill: '#B7A69A', border: '#563421', text: { normal: '#FFF0D5', hover: '#FFF0D5', active: '#FFF0D5', disabled: '#FFF0D5' } },
    winter: { normalFill: '#7699B5', pressedFill: '#4E6B84', disabledFill: '#AAB8BE', border: '#435565', text: { normal: '#F5F8F6', hover: '#F5F8F6', active: '#F5F8F6', disabled: '#F5F8F6' } },
  },
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
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#E2D3B8')
    expect(button.style.getPropertyValue('--nine-slice-button-default-outer-border')).toBe('#A38A6B')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#4A2C1A')
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
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#E2D3B8')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#4A2C1A')
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('transparent')
  })

  it('exposes derived border and text variables when a custom default color is provided', () => {
    render(<NineSliceButton color="#2E6F40">custom button</NineSliceButton>)

    const button = screen.getByRole('button', { name: 'custom button' })

    expect(button.style.getPropertyValue('--nine-slice-button-default-outer-border')).toBe('#2E6F40')
    expect(button.style.getPropertyValue('--nine-slice-button-default-inner-border')).not.toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).not.toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#E2D3B8')
  })

  it('updates regular default text colors on hover and active states', () => {
    render(<NineSliceButton>状态按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '状态按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#E2D3B8')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#4A2C1A')
    expect(button.style.fontWeight).toBe('')

    fireEvent.pointerEnter(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#E8D8C4')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#4A2C1A')
    expect(button.style.fontWeight).toBe('')

    fireEvent.pointerDown(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#E8D8C4')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#4A2C1A')
    expect(button.style.fontWeight).toBe('700')

    fireEvent.pointerUp(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#E8D8C4')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#4A2C1A')
    expect(button.style.fontWeight).toBe('')

    fireEvent.pointerLeave(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#E2D3B8')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#4A2C1A')
  })

  it('applies the supplied spring normal background, border, and text colors', () => {
    render(<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '春季默认按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-primary-color')).toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#D9899A')
    expect(button.style.getPropertyValue('--nine-slice-button-default-outer-border')).toBe('#67412F')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#FFF4E7')
  })

  it('renders primary buttons with the shared stepped frame and supplied palette', () => {
    render(<NineSliceButton variant="primary">主要按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '主要按钮' })
    const image = button.querySelector('img')
    const canvas = button.querySelector('canvas[class*="nine-slice-button__canvas--default"]')

    expect(image).toBeNull()
    expect(canvas).not.toBeNull()
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#8B5A32')
    expect(button.style.getPropertyValue('--nine-slice-button-default-outer-border')).toBe('#4A2C1A')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#FFF4D6')
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
    expect(canvas).toHaveAttribute('data-src', expect.stringContaining('btnImg'))
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
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#A5AE99')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#FFF4D6')
  })

  it('applies disabled overlay and disabled text color to regular default buttons', () => {
    render(<NineSliceButton disabled>禁用默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '禁用默认按钮' })
    const image = button.querySelector('img')

    expect(button).toBeDisabled()
    expect(image).toBeNull()
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#E2D3B8')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#B0BEC5')
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe(
      'rgba(238, 229, 213, 0.62)'
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
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#BDA6A0')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#FFF4E7')
  })

  it('updates seasonal text color on hover and active states', () => {
    render(<NineSliceButton theme="autumn">秋季按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '秋季按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#B85C3E')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#FFF0D5')

    fireEvent.pointerEnter(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#B85C3E')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#FFF0D5')

    fireEvent.pointerDown(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#773A2D')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#FFF0D5')

    fireEvent.pointerUp(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe('#B85C3E')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#FFF0D5')

    fireEvent.pointerLeave(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#FFF0D5')
  })

  it.each([
    ['secondary', '#D6B477', '#76502D', '#4A2C1A'],
    ['success', '#71964A', '#40582C', '#FFF7DC'],
    ['danger', '#B85C4A', '#71372D', '#FFF0DD'],
  ] as const)('uses the supplied %s palette', (variant, fill, border, text) => {
    render(<NineSliceButton variant={variant}>{variant}</NineSliceButton>)

    const button = screen.getByRole('button', { name: variant })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(fill)
    expect(button.style.getPropertyValue('--nine-slice-button-default-outer-border')).toBe(border)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(text)
  })

  it('renders seasonal buttons with the shared stepped default frame instead of image assets', () => {
    render(<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '春季默认按钮' })
    const canvas = button.querySelector('canvas')

    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#FFF4E7')
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('transparent')
    expect(canvas).not.toHaveAttribute('data-src', expect.stringContaining('defaultBtn'))
    expect(canvas).not.toHaveAttribute('data-src', expect.stringContaining('btnImg'))
  })
})
