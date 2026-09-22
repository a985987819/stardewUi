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
    expect(screen.getByRole('button', { name: /通用 General/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /数据录入 Data Entry/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /反馈 Feedback/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /按钮 Button/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /评分 Rating/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /进度条 Progress/ })).toBeInTheDocument()
  })

  it('groups components by conventional categories in catalogue order', () => {
    renderSidebar('zh')

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '通用 General',
      '布局 Layout',
      '导航 Navigation',
      '数据录入 Data Entry',
      '数据展示 Data Display',
      '反馈 Feedback',
      '其他 Other',
    ])
  })

  it('keeps bilingual route labels in English mode too', () => {
    renderSidebar('en')

    expect(screen.getByRole('link', { name: /指南 Guide/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /组件 Components/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /选项卡 Tab/ })).toBeInTheDocument()
  })
})
