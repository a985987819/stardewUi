import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n'
import PopupDemo from './PopupDemo'

describe('PopupDemo', () => {
  it('opens the click-trigger popup from the demo trigger', async () => {
    window.localStorage.setItem('star-ui-lang', JSON.stringify('zh'))

    render(
      <I18nProvider>
        <PopupDemo />
      </I18nProvider>
    )

    const section = document.getElementById('click') ?? document.body
    const trigger = within(section).getByRole('button', { name: '查看种子' })

    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('草莓种子：春季作物，成熟后可多次收获。')).toBeInTheDocument()
    })
  })
})
