import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ApiTable from './ApiTable'

describe('ApiTable', () => {
  it('renders card title and table content', () => {
    render(
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
