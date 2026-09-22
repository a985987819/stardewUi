import { useState } from 'react'
import { CalendarDays, Fish, Flower2, Heart, Sprout } from 'lucide-react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarCalendar, type CalendarItem } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const DEMO_MONTH = new Date(2024, 4, 1).getTime()

const copy = {
  zh: {
    title: 'Calendar 日历',
    desc: '月历组件适合展示节日、收获、生日和任务节点，让用户像安排农场日程一样理解时间。',
    toc: ['基础月历', '事件标记', '年月快切与回到今日', '自定义图标', 'API'],
    basic: ['基础月历', '显示一个可切换月份的日历，用来规划播种、升级和旅行商人行程。'],
    events: ['事件标记', '同一天可以挂多个事件，选中日期后展示完整列表。'],
    navigation: ['年月快切与回到今日', '点击月份标题弹出年月下拉，一步跳到目标年月；右上角「回到今日」按东八区当天回到本月。'],
    icons: ['自定义图标', 'iconKey 可映射图标，iconNode 可直接渲染 React 节点。'],
    today: '回到今日',
    monthValue: '当前月份时间戳',
  },
  en: {
    title: 'Calendar',
    desc: 'The calendar displays festivals, harvests, birthdays, and quest milestones so time feels like a farm schedule.',
    toc: ['Basic Calendar', 'Event Markers', 'Year & Month Jumps', 'Custom Icons', 'API'],
    basic: ['Basic Calendar', 'Show a navigable month view for planting, upgrades, and traveling-cart plans.'],
    events: ['Event Markers', 'Attach multiple events to one day and reveal the full list when selected.'],
    navigation: ['Year & Month Jumps', 'Click the month title to open a year/month dropdown, or use “Today” in the corner to jump back to the current month (UTC+8).'],
    icons: ['Custom Icons', 'Map iconKey values or render direct React iconNode markers.'],
    today: 'Today',
    monthValue: 'Current month timestamp',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; basic: [string, string]; events: [string, string]; navigation: [string, string]; icons: [string, string]; today: string; monthValue: string }>

const items = {
  zh: [
    { date: '2024-05-05', title: '花舞节', description: '上午 9 点去森林集合，别穿错靴子。', iconKey: 'festival', meta: '煤矿森林' },
    { date: '2024-05-12', title: '河边钓鱼', description: '带上鱼饵和零食，雨天也许有惊喜。', iconKey: 'fish', meta: '河岸' },
    { date: '2024-05-12', title: '种子补货', description: '皮埃尔上新本季种子。', iconKey: 'seed', meta: '杂货店' },
  ],
  en: [
    { date: '2024-05-05', title: 'Flower Dance', description: 'Meet in the forest at 9:00 and wear good boots.', iconKey: 'festival', meta: 'Cindersap Forest' },
    { date: '2024-05-12', title: 'River Fishing', description: 'Bring bait and snacks. Rain may add surprises.', iconKey: 'fish', meta: 'Riverbank' },
    { date: '2024-05-12', title: 'Seed Restock', description: 'Pierre refreshes seasonal seeds.', iconKey: 'seed', meta: 'General Store' },
  ],
} satisfies Record<Lang, CalendarItem[]>

const customIconItems = {
  zh: [
    { date: '2024-05-08', title: '好感事件', description: '直接渲染 Heart 图标。', iconNode: <Heart size={12} fill="currentColor" />, meta: 'iconNode' },
    { date: '2024-05-19', title: '旅行货车', description: '通过 iconKey 映射。', iconKey: 'cart', meta: 'iconKey' },
  ],
  en: [
    { date: '2024-05-08', title: 'Heart Event', description: 'Renders a direct Heart icon.', iconNode: <Heart size={12} fill="currentColor" />, meta: 'iconNode' },
    { date: '2024-05-19', title: 'Traveling Cart', description: 'Resolved through iconKey.', iconKey: 'cart', meta: 'iconKey' },
  ],
} satisfies Record<Lang, CalendarItem[]>

const iconMap = { festival: <Flower2 size={12} />, fish: <Fish size={12} />, seed: <Sprout size={12} />, cart: <CalendarDays size={12} /> }

const apiData = {
  zh: [
    { property: 'value', description: '受控月份时间戳', type: 'number', default: '-' },
    { property: 'defaultValue', description: '非受控初始月份时间戳', type: 'number', default: '-' },
    { property: 'items', description: '渲染在日期格里的事件数据', type: 'CalendarItem[]', default: '[]' },
    { property: 'iconMap', description: '将 iconKey 映射到图标节点或图片地址', type: 'Record<string, ReactNode | string>', default: '-' },
    { property: 'todayLabel', description: '「回到今日」按钮文案', type: 'string', default: "'回到今日'" },
    { property: 'showToday', description: '是否显示「回到今日」按钮', type: 'boolean', default: 'true' },
    { property: 'todayOffsetMinutes', description: '计算「今日」所用的时区偏移（分钟），480 即东八区', type: 'number', default: '480' },
  ],
  en: [
    { property: 'value', description: 'Controlled month timestamp.', type: 'number', default: '-' },
    { property: 'defaultValue', description: 'Initial uncontrolled month timestamp.', type: 'number', default: '-' },
    { property: 'items', description: 'Event data rendered in day cells.', type: 'CalendarItem[]', default: '[]' },
    { property: 'iconMap', description: 'Maps iconKey to icons or images.', type: 'Record<string, ReactNode | string>', default: '-' },
    { property: 'todayLabel', description: 'Label of the today button.', type: 'string', default: "'回到今日'" },
    { property: 'showToday', description: 'Whether the today button is rendered.', type: 'boolean', default: 'true' },
    { property: 'todayOffsetMinutes', description: 'Timezone offset in minutes used to resolve today; 480 is UTC+8.', type: 'number', default: '480' },
  ],
}

const code = `<StarCalendar defaultValue={new Date(2024, 4, 1).getTime()} items={items} iconMap={iconMap} />`

const navigationCode = `<StarCalendar
  value={month}
  onMonthChange={setMonth}
  todayLabel="Today"   // 右上角「回到今日」，按东八区当天回到本月
/>`

function StarCalendarDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'events', 'navigation', 'icons', 'api'][index], title, level: 1 }))
  const [month, setMonth] = useState(DEMO_MONTH)

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.basic[0]} description={t.basic[1]} code={code}><StarCalendar defaultValue={DEMO_MONTH} todayLabel={t.today} /></StarComponentDemo>
      <StarComponentDemo id="events" title={t.events[0]} description={t.events[1]} code={code}><StarCalendar defaultValue={DEMO_MONTH} items={items[lang]} iconMap={iconMap} todayLabel={t.today} /></StarComponentDemo>
      <StarComponentDemo id="navigation" title={t.navigation[0]} description={t.navigation[1]} code={navigationCode}>
        <div style={{ width: '100%' }}>
          <StarCalendar value={month} onMonthChange={setMonth} items={items[lang]} iconMap={iconMap} todayLabel={t.today} />
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-tertiary)' }}>{t.monthValue}: <strong>{month}</strong></p>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="icons" title={t.icons[0]} description={t.icons[1]} code={code}><StarCalendar defaultValue={DEMO_MONTH} items={customIconItems[lang]} iconMap={iconMap} todayLabel={t.today} /></StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Calendar API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarCalendarDemoPage
