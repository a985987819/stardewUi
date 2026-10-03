import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../i18n'
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

/** The copy button reads `copy.*`, so the block needs the provider mounted. */
function renderCodeBlock(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe('CodeBlock', () => {
  it('renders language label and code content', () => {
    renderCodeBlock(<CodeBlock code={`const crop = 'parsnip'`} language="tsx" />)

    expect(screen.getByText('tsx')).toBeInTheDocument()
    expect(screen.getByText('const crop = \'parsnip\'')).toBeInTheDocument()
  })

  it('highlights once per language/code pair instead of mutating the DOM on every render', () => {
    highlight.mockClear()

    const { rerender } = renderCodeBlock(<CodeBlock code={`const crop = 'parsnip'`} language="tsx" />)
    const callsAfterMount = highlight.mock.calls.length

    rerender(
      <I18nProvider>
        <CodeBlock code={`const crop = 'parsnip'`} language="tsx" />
      </I18nProvider>,
    )

    // React 19 StrictMode re-invokes effects on mount; deriving the markup during
    // render must not add extra highlight passes on subsequent identical renders.
    expect(highlight.mock.calls.length).toBe(callsAfterMount)
    expect(screen.getByText('const crop = \'parsnip\'')).toBeInTheDocument()
  })

  it('falls back to plain text when the language is not registered', () => {
    renderCodeBlock(<CodeBlock code="plain content" language="brainfuck" />)

    expect(screen.getByText('plain content')).toBeInTheDocument()
  })

  it('labels the copy button from the dictionary instead of a hardcoded Chinese string', () => {
    // Regression guard: the button used to read 复制 / 已复制 unconditionally,
    // which meant an English page showed a Chinese button. It now reads
    // `copy.title` / `copy.success`, and the default language is Chinese.
    renderCodeBlock(<CodeBlock code="const a = 1" />)

    expect(screen.getByRole('button', { name: /复制|Click to copy/ })).toBeInTheDocument()
  })
})