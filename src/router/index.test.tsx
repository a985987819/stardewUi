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
  // Routed pages are code-split and the date-picker chunk is heavy; under a
  // full-suite run the whole mount can outlast the default 5s test timeout,
  // so this case carries its own generous budget.
  it(
    'renders the date picker demo for /components/date-picker',
    async () => {
      await renderRoute('/components/date-picker')

      // Routed pages are code-split, so the chunk arrives asynchronously. The
      // default 1s findBy timeout is too tight when the whole suite is running.
      expect(
        (await screen.findAllByRole('heading', { name: /DatePicker/ }, { timeout: 10000 })).length
      ).toBeGreaterThan(0)
    },
    15000,
  )
})
