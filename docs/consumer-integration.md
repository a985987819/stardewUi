# 接入指南

`stardew-valley-ui` 是面向 React 18+ 的组件库。其公开入口为根模块与样式子路径：

```tsx
import { StarCard, StarNineSliceButton } from 'stardew-valley-ui'
import 'stardew-valley-ui/style.css'
```

## 安装

```bash
npm install stardew-valley-ui
# 或 bun add / pnpm add / yarn add stardew-valley-ui
```

React 与 ReactDOM 是 peer dependency，需由业务项目安装。样式只应在应用全局入口加载一次；组件使用 CSS Modules，不会注册全局组件选择器。

## 素材与部署

默认按钮、季节按钮、日历背景、加载动画及空状态图片都在库构建时随库产物嵌入或作为 Vite 资产发出。无论构建表示如何，使用方都不必复制或配置这些内置素材。

自定义图片 URL（例如 `backgroundSrc`、`imageSrc`、`src`）由业务项目负责。Vite 中优先传静态导入 URL，避免 base path、CDN 或 hash 更新导致的相对路径问题：

```tsx
import panelTexture from './assets/panel-texture.png'

<StarNineSliceButton backgroundSrc={panelTexture}>保存</StarNineSliceButton>
```

## SSR 与客户端边界

纯展示组件可参与服务端渲染。以下能力会在挂载后访问浏览器 API：画布背景、`StarLoading`、`StarDivider`、`StarDialog`、`message`、`useClipboard`、`useLocalStorage` 与 `useNineSliceBackground`。在 Next.js / RSC 中，请在含有这些组件或 Hooks 的最小交互边界添加：

```tsx
'use client'
```

`message(...)` 是命令式 API，应只从事件处理器、effect 或其他浏览器端逻辑调用，不能在组件 render 或服务端代码中调用。

## 构建与发布维护者检查

```bash
bun run build:lib
bun run verify:package
```

第二条命令校验 ESM、CommonJS、类型、样式子路径和内置素材是否都存在，并拒绝把演示站专用 `/stardewUi/` 资源路径带进 npm 包。
