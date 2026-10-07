/// <reference types="node" />
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../../i18n'
import IssueLinks from './IssueLinks'

function renderLinks(lang: 'zh' | 'en' = 'zh') {
  window.localStorage.setItem('star-ui-lang', JSON.stringify(lang))

  return render(
    <I18nProvider>
      <MemoryRouter>
        <IssueLinks />
      </MemoryRouter>
    </I18nProvider>
  )
}

describe('IssueLinks', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('offers the same four routes as the floating launcher', () => {
    renderLinks()

    // Both surfaces read one list, so a reader who starts at the footer and a
    // reader who starts at the launcher reach the same four forms. If these ever
    // disagree, one of them is offering a template the other does not have.
    expect(screen.getAllByRole('link')).toHaveLength(5) // four routes + the repo link
  })

  it('opens every route in a new tab, safely', () => {
    renderLinks()

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    }
  })

  it('includes a plain route to the repository itself', () => {
    renderLinks()

    // Not just the forms. Some readers arrive wanting to read the code or file a
    // licence question, and a repo link that is only reachable by going out to
    // the header first is one more step than it needs to be.
    const repo = screen.getByRole('link', { name: /在 GitHub 上查看仓库/ })

    expect(repo).toHaveAttribute('href', 'https://github.com/a985987819/stardewUi')
  })

  it('speaks the reader language', () => {
    renderLinks('en')

    expect(screen.getByText('Something off? Tell me')).toBeInTheDocument()
    expect(screen.getByText('Bug')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View the repository on GitHub/ })).toBeInTheDocument()
  })
})