import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import StarHeader from './Header'
import StarSidebar from './Sidebar'
import StarDivider from '../ui/Divider'
import StarLoading from '../ui/Loading'
import styles from './Layout.module.scss'

function StarLayout() {
  return (
    <div className={styles['doc-layout']}>
      <StarHeader />
      <StarSidebar />
      <main className={styles['doc-main']}>
        <div className={styles['doc-content']}>
          {/* Route-level code splitting means child chunks arrive after the shell
              has painted, so every routed page renders behind this boundary. */}
          <Suspense
            fallback={
              <div className={styles['doc-loading']}>
                <StarLoading text="" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
        {/* 页脚：横向铺满整列的木栅栏，挂在内容区外面，不跟正文共用容器宽度 */}
        <footer className={styles['doc-footer']}>
          <StarDivider />
        </footer>
      </main>
    </div>
  )
}

export default StarLayout
