import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarCard, StarDatePicker } from '../components/ui'
import { normalizeToDayTimestamp } from '../utils/calendar'

const initialSingleValue = normalizeToDayTimestamp('2024-05-13')
const disabledDate = normalizeToDayTimestamp('2024-05-16')
const minDate = normalizeToDayTimestamp('2024-05-10')
const maxDate = normalizeToDayTimestamp('2024-05-20')

const tocItems = [
  { id: 'single', title: '单日选择', level: 1 },
  { id: 'range', title: '范围选择', level: 1 },
  { id: 'limits', title: '限制条件', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const apiData = [
  { property: 'mode', description: 'Selection mode for one date or a start and end range.', type: "'single' | 'range'", default: "'single'" },
  { property: 'value', description: 'Controlled selected date or range value.', type: 'number | { startTimestamp: number | null; endTimestamp: number | null }', default: '-' },
  { property: 'defaultValue', description: 'Initial uncontrolled date or range value.', type: 'number | { startTimestamp: number | null; endTimestamp: number | null }', default: '-' },
  { property: 'onChange', description: 'Returns the normalized selected timestamp or range.', type: '(value) => void', default: '-' },
  { property: 'minDate', description: 'Blocks selection before the provided day timestamp.', type: 'number', default: '-' },
  { property: 'maxDate', description: 'Blocks selection after the provided day timestamp.', type: 'number', default: '-' },
  { property: 'disabledDates', description: 'Explicit day timestamps that cannot be selected.', type: 'number[]', default: '[]' },
]

const singleCode = `const [value, setValue] = useState(${initialSingleValue})

<StarDatePicker
  value={value}
  onChange={(next) => {
    if ('dateTimestamp' in next) {
      setValue(next.dateTimestamp)
    }
  }}
/>`

const rangeCode = `const [value, setValue] = useState({
  startTimestamp: ${normalizeToDayTimestamp('2024-05-11')},
  endTimestamp: ${normalizeToDayTimestamp('2024-05-15')},
})

<StarDatePicker
  mode="range"
  value={value}
  onChange={(next) => {
    if ('startTimestamp' in next) {
      setValue(next)
    }
  }}
/>`

const limitsCode = `<StarDatePicker
  defaultValue={${normalizeToDayTimestamp('2024-05-15')}}
  minDate={${minDate}}
  maxDate={${maxDate}}
  disabledDates={[${disabledDate}]}
/>`

function formatValue(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function TimestampPreview({ title, value }: { title: string; value: unknown }) {
  return (
    <StarCard title={title} showTitle style={{ width: '100%', marginTop: 16 }}>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{formatValue(value)}</pre>
    </StarCard>
  )
}

function StarDatePickerDemoPage() {
  const [singleValue, setSingleValue] = useState(initialSingleValue)
  const [rangeValue, setRangeValue] = useState<{
    startTimestamp: number | null
    endTimestamp: number | null
  }>({
    startTimestamp: normalizeToDayTimestamp('2024-05-11'),
    endTimestamp: normalizeToDayTimestamp('2024-05-15'),
  })

  return (
    <StarComponentPage
      title="DatePicker 日期选择"
      description="支持单日选择和日期范围选择的日期选择器，返回标准化的时间戳。"
      toc={tocItems}
    >
      <StarComponentDemo
        id="single"
        title="Single-date selection"
        description="A controlled picker that exposes the selected day timestamp."
        code={singleCode}
      >
        <div style={{ width: '100%' }}>
          <StarDatePicker
            value={singleValue}
            onChange={(next) => {
              if ('dateTimestamp' in next) {
                setSingleValue(next.dateTimestamp)
              }
            }}
          />
          <TimestampPreview title="Returned value" value={{ dateTimestamp: singleValue }} />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="range"
        title="Range selection"
        description="The second click completes the range and the page shows the ordered timestamps."
        code={rangeCode}
      >
        <div style={{ width: '100%' }}>
          <StarDatePicker
            mode="range"
            value={rangeValue}
            onChange={(next) => {
              if ('startTimestamp' in next) {
                setRangeValue(next)
              }
            }}
          />
          <TimestampPreview title="Returned value" value={rangeValue} />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="limits"
        title="Disabled and min or max dates"
        description="Dates before minDate, after maxDate, or explicitly listed in disabledDates are not selectable."
        code={limitsCode}
      >
        <div style={{ width: '100%' }}>
          <StarDatePicker
            defaultValue={normalizeToDayTimestamp('2024-05-15')}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={[disabledDate]}
          />
          <TimestampPreview
            title="Constraints"
            value={{
              minDate,
              maxDate,
              disabledDates: [disabledDate],
            }}
          />
        </div>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable title="DatePicker API" data={apiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarDatePickerDemoPage
