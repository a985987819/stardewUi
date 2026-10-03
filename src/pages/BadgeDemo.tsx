import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarBadge, StarDisplayFrame, StarNineSliceButton } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '徽标 Badge',
    desc: '像物品栏角落的数量角标：一枚带阶梯角的像素小牌钉在目标右上角，超过上限自动折叠为 N+；红点模式不显示数字，只标记"有新东西"。',
    toc: ['基础用法', '红点与上限', '包裹目标', '收获日', 'API'],
    demos: [
      ['基础用法', '独立摆放的计数牌，适合直接展示数量；color 决定底色，边框色由它自动推导；text 可以直接放一段文字或表情，不必是数字。'],
      ['红点与上限', '超过 overflowCount 显示 N+；count 为 0 时默认隐藏，showZero 强制显示；dot 模式只渲染一个 8px 方点。'],
      ['包裹目标', '把按钮、头像或图标放进 children，徽标会钉在它的右上角并外扩半步，像物品栏的堆叠计数。'],
      ['收获日', '点「浇水」让 count 涨上去，点「摘一颗」收走一枚；count 归零时徽标悄悄退场——勾选 showZero 后会留下一块写着 0 的空牌，超过 99 自动折成 99+。'],
    ],
    inbox: '收件箱',
    backpack: '背包',
    mails: [{ label: '新邮件', value: '12' }],
    harvest: '收获日',
    crop: '苹果树',
    water: '浇水 +5',
    pick: '摘一颗',
    collectAll: '一键收仓',
    restock: '补货',
    cropCount: '当前数量',
    showZeroLabel: 'count 为 0 时仍显示',
    textBadge: '限定',
    // 角标只有数字没有可读名称，这些 aria-label 是读屏用户唯一能听到的描述，
    // 写死中文等于英文页下读出中文。顺序与使用处一一对应。
    labels: [
      '七件物品', '超过上限折叠为 5+', '数量折叠为 99+', '数量为零也显示',
      '有新鲜货上架', '节日限定角标', '数量折叠为 99+', '三条待办警告',
      '两条新提示', '有好消息',
    ],
  },
  en: {
    title: 'Badge',
    desc: 'An inventory-style counter: a tiny stepped pixel plate pinned to the top-right corner of its target, collapsing to N+ past the limit; dot mode marks "something new" without a number.',
    toc: ['Basic Usage', 'Dot & Overflow', 'Wrap Target', 'Harvest Day', 'API'],
    demos: [
      ['Basic Usage', 'A standalone counter plate; color sets the fill and its frame edge is derived automatically, and text swaps the number for any label or emoji.'],
      ['Dot & Overflow', 'Counts above overflowCount collapse to N+; zero counts hide by default unless showZero is set; dot mode renders an 8px square instead of a number.'],
      ['Wrap Target', 'Put a button, avatar, or icon in children and the badge pins to its top-right corner, half a step outside like an inventory stack counter.'],
      ['Harvest Day', 'Water to raise the count, pick to take one off; the badge slips away at zero — unless showZero leaves a blank plate printed with 0, and anything past 99 folds into 99+.'],
    ],
    inbox: 'Inbox',
    backpack: 'Backpack',
    mails: [{ label: 'Unread mails', value: '12' }],
    harvest: 'Harvest Day',
    crop: 'Apple tree',
    water: 'Water +5',
    pick: 'Pick one',
    collectAll: 'Collect all',
    restock: 'Restock',
    cropCount: 'Current count',
    showZeroLabel: 'Show at zero',
    textBadge: 'EVENT',
    labels: [
      '7 items', 'Collapsed to 5+ past the limit', 'Collapsed to 99+',
      'Shown even at zero', 'Fresh stock arrived', 'Event badge',
      'Collapsed to 99+', '3 tasks need attention', '2 new notices', 'Good news',
    ],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; inbox: string; backpack: string; mails: { label: string; value: string }[]; harvest: string; crop: string; water: string; pick: string; collectAll: string; restock: string; cropCount: string; showZeroLabel: string; textBadge: string; labels: string[] }>

const apiData = {
  zh: [
    { property: 'count', description: '显示的数值；超过 overflowCount 折叠为 N+', type: 'number', default: '-' },
    { property: 'dot', description: '红点模式：只渲染 8px 方点，不显示数字', type: 'boolean', default: 'false' },
    { property: 'overflowCount', description: '数值折叠上限', type: 'number', default: '99' },
    { property: 'showZero', description: 'count 为 0 时是否显示', type: 'boolean', default: 'false' },
    { property: 'color', description: '底色；边框色由它自动推导', type: 'string', default: "'#E53935'" },
    { property: 'text', description: '用文字或表情代替数字角标', type: 'ReactNode', default: '-' },
    { property: 'children', description: '包裹目标；徽标钉在其右上角', type: 'ReactNode', default: '-' },
  ],
  en: [
    { property: 'count', description: 'Number shown; collapses to N+ past overflowCount.', type: 'number', default: '-' },
    { property: 'dot', description: 'Dot mode: renders an 8px square instead of a number.', type: 'boolean', default: 'false' },
    { property: 'overflowCount', description: 'Collapse limit for the count.', type: 'number', default: '99' },
    { property: 'showZero', description: 'Shows the badge even when the count is zero.', type: 'boolean', default: 'false' },
    { property: 'color', description: 'Fill colour; its frame edge is derived automatically.', type: 'string', default: "'#E53935'" },
    { property: 'text', description: 'Swaps the number for any label or emoji.', type: 'ReactNode', default: '-' },
    { property: 'children', description: 'Wrap target; the badge pins to its top-right corner.', type: 'ReactNode', default: '-' },
  ],
}

