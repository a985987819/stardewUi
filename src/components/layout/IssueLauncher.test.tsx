/// <reference types="node" />
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../../i18n'
import IssueLauncher from './IssueLauncher'

function renderLauncher(lang: 'zh' | 'en' = 'zh') {
  window.localStorage.setItem('star-ui-lang', JSON.stringify(lang))

  return render(
    <I18nProvider>
      <MemoryRouter>
        <IssueLauncher />
      </MemoryRouter>
    </I18nProvider>
  )
}

/**
 * The four routes, in menu order, as the reader sees them.
 *
 * `queryAll` rather than `getAll`: the collapsed state is asserted as "no links",
 * and `getAllByRole` throws on an empty match instead of returning an empty list,
 * which would turn that assertion into a lookup failure.
 */
const items = () => screen.queryAllByRole('link')

describe('IssueLauncher', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('opens on a single control, with the routes hidden until asked for', () => {
    renderLauncher()

    // Hidden, not merely transparent: `opacity: 0` alone leaves four links
    // sitting in the tab order behind a panel nobody can see, and a keyboard user
    // tabs into a menu that appears to be empty.
    expect(items()).toHaveLength(0)
    expect(screen.getByRole('button', { name: '提交 issue' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('reveals one route per issue template, each pointing at GitHub', () => {
    renderLauncher()

    fireEvent.click(screen.getByRole('button', { name: '提交 issue' }))

    expect(items()).toHaveLength(4)
    for (const link of items()) {
      expect(link).toHaveAttribute('href', expect.stringContaining('github.com/a985987819/stardewUi/issues/new'))
      // Leaving the site without `noopener` hands the opened page a reference to
      // this one via `window.opener`.
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(link).toHaveAttribute('target', '_blank')
    }
  })

  it('gives each route a distinct template, so no two land on the same form', () => {
    renderLauncher()

    fireEvent.click(screen.getByRole('button', { name: '提交 issue' }))

    const templates = items().map((link) => new URL(link.getAttribute('href')!).searchParams.get('template'))

    expect(new Set(templates).size, `模板重复了：${templates.join(', ')}`).toBe(4)
    expect(templates.every(Boolean)).toBe(true)
  })

  it('says what each route will ask for, before the reader leaves', () => {
    renderLauncher()

    fireEvent.click(screen.getByRole('button', { name: '提交 issue' }))

    // The hint is the whole point of routing by intent: a reader who knows the
    // "bug" form will ask for reproduction steps can choose a different form
    // instead of finding out on GitHub.
    expect(screen.getByText('行为和预期不一致')).toBeInTheDocument()
    expect(screen.getByText('装不上、构建失败或类型报错')).toBeInTheDocument()
    expect(screen.getByText('视觉、动效或文案读起来不对')).toBeInTheDocument()
    expect(screen.getByText('你的项目缺一个组件')).toBeInTheDocument()
  })

  it('speaks the reader language', () => {
    renderLauncher('en')

    fireEvent.click(screen.getByRole('button', { name: 'Report an issue' }))

    expect(screen.getByText('Bug')).toBeInTheDocument()
    expect(screen.getByText('It behaves differently than expected')).toBeInTheDocument()
  })

  it('closes on Escape and hands focus back to the trigger', () => {
    renderLauncher()

    const trigger = screen.getByRole('button', { name: '提交 issue' })
    fireEvent.click(trigger)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(items()).toHaveLength(0)
    // Without this the reader's focus is on a link that just disappeared, and the
    // next Tab starts again from the top of the document.
    expect(document.activeElement).toBe(trigger)
  })

  it('closes when the reader clicks elsewhere', () => {
    renderLauncher()

    fireEvent.click(screen.getByRole('button', { name: '提交 issue' }))
    expect(items()).toHaveLength(4)

    fireEvent.pointerDown(document.body)

    expect(items()).toHaveLength(0)
  })

  it('stays open when the click lands inside it', () => {
    renderLauncher()

    fireEvent.click(screen.getByRole('button', { name: '提交 issue' }))
    fireEvent.pointerDown(screen.getByText('Bug 反馈'))

    expect(items()).toHaveLength(4)
  })

  it('toggles shut from the same button', () => {
    renderLauncher()

    const trigger = screen.getByRole('button', { name: '提交 issue' })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: '关闭提 issue 菜单' }))

    expect(items()).toHaveLength(0)
    // The control is one button, not a pair: two would make it ambiguous which
    // one closes an open menu.
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('points the menu at the trigger for assistive tech', () => {
    renderLauncher()

    const trigger = screen.getByRole('button', { name: '提交 issue' })
    fireEvent.click(trigger)

    // Without this the menu is an unlabelled region that a screen reader has no
    // reason to announce when it appears.
    const menuId = trigger.getAttribute('aria-controls')
    expect(menuId).toBeTruthy()
    expect(document.getElementById(menuId!)).toBeInTheDocument()
  })

  it('prefills each report with the page it was filed from', () => {
    renderLauncher()

    fireEvent.click(screen.getByRole('button', { name: '提交 issue' }))

    for (const link of items()) {
      // The URL is the context a bug report most needs and least often gets. If
      // this ever comes back without it, the form goes out with no pointer to
      // which page was broken.
      expect(new URL(link.getAttribute('href')!).searchParams.get('q')).toBe(window.location.href)
    }
  })
})