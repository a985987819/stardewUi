import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import styles from './styles/global.module.css'

function StarApp() {
  return (
    <div className={styles.starApp}>
      <RouterProvider router={router} />
    </div>
  )
}

export default StarApp
