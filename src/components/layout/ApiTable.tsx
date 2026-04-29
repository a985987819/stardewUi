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

  const handleCopy = useCallback(async (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    const textToCopy = target.textContent || ''

    if (!textToCopy.trim()) return

    const cleanText = textToCopy.replace(/^\s*[|\s]\s*|\s*[|\s]\s*$/g, '').trim()
    if (!cleanText) return

    try {
      await navigator.clipboard.writeText(cleanText)
      message.success(`已复制: ${cleanText}`)
    } catch (err) {
      console.error('复制失败:', err)
      message.error('复制失败')
    }
  }, [])

  const renderTypeValue = (value: string) => {
    if (value.includes('|')) {
      const parts = value.split('|')
      return (
        <>
          {parts.map((part, index) => (
            <span key={`${part.trim()}-${index}`}>
              <span className={`${styles['api-table-copyable']} ${styles['api-table-type-part']}`} onClick={handleCopy} title="点击复制">
                {part.trim()}
              </span>
              {index < parts.length - 1 ? <span className={styles['api-table-type-separator']}> | </span> : null}
            </span>
          ))}
        </>
      )
    }

    return (
      <span className={styles['api-table-copyable']} onClick={handleCopy} title="点击复制">
        {value}
      </span>
    )
  }

  const renderCell = (column: ApiColumn, record: ApiTableData) => {
    const value = record[column.dataIndex as keyof ApiTableData]

    if (column.dataIndex === 'property') {
      return (
        <code className={`${styles['api-table-name']} ${styles['api-table-copyable']}`} onClick={handleCopy} title="点击复制">
          {value}
          {record.required ? <span className={styles['api-table-required']}>*</span> : null}
        </code>
      )
    }

    if (column.dataIndex === 'type') {
      return renderTypeValue(String(value))
    }

    if (column.dataIndex === 'default') {
      if (!value) return <span className={styles['api-table-empty']}>-</span>

      return (
        <code className={styles['api-table-copyable']} onClick={handleCopy} title="点击复制">
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
