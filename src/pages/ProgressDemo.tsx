import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarNineSliceButton, StarProgress } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'Progress 进度条',
    desc: '把进度拆成彼此留有呼吸感的像素格：缺角深框、左下木质投影和右上高光一起从填充色推导出来。',
    toc: ['基础进度', '自定义颜色', '固定尺寸与分格', '紧凑进度条', 'API'],
    demos: [
      ['基础进度', '默认每 10 点为一格。点击 -10 / +10 逐格减少或增加，变化的那一格会收回或弹出。'],
      ['自定义颜色', '只传入可见填充色；边框、左下阴影、右上高光和空格底色会自动取得同一套明暗关系。'],
      ['固定尺寸与分格', '每格固定为 15×25px；segmentSize 定义一格代表多少进度，max 定义整条进度上限。'],
      ['紧凑进度条', 'variant="compact" 使用 6px 宽方格与 2px 间距，适合背包栏、状态 HUD 和空间紧张的列表。'],
    ],
    actions: ['-10', '+10'],
  },
  en: {
    title: 'Progress',
    desc: 'Progress broken into breathing-room pixel cells: notched dark frames, lower-left wood shadows, and upper-right highlights are derived from the fill color.',
    toc: ['Basic Progress', 'Custom Colors', 'Fixed Cells & Segments', 'Compact Progress', 'API'],
    demos: [
      ['Basic Progress', 'Each cell represents ten points by default. Use -10 / +10 to remove or add one cell at a time.'],
      ['Custom Colors', 'Pass only the visible fill. The border, lower-left shadow, upper-right highlight, and empty surface are derived as one lighting system.'],
      ['Fixed Cells & Segments', 'Each cell stays 15×25px; segmentSize defines a cell and max defines the full amount.'],
      ['Compact Progress', 'variant="compact" uses six-pixel-wide cells with two-pixel gaps for inventories, status HUDs, and tight lists.'],
    ],
    actions: ['-10', '+10'],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; actions: string[] }>

const apiData = {
  zh: [
    { property: 'value', description: '当前进度；以完整格显示，超出范围自动截断', type: 'number', default: '-' },
    { property: 'max', description: '整条进度的上限', type: 'number', default: '100' },
    { property: 'segmentSize', description: '单个像素格代表的进度量', type: 'number', default: '10' },
    { property: 'color', description: '可见填充色；其余边框、高光、投影颜色自动推导', type: 'string', default: '#CE053C' },
    { property: 'variant', description: 'default 为 15px 宽方格；compact 为 6px 宽紧凑方格', type: "'default' | 'compact'", default: "'default'" },
    { property: 'showLabel', description: '显示当前值与上限', type: 'boolean', default: 'false' },
  ],
  en: [
    { property: 'value', description: 'Current amount; completed cells are displayed and the range is clamped.', type: 'number', default: '-' },
    { property: 'max', description: 'Full progress amount.', type: 'number', default: '100' },
    { property: 'segmentSize', description: 'Amount represented by one pixel cell.', type: 'number', default: '10' },
    { property: 'color', description: 'Visible fill; frame, highlight, and shadow are derived.', type: 'string', default: '#CE053C' },
    { property: 'variant', description: 'default uses 15px cells; compact uses dense 6px cells.', type: "'default' | 'compact'", default: "'default'" },
    { property: 'showLabel', description: 'Shows the current and maximum values.', type: 'boolean', default: 'false' },
  ],
}

function StarProgressDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [value, setValue] = useState(50)
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'color', 'size', 'compact', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]} code={'<StarProgress value={value} />\n<StarNineSliceButton onClick={() => setValue(value + 10)}>+10</StarNineSliceButton>'}>
        <div style={{ display: 'grid', width: 'min(100%, 440px)', gap: 18 }}>
          <StarProgress value={value} showLabel />
          <div style={{ display: 'flex', gap: 10 }}>
            <StarNineSliceButton variant="secondary" disabled={value <= 0} onClick={() => setValue((current) => Math.max(0, current - 10))}>{t.actions[0]}</StarNineSliceButton>
            <StarNineSliceButton variant="primary" disabled={value >= 100} onClick={() => setValue((current) => Math.min(100, current + 10))}>{t.actions[1]}</StarNineSliceButton>
          </div>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="color" title={t.demos[1][0]} description={t.demos[1][1]} code={'<StarProgress value={40} color="#7699B5" />'}>
        <div style={{ display: 'grid', width: 'min(100%, 440px)', gap: 16 }}>
          <StarProgress value={60} color="#CE053C" />
          <StarProgress value={40} color="#7699B5" />
          <StarProgress value={80} color="#71964A" />
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="size" title={t.demos[2][0]} description={t.demos[2][1]} code={'<StarProgress value={36} max={48} segmentSize={6} showLabel />'}>
        <div style={{ display: 'grid', width: 'min(100%, 440px)', gap: 18 }}>
          <StarProgress value={30} max={60} segmentSize={10} showLabel />
          <StarProgress value={36} max={48} segmentSize={6} showLabel />
          <StarProgress value={30} max={120} segmentSize={20} showLabel />
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="compact" title={t.demos[3][0]} description={t.demos[3][1]} code={'<StarProgress value={70} variant="compact" />'}>
        <div style={{ display: 'grid', width: 'min(100%, 440px)', gap: 18 }}>
          <StarProgress value={70} variant="compact" showLabel />
          <StarProgress value={48} max={60} segmentSize={5} variant="compact" color="#7699B5" showLabel />
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Progress API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarProgressDemoPage
