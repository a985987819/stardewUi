import { useMemo, useState } from 'react'
import { Fish, Pickaxe, Sprout } from 'lucide-react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarTab } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const text = {
  zh: {
    title: 'Tab 选项卡',
    desc: '像翻农场手册一样切换季节、区域和任务状态。适合把复杂内容拆成清晰的小田块。',
    toc: ['带图标区域', '外接选项卡', '底部导航', '自定义选中样式', '全局主题', '禁用选项', '受控模式', 'ReactNode 内容', 'API'],
    sections: {
      icon: ['带图标区域', '在 **items** 的每一项放入 **icon**，让农场、钓鱼和矿洞的入口一眼可辨。'],
      bottom: ['底部导航', '用 **position="bottom"** 把导航放到内容下方，适合移动端或卡片底部工具栏；选中标签会以像素步进滑向新位置。'],
      external: ['外接选项卡', '开启 **external** 后，每个选项卡都有独立边框；选中项会贴入内容框边缘，搭配 **position="bottom"** 可以完整地挂在框的下方。'],
      custom: ['自定义选中样式', '给每一项传 **activeStyle**，不同季节就能拥有不同色彩，像挂在田埂上的季节旗帜。'],
      global: ['全局主题', '给当前项传 **activeGlobalStyle**，整个选项卡容器也能跟着变成农场、矿洞或湖边氛围。'],
      disabled: ['禁用选项', '把未解锁区域标成 **disabled**，它仍会出现在地图上，但暂时不能点击。'],
      controlled: ['受控模式', '由 **activeKey** 控制当前季节，并在 **onChange** 中接住玩家的选择，适合和任务进度、URL 或表单联动。'],
      node: ['ReactNode 内容', '每个 **content** 都支持复杂 ReactNode，可以塞进卡片、列表或收益表。'],
      current: '当前选中',
    },
  },
  en: {
    title: 'Tab',
    desc: 'Switch seasons, locations, and quest states like flipping through a farm manual. Tabs keep dense content in tidy plots.',
    toc: ['Icon Locations', 'External Tabs', 'Bottom Navigation', 'Custom Active Style', 'Global Theme', 'Disabled Item', 'Controlled Mode', 'ReactNode Content', 'API'],
    sections: {
      icon: ['Icon Locations', 'Put an **icon** on each **items** entry so farm, fishing, and mine entrances are recognizable at a glance.'],
      bottom: ['Bottom Navigation', 'Use **position="bottom"** for mobile layouts or card footers; the active label steps toward its new place instead of teleporting there.'],
      external: ['External Tabs', 'With **external**, each tab has its own frame and the active tab tucks into the content edge; pair it with **position="bottom"** to hang a complete frame below the panel.'],
      custom: ['Custom Active Style', 'Pass **activeStyle** to each season for its own color and make the active tab read like a seasonal banner.'],
      global: ['Global Theme', 'Pass **activeGlobalStyle** to let the whole tab container shift mood when farm, mine, or lake content is active.'],
      disabled: ['Disabled Item', 'Mark locked areas as **disabled** so they stay on the map while interaction waits for the player.'],
      controlled: ['Controlled Mode', 'Drive the active season with **activeKey** and receive choices through **onChange** for quests, URLs, or forms.'],
      node: ['ReactNode Content', 'Every **content** field accepts complex ReactNodes such as cards, lists, or profit tables.'],
      current: 'Current tab',
    },
  },
} satisfies Record<Lang, unknown>

