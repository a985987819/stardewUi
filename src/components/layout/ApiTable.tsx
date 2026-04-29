import { useCallback, type MouseEvent } from 'react'
import { StarCard } from '../ui/Card'
import { message } from '../ui/Message'
import { useI18n } from '../../i18n'
import styles from './ApiTable.module.scss'

interface ApiColumn {
  title: string
  dataIndex: string
  width?: number
}

interface ApiTableData {
  property: string
  description: string
  type: string
  default: string
  required?: boolean
  version?: string
}

interface ApiTableProps {
  title?: string
  columns?: ApiColumn[]
  data: ApiTableData[]
}

function StarApiTable({ title, data }: ApiTableProps) {
  const { t } = useI18n()
  const columns: ApiColumn[] = [
    { title: t('api.property'), dataIndex: 'property', width: 150 },
    { title: t('api.description'), dataIndex: 'description' },
    { title: t('api.type'), dataIndex: 'type', width: 280 },
    { title: t('api.default'), dataIndex: 'default', width: 120 },
  ]

  const handleCopy = useCallback(
    async (event: MouseEvent<HTMLElement>) => {
      const target = event.target as HTMLElement
      const cleanText = (target.textContent || '').replace(/^\s*[|\s]\s*|\s*[|\s]\s*$/g, '').trim()
      if (!cleanText) return

      try {
        await navigator.clipboard.writeText(cleanText)
        message.success(`${t('copy.success')}: ${cleanText}`)
      } catch (err) {
        console.error('Copy failed:', err)
        message.error(t('copy.error'))
      }
    },
    [t]
  )

  const renderCopyable = (value: string, className?: string) => (
    <span className={className ? `${styles['api-table-copyable']} ${className}` : styles['api-table-copyable']} onClick={handleCopy} title={t('copy.title')}>
      {value}
    </span>
  )

  const renderTypeValue = (value: string) => {
    if (!value.includes('|')) return renderCopyable(value)

    return (
      <>
        {value.split('|').map((part, index, parts) => (
          <span key={`${part.trim()}-${index}`}>
            {renderCopyable(part.trim(), styles['api-table-type-part'])}
            {index < parts.length - 1 ? <span className={styles['api-table-type-separator']}> | </span> : null}
          </span>
        ))}
      </>
    )
  }

  const renderCell = (column: ApiColumn, record: ApiTableData) => {
    const value = record[column.dataIndex as keyof ApiTableData]

    if (column.dataIndex === 'property') {
      return (
        <code className={`${styles['api-table-name']} ${styles['api-table-copyable']}`} onClick={handleCopy} title={t('copy.title')}>
          {value}
          {record.required ? <span className={styles['api-table-required']}>*</span> : null}
        </code>
      )
    }

    if (column.dataIndex === 'type') return renderTypeValue(String(value))

    if (column.dataIndex === 'default') {
      if (!value) return <span className={styles['api-table-empty']}>-</span>
      return (
        <code className={styles['api-table-copyable']} onClick={handleCopy} title={t('copy.title')}>
          {value}
        </code>
      )
    }

    return value
  }

  return (
    <StarCard className={styles['api-table-wrapper']} showTitle title={title ?? t('api.title')}>
      <div className={styles['api-table-scroll']}>
        <table className={styles['api-table']}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.dataIndex} style={{ width: col.width }}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => (
              <tr key={index} className={styles['api-table-row']}>
                {columns.map((col) => (
                  <td key={col.dataIndex} className={styles['api-table-cell']}>
                    {renderCell(col, record)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StarCard>
  )
}

export default StarApiTable
