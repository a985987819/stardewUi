import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarTooltip } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

interface ToolTip {
  name: string
  desc: string
}

const TOOLBOX_TOOLS: Record<Lang, ToolTip[]> = {
  zh: [
    { name: '锄头', desc: '开垦土地，播种前先挥两下。' },
    { name: '水壶', desc: '给作物浇水，喷水器能省下这项日常。' },
    { name: '斧头', desc: '劈开硬木，升级后连大树也不在话下。' },
    { name: '鐮刀', desc: '收割草料，攒够了喂鸡和牛。' },
  ],
  en: [
    { name: 'Hoe', desc: 'Tills the soil — swing twice before sowing.' },
    { name: 'Can', desc: 'Waters crops; sprinklers spare you the chore.' },
    { name: 'Axe', desc: 'Splits hardwood; upgraded, even big trees fall.' },
    { name: 'Scythe', desc: 'Cuts hay for the coop and barn.' },
  ],
}

const copy = {
  zh: {
    title: '文字提示 Tooltip',
    desc: '悬停或聚焦时浮现的像素小气泡，像 NPC 的即时指点：一块两层阶梯裁切的羊皮纸小牌带一枚 8px 像素箭头，四个方向可选；键盘聚焦同样唤出，ESC 之外移开焦点即收起。',
    toc: ['四个方向', '富内容', '工具箱', 'API'],
    demos: [
      ['四个方向', 'placement 决定气泡出现在目标的哪一侧，箭头始终指向触发元素；悬停有 100ms 进入延迟、150ms 离开延迟，扫过界面不会乱闪。'],
      ['富内容', 'title 接受任意 ReactNode——多行文案、粗体强调都可以放进气泡；宽度上限 240px，超出自动换行。'],
      ['工具箱', '像物品栏一样悬停工具查看说明；下方切换 mouseEnterDelay——0ms 时扫过一排工具气泡会连成一片，500ms 则要稍作停留。'],
    ],
    trigger: '悬停我',
    top: '上方气泡',
    bottom: '下方气泡',
    left: '左侧气泡',
    right: '右侧气泡',
    noArrow: '无箭头',
    defaultOpenLabel: '默认展开',
    controlled: '受控开关',
    rich: '矿洞三层有吸血鬼……带够武器再下去！',
    richStrong: '矿洞三层',
    toolbox: '工具箱',
    toolDelay: '悬停延迟',
  },
  en: {
    title: 'Tooltip',
    desc: 'A pixel bubble that floats in on hover or focus, like an NPC pointing the way: a tiny two-layer staircase-clipped parchment plate with an 8px pixel arrow, on any of four sides; keyboard focus raises it too, and moving focus away dismisses it.',
    toc: ['Four Placements', 'Rich Content', 'Toolbox', 'API'],
    demos: [
      ['Four Placements', 'placement picks which side of the trigger the bubble floats on, with the arrow always pointing back; 100ms enter and 150ms leave delays keep it from flashing as the pointer sweeps past.'],
      ['Rich Content', 'title accepts any ReactNode — multi-line copy and bold emphasis both fit; the bubble caps at 240px and wraps beyond that.'],
      ['Toolbox', 'Hover a tool to read its tooltip like an inventory card; switch mouseEnterDelay below — at 0ms sweeping the row flashes every bubble, at 500ms it takes a deliberate pause.'],
    ],
    trigger: 'Hover me',
    top: 'Bubble on top',
    bottom: 'Bubble below',
    left: 'Bubble left',
    right: 'Bubble right',
    noArrow: 'No arrow',
    defaultOpenLabel: 'Default open',
    controlled: 'Controlled',
    rich: 'Floor 3 has vampires... gear up before heading down!',
    richStrong: 'Mine floor 3',
    toolbox: 'Toolbox',
    toolDelay: 'Hover delay',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; trigger: string; top: string; bottom: string; left: string; right: string; noArrow: string; defaultOpenLabel: string; controlled: string; rich: string; richStrong: string; toolbox: string; toolDelay: string }>

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

const placementCode = `import { useState } from 'react'
import { StarTooltip } from 'stardew-valley-ui'

<StarTooltip title="Bubble on top"><button>Top</button></StarTooltip>
<StarTooltip title="Bubble below" placement="bottom"><button>Bottom</button></StarTooltip>
<StarTooltip title="Bubble left" placement="left"><button>Left</button></StarTooltip>
<StarTooltip title="Bubble right" placement="right"><button>Right</button></StarTooltip>
<StarTooltip title="No arrow" arrow={false}><button>No arrow</button></StarTooltip>
<StarTooltip title="Bubble below" placement="bottom" defaultOpen><button>Default open</button></StarTooltip>

// Controlled: the open prop owns visibility, onOpenChange mirrors it.
const [open, setOpen] = useState(false)
<StarTooltip title="Controlled" open={open} onOpenChange={setOpen}>
  <button onClick={() => setOpen((v) => !v)}>Toggle</button>
</StarTooltip>`

const richCode = `import { StarTooltip } from 'stardew-valley-ui'

<StarTooltip
  title={<>Mine floor 3 has vampires...<br />Gear up before heading down!</>}
  mouseEnterDelay={150}
  mouseLeaveDelay={400}
>
  <button>Mine</button>
</StarTooltip>`

const toolboxCode = `import { useState } from 'react'
import { StarTooltip } from 'stardew-valley-ui'

export function Toolbox() {
  const [delay, setDelay] = useState(100)
  return (
    <>
      {tools.map((tool) => (
        <StarTooltip
          key={tool.name}
          title={<><strong>{tool.name}</strong><br />{tool.desc}</>}
          placement="bottom"
          mouseEnterDelay={delay}
        >
          <button>{tool.name}</button>
        </StarTooltip>
      ))}
      <button onClick={() => setDelay(0)}>0ms</button>
      <button onClick={() => setDelay(100)}>100ms</button>
      <button onClick={() => setDelay(500)}>500ms</button>
    </>
  )
}`

function StarTooltipDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['placement', 'rich', 'toolbox', 'api'][index], title, level: 1 }))
  const [toolboxDelay, setToolboxDelay] = useState(100)

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
          <StarTooltip title={t.top} arrow={false}>
            <button type="button" style={triggerStyle}>{t.noArrow}</button>
          </StarTooltip>
          <StarTooltip title={t.bottom} placement="bottom" defaultOpen>
            <button type="button" style={triggerStyle}>{t.defaultOpenLabel}</button>
          </StarTooltip>
          <ControlledTooltip label={t.controlled} title={t.top} triggerStyle={triggerStyle} />
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
            mouseLeaveDelay={400}
          >
            <button type="button" style={triggerStyle}>{t.trigger}</button>
          </StarTooltip>
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="toolbox"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={toolboxCode}
        data={[{ label: 'mouseEnterDelay', value: `${toolboxDelay}ms` }]}
      >
        <Toolbox tools={TOOLBOX_TOOLS[lang]} delayLabel={t.toolDelay} delay={toolboxDelay} onDelayChange={setToolboxDelay} />
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Tooltip API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

function ControlledTooltip({ label, title, triggerStyle }: { label: string; title: string; triggerStyle: { padding: string; cursor: 'pointer' } }) {
  const [open, setOpen] = useState(false)

  return (
    <StarTooltip title={title} open={open} onOpenChange={setOpen}>
      <button
        type="button"
        style={{ ...triggerStyle, background: open ? '#d4a72c' : undefined, color: open ? '#fff3dc' : undefined }}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>
    </StarTooltip>
  )
}

export default StarTooltipDemoPage

function Toolbox({
  tools,
  delayLabel,
  delay,
  onDelayChange,
}: {
  tools: ToolTip[]
  delayLabel: string
  delay: number
  onDelayChange: (delay: number) => void
}) {
  const options = [0, 100, 500]
  const toolTriggerStyle = { padding: '5px 12px', cursor: 'pointer' } as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        {tools.map((tool) => (
          <StarTooltip
            key={tool.name}
            title={(
              <>
                <strong>{tool.name}</strong>
                <br />
                {tool.desc}
              </>
            )}
            placement="bottom"
            mouseEnterDelay={delay}
          >
            <button type="button" style={toolTriggerStyle}>{tool.name}</button>
          </StarTooltip>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12 }}>
        <span style={{ opacity: 0.75 }}>{delayLabel}:</span>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onDelayChange(option)}
            style={{
              padding: '3px 10px',
              cursor: 'pointer',
              fontFamily: 'var(--font-pixel)',
              fontSize: 12,
              background: delay === option ? '#d4a72c' : undefined,
              color: delay === option ? '#fff3dc' : undefined,
            }}
          >
            {option}ms
          </button>
        ))}
      </div>
    </div>
  )
}
