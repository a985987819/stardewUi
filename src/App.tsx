import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { I18nProvider } from './i18n'
import { ThemeProvider } from './theme'
import StarStartupLoader from './components/layout/StartupLoader'
import StarWelcomePage from './pages/Welcome'
import styles from './styles/global.module.scss'

function StarApp() {
  const [stage, setStage] = useState<'loading' | 'welcome' | 'application'>('loading')

  return (
    <ThemeProvider>
      <div className={styles.starApp} data-star-app="true">
        <I18nProvider>
          {stage === 'loading' ? <StarStartupLoader onComplete={() => setStage('welcome')} /> : null}
          {stage === 'welcome' ? <StarWelcomePage onStart={() => setStage('application')} /> : null}
          {stage === 'application' ? <RouterProvider router={router} /> : null}
        </I18nProvider>
      </div>
    </ThemeProvider>
  )
}

export default StarApp
