import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import Input from './Input'

describe('Input', () => {
  it('binds its label to the field so the caption focuses the input', () => {
    render(<Input label="农场名" placeholder="给农场起个名字" />)

    const control = screen.getByLabelText('农场名')
    expect(control).toHaveAttribute('placeholder', '给农场起个名字')
    expect(control.tagName).toBe('INPUT')
  })

  it('reports the next text for a controlled field', () => {
    const onChange = vi.fn()

    function Harness() {
      const [value, setValue] = useState('')
      return (
        <Input
          label="农场名"
          value={value}
          onChange={(next) => {
            setValue(next)
            onChange(next)
          }}
        />
      )
    }

    render(<Harness />)
    fireEvent.change(screen.getByLabelText('农场名'), { target: { value: '鹈鹕镇' } })

    expect(onChange).toHaveBeenCalledWith('鹈鹕镇')
    expect(screen.getByLabelText('农场名')).toHaveValue('鹈鹕镇')
  })

  it('keeps its own state when uncontrolled', () => {
    render(<Input label="村民昵称" defaultValue="阿比" />)

    const control = screen.getByLabelText('村民昵称')
    expect(control).toHaveValue('阿比')

    fireEvent.change(control, { target: { value: '阿比盖尔' } })

    expect(screen.getByLabelText('村民昵称')).toHaveValue('阿比盖尔')
  })

  it('empties the field from the clear button and then hides it', () => {
    const onClear = vi.fn()
    render(<Input label="留言" defaultValue="给皮埃尔" allowClear clearLabel="清空" onClear={onClear} />)

    fireEvent.click(screen.getByRole('button', { name: '清空' }))

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('留言')).toHaveValue('')
    expect(screen.queryByRole('button', { name: '清空' })).not.toBeInTheDocument()
  })

  it('hides the clear button while the field is locked', () => {
    render(<Input label="留言" defaultValue="给皮埃尔" allowClear disabled />)

    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('留言')).toBeDisabled()
  })

  it('announces a validation message and tints the wrapper', () => {
    render(<Input label="农场名" status="error" message="名字最多 12 个字" maxLength={12} showCount defaultValue="星露谷" />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('名字最多 12 个字')
    expect(alert.closest('div')?.className).toContain('error')
    expect(screen.getByText('3/12')).toBeInTheDocument()
    expect(screen.getByLabelText('农场名')).toHaveAttribute('maxlength', '12')
  })

  it('passes affix content and the block flag through to the frame', () => {
    render(<Input label="搜索" prefix={<span>icon</span>} suffix={<span>金币</span>} block />)

    const control = screen.getByLabelText('搜索')
    const wrapper = control.closest('div')?.parentElement?.parentElement

    expect(wrapper?.className).toContain('is-block')
    expect(screen.getByText('金币')).toBeInTheDocument()
    expect(screen.getByText('icon')).toBeInTheDocument()
  })
})
