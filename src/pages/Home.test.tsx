import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n'
import Home from './Home'

describe('Home', () => {
  it('renders the product-focused hero copy and feature copy', () => {
    window.localStorage.setItem('star-ui-lang', JSON.stringify('zh'))

    render(
      <I18nProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </I18nProvider>
    )

    expect(screen.getByText('像素农场 UI Kit')).toBeInTheDocument()
    expect(screen.getByText('一套带着星露谷泥土香气的 React 组件库。按钮像工具箱里的铜锤，卡片像镇长公告栏，日历会提醒你别错过花舞节。')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /开始逛农场/ })).toBeInTheDocument()
    expect(screen.getByText('把组件种进田里')).toBeInTheDocument()
    expect(screen.getByText('先试玩，再接入')).toBeInTheDocument()
    expect(screen.getByText('界面也能有季节')).toBeInTheDocument()
  })
})
