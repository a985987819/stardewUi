import { useCallback, type MouseEvent } from 'react'
import Card from '../ui/Card'
import { message } from '../ui/Message'
import './ApiTable.css'

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

function ApiTable({ title = 'API', data }: ApiTableProps) {
  const columns: ApiColumn[] = [
    { title: '属性', dataIndex: 'property', width: 150 },
    { title: '说明', dataIndex: 'description' },
    { title: '类型', dataIndex: 'type', width: 280 },
    { title: '默认值', dataIndex: 'default', width: 120 },
  ]

  const handleCopy = useCallback(async (e: MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
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
              <span className="api-table-copyable api-table-type-part" onClick={handleCopy} title="点击复制">
                {part.trim()}
              </span>
              {index < parts.length - 1 ? <span className="api-table-type-separator"> | </span> : null}
            </span>
          ))}
        </>
      )
    }

    return (
      <span className="api-table-copyable" onClick={handleCopy} title="点击复制">
        {value}
      </span>
    )
  }

  const renderCell = (column: ApiColumn, record: ApiTableData) => {
    const value = record[column.dataIndex as keyof ApiTableData]

    if (column.dataIndex === 'property') {
      return (
        <code className="api-table-name api-table-copyable" onClick={handleCopy} title="点击复制">
          {value}
          {record.required ? <span className="api-table-required">*</span> : null}
        </code>
      )
    }

    if (column.dataIndex === 'type') {
      return renderTypeValue(String(value))
    }

    if (column.dataIndex === 'default') {
      if (!value) return <span className="api-table-empty">-</span>

      return (
        <code className="api-table-copyable" onClick={handleCopy} title="点击复制">
          {value}
        </code>
      )
    }

    return value
  }

  return (
    <Card className="api-table-wrapper" showTitle title={title}>
      <div className="api-table-scroll">
        <table className="api-table">
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
              <tr key={index} className="api-table-row">
                {columns.map((col) => (
                  <td key={col.dataIndex} className="api-table-cell">
                    {renderCell(col, record)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default ApiTable
