import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Textarea from './Textarea'
import styles from './Textarea.module.scss'

describe('Textarea', () => {
  it('renders a multi-line field bound to its label', () => {
    render(<Textarea label="任务描述" defaultValue="浇水" data-testid="textarea" />)

    const textarea = screen.getByLabelText('任务描述')
    expect(textarea).toHaveValue('浇水')
    expect(textarea).toHaveAttribute('rows', '4')
  })

  it('keeps typing in uncontrolled mode and reports changes', () => {
    const onChange = vi.fn()
    render(<Textarea onChange={onChange} data-testid="textarea" />)

    fireEvent.change(screen.getByTestId('textarea'), { target: { value: '收获南瓜' } })

    expect(screen.getByTestId('textarea')).toHaveValue('收获南瓜')
    expect(onChange).toHaveBeenCalledWith('收获南瓜')
  })

  it('follows controlled value changes', () => {
    const { rerender } = render(<Textarea value="第一稿" data-testid="textarea" />)
    expect(screen.getByTestId('textarea')).toHaveValue('第一稿')

    rerender(<Textarea value="第二稿" data-testid="textarea" />)
    expect(screen.getByTestId('textarea')).toHaveValue('第二稿')
  })

  it('shows the typed length, or typed/maxLength when capped', () => {
    const { rerender } = render(<Textarea defaultValue="abc" showCount data-testid="textarea" />)
    expect(screen.getByText('3')).toBeInTheDocument()

    rerender(<Textarea defaultValue="abc" showCount maxLength={10} data-testid="textarea" />)
    expect(screen.getByText('3/10')).toBeInTheDocument()
  })

  it('applies status tints and announces error messages', () => {
    const { rerender } = render(
      <Textarea status="error" message="信件太短" data-testid="textarea" />,
    )
    expect(screen.getByTestId('textarea').closest(`.${styles['star-textarea-wrapper']}`)).toHaveClass(
      styles['star-textarea-wrapper--error'],
    )
    expect(screen.getByText('信件太短')).toHaveAttribute('role', 'alert')

    rerender(<Textarea status="success" message="已保存" data-testid="textarea" />)
    expect(screen.getByTestId('textarea').closest(`.${styles['star-textarea-wrapper']}`)).toHaveClass(
      styles['star-textarea-wrapper--success'],
    )
  })

  it('disables typing while keeping the field visible', () => {
    render(<Textarea disabled data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeDisabled()
    expect(textarea.closest(`.${styles['star-textarea-wrapper']}`)).toHaveClass(styles['is-disabled'])
  })

  it('grows with its content when autoSize is set', () => {
    render(<Textarea autoSize data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea.parentElement).toHaveClass(styles['is-autosize'])
    // The auto-height effect always writes a concrete height.
    expect(textarea.style.height).not.toBe('')
  })

  it('injects the staircase clip path as a CSS variable', () => {
    render(<Textarea data-testid="textarea" />)

    const field = screen.getByTestId('textarea').parentElement
    expect(field?.style.getPropertyValue('--star-textarea-clip')).toContain('polygon')
  })
})

describe('Textarea allowClear and onPressEnter', () => {
  it('wipes the text back to empty through the built-in clear button', () => {
    const onChange = vi.fn()
    render(<Textarea allowClear clearLabel="清空" defaultValue="南瓜汤" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '清空' }))
    expect(onChange).toHaveBeenLastCalledWith('')
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('hides the clear button while empty, disabled, or readOnly', () => {
    const { rerender } = render(<Textarea allowClear value="南瓜汤" />)
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()

    rerender(<Textarea allowClear value="" />)
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()

    rerender(<Textarea allowClear value="南瓜汤" disabled />)
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
  })

  it('fires onPressEnter for bare Enter but not Shift+Enter', () => {
    const onPressEnter = vi.fn()
    render(<Textarea onPressEnter={onPressEnter} />)

    const field = screen.getByRole('textbox')
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onPressEnter).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(field, { key: 'Enter', shiftKey: true })
    expect(onPressEnter).toHaveBeenCalledTimes(1)
  })
})
