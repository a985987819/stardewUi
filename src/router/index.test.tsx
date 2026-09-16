import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { RouterProvider } from 'react-router-dom'
import { I18nProvider } from '../i18n'
import { router } from './index'

async function renderRoute(path: string) {
  await act(async () => {
    await router.navigate(path)
  })

  return render(
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  )
}

afterEach(() => {
  cleanup()
  void router.navigate('/')
})

describe('router', () => {
  it('renders the date picker demo for /components/date-picker', async () => {
    await renderRoute('/components/date-picker')

    // Routed pages are code-split, so the chunk arrives asynchronously. The
    // default 1s findBy timeout is too tight when the whole suite is running.
    expect(
      (await screen.findAllByRole('heading', { name: /DatePicker/ }, { timeout: 5000 })).length
    ).toBeGreaterThan(0)
  })
})
