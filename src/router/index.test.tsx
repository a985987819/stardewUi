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
  it.each([
    '/components/date-picker',
    '/components/star-date-picker',
  ])('renders the date picker demo for %s', async (path) => {
    await renderRoute(path)

    expect((await screen.findAllByRole('heading', { name: /DatePicker/ })).length).toBeGreaterThan(0)
  })
})
