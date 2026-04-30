import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { PixelButton } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'PixelButton 像素按钮',
    desc: '锯齿边框的像素风格按钮，支持自定义背景、文字、边框和阴影颜色，适合复古游戏风格的交互场景。',
    toc: ['基础用法', '自定义颜色', '不同主题', '禁用状态', 'API'],
    demo: {
      basic: ['基础用法', '默认样式的像素按钮，带有锯齿边框和立体阴影效果。'],
      custom: ['自定义颜色', '通过 props 自由控制按钮的各个颜色属性。'],
      theme: ['不同主题', '适合不同场景的主题配色方案。'],
      disabled: ['禁用状态', '禁用状态下按钮变为不可交互，透明度降低。'],
    },
  },
  en: {
    title: 'PixelButton',
    desc: 'Pixel-style button with锯齿边框, supporting custom background, text, border and shadow colors for retro game-style interactions.',
    toc: ['Basic Usage', 'Custom Colors', 'Themes', 'Disabled State', 'API'],
    demo: {
      basic: ['Basic Usage', 'Default pixel button with锯齿边框 and 3D shadow effects.'],
      custom: ['Custom Colors', 'Control each color property freely through props.'],
      theme: ['Themes', 'Color schemes suitable for different scenes.'],
      disabled: ['Disabled State', 'Button becomes non-interactive with reduced opacity when disabled.'],
    },
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demo: Record<string, [string, string]> }>

const apiData = {
  zh: [
    { property: 'bgColor', description: '按钮背景色', type: 'string', default: '#ffffff' },
    { property: 'textColor', description: '文字颜色', type: 'string', default: '#c2c2c2' },
    { property: 'borderColor', description: '锯齿边框颜色', type: 'string', default: '#f52424' },
    { property: 'shadowColor', description: '底部阴影颜色', type: 'string', default: '#a8a8a8' },
    { property: 'children', description: '按钮内容', type: 'ReactNode', default: '-' },
    { property: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' },
  ],
  en: [
    { property: 'bgColor', description: 'Button background color', type: 'string', default: '#ffffff' },
    { property: 'textColor', description: 'Text color', type: 'string', default: '#c2c2c2' },
    { property: 'borderColor', description: 'Jagged border color', type: 'string', default: '#f52424' },
    { property: 'shadowColor', description: 'Bottom shadow color', type: 'string', default: '#a8a8a8' },
    { property: 'children', description: 'Button content', type: 'ReactNode', default: '-' },
    { property: 'disabled', description: 'Whether disabled', type: 'boolean', default: 'false' },
  ],
}

const basicCode = `<PixelButton>默认按钮</PixelButton>`

const customCode = `<!-- 暖色系 -->
<PixelButton
  bgColor="#ffe0b2"
  textColor="#8b4513"
  borderColor="#d7770f"
  shadowColor="#ffb74d"
>
  确认
</PixelButton>

<!-- 冷色系 -->
<PixelButton
  bgColor="#e3f2fd"
  textColor="#1565c0"
  borderColor="#1976d2"
  shadowColor="#90caf9"
>
  信息
</PixelButton>`

const themeCode = `<!-- 警告主题 -->
<PixelButton
  bgColor="#fff3e0"
  textColor="#e65100"
  borderColor="#f57c00"
  shadowColor="#ffcc80"
>
  警告
</PixelButton>

<!-- 危险主题 -->
<PixelButton
  bgColor="#ffebee"
  textColor="#c62828"
  borderColor="#d32f2f"
  shadowColor="#ef9a9a"
>
  删除
</PixelButton>

<!-- 成功主题 -->
<PixelButton
  bgColor="#e8f5e9"
  textColor="#2e7d32"
  borderColor="#388e3c"
  shadowColor="#a5d6a7"
>
  成功
</PixelButton>`

const disabledCode = `<PixelButton disabled>禁用按钮</PixelButton>`

function StarPixelButtonDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title: string, i: number) => ({
    id: ['basic', 'custom', 'theme', 'disabled', 'api'][i],
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
        <PixelButton>默认按钮</PixelButton>
      </StarComponentDemo>

      <StarComponentDemo
        id="custom"
        title={t.demo.custom[0]}
        description={t.demo.custom[1]}
        code={customCode}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <PixelButton
            bgColor="#ffe0b2"
            textColor="#8b4513"
            borderColor="#d7770f"
            shadowColor="#ffb74d"
          >
            确认
          </PixelButton>
          <PixelButton
            bgColor="#e3f2fd"
            textColor="#1565c0"
            borderColor="#1976d2"
            shadowColor="#90caf9"
          >
            信息
          </PixelButton>
          <PixelButton
            bgColor="#f3e5f5"
            textColor="#6a1b9a"
            borderColor="#8e24aa"
            shadowColor="#ce93d8"
          >
            紫色
          </PixelButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="theme"
        title={t.demo.theme[0]}
        description={t.demo.theme[1]}
        code={themeCode}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <PixelButton
            bgColor="#fff3e0"
            textColor="#e65100"
            borderColor="#f57c00"
            shadowColor="#ffcc80"
          >
            警告
          </PixelButton>
          <PixelButton
            bgColor="#ffebee"
            textColor="#c62828"
            borderColor="#d32f2f"
            shadowColor="#ef9a9a"
          >
            删除
          </PixelButton>
          <PixelButton
            bgColor="#e8f5e9"
            textColor="#2e7d32"
            borderColor="#388e3c"
            shadowColor="#a5d6a7"
          >
            成功
          </PixelButton>
          <PixelButton
            bgColor="#e0f7fa"
            textColor="#00838f"
            borderColor="#00acc1"
            shadowColor="#80deea"
          >
            提示
          </PixelButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="disabled"
        title={t.demo.disabled[0]}
        description={t.demo.disabled[1]}
        code={disabledCode}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <PixelButton disabled>禁用按钮</PixelButton>
          <PixelButton
            disabled
            bgColor="#ffe0b2"
            textColor="#8b4513"
            borderColor="#d7770f"
            shadowColor="#ffb74d"
          >
            禁用样式
          </PixelButton>
        </div>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarPixelButtonDemoPage
