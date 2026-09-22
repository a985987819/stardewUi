import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STAR_COLORS } from '../../styles/colorTokens'
import {
  DEFAULT_BUTTON_DISABLED_OVERLAY,
  DEFAULT_BUTTON_DISABLED_TEXT,
  DEFAULT_BUTTON_FILL,
  DEFAULT_BUTTON_HOVER_FILL,
  DEFAULT_BUTTON_OUTER_BORDER,
} from '../../utils/defaultButtonTheme'
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
    spring: { normalFill: '#E68DA4', pressedFill: '#B95E76', disabledFill: '#CDB2B8', border: '#754657', text: { normal: '#FFF8EE', hover: '#FFF8EE', active: '#FFF8EE', disabled: '#FFF8EE' } },
    summer: { normalFill: '#78AD55', pressedFill: '#4E7B3A', disabledFill: '#B4C0A6', border: '#4A5C32', text: { normal: '#FFF9E8', hover: '#FFF9E8', active: '#FFF9E8', disabled: '#FFF9E8' } },
    autumn: { normalFill: '#D77B50', pressedFill: '#A94F38', disabledFill: '#C8B1A2', border: '#71402B', text: { normal: '#FFF7E7', hover: '#FFF7E7', active: '#FFF7E7', disabled: '#FFF7E7' } },
    winter: { normalFill: '#78AFC4', pressedFill: '#527A96', disabledFill: '#B4C7CD', border: '#405E70', text: { normal: '#F7FBFA', hover: '#F7FBFA', active: '#F7FBFA', disabled: '#F7FBFA' } },
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
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(DEFAULT_BUTTON_FILL)
    expect(button.style.getPropertyValue('--nine-slice-button-default-outer-border')).toBe(DEFAULT_BUTTON_OUTER_BORDER)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.ink.strongest)
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
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(DEFAULT_BUTTON_FILL)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.ink.strongest)
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('transparent')
  })

  it('exposes derived border and text variables when a custom default color is provided', () => {
    render(<NineSliceButton color="#2E6F40">custom button</NineSliceButton>)

    const button = screen.getByRole('button', { name: 'custom button' })

    expect(button.style.getPropertyValue('--nine-slice-button-default-outer-border')).toBe('#2E6F40')
    expect(button.style.getPropertyValue('--nine-slice-button-default-inner-border')).not.toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).not.toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(DEFAULT_BUTTON_FILL)
  })

  it('updates regular default text colors on hover and active states', () => {
    render(<NineSliceButton>状态按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '状态按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(DEFAULT_BUTTON_FILL)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.ink.strongest)
    expect(button.style.fontWeight).toBe('')

    fireEvent.pointerEnter(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(DEFAULT_BUTTON_HOVER_FILL)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.ink.strongest)
    expect(button.style.fontWeight).toBe('')

    fireEvent.pointerDown(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(DEFAULT_BUTTON_HOVER_FILL)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.ink.strongest)
    expect(button.style.fontWeight).toBe('700')

    fireEvent.pointerUp(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(DEFAULT_BUTTON_HOVER_FILL)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.ink.strongest)
    expect(button.style.fontWeight).toBe('')

    fireEvent.pointerLeave(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(DEFAULT_BUTTON_FILL)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.ink.strongest)
  })

  it('applies the supplied spring normal background, border, and text colors', () => {
    render(<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '春季默认按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-primary-color')).toBe('')
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(STAR_COLORS.season.spring.fill)
    expect(button.style.getPropertyValue('--nine-slice-button-default-outer-border')).toBe(STAR_COLORS.season.spring.border)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.season.spring.text)
  })

  it('renders primary buttons with the shared stepped frame and supplied palette', () => {
    render(<NineSliceButton variant="primary">主要按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '主要按钮' })
    const image = button.querySelector('img')
    const canvas = button.querySelector('canvas[class*="nine-slice-button__canvas--default"]')

    expect(image).toBeNull()
    expect(canvas).not.toBeNull()
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(STAR_COLORS.button.primary.fill)
    expect(button.style.getPropertyValue('--nine-slice-button-default-outer-border')).toBe(STAR_COLORS.button.primary.border)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.button.primary.text)
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
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(STAR_COLORS.season.summer.disabledFill)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.season.summer.text)
  })

  it('applies disabled overlay and disabled text color to regular default buttons', () => {
    render(<NineSliceButton disabled>禁用默认按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '禁用默认按钮' })
    const image = button.querySelector('img')

    expect(button).toBeDisabled()
    expect(image).toBeNull()
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(DEFAULT_BUTTON_FILL)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(DEFAULT_BUTTON_DISABLED_TEXT)
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe(
      DEFAULT_BUTTON_DISABLED_OVERLAY
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
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(STAR_COLORS.season.spring.disabledFill)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.season.spring.text)
  })

  it('updates seasonal text color on hover and active states', () => {
    render(<NineSliceButton theme="autumn">秋季按钮</NineSliceButton>)

    const button = screen.getByRole('button', { name: '秋季按钮' })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(STAR_COLORS.season.autumn.fill)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.season.autumn.text)

    fireEvent.pointerEnter(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(STAR_COLORS.season.autumn.fill)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.season.autumn.text)

    fireEvent.pointerDown(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(STAR_COLORS.season.autumn.pressedFill)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.season.autumn.text)

    fireEvent.pointerUp(button, { button: 0 })
    expect(button.style.getPropertyValue('--nine-slice-button-default-fill')).toBe(STAR_COLORS.season.autumn.fill)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.season.autumn.text)

    fireEvent.pointerLeave(button)
    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.season.autumn.text)
  })

  it.each([
    ['secondary', STAR_COLORS.button.secondary.fill, STAR_COLORS.button.secondary.border, STAR_COLORS.button.secondary.text],
    ['info', STAR_COLORS.button.info.fill, STAR_COLORS.button.info.border, STAR_COLORS.button.info.text],
    ['success', STAR_COLORS.button.success.fill, STAR_COLORS.button.success.border, STAR_COLORS.button.success.text],
    ['danger', STAR_COLORS.button.danger.fill, STAR_COLORS.button.danger.border, STAR_COLORS.button.danger.text],
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

    expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe(STAR_COLORS.season.spring.text)
    expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('transparent')
    expect(canvas).not.toHaveAttribute('data-src', expect.stringContaining('defaultBtn'))
    expect(canvas).not.toHaveAttribute('data-src', expect.stringContaining('btnImg'))
  })
})
