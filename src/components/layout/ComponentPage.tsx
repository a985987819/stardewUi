import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { StarTitle, StarTypewriter } from '../ui'
import type { DocLayoutOutletContext } from './docLayoutContext'
import type { TocItem } from './TableOfContents'
import styles from './ComponentPage.module.scss'

interface ComponentPageProps {
  title: string
  description: string
  children: React.ReactNode
  toc?: TocItem[]
}

function StarComponentPage({ title, description, children, toc }: ComponentPageProps) {
  const outletContext = useOutletContext<DocLayoutOutletContext | null>()
  const setTableOfContents = outletContext?.setTableOfContents

  useEffect(() => {
    if (!setTableOfContents) {
      return
    }

    setTableOfContents(toc ?? [])

    return () => setTableOfContents([])
  }, [setTableOfContents, toc])

  return (
    <div className={styles['component-page']}>
      <header className={styles['component-page-header']}>
        <StarTitle level={1} className={styles['component-page-header-title']}>{title}</StarTitle>
        <p className={styles['component-page-header-desc']}>
          <StarTypewriter text={description} speed={60} startDelay={120} />
        </p>
      </header>
      <div className={styles['component-page-content']}>{children}</div>
    </div>
  )
}

export default StarComponentPage
