import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Alert from './Alert'
import styles from './Alert.module.scss'

describe('Alert', () => {
  it('renders title and content inside a parchment banner', () => {
    render(<Alert title="收成报告" data-testid="alert">小麦 +64，防风草 +8。</Alert>)

    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass(styles['star-alert'])
    expect(alert).toHaveClass(styles['star-alert--info'])
    expect(alert).toHaveTextContent('收成报告')
    expect(alert).toHaveTextContent('小麦 +64，防风草 +8。')
  })

  it('applies one modifier class per type', () => {
    const { rerender } = render(<Alert type="success" data-testid="alert" />)
    expect(screen.getByTestId('alert')).toHaveClass(styles['star-alert--success'])

    rerender(<Alert type="warning" data-testid="alert" />)
    expect(screen.getByTestId('alert')).toHaveClass(styles['star-alert--warning'])

    rerender(<Alert type="error" data-testid="alert" />)
    expect(screen.getByTestId('alert')).toHaveClass(styles['star-alert--error'])
  })

  it('announces only error alerts to assistive tech', () => {
    const { rerender } = render(<Alert type="error" data-testid="alert" />)
    expect(screen.getByTestId('alert')).toHaveAttribute('role', 'alert')

    rerender(<Alert type="info" data-testid="alert" />)
    expect(screen.getByTestId('alert')).not.toHaveAttribute('role')

    rerender(<Alert type="success" data-testid="alert" />)
    expect(screen.getByTestId('alert')).not.toHaveAttribute('role')

    rerender(<Alert type="warning" data-testid="alert" />)
    expect(screen.getByTestId('alert')).not.toHaveAttribute('role')
  })

  it('renders no close button unless closable is set', () => {
    render(<Alert data-testid="alert">播种季节到了。</Alert>)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the semantic icon only when showIcon is set', () => {
    const { rerender, container } = render(<Alert data-testid="alert">播种季节到了。</Alert>)
    expect(container.querySelector(`.${styles['star-alert__icon']}`)).not.toBeInTheDocument()

    rerender(<Alert type="warning" showIcon data-testid="alert">播种季节到了。</Alert>)
    expect(container.querySelector(`.${styles['star-alert__icon']}`)).toBeInTheDocument()
  })

  it('dismisses the banner and fires onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Alert closable onClose={onClose} data-testid="alert">
        谷仓已满。
      </Alert>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(container).toBeEmptyDOMElement()
  })

  it('uses closeLabel as the accessible name of the close button', () => {
    render(<Alert closable closeLabel="关掉" data-testid="alert" />)

    expect(screen.getByRole('button', { name: '关掉' })).toBeInTheDocument()
  })

  it('injects the staircase clip path as a CSS variable', () => {
    render(<Alert data-testid="alert" />)

    const alert = screen.getByTestId('alert')
    expect(alert.style.getPropertyValue('--star-alert-clip')).toContain('polygon')
  })
})

describe('Alert custom icon', () => {
  it('renders a custom node in the icon slot instead of the built-in glyph', () => {
    render(
      <Alert
        type="warning"
        showIcon
        icon={<span data-testid="custom-icon">!</span>}
        data-testid="alert"
      />,
    )

    const alert = screen.getByTestId('alert')
    expect(alert.querySelector(`.${styles['star-alert__icon']}`)).toBeInTheDocument()
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(alert.querySelector('svg')).not.toBeInTheDocument()
  })

  it('still hides the icon slot entirely without showIcon', () => {
    render(<Alert icon={<span data-testid="custom-icon">!</span>} data-testid="alert" />)

    expect(screen.getByTestId('alert').querySelector(`.${styles['star-alert__icon']}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument()
  })
})
