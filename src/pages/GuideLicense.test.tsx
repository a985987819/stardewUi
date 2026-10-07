import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n'
import GuideLicense from './GuideLicense'

function renderLicense(lang: 'zh' | 'en' = 'zh') {
  window.localStorage.setItem('star-ui-lang', JSON.stringify(lang))

  return render(
    <I18nProvider>
      <GuideLicense />
    </I18nProvider>,
  )
}

/** Every string the page renders, flattened — for the "must not say X" checks. */
const pageText = () => document.body.textContent ?? ''

describe('GuideLicense', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('states the MIT terms in Chinese', () => {
    renderLicense('zh')

    expect(pageText()).toContain('MIT')
    // The single most consequential fact on the page, and the one a stale copy
    // would contradict. It lives in the permitted list rather than the lede —
    // a reader deciding whether they can ship this is scanning that list.
    expect(pageText()).toMatch(/商业项目、收费服务、闭源产品/)
  })

  it('states the MIT terms in English', () => {
    renderLicense('en')

    expect(pageText()).toContain('MIT')
    expect(pageText()).toMatch(/sell it|commercial/i)
  })

  it.each(['zh', 'en'] as const)('%s does not tell readers commercial use is forbidden', (lang) => {
    renderLicense(lang)

    // The regression this page is most likely to fall back into. It shipped for
    // months saying "non-commercial, do not use commercially", and a later edit
    // that only replaced the headline would leave the old prohibition standing in
    // the list below — telling readers the opposite of what the LICENSE grants.
    const text = pageText()

    for (const stale of [/仅限非商业/, /不得.*商业/, /不提供商业授权/, /non-commercial/i, /do not use it in commercial/i]) {
      expect(text, `页面仍写着「${stale}」，与 MIT 矛盾`).not.toMatch(stale)
    }
  })

  it.each(['zh', 'en'] as const)('%s keeps the trademark caveat, which MIT does not cover', (lang) => {
    renderLicense(lang)

    // Switching to MIT says nothing about the game. If this caveat ever goes,
    // the page would be actively misleading in the other direction — implying the
    // licence grants rights to Stardew Valley's name and artwork, which it does not.
    expect(pageText()).toMatch(/Stardew Valley|星露谷/)
    expect(pageText()).toMatch(/商标|素材|trademark|asset/i)
  })

  it('names the one obligation MIT actually imposes', () => {
    renderLicense('zh')

    // "Keep the copyright notice" is the whole of it. A page that lists many rules
    // invites readers to believe there are more.
    expect(pageText()).toMatch(/保留版权声明/)
  })

  it('renders both languages without a crash', () => {
    renderLicense('en')

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})