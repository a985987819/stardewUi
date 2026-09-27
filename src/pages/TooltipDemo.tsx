import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarTooltip } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '文字提示 Tooltip',
    desc: '悬停或聚焦时浮现的像素小气泡，像 NPC 的即时指点：一块两层阶梯裁切的羊皮纸小牌带一枚 8px 像素箭头，四个方向可选；键盘聚焦同样唤出，ESC 之外移开焦点即收起。',
    toc: ['四个方向', '富内容', 'API'],
    demos: [
      ['四个方向', 'placement 决定气泡出现在目标的哪一侧，箭头始终指向触发元素；悬停有 100ms 进入延迟、150ms 离开延迟，扫过界面不会乱闪。'],
      ['富内容', 'title 接受任意 ReactNode——多行文案、粗体强调都可以放进气泡；宽度上限 240px，超出自动换行。'],
    ],
    trigger: '悬停我',
    top: '上方气泡',
    bottom: '下方气泡',
    left: '左侧气泡',
    right: '右侧气泡',
    rich: '矿洞三层有吸血鬼……带够武器再下去！',
    richStrong: '矿洞三层',
  },
  en: {
    title: 'Tooltip',
    desc: 'A pixel bubble that floats in on hover or focus, like an NPC pointing the way: a tiny two-layer staircase-clipped parchment plate with an 8px pixel arrow, on any of four sides; keyboard focus raises it too, and moving focus away dismisses it.',
    toc: ['Four Placements', 'Rich Content', 'API'],
    demos: [
      ['Four Placements', 'placement picks which side of the trigger the bubble floats on, with the arrow always pointing back; 100ms enter and 150ms leave delays keep it from flashing as the pointer sweeps past.'],
      ['Rich Content', 'title accepts any ReactNode — multi-line copy and bold emphasis both fit; the bubble caps at 240px and wraps beyond that.'],
    ],
    trigger: 'Hover me',
    top: 'Bubble on top',
    bottom: 'Bubble below',
    left: 'Bubble left',
    right: 'Bubble right',
    rich: 'Floor 3 has vampires... gear up before heading down!',
    richStrong: 'Mine floor 3',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; trigger: string; top: string; bottom: string; left: string; right: string; rich: string; richStrong: string }>

const apiData = {
  zh: [
    { property: 'title', description: '气泡内容，支持任意 ReactNode', type: 'ReactNode', default: '-' },
    { property: 'placement', description: '气泡出现的位置', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'" },
    { property: 'open', description: '受控可见性；不传则由悬停/聚焦接管', type: 'boolean', default: '-' },
    { property: 'defaultOpen', description: '非受控模式的初始可见性', type: 'boolean', default: 'false' },
    { property: 'mouseEnterDelay', description: '悬停显示延迟（毫秒）', type: 'number', default: '100' },
    { property: 'mouseLeaveDelay', description: '移开隐藏延迟（毫秒）', type: 'number', default: '150' },
    { property: 'onOpenChange', description: '可见性将要变化时触发', type: '(open: boolean) => void', default: '-' },
    { property: 'children', description: '触发元素', type: 'ReactNode', default: '-' },
  ],
  en: [
    { property: 'title', description: 'Bubble content; any ReactNode.', type: 'ReactNode', default: '-' },
    { property: 'placement', description: 'Which side the bubble floats on.', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'" },
    { property: 'open', description: 'Controlled visibility; omit to let hover and focus own it.', type: 'boolean', default: '-' },
    { property: 'defaultOpen', description: 'Initial visibility for the uncontrolled mode.', type: 'boolean', default: 'false' },
    { property: 'mouseEnterDelay', description: 'Hover-in delay in ms.', type: 'number', default: '100' },
    { property: 'mouseLeaveDelay', description: 'Hover-out delay in ms.', type: 'number', default: '150' },
    { property: 'onOpenChange', description: 'Fires when visibility is about to change.', type: '(open: boolean) => void', default: '-' },
    { property: 'children', description: 'Trigger element.', type: 'ReactNode', default: '-' },
  ],
}

const placementCode = `import { StarTooltip } from 'stardew-valley-ui'

<StarTooltip title="Bubble on top"><button>Top</button></StarTooltip>
<StarTooltip title="Bubble below" placement="bottom"><button>Bottom</button></StarTooltip>
<StarTooltip title="Bubble left" placement="left"><button>Left</button></StarTooltip>
<StarTooltip title="Bubble right" placement="right"><button>Right</button></StarTooltip>`

const richCode = `import { StarTooltip } from 'stardew-valley-ui'

<StarTooltip
  title={<>Mine floor 3 has vampires...<br />Gear up before heading down!</>}
>
  <button>Mine</button>
</StarTooltip>`

function StarTooltipDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['placement', 'rich', 'api'][index], title, level: 1 }))

  const triggerStyle = { padding: '5px 12px', cursor: 'pointer' } as const

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="placement"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={placementCode}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', padding: 24, justifyContent: 'center' }}>
          <StarTooltip title={t.top}>
            <button type="button" style={triggerStyle}>Top</button>
          </StarTooltip>
          <StarTooltip title={t.bottom} placement="bottom">
            <button type="button" style={triggerStyle}>Bottom</button>
          </StarTooltip>
          <StarTooltip title={t.left} placement="left">
            <button type="button" style={triggerStyle}>Left</button>
          </StarTooltip>
          <StarTooltip title={t.right} placement="right">
            <button type="button" style={triggerStyle}>Right</button>
          </StarTooltip>
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="rich"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={richCode}
      >
        <div style={{ padding: 24, textAlign: 'center' }}>
          <StarTooltip
            title={(
              <>
                <strong>{t.richStrong}</strong>
                {t.rich}
              </>
            )}
            mouseEnterDelay={150}
          >
            <button type="button" style={triggerStyle}>{t.trigger}</button>
          </StarTooltip>
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Tooltip API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarTooltipDemoPage
