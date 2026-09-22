import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { StarCard } from '../ui/Card'
import StarCodeBlock from './CodeBlock'
import { useI18n } from '../../i18n'
import styles from './ComponentDemo.module.scss'

interface ComponentDemoDataItem {
  /** A concise name for one piece of live demo state or source data. */
  label: React.ReactNode
  /** The value currently driving the preview. Strings are rendered as code. */
  value: React.ReactNode
}

interface ComponentDemoProps {
  title: string
  description?: string
  children: React.ReactNode
  code?: string
  /** State and source data intentionally shown beside an interactive example. */
  data?: ComponentDemoDataItem[]
  dataLabel?: string
  defaultShowCode?: boolean
  id?: string
}

const libraryComponentPattern = /\b(Star[A-Z][A-Za-z0-9]*)\b/g
const lucideComponentPattern = /<([A-Z][A-Za-z0-9]*)\b/g
const lucideComponents = new Set(['Search'])

const unique = (values: string[]) => [...new Set(values)]

/**
 * Turns the concise JSX passed by a demo page into a copy-ready snippet. Demo
 * pages only describe the meaningful usage; the shared frame owns the package
 * imports so the visible code never silently omits its component references.
 */
// eslint-disable-next-line react-refresh/only-export-components -- tests and page builders reuse this pure formatter.
export function createCopyableDemoCode(code: string): string {
  if (code.includes("from 'stardew-valley-ui'") || code.includes('from "stardew-valley-ui"')) {
    return code
  }

  const libraryImports = unique([...code.matchAll(libraryComponentPattern)].map(([, component]) => component))
  const iconImports = unique(
    [...code.matchAll(lucideComponentPattern)]
      .map(([, component]) => component)
      .filter((component) => lucideComponents.has(component)),
  )
  const imports = [
    libraryImports.length > 0 ? `import { ${libraryImports.join(', ')} } from 'stardew-valley-ui'` : null,
    iconImports.length > 0 ? `import { ${iconImports.join(', ')} } from 'lucide-react'` : null,
  ].filter((statement): statement is string => statement !== null)

  return imports.length > 0 ? `${imports.join('\n')}\n\n${code}` : code
}

function StarComponentDemo({
  title,
  description,
  children,
  code,
  data,
  dataLabel,
  defaultShowCode = true,
  id,
}: ComponentDemoProps) {
  const [showCode, setShowCode] = useState(defaultShowCode)
  const { t } = useI18n()
  const copyableCode = code ? createCopyableDemoCode(code) : undefined

  return (
    <StarCard
      id={id}
      className={code ? `${styles['component-demo']} ${styles['has-code']}` : styles['component-demo']}
      showTitle
      title={title}
    >
      {description ? <p className={styles['component-demo-desc']}>{description}</p> : null}
      <div className={styles['component-demo-preview']}>{children}</div>
      {data?.length ? (
        <section className={styles['component-demo-data']} aria-label={dataLabel ?? t('demo.liveData')}>
          <div className={styles['component-demo-data-heading']}>
            <span>{dataLabel ?? t('demo.liveData')}</span>
            <span>{t('demo.liveDataHint')}</span>
          </div>
          <dl className={styles['component-demo-data-list']}>
            {data.map((item, index) => (
              <div key={index}>
                <dt>{item.label}</dt>
                <dd>{typeof item.value === 'string' ? <code>{item.value}</code> : item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      {code ? (
        <div className={styles['component-demo-toggle-wrapper']}>
          <button className={styles['component-demo-toggle']} type="button" onClick={() => setShowCode(!showCode)}>
            {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>{showCode ? t('demo.hideCode') : t('demo.showCode')}</span>
          </button>
        </div>
      ) : null}
      {showCode && copyableCode ? (
        <div className={styles['component-demo-code']}>
          <div className={styles['component-demo-code-heading']}>
            <span>{t('demo.copyReady')}</span>
            <span>{t('demo.copyReadyHint')}</span>
          </div>
          <StarCodeBlock code={copyableCode} language="tsx" className={styles['component-demo-code-block']} />
        </div>
      ) : null}
    </StarCard>
  )
}

export default StarComponentDemo
