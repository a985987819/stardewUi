import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarDatePicker } from '../components/ui'
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
    toc: ['单日选择', '范围选择', '行内轮盘', '限制条件', 'API'],
    single: ['单日选择', '选择一个具体日期，例如草莓成熟日或工具取回日。'],
    range: ['范围选择', '选择一段连续时间，例如连续三天冲矿洞或节前备货。'],
    inline: ['行内轮盘', '把交互换成三列可无限滚动的轮盘：点一下触发器，年、月、日同时滚出来，确认后才会写回。'],
    limits: ['限制条件', '用 minDate、maxDate 和 disabledDates 封锁不可选日期。'],
    today: '回到今日',
    returned: '返回值',
    constraints: '限制条件',
  },
  en: {
    title: 'DatePicker',
    desc: 'Pick planting days, upgrade appointments, and mining-vacation ranges while returning stable timestamps.',
    toc: ['Single Date', 'Range Selection', 'Inline Wheel', 'Constraints', 'API'],
    single: ['Single Date', 'Choose one date such as a strawberry harvest or tool pickup day.'],
    range: ['Range Selection', 'Choose a continuous span, such as three mine-push days before a festival.'],
    inline: ['Inline Wheel', 'Swap in three endlessly scrolling wheels: one click opens year, month, and day together, and nothing is committed until you confirm.'],
    limits: ['Constraints', 'Use minDate, maxDate, and disabledDates to block unavailable days.'],
    today: 'Today',
    returned: 'Returned value',
    constraints: 'Constraints',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; single: [string, string]; range: [string, string]; inline: [string, string]; limits: [string, string]; today: string; returned: string; constraints: string }>

const apiData = {
  zh: [
    { property: 'mode', description: '选择模式：单日或范围', type: "'single' | 'range'", default: "'single'" },
    { property: 'interaction', description: '交互类型：月历形式或三列轮盘的行内形式', type: "'calendar' | 'inline'", default: "'calendar'" },
    { property: 'value', description: '受控选中值', type: 'number | DateRange', default: '-' },
    { property: 'defaultValue', description: '非受控初始值', type: 'number | DateRange', default: '-' },
    { property: 'onChange', description: '返回标准化后的选择值', type: '(value) => void', default: '-' },
    { property: 'disabledDates', description: '显式禁用日期', type: 'number[]', default: '[]' },
    { property: 'confirmLabel', description: '行内形式「确定」按钮文案', type: 'string', default: "'确定'" },
    { property: 'cancelLabel', description: '行内形式「取消」按钮文案', type: 'string', default: "'取消'" },
    { property: 'columnLabels', description: '行内形式三列的无障碍名称（年、月、日）', type: '[string, string, string]', default: "['年', '月', '日']" },
    { property: 'todayLabel', description: '「回到今日」按钮文案', type: 'string', default: "'回到今日'" },
    { property: 'showToday', description: '是否显示「回到今日」按钮（仅月历形式）', type: 'boolean', default: 'true' },
    { property: 'todayOffsetMinutes', description: '计算「今日」所用的时区偏移（分钟），480 即东八区', type: 'number', default: '480' },
    { property: 'minDate', description: '可选的最早日期（时间戳），更早的日期不可选', type: 'number', default: '-' },
    { property: 'maxDate', description: '可选的最晚日期（时间戳），更晚的日期不可选', type: 'number', default: '-' },
    { property: 'showOutsideDays', description: '显示当前月之外的相邻月日期', type: 'boolean', default: 'true' },
    { property: 'locale', description: '月份名、周头与行内触发器的 locale', type: 'string', default: "'zh-CN'" },],
  en: [
    { property: 'mode', description: 'Selection mode.', type: "'single' | 'range'", default: "'single'" },
    { property: 'interaction', description: 'Interaction: month grid or the inline three-wheel form.', type: "'calendar' | 'inline'", default: "'calendar'" },
    { property: 'value', description: 'Controlled selected value.', type: 'number | DateRange', default: '-' },
    { property: 'defaultValue', description: 'Initial uncontrolled value.', type: 'number | DateRange', default: '-' },
    { property: 'onChange', description: 'Returns normalized selected value.', type: '(value) => void', default: '-' },
    { property: 'disabledDates', description: 'Explicit disabled dates.', type: 'number[]', default: '[]' },
    { property: 'confirmLabel', description: 'Label of the inline confirm button.', type: 'string', default: "'确定'" },
    { property: 'cancelLabel', description: 'Label of the inline cancel button.', type: 'string', default: "'取消'" },
    { property: 'columnLabels', description: 'Accessible names of the inline wheels (year, month, day).', type: '[string, string, string]', default: "['年', '月', '日']" },
    { property: 'todayLabel', description: 'Label of the today button.', type: 'string', default: "'回到今日'" },
    { property: 'showToday', description: 'Whether the today button is rendered (calendar form only).', type: 'boolean', default: 'true' },
    { property: 'todayOffsetMinutes', description: 'Timezone offset in minutes used to resolve today; 480 is UTC+8.', type: 'number', default: '480' },
    { property: 'minDate', description: 'Earliest selectable date (timestamp); earlier days are disabled.', type: 'number', default: '-' },
    { property: 'maxDate', description: 'Latest selectable date (timestamp); later days are disabled.', type: 'number', default: '-' },
    { property: 'showOutsideDays', description: 'Shows adjacent-month days around the current month.', type: 'boolean', default: 'true' },
    { property: 'locale', description: 'Locale for month names, the weekday header, and the inline trigger.', type: 'string', default: "'zh-CN'" },],
}

