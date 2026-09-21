import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CodeBlock from './CodeBlock'

const { highlight } = vi.hoisted(() => ({
  highlight: vi.fn((code: string) => ({ value: code })),
}))

vi.mock('highlight.js/lib/core', () => ({
  default: {
    registerLanguage: vi.fn(),
    getLanguage: (name: string) => (name === 'typescript' ? { name } : undefined),
    highlight,
  },
}))

vi.mock('highlight.js/lib/languages/bash', () => ({ default: {} }))
vi.mock('highlight.js/lib/languages/json', () => ({ default: {} }))
vi.mock('highlight.js/lib/languages/typescript', () => ({ default: {} }))
vi.mock('highlight.js/lib/languages/xml', () => ({ default: {} }))

describe('CodeBlock', () => {
  it('renders language label and code content', () => {
    render(<CodeBlock code={`const crop = 'parsnip'`} language="tsx" />)

    expect(screen.getByText('tsx')).toBeInTheDocument()
    expect(screen.getByText('const crop = \'parsnip\'')).toBeInTheDocument()
  })

  it('highlights once per language/code pair instead of mutating the DOM on every render', () => {
    highlight.mockClear()

    const { rerender } = render(<CodeBlock code={`const crop = 'parsnip'`} language="tsx" />)
    const callsAfterMount = highlight.mock.calls.length

    rerender(<CodeBlock code={`const crop = 'parsnip'`} language="tsx" />)

    // React 19 StrictMode re-invokes effects on mount; deriving the markup during
    // render must not add extra highlight passes on subsequent identical renders.
    expect(highlight.mock.calls.length).toBe(callsAfterMount)
    expect(screen.getByText('const crop = \'parsnip\'')).toBeInTheDocument()
  })

  it('falls back to plain text when the language is not registered', () => {
    render(<CodeBlock code="plain content" language="brainfuck" />)

    expect(screen.getByText('plain content')).toBeInTheDocument()
  })
})
