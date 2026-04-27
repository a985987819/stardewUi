import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Card from '../ui/Card'
import CodeBlock from './CodeBlock'
import './ComponentDemo.css'

interface ComponentDemoProps {
  title: string
  description?: string
  children: React.ReactNode
  code?: string
  defaultShowCode?: boolean
  id?: string
}

function ComponentDemo({
  title,
  description,
  children,
  code,
  defaultShowCode = false,
  id,
}: ComponentDemoProps) {
  const [showCode, setShowCode] = useState(defaultShowCode)

  return (
    <Card
      id={id}
      className={`component-demo ${code ? 'has-code' : ''}`}
      showTitle
      title={title}
      headerExtra={
        code ? (
          <button className="component-demo-toggle" type="button" onClick={() => setShowCode(!showCode)}>
            {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>{showCode ? '隐藏代码' : '显示代码'}</span>
          </button>
        ) : null
      }
    >
      {description ? <p className="component-demo-desc">{description}</p> : null}
      <div className="component-demo-preview">{children}</div>
      {showCode && code ? (
        <div className="component-demo-code">
          <CodeBlock code={code} language="tsx" />
        </div>
      ) : null}
    </Card>
  )
}

export default ComponentDemo
