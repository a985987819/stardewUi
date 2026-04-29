import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../../i18n'
import Sidebar from './Sidebar'

function renderSidebar(lang: 'zh' | 'en') {
  window.localStorage.setItem('star-ui-lang', JSON.stringify(lang))

  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/components/button']}>
        <Sidebar />
      </MemoryRouter>
    </I18nProvider>
  )
}

describe('Sidebar language rendering', () => {
  it('always renders route menu items with Chinese and English labels', () => {
    renderSidebar('zh')

    expect(screen.getByRole('link', { name: /指南 Guide/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /组件 Components/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /按钮 Button/ })).toBeInTheDocument()
  })

  it('keeps bilingual route labels in English mode too', () => {
    renderSidebar('en')

    expect(screen.getByRole('link', { name: /指南 Guide/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /组件 Components/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /选项卡 Tab/ })).toBeInTheDocument()
  })
})
