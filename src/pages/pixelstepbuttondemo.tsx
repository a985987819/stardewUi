import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { PixelStepButton } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'PixelStepButton 阶梯断角按钮',
    desc: '参考缺口边框组件实现方式，使用独立 DOM 元素绘制边框和阶梯台阶，四角有明显的阶梯不连续过渡。支持默认、禁用和加载状态。',
    toc: ['基础用法', '台阶级别', '不同尺寸', '自定义颜色', '禁用状态', '加载状态', '块级按钮', 'API'],
    demo: {
      basic: ['基础用法', '默认 1 级台阶，四角有明显的阶梯断角效果。'],
      steps: ['台阶级别', '通过 steps 属性控制每角的台阶数。steps=1 为 1 级台阶，steps=2 为 3 级台阶，steps=3 为 5 级台阶。'],
      size: ['不同尺寸', '提供 small、medium、large 三种尺寸。'],
      color: ['自定义颜色', '通过 color 属性自定义按钮主色调。'],
      disabled: ['禁用状态', '禁用状态下按钮变为不可交互，颜色变灰。'],
      loading: ['加载状态', '加载状态下按钮显示像素风加载指示器，同时禁用交互。'],
      block: ['块级按钮', '块级按钮占满容器宽度。'],
    },
  },
  en: {
    title: 'PixelStepButton',
    desc: 'Stepped-corner pixel-style button built with independent DOM elements for borders and corner steps, creating distinct staircase discontinuous transitions at all four corners.',
    toc: ['Basic Usage', 'Step Levels', 'Sizes', 'Custom Color', 'Disabled State', 'Loading State', 'Block Button', 'API'],
    demo: {
      basic: ['Basic Usage', 'Default 1-level steps with distinct staircase corner cuts.'],
      steps: ['Step Levels', 'Control the number of corner steps via the steps prop. steps=1 gives 1 step, steps=2 gives 3 steps, steps=3 gives 5 steps.'],
      size: ['Sizes', 'Available in small, medium, and large sizes.'],
      color: ['Custom Color', 'Customize the primary color via the color prop.'],
      disabled: ['Disabled State', 'Button becomes non-interactive with grayed-out colors when disabled.'],
      loading: ['Loading State', 'Shows a pixel-style loading indicator and disables interaction.'],
      block: ['Block Button', 'Block-level button fills the container width.'],
    },
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demo: Record<string, [string, string]> }>

const apiData = {
  zh: [
    { property: 'children', description: '按钮内容', type: 'ReactNode', default: '-' },
    { property: 'color', description: '按钮主色调', type: 'string', default: '#7a5c3a' },
    { property: 'size', description: '按钮尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'steps', description: '台阶级别（实际台阶数 = steps×2-1）', type: 'number', default: '1' },
    { property: 'loading', description: '是否加载中', type: 'boolean', default: 'false' },
    { property: 'block', description: '是否块级按钮', type: 'boolean', default: 'false' },
    { property: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' },
  ],
  en: [
    { property: 'children', description: 'Button content', type: 'ReactNode', default: '-' },
    { property: 'color', description: 'Primary color', type: 'string', default: '#7a5c3a' },
    { property: 'size', description: 'Button size', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'steps', description: 'Step level (actual steps = steps×2-1)', type: 'number', default: '1' },
    { property: 'loading', description: 'Loading state', type: 'boolean', default: 'false' },
    { property: 'block', description: 'Block-level button', type: 'boolean', default: 'false' },
    { property: 'disabled', description: 'Disabled state', type: 'boolean', default: 'false' },
  ],
}

const basicCode = `<PixelStepButton>默认按钮</PixelStepButton>`
const stepsCode = `<PixelStepButton steps={1}>1 级台阶</PixelStepButton>
<PixelStepButton steps={2}>2 级台阶</PixelStepButton>
<PixelStepButton steps={3}>3 级台阶</PixelStepButton>`
const sizeCode = `<PixelStepButton size="small">小号</PixelStepButton>
<PixelStepButton size="medium">中号</PixelStepButton>
<PixelStepButton size="large">大号</PixelStepButton>`
const colorCode = `<PixelStepButton color="#c62828">危险</PixelStepButton>
<PixelStepButton color="#2e7d32">成功</PixelStepButton>
<PixelStepButton color="#1565c0">信息</PixelStepButton>`
const disabledCode = `<PixelStepButton disabled>禁用按钮</PixelStepButton>`
const loadingCode = `<PixelStepButton loading>加载中</PixelStepButton>`
const blockCode = `<PixelStepButton block>块级按钮</PixelStepButton>`

function StarPixelStepButtonDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [loading, setLoading] = useState(false)

  const handleLoadingClick = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const toc = t.toc.map((title: string, i: number) => ({
    id: ['basic', 'steps', 'size', 'color', 'disabled', 'loading', 'block', 'api'][i],
    title,
    level: 1,
  }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demo.basic[0]}
        description={t.demo.basic[1]}
        code={basicCode}
      >
        <PixelStepButton>默认按钮</PixelStepButton>
      </StarComponentDemo>

      <StarComponentDemo
        id="steps"
        title={t.demo.steps[0]}
        description={t.demo.steps[1]}
        code={stepsCode}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <PixelStepButton steps={1}>1 级台阶</PixelStepButton>
          <PixelStepButton steps={2}>2 级台阶</PixelStepButton>
          <PixelStepButton steps={3}>3 级台阶</PixelStepButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="size"
        title={t.demo.size[0]}
        description={t.demo.size[1]}
        code={sizeCode}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <PixelStepButton size="small">小号</PixelStepButton>
          <PixelStepButton size="medium">中号</PixelStepButton>
          <PixelStepButton size="large">大号</PixelStepButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="color"
        title={t.demo.color[0]}
        description={t.demo.color[1]}
        code={colorCode}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <PixelStepButton color="#c62828">危险</PixelStepButton>
          <PixelStepButton color="#2e7d32">成功</PixelStepButton>
          <PixelStepButton color="#1565c0">信息</PixelStepButton>
          <PixelStepButton color="#6a1b9a">紫色</PixelStepButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="disabled"
        title={t.demo.disabled[0]}
        description={t.demo.disabled[1]}
        code={disabledCode}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <PixelStepButton disabled>禁用按钮</PixelStepButton>
          <PixelStepButton disabled color="#c62828">禁用红色</PixelStepButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="loading"
        title={t.demo.loading[0]}
        description={t.demo.loading[1]}
        code={loadingCode}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <PixelStepButton loading>加载中</PixelStepButton>
          <PixelStepButton loading={loading} onClick={handleLoadingClick}>
            {loading ? '加载中...' : '点击加载'}
          </PixelStepButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="block"
        title={t.demo.block[0]}
        description={t.demo.block[1]}
        code={blockCode}
      >
        <PixelStepButton block>块级按钮</PixelStepButton>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarPixelStepButtonDemoPage
