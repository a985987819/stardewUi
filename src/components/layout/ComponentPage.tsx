import { StarCard } from '../ui/Card'
import StarTableOfContents from './TableOfContents'
import styles from './ComponentPage.module.scss'

interface TocItem {
  id: string
  title: string
  level: number
}

interface ComponentPageProps {
  title: string
  description: string
  children: React.ReactNode
  toc?: TocItem[]
}

function StarComponentPage({ title, description, children, toc }: ComponentPageProps) {
  return (
    <div className={styles['component-page']}>
      <StarCard className={styles['component-page-header-card']}>
        <div className={styles['component-page-header']}>
          <h1 className={styles['component-page-title']}>{title}</h1>
          <p className={styles['component-page-desc']}>{description}</p>
        </div>
      </StarCard>
      <div className={styles['component-page-content']}>{children}</div>
      {toc ? <StarTableOfContents items={toc} /> : null}
    </div>
  )
}

export default StarComponentPage
