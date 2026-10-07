/// <reference types="node" />
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider } from './I18nProvider'
import { useI18n } from './context'

function Probe() {
  const { lang, setLang, t } = useI18n()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="copy">{t('nav.components')}</span>
      <button type="button" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>
        toggle
      </button>
    </div>
  )
}

const renderProvider = () =>
  render(
    <I18nProvider>
      <MemoryRouter>
        <Probe />
      </MemoryRouter>
    </I18nProvider>
  )

const setSearch = (search: string) =>
  window.history.replaceState(null, '', `/${search}`)

describe('I18nProvider language resolution', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setSearch('')
    document.documentElement.lang = ''
  })

  afterEach(() => {
    window.localStorage.clear()
    setSearch('')
  })

  it('follows ?lang= over the stored choice', () => {
    // This is the whole point of the parameter. `localStorage` is permanent and
    // per-browser, so a shared `?lang=en` link used to land in whatever language
    // the last person to use that browser had chosen — the reason the demo looked
    // identical no matter which link was followed.
    window.localStorage.setItem('star-ui-lang', JSON.stringify('zh'))

    setSearch('?lang=en')
    renderProvider()

    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    expect(screen.getByTestId('copy')).toHaveTextContent('Components')
  })

  it('lets ?lang=zh win over a stored English', () => {
    window.localStorage.setItem('star-ui-lang', JSON.stringify('en'))

    setSearch('?lang=zh')
    renderProvider()

    expect(screen.getByTestId('lang')).toHaveTextContent('zh')
  })

  it('falls back to the stored choice when there is no parameter', () => {
    window.localStorage.setItem('star-ui-lang', JSON.stringify('en'))

    renderProvider()

    expect(screen.getByTestId('lang')).toHaveTextContent('en')
  })

  it('falls back to Chinese when neither source has an opinion', () => {
    renderProvider()

    expect(screen.getByTestId('lang')).toHaveTextContent('zh')
  })

  it('ignores an unrecognised parameter instead of guessing', () => {
    // `?lang=fr` must not silently become English: a wrong-but-plausible language
    // is harder to notice and report than the default a reader already expects.
    window.localStorage.setItem('star-ui-lang', JSON.stringify('en'))

    setSearch('?lang=fr')
    renderProvider()

    expect(screen.getByTestId('lang')).toHaveTextContent('en')
  })

  it('writes the parameter language to storage so a bare URL agrees with it', () => {
    setSearch('?lang=en')
    renderProvider()

    expect(window.localStorage.getItem('star-ui-lang')).toBe('"en"')
  })

  it('puts the language in the address bar when the visitor toggles it', () => {
    setSearch('?lang=zh')
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))

    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    // Without this, copying the URL after switching handed over a link with no
    // language in it, and the recipient got their own stored default instead.
    expect(window.location.search).toBe('?lang=en')
  })

  it('sets the document language so assistive tech matches the copy', () => {
    setSearch('?lang=en')
    renderProvider()

    expect(document.documentElement.lang).toBe('en')
  })

  it('survives a corrupt storage entry', () => {
    // A hand-edited or half-written entry used to be the one input that could
    // keep the first paint from finishing.
    window.localStorage.setItem('star-ui-lang', '{not json')

    renderProvider()

    expect(screen.getByTestId('lang')).toHaveTextContent('zh')
  })

  it('ignores a storage entry that is valid JSON but not a language', () => {
    window.localStorage.setItem('star-ui-lang', JSON.stringify('fr'))

    renderProvider()

    expect(screen.getByTestId('lang')).toHaveTextContent('zh')
  })
})