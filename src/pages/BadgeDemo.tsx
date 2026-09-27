import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarBadge, StarDisplayFrame } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '徽标 Badge',
    desc: '像物品栏角落的数量角标：一枚带阶梯角的像素小牌钉在目标右上角，超过上限自动折叠为 N+；红点模式不显示数字，只标记"有新东西"。',
    toc: ['基础用法', '红点与上限', '包裹目标', 'API'],
    demos: [
      ['基础用法', '独立摆放的计数牌，适合直接展示数量；color 决定底色，边框色由它自动推导。'],
      ['红点与上限', '超过 overflowCount 显示 N+；count 为 0 时默认隐藏，showZero 强制显示；dot 模式只渲染一个 8px 方点。'],
      ['包裹目标', '把按钮、头像或图标放进 children，徽标会钉在它的右上角并外扩半步，像物品栏的堆叠计数。'],
    ],
    inbox: '收件箱',
    backpack: '背包',
    mails: [{ label: '新邮件', value: '12' }],
  },
  en: {
    title: 'Badge',
    desc: 'An inventory-style counter: a tiny stepped pixel plate pinned to the top-right corner of its target, collapsing to N+ past the limit; dot mode marks "something new" without a number.',
    toc: ['Basic Usage', 'Dot & Overflow', 'Wrap Target', 'API'],
    demos: [
      ['Basic Usage', 'A standalone counter plate; color sets the fill and its frame edge is derived automatically.'],
      ['Dot & Overflow', 'Counts above overflowCount collapse to N+; zero counts hide by default unless showZero is set; dot mode renders an 8px square instead of a number.'],
      ['Wrap Target', 'Put a button, avatar, or icon in children and the badge pins to its top-right corner, half a step outside like an inventory stack counter.'],
    ],
    inbox: 'Inbox',
    backpack: 'Backpack',
    mails: [{ label: 'Unread mails', value: '12' }],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; inbox: string; backpack: string; mails: { label: string; value: string }[] }>

const apiData = {
  zh: [
    { property: 'count', description: '显示的数值；超过 overflowCount 折叠为 N+', type: 'number', default: '-' },
    { property: 'dot', description: '红点模式：只渲染 8px 方点，不显示数字', type: 'boolean', default: 'false' },
    { property: 'overflowCount', description: '数值折叠上限', type: 'number', default: '99' },
    { property: 'showZero', description: 'count 为 0 时是否显示', type: 'boolean', default: 'false' },
    { property: 'color', description: '底色；边框色由它自动推导', type: 'string', default: "'#E53935'" },
    { property: 'children', description: '包裹目标；徽标钉在其右上角', type: 'ReactNode', default: '-' },
  ],
  en: [
    { property: 'count', description: 'Number shown; collapses to N+ past overflowCount.', type: 'number', default: '-' },
    { property: 'dot', description: 'Dot mode: renders an 8px square instead of a number.', type: 'boolean', default: 'false' },
    { property: 'overflowCount', description: 'Collapse limit for the count.', type: 'number', default: '99' },
    { property: 'showZero', description: 'Shows the badge even when the count is zero.', type: 'boolean', default: 'false' },
    { property: 'color', description: 'Fill colour; its frame edge is derived automatically.', type: 'string', default: "'#E53935'" },
    { property: 'children', description: 'Wrap target; the badge pins to its top-right corner.', type: 'ReactNode', default: '-' },
  ],
}

const standaloneCode = `import { StarBadge } from 'stardew-valley-ui'

<StarBadge count={7} />
<StarBadge count={7} overflowCount={5} />
<StarBadge count={120} />
<StarBadge count={0} showZero />
<StarBadge dot color="#71964A" />`

const wrapCode = `import { StarBadge } from 'stardew-valley-ui'

export function MailboxButton() {
  return (
    <StarBadge count={12}>
      <button type="button">Inbox</button>
    </StarBadge>
  )
}`

function StarBadgeDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'dot', 'wrap', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={standaloneCode}
      >
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <StarBadge count={7} aria-label="seven" />
          <StarBadge count={7} overflowCount={5} aria-label="capped" />
          <StarBadge count={120} aria-label="overflow" />
          <StarBadge count={0} showZero aria-label="zero" />
          <StarBadge dot color="#71964A" aria-label="has news" />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="dot"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={'<StarBadge count={120} overflowCount={99} />\n<StarBadge count={0} showZero />\n<StarBadge dot color="#308BE2" />'}
      >
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <StarBadge count={120} aria-label="overflow" />
          <StarBadge count={3} color="#D7992E" aria-label="warning" />
          <StarBadge count={2} color="#308BE2" aria-label="info" />
          <StarBadge dot color="#71964A" aria-label="success news" />
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
            <button type="button" style={{ padding: '6px 12px', cursor: 'pointer' }}>{t.inbox}</button>
          </StarBadge>
          <StarBadge dot>
            <button type="button" style={{ padding: '6px 12px', cursor: 'pointer' }}>{t.backpack}</button>
          </StarBadge>
          <StarBadge count={5}>
            <StarDisplayFrame>312</StarDisplayFrame>
          </StarBadge>
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Badge API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarBadgeDemoPage
