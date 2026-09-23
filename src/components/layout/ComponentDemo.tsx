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
  /** Supports React content and `**API**` emphasis inside a prose string. */
  description?: React.ReactNode
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

function toExampleName(value: string) {
  const name = value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('')

  return `${name || 'Component'}Example`
}

function withExplicitStyles(code: string) {
  if (code.includes("stardew-valley-ui/style.css") || code.includes("stardew-valley-ui/auto")) return code
  return `import 'stardew-valley-ui/style.css'\n${code}`
}

function indentJsx(code: string) {
  return code
    .split('\n')
    .map((line) => (line ? `      ${line}` : ''))
    .join('\n')
}

function renderDescription(description: React.ReactNode) {
  if (typeof description !== 'string') return description

  // A tiny deliberate subset of Markdown, kept local to demo captions. It lets
  // a scenario explain its API lever without handing arbitrary HTML to docs.
  return description.split(/(\*\*[^*]+\*\*)/).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  )
}

/**
 * Turns the concise JSX passed by a demo page into a copy-ready snippet. Demo
 * pages only describe the meaningful usage. The shared frame turns a compact,
 * stateless line into the place it belongs in a React application, while
 * preserving authored stateful examples as complete components.
 */
// eslint-disable-next-line react-refresh/only-export-components -- tests and page builders reuse this pure formatter.
export function createCopyableDemoCode(code: string, exampleName = 'ComponentExample'): string {
  const filePath = `src/components/examples/${exampleName}.tsx`
  const fileHeader = `// ${filePath}`
  const hasAuthoredPackageImport = code.includes("from 'stardew-valley-ui'") || code.includes('from "stardew-valley-ui"')

  if (hasAuthoredPackageImport) return `${fileHeader}\n${withExplicitStyles(code)}`

  const libraryImports = unique([...code.matchAll(libraryComponentPattern)].map(([, component]) => component))
  const iconImports = unique(
    [...code.matchAll(lucideComponentPattern)]
      .map(([, component]) => component)
      .filter((component) => lucideComponents.has(component)),
  )
  const imports = [
    "import 'stardew-valley-ui/style.css'",
    libraryImports.length > 0 ? `import { ${libraryImports.join(', ')} } from 'stardew-valley-ui'` : null,
    iconImports.length > 0 ? `import { ${iconImports.join(', ')} } from 'lucide-react'` : null,
  ].filter((statement): statement is string => statement !== null)

  return `${fileHeader}\n${imports.join('\n')}\n\nexport function ${exampleName}() {\n  return (\n    <>\n${indentJsx(code)}\n    </>\n  )\n}`
}

function StarComponentDemo({
  title,
  description,
  children,
  code,
  data,
  dataLabel,
  defaultShowCode = false,
  id,
}: ComponentDemoProps) {
  const [showCode, setShowCode] = useState(defaultShowCode)
  const { t } = useI18n()
  const exampleName = toExampleName(id ?? title)
  const copyableCode = code ? createCopyableDemoCode(code, exampleName) : undefined

  return (
    <StarCard
      id={id}
      className={code ? `${styles['component-demo']} ${styles['has-code']}` : styles['component-demo']}
      showTitle
      title={title}
    >
      {description ? <p className={styles['component-demo-desc']}>{renderDescription(description)}</p> : null}
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
          <button
            className={styles['component-demo-toggle']}
            type="button"
            aria-expanded={showCode}
            aria-controls={id ? `${id}-code` : undefined}
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>{showCode ? t('demo.hideCode') : t('demo.showCode')}</span>
          </button>
        </div>
      ) : null}
      {showCode && copyableCode ? (
        <div id={id ? `${id}-code` : undefined} className={styles['component-demo-code']}>
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
