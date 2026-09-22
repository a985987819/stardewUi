# 接入指南

`stardew-valley-ui` 是面向 React 18+ 的组件库。公开入口有四个：

| 子路径 | 内容 |
| --- | --- |
| `stardew-valley-ui` | 组件、Hooks、工具函数与类型（不含样式） |
| `stardew-valley-ui/style.css` | 聚合样式表 |
| `stardew-valley-ui/auto` | 与根入口等价的导出，**并在加载时自动注入样式** |
| `stardew-valley-ui/style.css` 之外的类型 | 所有 Props 类型均可从根入口 `import type` |

## 安装

```bash
npm install stardew-valley-ui
# 或 bun add / pnpm add / yarn add stardew-valley-ui
```

React 与 ReactDOM 是 peer dependency，需由业务项目安装。

## 样式引入方式

两种方式**任选其一**，不要都写：

### 方式一：显式引入样式（推荐）

```tsx
// main.tsx / app/layout.tsx
import 'stardew-valley-ui/style.css'
import { StarCard } from 'stardew-valley-ui'
```

- 样式进入宿主项目的构建产物，服务端渲染的首屏就有样式，不会闪烁
- 不依赖 `style-src 'unsafe-inline'`，对严格 CSP 友好
- 支持把样式单独抽成文件、按需延迟加载或做资源指纹

### 方式二：自动注入入口

```tsx
import { StarCard } from 'stardew-valley-ui/auto'
```

导入 `stardew-valley-ui/auto` 即等价于「导入根入口 + 注入样式」：模块加载时会创建
`<style id="stardew-valley-ui-styles" data-stardew-valley-ui="styles">` 并写入聚合样式表。

取舍：

| | 显式 `style.css` | `auto` 入口 |
| --- | --- | --- |
| 代码量 | 多一行 import | 少一行 |
| SSR / SSG 首屏 | 无闪烁 | 样式在客户端注入，可能出现短暂无样式 |
| CSP | 无需 `unsafe-inline` | 需要 `style-src 'unsafe-inline'` |
| 样式落点 | 宿主构建产物 | 运行时 `<style>` |
| 适用 | Next.js / RSC / 企业 CSP 限制项目 | 纯客户端应用（Vite / CRA 等） |

> **两者可以共存但没必要**：注入前会检查页面上是否已存在样式表（通过 `:root { --stardew-valley-ui-styles: 1 }`
> 这个哨兵变量探测），因此即便项目里同时存在 `import 'stardew-valley-ui/style.css'` 与 `/auto` 入口，
> 也只会加载一份 CSS。重复导入 `/auto` 同样只注入一次。
>
> SSR 环境（没有 `document`）下 `/auto` 会静默跳过注入，不会抛错。

无论用哪种方式，组件内部类名都使用 CSS Modules，**不会**向宿主项目写入全局组件选择器。

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

## 维护者：构建与发布检查

```bash
bun run build:lib
bun run verify:package
```

第二条命令校验 ESM、CommonJS、类型、`./style.css` 与 `./auto` 五个出口是否都存在、样式是否已内嵌进 `/auto` 入口，并拒绝把演示站专用 `/stardewUi/` 资源路径带进 npm 包。

发布到 npm 的完整步骤（令牌配置、版本号、发布后核验、报错对照）见 [publishing.md](publishing.md)。
