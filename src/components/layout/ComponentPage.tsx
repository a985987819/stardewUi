import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { StarCard } from '../ui/Card'
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
      <StarCard className={styles['component-page-header-card']}>
        <div className={styles['component-page-header']}>
          <h1 className={styles['component-page-title']}>{title}</h1>
          <p className={styles['component-page-desc']}>{description}</p>
        </div>
      </StarCard>
      <div className={styles['component-page-content']}>{children}</div>
    </div>
  )
}

export default StarComponentPage
