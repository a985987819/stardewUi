import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { StarCard } from '../ui/Card'
import StarCodeBlock from './CodeBlock'
import { useI18n } from '../../i18n'
import styles from './ComponentDemo.module.scss'

interface ComponentDemoProps {
  title: string
  description?: string
  children: React.ReactNode
  code?: string
  defaultShowCode?: boolean
  id?: string
}

function StarComponentDemo({
  title,
  description,
  children,
  code,
  defaultShowCode = false,
  id,
}: ComponentDemoProps) {
  const [showCode, setShowCode] = useState(defaultShowCode)
  const { t } = useI18n()

  return (
    <StarCard
      id={id}
      className={code ? `${styles['component-demo']} ${styles['has-code']}` : styles['component-demo']}
      showTitle
      title={title}
      headerExtra={
        code ? (
          <button className={styles['component-demo-toggle']} type="button" onClick={() => setShowCode(!showCode)}>
            {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>{showCode ? t('demo.hideCode') : t('demo.showCode')}</span>
          </button>
        ) : null
      }
    >
      {description ? <p className={styles['component-demo-desc']}>{description}</p> : null}
      <div className={styles['component-demo-preview']}>{children}</div>
      {showCode && code ? (
        <div className={styles['component-demo-code']}>
          <StarCodeBlock code={code} language="tsx" className={styles['component-demo-code-block']} />
        </div>
      ) : null}
    </StarCard>
  )
}

export default StarComponentDemo
