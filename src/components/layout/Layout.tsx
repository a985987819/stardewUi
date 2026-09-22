import { Suspense, useLayoutEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import StarHeader from './Header'
import StarSidebar from './Sidebar'
import StarDivider from '../ui/Divider'
import StarLoading from '../ui/Loading'
import StarBackToTop from '../ui/BackToTop'
import StarTableOfContents, { type TocItem } from './TableOfContents'
import { useI18n } from '../../i18n'
import type { DocLayoutOutletContext } from './docLayoutContext'
import styles from './Layout.module.scss'

function StarLayout() {
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([])
  const outletContext = useMemo<DocLayoutOutletContext>(() => ({ setTableOfContents }), [])
  const { pathname } = useLocation()
  const { t } = useI18n()

  // 换页即回顶：新页面从顶部开始，右下角那只纸飞机负责飞走那一拍，哪怕这一跳是
  // 路由替它做的。
  //
  // 只认 `pathname`：页内目录锚点只改 hash，正文位置本来就该留着。刻意用 layout
  // effect 而不是 effect —— 后者在新页面已经画完一帧之后才跑，那一帧会停在上一页的
  // 滚动位置上闪一下。
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <div className={styles['doc-layout']}>
      <StarHeader />
      <StarSidebar />
      <main className={styles['doc-main']}>
        <div className={styles['doc-content']}>
          <div className={styles['doc-content-primary']}>
            {/* Route-level code splitting means child chunks arrive after the shell
                has painted, so every routed page renders behind this boundary. */}
            <Suspense
              fallback={
                <div className={styles['doc-loading']}>
                  <StarLoading text="" />
                </div>
              }
            >
              <Outlet context={outletContext} />
            </Suspense>
          </div>
          {tableOfContents.length > 0 ? (
            <StarTableOfContents
              items={tableOfContents}
              className={styles['doc-content-toc']}
            />
          ) : null}
        </div>
        {/* 页脚：横向铺满整列的木栅栏，挂在内容区外面，不跟正文共用容器宽度 */}
        <footer className={styles['doc-footer']}>
          <StarDivider />
        </footer>
      </main>
      {/* 全站就养这一只纸飞机：任何页面滚动到离开顶部，它自己就会浮现；换页时由
          `flightKey` 触发飞走，替用户按下这一颗按钮。固定在视口上，不占栅格。 */}
      <StarBackToTop flightKey={pathname} label={t('nav.backToTop')} />
    </div>
  )
}

export default StarLayout
