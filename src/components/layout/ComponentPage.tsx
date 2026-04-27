import Card from '../ui/Card'
import './ComponentPage.css'
import TableOfContents from './TableOfContents'

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

function ComponentPage({ title, description, children, toc }: ComponentPageProps) {
  return (
    <div className="component-page">
      <Card className="component-page-header-card">
        <div className="component-page-header">
          <h1 className="component-page-title">{title}</h1>
          <p className="component-page-desc">{description}</p>
        </div>
      </Card>
      <div className="component-page-content">{children}</div>
      {toc ? <TableOfContents items={toc} /> : null}
    </div>
  )
}

export default ComponentPage