const seasonItems = {
  zh: [
    { key: 'spring', label: '春天', content: '春天来了，万物复苏！可以种植土豆、花椰菜和草莓。别忘了参加花舞节！' },
    { key: 'summer', label: '夏天', content: '太阳把田埂烤得发亮，蓝莓和甜瓜正在冲刺成熟。月光水母节会在海边点亮夜晚。' },
    { key: 'fall', label: '秋天', content: '南瓜、蔓越莓和茄子把仓库塞满。带上最好的农产品去星露谷展览会换星币吧。' },
    { key: 'winter', label: '冬天', content: '田地休息，矿洞和钓鱼正忙。整理背包、升级工具，冬日星盛宴也在等你。' },
  ],
  en: [
    { key: 'spring', label: 'Spring', content: 'Spring has arrived. Plant potatoes, cauliflower, and strawberries, then save energy for the Flower Dance.' },
    { key: 'summer', label: 'Summer', content: 'Blueberries and melons love the heat. When night falls, the Moonlight Jellies drift across the beach.' },
    { key: 'fall', label: 'Fall', content: 'Pumpkins, cranberries, and eggplants fill the shed. Bring your best harvest to the Stardew Valley Fair.' },
    { key: 'winter', label: 'Winter', content: 'The fields rest, so the mines and fishing docks take over. Upgrade tools before the Feast of the Winter Star.' },
  ],
}

const apiData = {
  zh: [
    { property: 'items', description: '选项卡数据列表', type: 'StarTabItem[]', default: '-', required: true },
    { property: 'activeKey', description: '当前激活的 key，传入后进入受控模式', type: 'string', default: '-' },
    { property: 'defaultActiveKey', description: '默认激活的 key', type: 'string', default: '第一项 key' },
    { property: 'onChange', description: '切换选项卡时触发', type: '(key: string) => void', default: '-' },
    { property: 'position', description: '导航栏位置', type: "'top' | 'bottom'", default: "'top'" },
    { property: 'external', description: '外接导航：选项卡移到内容框外，内容仍留在框内', type: 'boolean', default: 'false' },
  ],
  en: [
    { property: 'items', description: 'Tab item list.', type: 'StarTabItem[]', default: '-', required: true },
    { property: 'activeKey', description: 'Active key for controlled mode.', type: 'string', default: '-' },
    { property: 'defaultActiveKey', description: 'Initial active key.', type: 'string', default: 'first item key' },
    { property: 'onChange', description: 'Called when the active tab changes.', type: '(key: string) => void', default: '-' },
    { property: 'position', description: 'Navigation position.', type: "'top' | 'bottom'", default: "'top'" },
    { property: 'external', description: 'Renders the tab strip outside the content frame.', type: 'boolean', default: 'false' },
  ],
}

const code = `<StarTab
  items={[
    { key: 'spring', label: 'Spring', content: 'Plant potatoes, cauliflower, and strawberries.' },
    { key: 'summer', label: 'Summer', content: 'Blueberries and melons love the heat.' },
  ]}
/>`

const externalCode = `<StarTab external items={items} />            // 选项卡在内容框上方
<StarTab external position="bottom" items={items} /> // 选项卡在内容框下方`

const controlledTabCode = `import { useState } from 'react'
import { StarTab } from 'stardew-valley-ui'

const seasons = [
  { key: 'spring', label: 'Spring', content: 'Plant potatoes and strawberries.' },
  { key: 'summer', label: 'Summer', content: 'Blueberries love the heat.' },
  { key: 'fall', label: 'Fall', content: 'Pumpkins fill the shed.' },
]

export function SeasonTabs() {
  const [activeKey, setActiveKey] = useState('spring')

  return (
    <>
      <StarTab activeKey={activeKey} onChange={setActiveKey} items={seasons} />
      <output>Active tab: {activeKey}</output>
    </>
  )
}`

function StarTabDemoPage() {
  const { lang } = useI18n()
  const copy = text[lang]
  const [controlledKey, setControlledKey] = useState('spring')
  const toc = copy.toc.map((title, index) => ({ id: ['icon', 'external', 'position', 'custom', 'global', 'disabled', 'controlled', 'nodeContent', 'api'][index], title, level: 1 }))
  const items = seasonItems[lang]

  const iconItems = useMemo(
    () => [
      { key: 'farm', label: lang === 'zh' ? '农场' : 'Farm', icon: <Sprout size={16} />, content: lang === 'zh' ? '安排播种、浇水和收获，把每一天都过成丰收路线。' : 'Plan planting, watering, and harvest loops for a productive route.' },
      { key: 'fish', label: lang === 'zh' ? '钓鱼' : 'Fishing', icon: <Fish size={16} />, content: lang === 'zh' ? '不同季节、天气和水域会刷新不同鱼类。' : 'Different seasons, weather, and waters bring different fish.' },
      { key: 'mine', label: lang === 'zh' ? '矿洞' : 'Mine', icon: <Pickaxe size={16} />, content: lang === 'zh' ? '带上镐子和补给，向更深层寻找矿石与宝石。' : 'Bring a pickaxe and supplies to chase ore and gems deeper underground.' },
    ],
    [lang]
  )

  return (
    <StarComponentPage title={copy.title} description={copy.desc} toc={toc}>
      <StarComponentDemo id="icon" title={copy.sections.icon[0]} description={copy.sections.icon[1]} code={code} data={[{ label: 'items', value: `${iconItems.length} locations` }]}>
        <div style={{ width: '100%' }}><StarTab items={iconItems} /></div>
      </StarComponentDemo>
      <StarComponentDemo id="external" title={copy.sections.external[0]} description={copy.sections.external[1]} code={externalCode}>
        <div style={{ width: '100%' }}>
          <StarTab external items={items} />
          <div style={{ height: 20 }} />
          <StarTab external position="bottom" items={iconItems} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="position" title={copy.sections.bottom[0]} description={copy.sections.bottom[1]} code={code}>
        <div style={{ width: '100%' }}><StarTab items={iconItems} position="bottom" /></div>
      </StarComponentDemo>
      <StarComponentDemo id="custom" title={copy.sections.custom[0]} description={copy.sections.custom[1]} code={code}>
        <div style={{ width: '100%' }}><StarTab items={items.map((item, index) => ({ ...item, activeStyle: [{ background: '#7a9d3d' }, { background: '#d7992e' }, { background: '#c45c3e' }, { background: '#5b8fa8' }][index] }))} /></div>
      </StarComponentDemo>
      <StarComponentDemo id="global" title={copy.sections.global[0]} description={copy.sections.global[1]} code={code}>
        <div style={{ width: '100%' }}><StarTab items={iconItems.map((item, index) => ({ ...item, activeGlobalStyle: { background: ['#2d4a3e', '#2d4a5e', '#4a3728'][index], borderRadius: 8, padding: 12 } }))} /></div>
      </StarComponentDemo>
      <StarComponentDemo id="disabled" title={copy.sections.disabled[0]} description={copy.sections.disabled[1]} code={code}>
        <div style={{ width: '100%' }}><StarTab items={[items[0], { ...items[1], label: lang === 'zh' ? '未解锁海滩' : 'Locked Beach', disabled: true }, items[2]]} /></div>
      </StarComponentDemo>
      <StarComponentDemo id="controlled" title={copy.sections.controlled[0]} description={copy.sections.controlled[1]} code={controlledTabCode} data={[{ label: 'activeKey', value: controlledKey }, { label: 'available keys', value: items.map((item) => item.key).join(', ') }]}>
        <div style={{ width: '100%' }}>
          <StarTab activeKey={controlledKey} onChange={setControlledKey} items={items} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="nodeContent" title={copy.sections.node[0]} description={copy.sections.node[1]} code={code}>
        <div style={{ width: '100%' }}><StarTab items={[{ key: 'table', label: lang === 'zh' ? '收益表' : 'Profit', content: <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr><td>Strawberry</td><td>☆☆☆☆☆</td></tr><tr><td>Blueberry</td><td>☆☆☆☆</td></tr></tbody></table> }]} /></div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Tab API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarTabDemoPage
