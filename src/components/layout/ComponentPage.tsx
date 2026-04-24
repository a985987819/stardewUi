import './ComponentPage.css'

interface ComponentPageProps {
  title: string
  description: string
  children: React.ReactNode
}

function ComponentPage({ title, description, children }: ComponentPageProps) {
  return (
    <div className="component-page">
      <div className="component-page-header">
        <h1 className="component-page-title">{title}</h1>
        <p className="component-page-desc">{description}</p>
      </div>
      <div className="component-page-content">{children}</div>
    </div>
  )
}

export default ComponentPage
