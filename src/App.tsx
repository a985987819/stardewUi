import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { I18nProvider } from './i18n'
import { ThemeProvider } from './theme'
import StarStartupLoader from './components/layout/StartupLoader'
import styles from './styles/global.module.scss'

function StarApp() {
  const [ready, setReady] = useState(false)

  return (
    <ThemeProvider>
      <div className={styles.starApp} data-star-app="true">
        <I18nProvider>
          {ready ? <RouterProvider router={router} /> : <StarStartupLoader onComplete={() => setReady(true)} />}
        </I18nProvider>
      </div>
    </ThemeProvider>
  )
}

export default StarApp
