import CodeBlock from '../components/layout/CodeBlock'
import './Guide.css'

const installCode = `npm install stardew-valley-ui
# 或
yarn add stardew-valley-ui
# 或
pnpm add stardew-valley-ui`

const usageCode = `import { Button } from 'stardew-valley-ui'

function App() {
  return <Button>Hello World</Button>
}`

const viteConfigCode = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
})`

function Guide() {
  return (
    <div className="guide-section">
      <h2>安装</h2>
      <p>使用 npm、yarn 或 pnpm 安装组件库：</p>
      <CodeBlock code={installCode} language="bash" />

      <h2>使用</h2>
      <p>在你的项目中引入并使用组件：</p>
      <CodeBlock code={usageCode} language="tsx" />

      <h2>配置</h2>
      <p>如果你使用 Vite，请确保正确配置 PostCSS：</p>
      <CodeBlock code={viteConfigCode} language="ts" />

      <h2>特性</h2>
      <ul>
        <li>基于 React 18 开发</li>
        <li>完整的 TypeScript 类型支持</li>
        <li>支持暗黑模式</li>
        <li>可定制的主题</li>
        <li>轻量级，无依赖</li>
      </ul>
    </div>
  )
}

export default Guide
