import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n'
import StarWelcomePage from './Welcome'

/** The splash reads its copy from the dictionary, so the provider is required. */
function renderWelcome(onStart: () => void) {
  return render(
    <I18nProvider>
      <StarWelcomePage onStart={onStart} />
    </I18nProvider>,
  )
}

describe('Welcome', () => {
  it('keeps the welcome gate closed until the visitor starts the application', () => {
    const onStart = vi.fn()

    renderWelcome(onStart)

    expect(screen.getByRole('heading', { name: '欢迎来到小镇' })).toBeInTheDocument()
    expect(screen.getByLabelText('老乡，你真中！！')).toBeInTheDocument()
    expect(screen.getByText('老乡，')).toBeInTheDocument()
    expect(screen.getByText('你真中！！')).toBeInTheDocument()
    expect(screen.queryByText('噫')).not.toBeInTheDocument()
    expect(onStart).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '开始使用' }))

    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('shows English copy when the app language is English', () => {
    // Regression guard: this page used to be hardcoded Chinese end to end, so a
    // visitor who had switched the app to English met a fully Chinese front
    // door before reaching any content at all.
    localStorage.setItem('star-ui-lang', JSON.stringify('en'))
    const onStart = vi.fn()

    try {
      renderWelcome(onStart)

      expect(screen.getByRole('heading', { name: 'Welcome to town' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument()
      expect(screen.getByText('Spring · Year 1')).toBeInTheDocument()
      // The accessible name switches too, not just the visible glyphs.
      expect(screen.getByLabelText('Now that is farm spirit!')).toBeInTheDocument()
    } finally {
      localStorage.removeItem('star-ui-lang')
    }
  })
})