const standaloneCode = `import { StarBadge } from 'stardew-valley-ui'

<StarBadge count={7} />
<StarBadge count={7} overflowCount={5} />
<StarBadge count={120} />
<StarBadge count={0} showZero />
<StarBadge dot color="#71964A" />
<StarBadge text="EVENT" color="#308BE2" />`

const wrapCode = `import { StarBadge, StarNineSliceButton } from 'stardew-valley-ui'

export function MailboxButton() {
  return (
    <StarBadge count={12}>
      <StarNineSliceButton size="small">Inbox</StarNineSliceButton>
    </StarBadge>
  )
}`

const harvestCode = `import { useState } from 'react'
import { StarBadge, StarDisplayFrame } from 'stardew-valley-ui'

export function AppleTree() {
  const [apples, setApples] = useState(24)
  return (
    <StarBadge count={apples} color="#D7992E">
      <StarDisplayFrame>Apple tree</StarDisplayFrame>
    </StarBadge>
  )
}`

function StarBadgeDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'dot', 'wrap', 'harvest', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={standaloneCode}
      >
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <StarBadge count={7} aria-label={t.labels[0]} />
          <StarBadge count={7} overflowCount={5} aria-label={t.labels[1]} />
          <StarBadge count={120} aria-label={t.labels[2]} />
          <StarBadge count={0} showZero aria-label={t.labels[3]} />
          <StarBadge dot color="#71964A" aria-label={t.labels[4]} />
          <StarBadge text={t.textBadge} color="#308BE2" aria-label={t.labels[5]} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="dot"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={'<StarBadge count={120} overflowCount={99} />\n<StarBadge count={0} showZero />\n<StarBadge dot color="#308BE2" />'}
      >
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <StarBadge count={120} aria-label={t.labels[2]} />
          <StarBadge count={3} color="#D7992E" aria-label={t.labels[7]} />
          <StarBadge count={2} color="#308BE2" aria-label={t.labels[8]} />
          <StarBadge dot color="#71964A" aria-label={t.labels[9]} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="wrap"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={wrapCode}
        data={t.mails}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <StarBadge count={12}>
            <StarNineSliceButton size="small">{t.inbox}</StarNineSliceButton>
          </StarBadge>
          <StarBadge dot>
            <StarNineSliceButton size="small">{t.backpack}</StarNineSliceButton>
          </StarBadge>
          <StarBadge count={5}>
            <StarDisplayFrame>312</StarDisplayFrame>
          </StarBadge>
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="harvest"
        title={t.demos[3][0]}
        description={t.demos[3][1]}
        code={harvestCode}
      >
        <HarvestGame
          crop={t.crop}
          waterLabel={t.water}
          pickLabel={t.pick}
          collectLabel={t.collectAll}
          restockLabel={t.restock}
          countLabel={t.cropCount}
          showZeroLabel={t.showZeroLabel}
        />
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarBadgeDemoPage

function HarvestGame({
  crop,
  waterLabel,
  pickLabel,
  collectLabel,
  restockLabel,
  countLabel,
  showZeroLabel,
}: {
  crop: string
  waterLabel: string
  pickLabel: string
  collectLabel: string
  restockLabel: string
  countLabel: string
  showZeroLabel: string
}) {
  const [count, setCount] = useState(24)
  const [showZero, setShowZero] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
      <StarBadge count={count} showZero={showZero} color="#D7992E">
        <StarDisplayFrame>{crop}</StarDisplayFrame>
      </StarBadge>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <StarNineSliceButton size="small" variant="success" onClick={() => setCount((value) => value + 5)}>{waterLabel}</StarNineSliceButton>
        <StarNineSliceButton size="small" onClick={() => setCount((value) => Math.max(0, value - 1))}>{pickLabel}</StarNineSliceButton>
        <StarNineSliceButton size="small" variant="warning" onClick={() => setCount(0)}>{collectLabel}</StarNineSliceButton>
        <StarNineSliceButton size="small" onClick={() => setCount(24)}>{restockLabel}</StarNineSliceButton>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
        <input type="checkbox" checked={showZero} onChange={(event) => setShowZero(event.target.checked)} />
        {showZeroLabel}
      </label>
      <span style={{ fontSize: 12, opacity: 0.75 }}>{countLabel}: {count}</span>
    </div>
  )
}
