import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n'
import Home from './Home'

describe('Home', () => {
  it('renders the welcome page with its primary routes and license boundary', () => {
    window.localStorage.setItem('star-ui-lang', JSON.stringify('zh'))

    render(
      <I18nProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </I18nProvider>
    )

    expect(screen.getByText('给你的界面，')).toBeInTheDocument()
    expect(screen.getByText('种下一座小镇')).toBeInTheDocument()
    expect(screen.getByText('把种子放进项目')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /浏览组件田地/ })).toHaveAttribute('href', '/components')
    expect(screen.getByRole('link', { name: /从使用指南开始/ })).toHaveAttribute('href', '/guide/self-use')
    expect(screen.getByRole('link', { name: /Agent 帮我使用/ })).toHaveAttribute('href', '/guide/agent-use')
    expect(screen.getByRole('link', { name: /查看版权相关/ })).toHaveAttribute('href', '/guide/license')
    expect(screen.getByText('许可提醒：本项目仅供非商业学习、研究与原型使用。')).toBeInTheDocument()
  })
})
