import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n'
import Home from './Home'

describe('Home', () => {
  it('renders the product-focused hero copy and feature copy', () => {
    render(
      <I18nProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </I18nProvider>
    )

    expect(screen.getByText('像素风 UI Kit')).toBeInTheDocument()
    expect(
      screen.getByText('一个受星露谷气质启发的像素风 UI 组件库。这里提供带有田园感、游戏感和复古界面氛围的组件与 demo，适合用来搭建更有个性的网页和交互页面。')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '开始浏览' })).toBeInTheDocument()
    expect(screen.getByText('像素风组件')).toBeInTheDocument()
    expect(screen.getByText('可直接体验')).toBeInTheDocument()
    expect(screen.getByText('有氛围的界面')).toBeInTheDocument()
  })
})
