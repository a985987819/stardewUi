import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../../i18n'
import ApiTable from './ApiTable'

describe('ApiTable', () => {
  it('renders card title and table content', () => {
    render(
      <I18nProvider>
        <ApiTable
          title="Popup API"
          data={[
            {
              property: 'placement',
              description: '弹出位置',
              type: "'top' | 'right'",
              default: "'right'",
              required: true,
            },
          ]}
        />
      </I18nProvider>
    )

    expect(screen.getByText('Popup API')).toBeInTheDocument()
    expect(screen.getByText('属性')).toBeInTheDocument()
    expect(screen.getByText('说明')).toBeInTheDocument()
    expect(screen.getByText('类型')).toBeInTheDocument()
    expect(screen.getByText('默认值')).toBeInTheDocument()
    expect(screen.getByText('placement')).toBeInTheDocument()
    expect(screen.getByText('弹出位置')).toBeInTheDocument()
  })
})
