import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { I18nProvider } from './i18n'
import StarStartupLoader from './components/layout/StartupLoader'
import styles from './styles/global.module.scss'

function StarApp() {
  const [ready, setReady] = useState(false)

  return (
    <div className={styles.starApp} data-star-app="true">
      <I18nProvider>
        {ready ? <RouterProvider router={router} /> : <StarStartupLoader onComplete={() => setReady(true)} />}
      </I18nProvider>
    </div>
  )
}

export default StarApp