const singlePickerCode = `import { useState } from 'react'
import { StarDatePicker } from 'stardew-valley-ui'

export function HarvestDatePicker() {
  const [dateTimestamp, setDateTimestamp] = useState(new Date(2024, 4, 13).getTime())

  return (
    <StarDatePicker
      value={dateTimestamp}
      onChange={(next) => {
        if ('dateTimestamp' in next) setDateTimestamp(next.dateTimestamp)
      }}
    />
  )
}`

const rangePickerCode = `import { useState } from 'react'
import { StarDatePicker } from 'stardew-valley-ui'

export function MiningTripPicker() {
  const [range, setRange] = useState<{ startTimestamp: number | null; endTimestamp: number | null }>({
    startTimestamp: new Date(2024, 4, 11).getTime(),
    endTimestamp: new Date(2024, 4, 15).getTime(),
  })

  return (
    <StarDatePicker
      mode="range"
      value={range}
      onChange={(next) => {
        if ('startTimestamp' in next) setRange(next)
      }}
    />
  )
}`

const inlinePickerCode = `import { useState } from 'react'
import { StarDatePicker } from 'stardew-valley-ui'

export function FestiveDatePicker() {
  const [dateTimestamp, setDateTimestamp] = useState(new Date(2024, 4, 13).getTime())

  return (
    <StarDatePicker
      // 月历换成三列可无限滚动的轮盘：年 / 月 / 日同时出来，
      // 点「确定」才写回 onChange，点「取消」原样丢弃。
      interaction="inline"
      value={dateTimestamp}
      onChange={(next) => {
        if ('dateTimestamp' in next) setDateTimestamp(next.dateTimestamp)
      }}
    />
  )
}`

const limitsPickerCode = `import { StarDatePicker } from 'stardew-valley-ui'

const minDate = new Date(2024, 4, 10).getTime()
const maxDate = new Date(2024, 4, 20).getTime()
const disabledDates = [new Date(2024, 4, 16).getTime()]

export function AvailableDates() {
  return <StarDatePicker minDate={minDate} maxDate={maxDate} disabledDates={disabledDates} />
}`

function StarDatePickerDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [singleValue, setSingleValue] = useState(initialSingleValue)
  const [inlineValue, setInlineValue] = useState(initialSingleValue)
  const [rangeValue, setRangeValue] = useState<{ startTimestamp: number | null; endTimestamp: number | null }>({ startTimestamp: normalizeToDayTimestamp('2024-05-11'), endTimestamp: normalizeToDayTimestamp('2024-05-15') })
  const toc = t.toc.map((title, index) => ({ id: ['single', 'range', 'inline', 'limits', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="single" title={t.single[0]} description={t.single[1]} code={singlePickerCode} data={[{ label: 'dateTimestamp', value: String(singleValue) }]}>
        <div style={{ width: '100%' }}><StarDatePicker value={singleValue} todayLabel={t.today} onChange={(next) => { if ('dateTimestamp' in next) setSingleValue(next.dateTimestamp) }} /></div>
      </StarComponentDemo>
      <StarComponentDemo id="range" title={t.range[0]} description={t.range[1]} code={rangePickerCode} data={[{ label: 'startTimestamp', value: String(rangeValue.startTimestamp) }, { label: 'endTimestamp', value: String(rangeValue.endTimestamp) }]}>
        <div style={{ width: '100%' }}><StarDatePicker mode="range" value={rangeValue} todayLabel={t.today} onChange={(next) => { if ('startTimestamp' in next) setRangeValue(next) }} /></div>
      </StarComponentDemo>
      <StarComponentDemo id="inline" title={t.inline[0]} description={t.inline[1]} code={inlinePickerCode} data={[{ label: 'interaction', value: "'inline'" }, { label: 'dateTimestamp', value: String(inlineValue) }]}>
        <div style={{ width: '100%' }}><StarDatePicker interaction="inline" value={inlineValue} onChange={(next) => { if ('dateTimestamp' in next) setInlineValue(next.dateTimestamp) }} /></div>
      </StarComponentDemo>
      <StarComponentDemo id="limits" title={t.limits[0]} description={t.limits[1]} code={limitsPickerCode} data={[{ label: 'minDate', value: String(minDate) }, { label: 'maxDate', value: String(maxDate) }, { label: 'disabledDates', value: JSON.stringify([disabledDate]) }]}>
        <div style={{ width: '100%' }}><StarDatePicker defaultValue={normalizeToDayTimestamp('2024-05-15')} minDate={minDate} maxDate={maxDate} disabledDates={[disabledDate]} todayLabel={t.today} /></div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="DatePicker API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarDatePickerDemoPage
