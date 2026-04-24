import './ApiTable.css'

interface ApiColumn {
  title: string
  key: string
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
  const columns = [
    { title: '属性', dataIndex: 'property', width: 150 },
    { title: '说明', dataIndex: 'description' },
    { title: '类型', dataIndex: 'type', width: 180 },
    { title: '默认值', dataIndex: 'default', width: 120 },
  ]

  const renderCell = (column: ApiColumn, record: ApiTableData) => {
    const value = record[column.dataIndex as keyof ApiTableData]

    if (column.dataIndex === 'property') {
      return (
        <code className="api-table-name">
          {value}
          {record.required && <span className="api-table-required">*</span>}
        </code>
      )
    }

    if (column.dataIndex === 'type') {
      return <code>{value}</code>
    }

    if (column.dataIndex === 'default') {
      return value ? <code>{value}</code> : <span className="api-table-empty">-</span>
    }

    return value
  }

  return (
    <div className="api-table-wrapper">
      <h3 className="api-table-title">{title}</h3>
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
  )
}

export default ApiTable
