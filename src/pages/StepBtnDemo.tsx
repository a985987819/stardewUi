import { useState } from 'react'
import { Zap } from 'lucide-react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarStepBtn } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'StarStepBtn 阶梯按钮',
    desc: '纯 CSS 实现的阶梯断角像素风格按钮，参考缺口边框组件实现方式，四角有明显的阶梯不连续过渡。支持季节主题、颜色推导、图标按钮。',
    toc: ['基础用法', '台阶级别', '季节主题', '自定义颜色', '图标按钮', '禁用状态', '加载状态', '块级按钮', 'API'],
    demo: {
      basic: ['基础用法', '默认 1 级台阶，四角有明显的阶梯断角效果。'],
      steps: ['台阶级别', '通过 steps 属性控制每角的台阶数。普通按钮比例下 2 级已是极限，3 级需更趋近方形的按钮。'],
      theme: ['季节主题', '提供春夏秋冬四种季节主题配色。'],
      color: ['自定义颜色', '通过 color 属性传入主色调，自动推导边框、hover、active 和文字颜色。'],
      icon: ['图标按钮', '通过 icon 属性传入图标元素。'],
      disabled: ['禁用状态', '禁用状态下按钮变为不可交互，颜色变灰。'],
      loading: ['加载状态', '加载状态下按钮显示像素风加载指示器，同时禁用交互。'],
      block: ['块级按钮', '块级按钮占满容器宽度。'],
    },
  },
  en: {
    title: 'StarStepBtn',
    desc: 'Pure CSS stepped-corner pixel-style button with distinct staircase transitions. Supports seasonal themes, color derivation, and icon buttons.',
    toc: ['Basic', 'Step Levels', 'Seasonal Themes', 'Custom Color', 'Icon Button', 'Disabled', 'Loading', 'Block', 'API'],
    demo: {
      basic: ['Basic', 'Default 1-level steps with distinct staircase corner cuts.'],
      steps: ['Step Levels', 'Control corner steps via the steps prop. 2 levels is the limit for typical button proportions; 3 levels requires a squarer shape.'],
      theme: ['Seasonal Themes', 'Four seasonal color themes: spring, summer, autumn, winter.'],
      color: ['Custom Color', 'Pass a primary color and border/hover/active/text colors are derived automatically.'],
      icon: ['Icon Button', 'Pass an icon element via the icon prop.'],
      disabled: ['Disabled', 'Non-interactive with grayed-out colors.'],
      loading: ['Loading', 'Shows a pixel-style loading indicator and disables interaction.'],
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
    { property: 'steps', description: '台阶级别（实际台阶数 = steps×2-1）', type: 'number', default: '1' },
    { property: 'icon', description: '图标元素', type: 'ReactNode', default: '-' },
    { property: 'loading', description: '是否加载中', type: 'boolean', default: 'false' },
    { property: 'block', description: '是否块级按钮', type: 'boolean', default: 'false' },
    { property: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' },
  ],
  en: [
    { property: 'children', description: 'Button text', type: 'ReactNode', default: '-' },
    { property: 'color', description: 'Primary color (others derived)', type: 'string', default: '#7a5c3a' },
    { property: 'theme', description: 'Seasonal theme', type: "'spring' | 'summer' | 'autumn' | 'winter'", default: '-' },
    { property: 'size', description: 'Button size', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'steps', description: 'Step level (actual steps = steps×2-1)', type: 'number', default: '1' },
    { property: 'icon', description: 'Icon element', type: 'ReactNode', default: '-' },
    { property: 'loading', description: 'Loading state', type: 'boolean', default: 'false' },
    { property: 'block', description: 'Block-level button', type: 'boolean', default: 'false' },
    { property: 'disabled', description: 'Disabled state', type: 'boolean', default: 'false' },
  ],
}

function StarStepBtnDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [loading, setLoading] = useState(false)

  const handleLoadingClick = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const toc = t.toc.map((title: string, i: number) => ({
    id: ['basic', 'steps', 'theme', 'color', 'icon', 'disabled', 'loading', 'block', 'api'][i],
    title,
    level: 1,
  }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demo.basic[0]}
        description={t.demo.basic[1]}
        code={`<StarStepBtn>默认按钮</StarStepBtn>`}
      >
        <StarStepBtn>默认按钮</StarStepBtn>
      </StarComponentDemo>

      <StarComponentDemo
        id="steps"
        title={t.demo.steps[0]}
        description={t.demo.steps[1]}
        code={`<StarStepBtn steps={1}>1 级台阶</StarStepBtn>
<StarStepBtn steps={2}>2 级台阶</StarStepBtn>
<StarStepBtn steps={3} style={{ minWidth: 120, minHeight: 80 }}>3 级台阶</StarStepBtn>`}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <StarStepBtn steps={1}>1 级台阶</StarStepBtn>
          <StarStepBtn steps={2}>2 级台阶</StarStepBtn>
          <StarStepBtn steps={3} style={{ minWidth: 120, minHeight: 80 }}>3 级台阶</StarStepBtn>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="theme"
        title={t.demo.theme[0]}
        description={t.demo.theme[1]}
        code={`<StarStepBtn theme="spring">春天</StarStepBtn>
<StarStepBtn theme="summer">夏天</StarStepBtn>
<StarStepBtn theme="autumn">秋天</StarStepBtn>
<StarStepBtn theme="winter">冬天</StarStepBtn>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StarStepBtn theme="spring">春天</StarStepBtn>
          <StarStepBtn theme="summer">夏天</StarStepBtn>
          <StarStepBtn theme="autumn">秋天</StarStepBtn>
          <StarStepBtn theme="winter">冬天</StarStepBtn>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="color"
        title={t.demo.color[0]}
        description={t.demo.color[1]}
        code={`<StarStepBtn color="#c62828">危险</StarStepBtn>
<StarStepBtn color="#2e7d32">成功</StarStepBtn>
<StarStepBtn color="#1565c0">信息</StarStepBtn>
<StarStepBtn color="#6a1b9a">紫色</StarStepBtn>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StarStepBtn color="#c62828">危险</StarStepBtn>
          <StarStepBtn color="#2e7d32">成功</StarStepBtn>
          <StarStepBtn color="#1565c0">信息</StarStepBtn>
          <StarStepBtn color="#6a1b9a">紫色</StarStepBtn>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="icon"
        title={t.demo.icon[0]}
        description={t.demo.icon[1]}
        code={`<StarStepBtn icon={<Zap size={16} />}>闪电</StarStepBtn>
<StarStepBtn icon={<Zap size={16} />} theme="summer" />
<StarStepBtn icon={<Zap size={16} />} color="#c62828" />`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <StarStepBtn icon={<Zap size={16} />}>闪电</StarStepBtn>
          <StarStepBtn icon={<Zap size={16} />} theme="summer" />
          <StarStepBtn icon={<Zap size={16} />} color="#c62828" />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="disabled"
        title={t.demo.disabled[0]}
        description={t.demo.disabled[1]}
        code={`<StarStepBtn disabled>禁用按钮</StarStepBtn>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StarStepBtn disabled>禁用按钮</StarStepBtn>
          <StarStepBtn disabled color="#c62828">禁用红色</StarStepBtn>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="loading"
        title={t.demo.loading[0]}
        description={t.demo.loading[1]}
        code={`<StarStepBtn loading>加载中</StarStepBtn>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StarStepBtn loading>加载中</StarStepBtn>
          <StarStepBtn loading={loading} onClick={handleLoadingClick}>
            {loading ? '加载中...' : '点击加载'}
          </StarStepBtn>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="block"
        title={t.demo.block[0]}
        description={t.demo.block[1]}
        code={`<StarStepBtn block>块级按钮</StarStepBtn>`}
      >
        <StarStepBtn block>块级按钮</StarStepBtn>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarStepBtnDemoPage
