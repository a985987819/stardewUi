import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarDivider } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'Divider 分割线',
    desc: '把 Card 默认木纹与光影压缩成开放的像素栅栏：没有卡片背景，只留下受光横梁、深色端柱和右下遮光。',
    toc: ['基础栅栏', '方向与配色', 'API'],
    demos: [
      ['基础栅栏', '默认横向分割线会撑满容器宽度，适合分隔背包栏、清单和信息区。'],
      ['方向与配色', 'vertical 可用于两列内容之间；color 传入主体色后会复用 Card 的条纹、受光和阴影推导。'],
    ],
  },
  en: {
    title: 'Divider',
    desc: 'Card wood grain and lighting condensed into an open pixel fence: no panel background, only lit rails, dark end posts, and lower-right occlusion.',
    toc: ['Basic Fence', 'Direction & Color', 'API'],
    demos: [
      ['Basic Fence', 'The horizontal divider fills its container and separates inventories, lists, and information sections.'],
      ['Direction & Color', 'Use vertical between columns. color takes a visible surface and reuses Card stripe, lighting, and shadow derivation.'],
    ],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][] }>

const apiData = {
  zh: [
    { property: 'orientation', description: '栅栏方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
    { property: 'color', description: '主体木纹色；自动推导条纹、受光和遮光', type: 'string', default: '#FFC675' },
    { property: 'className / style', description: '根元素样式，可设定纵向栅栏高度等布局尺寸', type: 'string / CSSProperties', default: '-' },
  ],
  en: [
    { property: 'orientation', description: 'Fence direction.', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
    { property: 'color', description: 'Visible wood surface; stripe, light, and shade are derived.', type: 'string', default: '#FFC675' },
    { property: 'className / style', description: 'Root styles for layout, including a vertical rail height.', type: 'string / CSSProperties', default: '-' },
  ],
}

function StarDividerDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'direction', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]} code={'<StarDivider />'}>
        <div style={{ width: 'min(100%, 520px)', display: 'grid', gap: 12 }}>
          <span>{lang === 'zh' ? '背包物品' : 'Backpack items'}</span>
          <StarDivider />
          <span>{lang === 'zh' ? '任务奖励' : 'Quest rewards'}</span>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="direction" title={t.demos[1][0]} description={t.demos[1][1]} code={'<StarDivider orientation="vertical" color="#7699B5" style={{ height: 96 }} />'}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 18, minHeight: 96 }}>
          <div>{lang === 'zh' ? '春季作物' : 'Spring crops'}</div>
          <StarDivider orientation="vertical" color="#7699B5" style={{ height: 96 }} />
          <div>{lang === 'zh' ? '矿洞收获' : 'Mine findings'}</div>
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Divider API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarDividerDemoPage
