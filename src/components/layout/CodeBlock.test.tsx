import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CodeBlock from './CodeBlock'

vi.mock('highlight.js', () => ({
  default: {
    highlightElement: vi.fn(),
  },
}))

describe('CodeBlock', () => {
  it('renders language label and code content', () => {
    render(<CodeBlock code={`const crop = 'parsnip'`} language="tsx" />)

    expect(screen.getByText('tsx')).toBeInTheDocument()
    expect(screen.getByText('const crop = \'parsnip\'')).toBeInTheDocument()
  })
})
