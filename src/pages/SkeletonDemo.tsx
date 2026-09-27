import { useEffect, useRef, useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarSkeleton } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '骨架屏 Skeleton',
    desc: '内容就位前的像素条纹占位骨架，像矿洞里先搭好的支架：标题行、段落行和头像块都以 45° 条纹填充，条纹以像素步进向前跳；loading 变为 false 时支架拆掉，真实内容接管。',
    toc: ['基础用法', '带头像', '加载切换', '矿洞电梯', 'API'],
    demos: [
      ['基础用法', '默认一条加粗标题行加三段长短交替的段落行，最后一行收短到 60%，模拟自然排版的呼吸感。'],
      ['带头像', 'avatar 选项在左侧立一块 36px 的方形占位，适合列表、留言板等"头像 + 正文"的场景。'],
      ['加载切换', 'loading 为 false 时骨架整体退场，children 直接接管位置；点击按钮模拟数据到达。'],
      ['矿洞电梯', '点「下矿」让电梯下行：下落期间骨架支架先撑住界面，1.5 秒后电梯门开——这一层挖到了什么全看运气。'],
    ],
    harvestTitle: '秋季收成',
    harvestBody: '南瓜 ×112，蔓越莓 ×340，杨桃 ×58。总收入 41,250g，比上月多两成半。',
    toggle: '重新加载',
    loadedLabel: '已加载',
    mine: '矿洞电梯',
    descend: '下矿',
    descending: '下行中……',
    floorLabel: '本次抵达',
    mineEmpty: '电梯还没动过——点「下矿」出发。',
    finds: [
      '这一层只有煤，但锅炉正缺它。',
      '挖到石英！给冈瑟的博物馆添了一件展品。',
      '钻石！今天的运气价值 750g。',
      '蝙蝠群袭来——挥镐自卫后逃上了梯子。',
    ],
  },
  en: {
    title: 'Skeleton',
    desc: 'Pixel-striped placeholders that prop the page up like mine supports before content arrives: title row, paragraph rows, and an avatar block all filled with a 45° stripe that hops forward in pixel steps. When loading turns false, the supports come down and real content takes over.',
    toc: ['Basic Usage', 'With Avatar', 'Loading Toggle', 'Mine Elevator', 'API'],
    demos: [
      ['Basic Usage', 'A bold title row plus three alternating paragraph rows by default, with the last row shortened to 60% so the block breathes like real typesetting.'],
      ['With Avatar', 'The avatar option stands a 36px square block on the left, suited to lists and message boards with an "avatar + body" layout.'],
      ['Loading Toggle', 'When loading is false the skeleton exits entirely and children take its place; click the button to simulate data arriving.'],
      ['Mine Elevator', 'Click "descend" to ride the elevator down: the striped supports hold the page while it falls, and 1.5 seconds later the doors open onto whatever this floor holds.'],
    ],
    harvestTitle: 'Fall harvest',
    harvestBody: 'Pumpkin ×112, cranberry ×340, starfruit ×58. Total earnings 41,250g — up 25% from last month.',
    toggle: 'Reload',
    loadedLabel: 'Loaded',
    mine: 'Mine Elevator',
    descend: 'Descend',
    descending: 'Descending...',
    floorLabel: 'Arrived at floor',
    mineEmpty: 'The elevator has not moved yet — hit "descend" to ride.',
    finds: [
      'Nothing but coal this floor — the furnace was hungry anyway.',
      'Quartz! One more exhibit for Gunther\'s museum.',
      'A diamond! Today\'s luck is worth 750g.',
      'Bats swarm in — fend them off and scramble up the ladder.',
    ],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; harvestTitle: string; harvestBody: string; toggle: string; loadedLabel: string; mine: string; descend: string; descending: string; floorLabel: string; mineEmpty: string; finds: string[] }>

const apiData = {
  zh: [
    { property: 'loading', description: '是否显示骨架；为 false 时渲染 children', type: 'boolean', default: 'true' },
    { property: 'rows', description: '段落占位行数', type: 'number', default: '3' },
    { property: 'title', description: '是否显示加粗标题行', type: 'boolean', default: 'true' },
    { property: 'avatar', description: '是否在左侧显示方形头像占位', type: 'boolean', default: 'false' },
    { property: 'children', description: 'loading 为 false 时渲染的真实内容', type: 'ReactNode', default: '-' },
  ],
  en: [
    { property: 'loading', description: 'Shows the skeleton; when false, children render instead.', type: 'boolean', default: 'true' },
    { property: 'rows', description: 'Number of paragraph placeholder rows.', type: 'number', default: '3' },
    { property: 'title', description: 'Shows the bold title row.', type: 'boolean', default: 'true' },
    { property: 'avatar', description: 'Shows a square avatar block on the left.', type: 'boolean', default: 'false' },
    { property: 'children', description: 'Real content rendered when loading is false.', type: 'ReactNode', default: '-' },
  ],
}

const basicCode = `import { StarSkeleton } from 'stardew-valley-ui'

<StarSkeleton rows={3} />
<StarSkeleton title={false} rows={2} />
<StarSkeleton title={false} rows={2} active={false} />`

const avatarCode = `import { StarSkeleton } from 'stardew-valley-ui'

<StarSkeleton avatar rows={2} />`

const toggleCode = `import { useState } from 'react'
import { StarSkeleton } from 'stardew-valley-ui'

export function HarvestReport() {
  const [loading, setLoading] = useState(true)
  return (
    <>
      <button onClick={() => setLoading((v) => !v)}>Reload</button>
      <StarSkeleton loading={loading} rows={2}>
        <h4>Fall harvest</h4>
        <p>Pumpkin ×112, cranberry ×340...</p>
      </StarSkeleton>
    </>
  )
}`

const mineCode = `import { useState } from 'react'
import { StarSkeleton } from 'stardew-valley-ui'

export function MineElevator() {
  const [loading, setLoading] = useState(false)
  // While the elevator falls, the striped supports hold the page up.
  return (
    <>
      <button onClick={descend} disabled={loading}>Descend</button>
      <StarSkeleton loading={loading} avatar rows={2}>
        <h4>Arrived at floor {floor}</h4>
        <p>{find}</p>
      </StarSkeleton>
    </>
  )
}`

function StarSkeletonDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'avatar', 'toggle', 'mine', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={basicCode}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
          <StarSkeleton rows={3} />
          <StarSkeleton title={false} rows={2} />
          <StarSkeleton title={false} rows={2} active={false} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="avatar"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={avatarCode}
      >
        <div style={{ width: '100%' }}>
          <StarSkeleton avatar rows={2} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="toggle"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={toggleCode}
      >
        <div style={{ width: '100%' }}>
          <LoadingToggle title={t.harvestTitle} body={t.harvestBody} toggleLabel={t.toggle} loadedLabel={t.loadedLabel} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="mine"
        title={t.demos[3][0]}
        description={t.demos[3][1]}
        code={mineCode}
      >
        <MineElevator
          descendLabel={t.descend}
          descendingLabel={t.descending}
          floorLabel={t.floorLabel}
          emptyLabel={t.mineEmpty}
          finds={t.finds}
        />
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Skeleton API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

function LoadingToggle({ title, body, toggleLabel, loadedLabel }: { title: string; body: string; toggleLabel: string; loadedLabel: string }) {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setLoading((value) => !value)}
          style={{ padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-pixel)', fontSize: 12 }}
        >
          {loading ? toggleLabel : loadedLabel}
        </button>
      </div>
      <StarSkeleton loading={loading} rows={2}>
        <div style={{ fontFamily: 'var(--font-pixel)', color: '#4a2c1a' }}>
          <h4 style={{ margin: 0, fontSize: 14 }}>{title}</h4>
          <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.6 }}>{body}</p>
        </div>
      </StarSkeleton>
    </>
  )
}

export default StarSkeletonDemoPage

function MineElevator({ descendLabel, descendingLabel, floorLabel, emptyLabel, finds }: { descendLabel: string; descendingLabel: string; floorLabel: string; emptyLabel: string; finds: string[] }) {
  const [visit, setVisit] = useState<{ floor: number; find: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const descend = () => {
    window.clearTimeout(timerRef.current)
    setLoading(true)
    const floor = (visit?.floor ?? 0) + 3 + Math.floor(Math.random() * 8)
    const find = finds[Math.floor(Math.random() * finds.length)]
    setVisit({ floor, find })
    timerRef.current = window.setTimeout(() => setLoading(false), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          onClick={descend}
          disabled={loading}
          style={{ padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-pixel)', fontSize: 12 }}
        >
          {loading ? descendingLabel : descendLabel}
        </button>
        {visit && !loading ? <span style={{ fontSize: 12, opacity: 0.75 }}>{floorLabel}: {visit.floor}</span> : null}
      </div>
      {visit ? (
        <StarSkeleton loading={loading} avatar rows={2}>
          <div style={{ fontFamily: 'var(--font-pixel)', color: '#4a2c1a' }}>
            <h4 style={{ margin: 0, fontSize: 14 }}>{floorLabel}: {visit.floor}</h4>
            <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.6 }}>{visit.find}</p>
          </div>
        </StarSkeleton>
      ) : (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>{emptyLabel}</p>
      )}
    </div>
  )
}
