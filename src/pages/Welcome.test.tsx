import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import StarWelcomePage from './Welcome'

describe('Welcome', () => {
  it('keeps the welcome gate closed until the visitor starts the application', () => {
    const onStart = vi.fn()

    render(<StarWelcomePage onStart={onStart} />)

    expect(screen.getByRole('heading', { name: '欢迎来到小镇' })).toBeInTheDocument()
    expect(screen.getByLabelText('老乡，你真中！！')).toBeInTheDocument()
    expect(screen.getByText('老乡，')).toBeInTheDocument()
    expect(screen.getByText('你真中！！')).toBeInTheDocument()
    expect(screen.queryByText('噫')).not.toBeInTheDocument()
    expect(onStart).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '开始使用' }))

    expect(onStart).toHaveBeenCalledTimes(1)
  })
})
