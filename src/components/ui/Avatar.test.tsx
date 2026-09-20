import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Avatar from './Avatar'
import styles from './Avatar.module.scss'

describe('Avatar', () => {
  it('renders a labelled image portrait', () => {
    render(<Avatar src="/abigail.png" alt="Abigail" />)

    expect(screen.getByRole('img', { name: 'Abigail' })).toHaveAttribute('src', '/abigail.png')
  })

  it('uses initials as an accessible fallback when no image is supplied', () => {
    render(<Avatar name="Leah Stone" />)

    expect(screen.getByRole('img', { name: 'Leah Stone' })).toHaveTextContent('LS')
  })

  it('falls back to initials when the portrait URL cannot load', () => {
    render(<Avatar src="/missing.png" name="Sam" />)
    fireEvent.error(screen.getByRole('img', { name: 'Sam' }))

    expect(screen.getByRole('img', { name: 'Sam' })).toHaveTextContent('SA')
  })

  it('supports circular frames and custom palette surfaces', () => {
    const { container } = render(<Avatar shape="circle" size="large" color="#7699B5" name="Maru" />)
    const avatar = container.firstElementChild as HTMLElement

    expect(avatar).toHaveClass(styles['star-avatar--circle'])
    expect(avatar.style.getPropertyValue('--avatar-size')).toBe('104px')
    expect(avatar.style.getPropertyValue('--avatar-bg')).toBe('#7699b5')
    expect(avatar.style.getPropertyValue('--avatar-border-dark')).not.toBe('#7699b5')
    expect(avatar.querySelector('[class*="star-avatar__grain"]')).toBeInTheDocument()
  })

  it('accepts exact numeric pixel sizes', () => {
    const { container } = render(<Avatar size={60} name="Penny" />)

    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--avatar-size')).toBe('60px')
  })
})
