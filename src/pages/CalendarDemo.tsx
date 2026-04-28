import { CalendarDays, Flower2, Fish, Heart, Sprout } from 'lucide-react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarCalendar, type CalendarItem } from '../components/ui'

const DEMO_MONTH = new Date(2024, 4, 1).getTime()

const harvestItems: CalendarItem[] = [
  {
    date: '2024-05-05',
    title: 'Flower Dance',
    description: 'Town square festival begins at 9:00.',
    iconKey: 'festival',
    meta: 'Pelican Town',
  },
  {
    date: '2024-05-12',
    title: 'Fishing Trip',
    description: 'Riverbank meet-up with bait and snacks.',
    iconKey: 'fish',
    meta: 'Cindersap Forest',
  },
  {
    date: '2024-05-12',
    title: 'Seed Restock',
    description: 'Pierre refreshes seasonal inventory.',
    iconKey: 'seed',
    meta: 'General Store',
  },
  {
    date: '2024-05-18',
    title: 'Barn Upgrade',
    description: 'Robin arrives with building materials.',
    iconKey: 'seed',
    meta: 'Farm',
  },
]

const customIconItems: CalendarItem[] = [
  {
    date: '2024-05-08',
    title: 'Heart Event',
    description: 'Custom ReactNode icon rendered directly from event data.',
    iconNode: <Heart size={12} fill="currentColor" />,
    meta: 'Direct iconNode usage',
  },
  {
    date: '2024-05-19',
    title: 'Traveling Cart',
    description: 'Mapped through iconKey and resolved from iconMap.',
    iconKey: 'cart',
    meta: 'iconKey -> iconMap',
  },
  {
    date: '2024-05-23',
    title: 'Greenhouse Check',
    description: 'Another direct marker with a custom leaf icon.',
    iconNode: <Sprout size={12} />,
    meta: 'Direct iconNode usage',
  },
]

const iconMap = {
  festival: <Flower2 size={12} />,
  fish: <Fish size={12} />,
  seed: <Sprout size={12} />,
  cart: <CalendarDays size={12} />,
}

const tocItems = [
  { id: 'basic', title: 'Basic', level: 1 },
  { id: 'events', title: 'Markers', level: 1 },
  { id: 'icons', title: 'Icons', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const apiData = [
  { property: 'value', description: 'Controlled month timestamp.', type: 'number', default: '-' },
  { property: 'defaultValue', description: 'Initial month timestamp for uncontrolled usage.', type: 'number', default: '-' },
  { property: 'onMonthChange', description: 'Called when prev or next month is selected.', type: '(monthTimestamp: number) => void', default: '-' },
  { property: 'items', description: 'Day marker data rendered inside the calendar grid.', type: 'CalendarItem[]', default: '[]' },
  { property: 'iconMap', description: 'Maps item.iconKey values to ReactNode or image sources.', type: 'Record<string, ReactNode | string>', default: '-' },
  { property: 'maxVisibleMarkers', description: 'Limits visible markers before showing a +N summary.', type: 'number', default: '3' },
  { property: 'showOutsideDays', description: 'Shows or hides leading and trailing month days.', type: 'boolean', default: 'true' },
]

const basicCode = `<StarCalendar defaultValue={new Date(2024, 4, 1).getTime()} />`

const markersCode = `const items = [
  { date: '2024-05-05', title: 'Flower Dance', iconKey: 'festival' },
  { date: '2024-05-12', title: 'Fishing Trip', iconKey: 'fish' },
  { date: '2024-05-12', title: 'Seed Restock', iconKey: 'seed' },
]

const iconMap = {
  festival: <Flower2 size={12} />,
  fish: <Fish size={12} />,
  seed: <Sprout size={12} />,
}

<StarCalendar
  defaultValue={new Date(2024, 4, 1).getTime()}
  items={items}
  iconMap={iconMap}
/>`

const customIconCode = `const items = [
  {
    date: '2024-05-08',
    title: 'Heart Event',
    iconNode: <Heart size={12} fill="currentColor" />,
  },
  {
    date: '2024-05-19',
    title: 'Traveling Cart',
    iconKey: 'cart',
  },
]

const iconMap = {
  cart: <CalendarDays size={12} />,
}

<StarCalendar
  defaultValue={new Date(2024, 4, 1).getTime()}
  items={items}
  iconMap={iconMap}
/>`

function StarCalendarDemoPage() {
  return (
    <StarComponentPage
      title="Calendar"
      description="Month view calendar with optional marker data, icon mapping, and hover or focus details."
      toc={tocItems}
    >
      <StarComponentDemo
        id="basic"
        title="Basic calendar"
        description="A plain month view with an initial month value and working month navigation."
        code={basicCode}
      >
        <StarCalendar defaultValue={DEMO_MONTH} />
      </StarComponentDemo>

      <StarComponentDemo
        id="events"
        title="Calendar with marker data"
        description="Markers are grouped by day, and selecting a day reveals the full event list below the grid."
        code={markersCode}
      >
        <StarCalendar defaultValue={DEMO_MONTH} items={harvestItems} iconMap={iconMap} />
      </StarComponentDemo>

      <StarComponentDemo
        id="icons"
        title="iconKey mapping and direct custom icons"
        description="This example mixes iconKey lookups from iconMap with per-item iconNode markers."
        code={customIconCode}
      >
        <StarCalendar defaultValue={DEMO_MONTH} items={customIconItems} iconMap={iconMap} />
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable title="Calendar API" data={apiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarCalendarDemoPage
