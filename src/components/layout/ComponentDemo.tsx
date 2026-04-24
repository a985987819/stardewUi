import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import CodeBlock from './CodeBlock'
import './ComponentDemo.css'

interface ComponentDemoProps {
  title: string
  description?: string
  children: React.ReactNode
  code?: string
  defaultShowCode?: boolean
}

function ComponentDemo({
  title,
  description,
  children,
  code,
  defaultShowCode = false,
}: ComponentDemoProps) {
  const [showCode, setShowCode] = useState(defaultShowCode)

  return (
    <div className={`component-demo ${code ? 'has-code' : ''}`}>
      <div className="component-demo-header">
        <h3 className="component-demo-title">{title}</h3>
        {description && (
          <p className="component-demo-desc">{description}</p>
        )}
      </div>
      <div className="component-demo-preview">{children}</div>
      {code && (
        <>
          <div className="component-demo-actions">
            <button
              className="component-demo-toggle"
              onClick={() => setShowCode(!showCode)}
            >
              {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>{showCode ? '隐藏代码' : '显示代码'}</span>
            </button>
          </div>
          {showCode && (
            <div className="component-demo-code">
              <CodeBlock code={code} language="tsx" />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function ComponentDemoWithCode(props: ComponentDemoProps) {
  return <ComponentDemo {...props} defaultShowCode={true} />
}

export default ComponentDemo
