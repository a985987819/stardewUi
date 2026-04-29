import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarCard, StarDatePicker } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import { normalizeToDayTimestamp } from '../utils/calendar'

const initialSingleValue = normalizeToDayTimestamp('2024-05-13')
const disabledDate = normalizeToDayTimestamp('2024-05-16')
const minDate = normalizeToDayTimestamp('2024-05-10')
const maxDate = normalizeToDayTimestamp('2024-05-20')

const copy = {
  zh: {
    title: 'DatePicker 日期选择',
    desc: '日期选择器用于挑选播种日、预约升级、规划节日前后的采矿假期，并输出稳定时间戳。',
    toc: ['单日选择', '范围选择', '限制条件', 'API'],
    single: ['单日选择', '选择一个具体日期，例如草莓成熟日或工具取回日。'],
    range: ['范围选择', '选择一段连续时间，例如连续三天冲矿洞或节前备货。'],
    limits: ['限制条件', '用 minDate、maxDate 和 disabledDates 封锁不可选日期。'],
    returned: '返回值',
    constraints: '限制条件',
  },
  en: {
    title: 'DatePicker',
    desc: 'Pick planting days, upgrade appointments, and mining-vacation ranges while returning stable timestamps.',
    toc: ['Single Date', 'Range Selection', 'Constraints', 'API'],
    single: ['Single Date', 'Choose one date such as a strawberry harvest or tool pickup day.'],
    range: ['Range Selection', 'Choose a continuous span, such as three mine-push days before a festival.'],
    limits: ['Constraints', 'Use minDate, maxDate, and disabledDates to block unavailable days.'],
    returned: 'Returned value',
    constraints: 'Constraints',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; single: [string, string]; range: [string, string]; limits: [string, string]; returned: string; constraints: string }>

const apiData = {
  zh: [
    { property: 'mode', description: '选择模式：单日或范围', type: "'single' | 'range'", default: "'single'" },
    { property: 'value', description: '受控选中值', type: 'number | DateRange', default: '-' },
    { property: 'defaultValue', description: '非受控初始值', type: 'number | DateRange', default: '-' },
    { property: 'onChange', description: '返回标准化后的选择值', type: '(value) => void', default: '-' },
    { property: 'disabledDates', description: '显式禁用日期', type: 'number[]', default: '[]' },
  ],
  en: [
    { property: 'mode', description: 'Selection mode.', type: "'single' | 'range'", default: "'single'" },
    { property: 'value', description: 'Controlled selected value.', type: 'number | DateRange', default: '-' },
    { property: 'defaultValue', description: 'Initial uncontrolled value.', type: 'number | DateRange', default: '-' },
    { property: 'onChange', description: 'Returns normalized selected value.', type: '(value) => void', default: '-' },
    { property: 'disabledDates', description: 'Explicit disabled dates.', type: 'number[]', default: '[]' },
  ],
}

const code = `<StarDatePicker mode="range" minDate={minDate} maxDate={maxDate} />`

function TimestampPreview({ title, value }: { title: string; value: unknown }) {
  return <StarCard title={title} showTitle style={{ width: '100%', marginTop: 16 }}><pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(value, null, 2)}</pre></StarCard>
}

function StarDatePickerDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [singleValue, setSingleValue] = useState(initialSingleValue)
  const [rangeValue, setRangeValue] = useState<{ startTimestamp: number | null; endTimestamp: number | null }>({ startTimestamp: normalizeToDayTimestamp('2024-05-11'), endTimestamp: normalizeToDayTimestamp('2024-05-15') })
  const toc = t.toc.map((title, index) => ({ id: ['single', 'range', 'limits', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="single" title={t.single[0]} description={t.single[1]} code={code}>
        <div style={{ width: '100%' }}><StarDatePicker value={singleValue} onChange={(next) => { if ('dateTimestamp' in next) setSingleValue(next.dateTimestamp) }} /><TimestampPreview title={t.returned} value={{ dateTimestamp: singleValue }} /></div>
      </StarComponentDemo>
      <StarComponentDemo id="range" title={t.range[0]} description={t.range[1]} code={code}>
        <div style={{ width: '100%' }}><StarDatePicker mode="range" value={rangeValue} onChange={(next) => { if ('startTimestamp' in next) setRangeValue(next) }} /><TimestampPreview title={t.returned} value={rangeValue} /></div>
      </StarComponentDemo>
      <StarComponentDemo id="limits" title={t.limits[0]} description={t.limits[1]} code={code}>
        <div style={{ width: '100%' }}><StarDatePicker defaultValue={normalizeToDayTimestamp('2024-05-15')} minDate={minDate} maxDate={maxDate} disabledDates={[disabledDate]} /><TimestampPreview title={t.constraints} value={{ minDate, maxDate, disabledDates: [disabledDate] }} /></div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="DatePicker API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarDatePickerDemoPage
