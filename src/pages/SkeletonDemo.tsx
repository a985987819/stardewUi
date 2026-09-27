import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarSkeleton } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '骨架屏 Skeleton',
    desc: '内容就位前的像素条纹占位骨架，像矿洞里先搭好的支架：标题行、段落行和头像块都以 45° 条纹填充，条纹以像素步进向前跳；loading 变为 false 时支架拆掉，真实内容接管。',
    toc: ['基础用法', '带头像', '加载切换', 'API'],
    demos: [
      ['基础用法', '默认一条加粗标题行加三段长短交替的段落行，最后一行收短到 60%，模拟自然排版的呼吸感。'],
      ['带头像', 'avatar 选项在左侧立一块 36px 的方形占位，适合列表、留言板等"头像 + 正文"的场景。'],
      ['加载切换', 'loading 为 false 时骨架整体退场，children 直接接管位置；点击按钮模拟数据到达。'],
    ],
    harvestTitle: '秋季收成',
    harvestBody: '南瓜 ×112，蔓越莓 ×340，杨桃 ×58。总收入 41,250g，比上月多两成半。',
    toggle: '重新加载',
    loadedLabel: '已加载',
  },
  en: {
    title: 'Skeleton',
    desc: 'Pixel-striped placeholders that prop the page up like mine supports before content arrives: title row, paragraph rows, and an avatar block all filled with a 45° stripe that hops forward in pixel steps. When loading turns false, the supports come down and real content takes over.',
    toc: ['Basic Usage', 'With Avatar', 'Loading Toggle', 'API'],
    demos: [
      ['Basic Usage', 'A bold title row plus three alternating paragraph rows by default, with the last row shortened to 60% so the block breathes like real typesetting.'],
      ['With Avatar', 'The avatar option stands a 36px square block on the left, suited to lists and message boards with an "avatar + body" layout.'],
      ['Loading Toggle', 'When loading is false the skeleton exits entirely and children take its place; click the button to simulate data arriving.'],
    ],
    harvestTitle: 'Fall harvest',
    harvestBody: 'Pumpkin ×112, cranberry ×340, starfruit ×58. Total earnings 41,250g — up 25% from last month.',
    toggle: 'Reload',
    loadedLabel: 'Loaded',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; harvestTitle: string; harvestBody: string; toggle: string; loadedLabel: string }>

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
<StarSkeleton title={false} rows={2} />`

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

function StarSkeletonDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'avatar', 'toggle', 'api'][index], title, level: 1 }))

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
