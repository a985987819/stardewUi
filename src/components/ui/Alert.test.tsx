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
