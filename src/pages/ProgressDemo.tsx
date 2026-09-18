import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarProgress } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: { title: 'Progress 进度条', desc: '像农场 HUD 一样显示体力、作物成熟度和建造进度，填充颜色可按状态自由替换。', toc: ['基础进度', '自定义颜色', '尺寸与标签', 'API'], demos: [['基础进度', '适合任务、采集或建造的完成比例。'], ['自定义颜色', '用不同颜色表达体力、危险和魔力等资源。'], ['尺寸与标签', '在紧凑 HUD 或信息面板中切换尺寸。']] },
  en: { title: 'Progress', desc: 'Farm-HUD progress for stamina, crop growth, and construction, with a configurable pixel fill color.', toc: ['Basic Progress', 'Custom Color', 'Sizes & Labels', 'API'], demos: [['Basic Progress', 'For quests, gathering, and construction completion.'], ['Custom Color', 'Map colors to stamina, danger, or magic resources.'], ['Sizes & Labels', 'Switch sizes between a compact HUD and information panel.']] },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][] }>

const apiData = {
  zh: [
    { property: 'value', description: '当前进度', type: 'number', default: '-' },
    { property: 'max', description: '满值', type: 'number', default: '100' },
    { property: 'color', description: '填充颜色', type: 'string', default: '#71964A' },
    { property: 'size', description: '条形尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'showLabel', description: '显示数值标签', type: 'boolean', default: 'false' },
  ],
  en: [
    { property: 'value', description: 'Current progress.', type: 'number', default: '-' },
    { property: 'max', description: 'Full value.', type: 'number', default: '100' },
    { property: 'color', description: 'Fill color.', type: 'string', default: '#71964A' },
    { property: 'size', description: 'Bar size.', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'showLabel', description: 'Shows a numeric label.', type: 'boolean', default: 'false' },
  ],
}

function StarProgressDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'color', 'size', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]} code={'<StarProgress value={68} />'}>
        <StarProgress value={68} />
      </StarComponentDemo>
      <StarComponentDemo id="color" title={t.demos[1][0]} description={t.demos[1][1]} code={'<StarProgress value={42} color="#D9899A" />'}>
        <div style={{ display: 'grid', width: 'min(100%, 440px)', gap: 12 }}>
          <StarProgress value={82} color="#71964A" />
          <StarProgress value={42} color="#D9899A" />
          <StarProgress value={28} color="#7699B5" />
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="size" title={t.demos[2][0]} description={t.demos[2][1]} code={'<StarProgress value={48} size="large" showLabel />'}>
        <div style={{ display: 'grid', width: 'min(100%, 440px)', gap: 14 }}>
          <StarProgress value={35} size="small" showLabel />
          <StarProgress value={64} showLabel />
          <StarProgress value={88} size="large" showLabel />
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Progress API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarProgressDemoPage
