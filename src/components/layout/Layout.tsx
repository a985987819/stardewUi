import { Outlet } from 'react-router-dom'
import StarHeader from './Header'
import StarSidebar from './Sidebar'
import styles from './Layout.module.css'

function StarLayout() {
  return (
    <div className={styles['doc-layout']}>
      <StarHeader />
      <StarSidebar />
      <main className={styles['doc-main']}>
        <div className={styles['doc-content']}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default StarLayout
