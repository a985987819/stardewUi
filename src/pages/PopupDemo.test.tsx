import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n'
import PopupDemo from './PopupDemo'

describe('PopupDemo', () => {
  it('opens the popup from the clicked placement button instead of a separate center trigger', async () => {
    render(
      <I18nProvider>
        <PopupDemo />
      </I18nProvider>
    )

    const section = document.getElementById('all-placement') ?? document.body
    const trigger = within(section).getByRole('button', { name: 'top-start' })

    expect(within(section).queryByText('位置控制')).not.toBeInTheDocument()

    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('位置控制')).toBeInTheDocument()
    })
    expect(screen.getByText('支持 top / right / bottom / left 以及 start / end 对齐。')).toBeInTheDocument()
  })
})
