import StarCodeBlock from '../components/layout/CodeBlock'
import styles from './Guide.module.scss'

const installCode = `npm install stardew-valley-ui
# 或
yarn add stardew-valley-ui
# 或
pnpm add stardew-valley-ui`

const usageCode = `import { StarNineSliceButton } from 'stardew-valley-ui'

function App() {
  return <StarNineSliceButton>Hello World</StarNineSliceButton>
}`

const viteConfigCode = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
})`

function StarGuidePage() {
  return (
    <div className={styles['guide-section']}>
      <h2>安装</h2>
      <p>使用 npm、yarn 或 pnpm 安装组件库：</p>
      <StarCodeBlock code={installCode} language="bash" />

      <h2>使用</h2>
      <p>在你的项目中导入并使用组件：</p>
      <StarCodeBlock code={usageCode} language="tsx" />

      <h2>配置</h2>
      <p>如果你使用 Vite，请确保正确配置 PostCSS：</p>
      <StarCodeBlock code={viteConfigCode} language="ts" />

      <h2>特性</h2>
      <ul>
        <li>基于 React 开发</li>
        <li>完整的 TypeScript 类型支持</li>
        <li>支持像素风主题定制</li>
        <li>提供多种可复用基础组件</li>
        <li>适合文档站和游戏风格界面</li>
      </ul>
    </div>
  )
}

export default StarGuidePage
