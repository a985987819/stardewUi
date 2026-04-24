import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Popup from './Popup'

describe('Popup', () => {
  it('renders content when open is true', () => {
    render(
      <Popup open placement="right-start" title="标题" content="弹窗内容">
        <button type="button">trigger</button>
      </Popup>
    )

    expect(screen.getByText('标题')).toBeInTheDocument()
    expect(screen.getByText('弹窗内容')).toBeInTheDocument()
  })

  it('does not render bubble when open is false', () => {
    render(
      <Popup open={false} placement="right-start" title="标题" content="弹窗内容">
        <button type="button">trigger</button>
      </Popup>
    )

    expect(screen.queryByText('标题')).not.toBeInTheDocument()
    expect(screen.queryByText('弹窗内容')).not.toBeInTheDocument()
  })

  it('renders action buttons and handles click', () => {
    const onConfirm = vi.fn()

    render(
      <Popup
        open
        placement="bottom"
        content="弹窗内容"
        actions={[
          { label: '取消' },
          { label: '确认', variant: 'primary', onClick: onConfirm },
        ]}
      >
        <button type="button">trigger</button>
      </Popup>
    )

    fireEvent.click(screen.getByText('确认'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
