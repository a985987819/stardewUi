import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n'
import Components from './Components'

function renderComponents(lang: 'zh' | 'en') {
  window.localStorage.setItem('star-ui-lang', JSON.stringify(lang))

  return render(
    <I18nProvider>
      <MemoryRouter>
        <Components />
      </MemoryRouter>
    </I18nProvider>
  )
}

describe('Components page language rendering', () => {
  it('renders only Chinese page content in Chinese mode', () => {
    renderComponents('zh')

    expect(screen.getByRole('heading', { name: '组件' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '按钮' })).toBeInTheDocument()
    expect(screen.queryByText('Button')).not.toBeInTheDocument()
  })

  it('renders only English page content in English mode', () => {
    renderComponents('en')

    expect(screen.getByRole('heading', { name: 'Components' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Button' })).toBeInTheDocument()
    expect(screen.queryByText('按钮')).not.toBeInTheDocument()
  })
})
