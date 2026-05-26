import { useState } from 'react'
import { Heart, Sun, Leaf, Snowflake } from 'lucide-react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarBtn } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'StarBtn 按钮',
    desc: '阶梯断角像素风格按钮，使用独立 DOM 元素绘制边框和阶梯台阶，四角有明显的阶梯不连续过渡。支持季节主题、自定义颜色、图标按钮等。',
    toc: ['基础用法', '台阶级别', '季节主题', '自定义颜色', '图标按钮', '禁用与加载', '块级按钮', 'API'],
    demo: {
      basic: ['基础用法', '默认 1 级台阶，四角有明显的阶梯断角效果。'],
      steps: ['台阶级别', '通过 steps 属性控制每角的台阶数。宽按钮适合 2 级，方形按钮可展示 3 级。'],
      season: ['季节主题', '提供春、夏、秋、冬四种季节主题配色。'],
      color: ['自定义颜色', '通过 color 属性传入主色调，自动推导边框、文字、高光等颜色。'],
      icon: ['图标按钮', '通过 icon 属性传入图标，按钮自动切换为纵向布局。'],
      state: ['禁用与加载', '禁用状态变灰不可交互，加载状态显示像素风指示器。'],
      block: ['块级按钮', '块级按钮占满容器宽度。'],
    },
  },
  en: {
    title: 'StarBtn',
    desc: 'Stepped-corner pixel-style button with distinct staircase discontinuous transitions. Supports seasonal themes, custom color derivation, and icon buttons.',
    toc: ['Basic', 'Step Levels', 'Seasonal Themes', 'Custom Color', 'Icon Button', 'Disabled & Loading', 'Block', 'API'],
    demo: {
      basic: ['Basic', 'Default 1-level steps with distinct staircase corner cuts.'],
      steps: ['Step Levels', 'Control corner steps via the steps prop. Wide buttons suit 2 levels, square buttons can show 3.'],
      season: ['Seasonal Themes', 'Four seasonal color palettes: spring, summer, autumn, winter.'],
      color: ['Custom Color', 'Pass a primary color and border/text/highlight colors are auto-derived.'],
      icon: ['Icon Button', 'Pass an icon via the icon prop for a vertical stacked layout.'],
      state: ['Disabled & Loading', 'Disabled state grays out; loading state shows pixel-style indicator.'],
      block: ['Block', 'Block-level button fills the container width.'],
    },
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demo: Record<string, [string, string]> }>

