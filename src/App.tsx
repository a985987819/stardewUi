import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { I18nProvider } from './i18n'
import styles from './styles/global.module.scss'

function StarApp() {
  return (
    <div className={styles.starApp} data-star-app="true">
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </div>
  )
}

export default StarApp
