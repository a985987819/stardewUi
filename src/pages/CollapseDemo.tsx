import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarCollapse } from '../components/ui'
import type { CollapseItem } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '折叠面板 Collapse',
    desc: '可折叠的木牌分节，像翻开的手账逐节收纳任务说明：每节是一块 2px 阶梯框的羊皮纸木牌，像素箭头两步翻转，面板瞬开，默认多开互不影响。',
    toc: ['基础用法', '手风琴模式', '受控展开', '禁用分节', 'API'],
    demos: [
      ['基础用法', 'defaultActiveKeys 指定初始展开的分节；点击头部切换，onChange 返回最新的展开键列表。'],
      ['手风琴模式', 'accordion 让整块手账同时只摊开一节——打开新的会自动合上旧的，再点一次则全部合上。'],
      ['受控展开', 'activeKeys 由外部持有，onChange 同步最新键集合；页面上会实时显示当前展开的键。'],
      ['禁用分节', 'disabled 的分节头颜色变浅、点击无效，用来标记尚未解锁或暂不可用的内容。'],
    ],
    season: '四季手账',
    spring: '春季',
    springBody: '种下防风草和土豆，把钴蓝的春天铺满农田。',
    summer: '夏季',
    summerBody: '蓝莓和辣椒是大户，记得留出洒水器的位置。',
    winter: '冬季',
    winterBody: '田里歇了，去矿洞和钓冰鱼，顺便刷一刷人缘。',
    locked: '温室',
    lockedBody: '修复谷仓旁的废墟后解锁。',
    openKeys: '当前展开',
  },
  en: {
    title: 'Collapse',
    desc: 'Foldable wooden sections that tuck notes away like a journal: each one is a parchment plate with a 2px stepped frame, a two-step pixel chevron flip, and panels that snap open instantly — several can stay open at once by default.',
    toc: ['Basic Usage', 'Accordion', 'Controlled', 'Disabled Sections', 'API'],
    demos: [
      ['Basic Usage', 'defaultActiveKeys picks the sections open at first; clicking a header toggles it, and onChange reports the next list of open keys.'],
      ['Accordion', 'accordion keeps a single section open at a time — opening one folds the previous, and clicking the open one closes everything.'],
      ['Controlled', 'activeKeys is held outside the component and onChange reports the next set; the currently open keys are printed live below the board.'],
      ['Disabled Sections', 'A disabled header dims and refuses clicks, marking content that is locked or not yet available.'],
    ],
    season: 'Season journal',
    spring: 'Spring',
    springBody: 'Plant parsnips and potatoes, tiling the fields with spring blue.',
    summer: 'Summer',
    summerBody: 'Blueberries and peppers pay best; leave room for the sprinklers.',
    winter: 'Winter',
    winterBody: 'Fields rest — hit the mines, fish for ice, and catch up with the villagers.',
    locked: 'Greenhouse',
    lockedBody: 'Unlocks after repairing the ruin by the barn.',
    openKeys: 'Open keys',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; season: string; spring: string; springBody: string; summer: string; summerBody: string; winter: string; winterBody: string; locked: string; lockedBody: string; openKeys: string }>

const apiData = {
  zh: [
    { property: 'items', description: '分节列表', type: 'CollapseItem[]', default: '-' },
    { property: 'accordion', description: '手风琴模式：同时只展开一节', type: 'boolean', default: 'false' },
    { property: 'activeKeys', description: '受控展开键；不传则组件自持状态', type: 'string[]', default: '-' },
    { property: 'defaultActiveKeys', description: '非受控初始展开键', type: 'string[]', default: '[]' },
    { property: 'onChange', description: '展开集合变化时触发，参数为最新键列表', type: '(keys: string[]) => void', default: '-' },
    { property: 'ariaLabel', description: '整个面板的无障碍名称', type: 'string', default: '-' },
  ],
  en: [
    { property: 'items', description: 'Sections of the board, in order.', type: 'CollapseItem[]', default: '-' },
    { property: 'accordion', description: 'Only one section stays open at a time.', type: 'boolean', default: 'false' },
    { property: 'activeKeys', description: 'Controlled open keys; omit to let the component own them.', type: 'string[]', default: '-' },
    { property: 'defaultActiveKeys', description: 'Initial open keys for the uncontrolled mode.', type: 'string[]', default: '[]' },
    { property: 'onChange', description: 'Fires with the next open-keys set.', type: '(keys: string[]) => void', default: '-' },
    { property: 'ariaLabel', description: 'Accessible name of the whole board.', type: 'string', default: '-' },
  ],
}

const basicCode = `import { StarCollapse } from 'stardew-valley-ui'

<StarCollapse
  defaultActiveKeys={['spring']}
  items={[
    { key: 'spring', label: 'Spring', content: 'Plant parsnips.' },
    { key: 'summer', label: 'Summer', content: 'Plant blueberries.' },
  ]}
/>`

const accordionCode = `import { StarCollapse } from 'stardew-valley-ui'

<StarCollapse accordion items={seasons} />`

const controlledCode = `import { useState } from 'react'
import { StarCollapse } from 'stardew-valley-ui'

export function Journal() {
  const [keys, setKeys] = useState<string[]>([])
  return (
    <StarCollapse
      items={seasons}
      activeKeys={keys}
      onChange={setKeys}
    />
  )
}`

const disabledCode = `import { StarCollapse } from 'stardew-valley-ui'

<StarCollapse
  items={[
    { key: 'open', label: 'Open', content: 'Ready.' },
    { key: 'locked', label: 'Greenhouse', content: 'Not yet.', disabled: true },
  ]}
/>`

function StarCollapseDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'accordion', 'controlled', 'disabled', 'api'][index], title, level: 1 }))

  const seasonItems: CollapseItem[] = [
    { key: 'spring', label: t.spring, content: t.springBody },
    { key: 'summer', label: t.summer, content: t.summerBody },
    { key: 'winter', label: t.winter, content: t.winterBody },
  ]

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={basicCode}
      >
        <div style={{ width: '100%' }}>
          <StarCollapse ariaLabel={t.season} defaultActiveKeys={['spring']} items={seasonItems} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="accordion"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={accordionCode}
      >
        <div style={{ width: '100%' }}>
          <StarCollapse ariaLabel={t.season} accordion items={seasonItems} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="controlled"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={controlledCode}
      >
        <div style={{ width: '100%' }}>
          <ControlledCollapse items={seasonItems} ariaLabel={t.season} openKeysLabel={t.openKeys} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="disabled"
        title={t.demos[3][0]}
        description={t.demos[3][1]}
        code={disabledCode}
      >
        <div style={{ width: '100%' }}>
          <StarCollapse
            ariaLabel={t.season}
            items={[
              ...seasonItems.slice(0, 1),
              { key: 'locked', label: t.locked, content: t.lockedBody, disabled: true },
            ]}
          />
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Collapse API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

function ControlledCollapse({ items, ariaLabel, openKeysLabel }: { items: CollapseItem[]; ariaLabel: string; openKeysLabel: string }) {
  const [keys, setKeys] = useState<string[]>([])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      <StarCollapse items={items} activeKeys={keys} onChange={setKeys} ariaLabel={ariaLabel} />
      <span style={{ fontSize: 12, opacity: 0.75 }}>
        {openKeysLabel}: [{keys.map((key) => `'${key}'`).join(', ')}]
      </span>
    </div>
  )
}

export default StarCollapseDemoPage