const apiData = {
  zh: [
    { property: 'children', description: '按钮文字', type: 'ReactNode', default: '-' },
    { property: 'color', description: '主色调（自动推导其他颜色）', type: 'string', default: '#7a5c3a' },
    { property: 'theme', description: '季节主题', type: "'spring' | 'summer' | 'autumn' | 'winter'", default: '-' },
    { property: 'size', description: '按钮尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'steps', description: '台阶级别（实际台阶数=steps×2-1）', type: 'number', default: '1' },
    { property: 'icon', description: '图标元素', type: 'ReactNode', default: '-' },
    { property: 'loading', description: '是否加载中', type: 'boolean', default: 'false' },
    { property: 'block', description: '是否块级按钮', type: 'boolean', default: 'false' },
    { property: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' },
  ],
  en: [
    { property: 'children', description: 'Button label', type: 'ReactNode', default: '-' },
    { property: 'color', description: 'Primary color (others auto-derived)', type: 'string', default: '#7a5c3a' },
    { property: 'theme', description: 'Seasonal theme', type: "'spring' | 'summer' | 'autumn' | 'winter'", default: '-' },
    { property: 'size', description: 'Button size', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'steps', description: 'Step level (actual steps=steps×2-1)', type: 'number', default: '1' },
    { property: 'icon', description: 'Icon element', type: 'ReactNode', default: '-' },
    { property: 'loading', description: 'Loading state', type: 'boolean', default: 'false' },
    { property: 'block', description: 'Block-level button', type: 'boolean', default: 'false' },
    { property: 'disabled', description: 'Disabled state', type: 'boolean', default: 'false' },
  ],
}

function StarBtnDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [loading, setLoading] = useState(false)

  const handleLoadingClick = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const toc = t.toc.map((title: string, i: number) => ({
    id: ['basic', 'steps', 'season', 'color', 'icon', 'state', 'block', 'api'][i],
    title,
    level: 1,
  }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demo.basic[0]}
        description={t.demo.basic[1]}
        code={`<StarBtn>默认按钮</StarBtn>`}
      >
        <StarBtn>默认按钮</StarBtn>
      </StarComponentDemo>

      <StarComponentDemo
        id="steps"
        title={t.demo.steps[0]}
        description={t.demo.steps[1]}
        code={`<StarBtn steps={1}>1 级台阶</StarBtn>
<StarBtn steps={2}>2 级台阶</StarBtn>
<StarBtn steps={3} icon={<Heart />}>3 级台阶</StarBtn>`}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <StarBtn steps={1}>1 级台阶</StarBtn>
          <StarBtn steps={2}>2 级台阶</StarBtn>
          <StarBtn steps={3} icon={<Heart size={20} />}>3 级</StarBtn>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="season"
        title={t.demo.season[0]}
        description={t.demo.season[1]}
        code={`<StarBtn theme="spring">春天</StarBtn>
<StarBtn theme="summer">夏天</StarBtn>
<StarBtn theme="autumn">秋天</StarBtn>
<StarBtn theme="winter">冬天</StarBtn>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StarBtn theme="spring" icon={<Heart size={18} />}>春天</StarBtn>
          <StarBtn theme="summer" icon={<Sun size={18} />}>夏天</StarBtn>
          <StarBtn theme="autumn" icon={<Leaf size={18} />}>秋天</StarBtn>
          <StarBtn theme="winter" icon={<Snowflake size={18} />}>冬天</StarBtn>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="color"
        title={t.demo.color[0]}
        description={t.demo.color[1]}
        code={`<StarBtn color="#c62828">危险</StarBtn>
<StarBtn color="#2e7d32">成功</StarBtn>
<StarBtn color="#1565c0">信息</StarBtn>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StarBtn color="#c62828">危险</StarBtn>
          <StarBtn color="#2e7d32">成功</StarBtn>
          <StarBtn color="#1565c0">信息</StarBtn>
          <StarBtn color="#6a1b9a">紫色</StarBtn>
          <StarBtn color="#F5E6CC">浅色</StarBtn>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="icon"
        title={t.demo.icon[0]}
        description={t.demo.icon[1]}
        code={`<StarBtn icon={<Heart size={20} />}>收藏</StarBtn>
<StarBtn icon={<Sun size={20} />} theme="summer">晴朗</StarBtn>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StarBtn icon={<Heart size={20} />}>收藏</StarBtn>
          <StarBtn icon={<Sun size={20} />} theme="summer">晴朗</StarBtn>
          <StarBtn icon={<Leaf size={20} />} theme="autumn">丰收</StarBtn>
          <StarBtn icon={<Snowflake size={20} />} theme="winter">冰雪</StarBtn>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="state"
        title={t.demo.state[0]}
        description={t.demo.state[1]}
        code={`<StarBtn disabled>禁用</StarBtn>
<StarBtn loading>加载中</StarBtn>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StarBtn disabled>禁用按钮</StarBtn>
          <StarBtn disabled color="#c62828">禁用红色</StarBtn>
          <StarBtn loading>加载中</StarBtn>
          <StarBtn loading={loading} onClick={handleLoadingClick}>
            {loading ? '加载中...' : '点击加载'}
          </StarBtn>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="block"
        title={t.demo.block[0]}
        description={t.demo.block[1]}
        code={`<StarBtn block>块级按钮</StarBtn>`}
      >
        <StarBtn block>块级按钮</StarBtn>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarBtnDemoPage
