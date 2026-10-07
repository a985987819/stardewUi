# Stardew Valley UI

[![npm version](https://img.shields.io/npm/v/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![npm downloads](https://img.shields.io/npm/dm/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![types](https://img.shields.io/npm/types/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![license](https://img.shields.io/npm/l/stardew-valley-ui.svg)](https://github.com/a985987819/stardewUi/blob/main/LICENSE)
[![English](https://img.shields.io/badge/README-English-1a1a1a?style=flat-square&logo=github)](README.md)
[![中文](https://img.shields.io/badge/README-%E4%B8%AD%E6%96%87-1a1a1a?style=flat-square&logo=github)](README_ZH.md)

> 🐣 32 个组件 · 样式入口二选一 · 零运行时配置 · ESM / CJS / 类型声明齐全

一个 **星露谷风格、像素化的 React 组件库**，基于 React、TypeScript 与 Vite 构建。
它既包含可组合的 UI 组件，也提供日期、画布九宫格和像素形状等工具函数。

不只是「把按钮换成像素图」—— 木框的阶梯缺口、羊皮纸的凹陷、进度格的逐格填充、
对话框背后骤然缩小柔化的农场，都是按星露谷的界面语言一帧一帧画进 Canvas 与
九宫格切片里的。**装上它，你的 React 项目就长出一座农场。**

```tsx
import { StarCard, StarNineSliceButton, StarDialog, message } from 'stardew-valley-ui'
import 'stardew-valley-ui/style.css'

function App() {
  const [open, setOpen] = useState(false)
  return (
    <StarCard title="皮埃尔的杂货铺" showTitle>
      <StarNineSliceButton variant="primary" onClick={() => setOpen(true)}>
        看看今天卖什么
      </StarNineSliceButton>
      <StarDialog
        open={open}
        title="皮埃尔"
        content="雨要下大了。把这包防风的种子带走吧，春天可不等人。"
        onClose={() => setOpen(false)}
      />
    </StarCard>
  )
}
```

在线演示站（每个组件都有可交互示例与完整 API 表）：
**<https://a985987819.github.io/stardewUi/?lang=zh>**

**English** | [中文](README_ZH.md) · **反馈问题**：[新建 Issue](https://github.com/a985987819/stardewUi/issues/new/choose)

---

## 它能给你什么

| | |
| --- | --- |
| 🧩 **32 个组件** | 表单、浮层、日期、导航、反馈全覆盖，全部支持受控与非受控 |
| 🎨 **Canvas 像素渲染** | 标题、像素文本、九宫格按钮由 Canvas 逐像素绘制，不是模糊滤镜 |
| ♿ **无障碍内建** | 焦点陷阱、Esc 关闭、`aria-modal`、键盘可达不是可选项 |
| 🏗️ **零配置** | 像素素材随包发布，不需要往 `public/` 拷任何文件 |
| 📦 **双格式** | ESM + CommonJS + 完整类型声明 |
| 🪄 **样式两选一** | 显式 `style.css`（适合 SSR）或 `/auto` 自动注入（适合纯客户端） |
| 🤖 **Agent 友好** | 内置可安装 Skill，让 AI Agent 按真实 API 写，不靠猜 |

---

## 安装

一条命令，用哪个包管理器都行：

```bash
npm install stardew-valley-ui     # 或：bun add / pnpm add / yarn add
```

安装到此为止。React >= 18 是唯一的对等依赖；`clsx` 和 `lucide-react` 会自动装好，
不用手动添加，也不用往 `public/` 拷任何文件。

> 从 **0.2.x 升级**请先读[迁移指南](docs/migration-0.3.md)：`visible` 已统一为 `open`，
> `color` 的预设名单独走 `tone` / `surface`。

---

## 快速开始

### 1. 引入样式

在应用的全局入口引入一次样式（**推荐**：样式进入宿主项目的构建产物，SSR 首屏不闪烁）：

```tsx
import 'stardew-valley-ui/style.css'
```

如果不想多写这一行，改用带**自动注入**的入口即可，组件导入写法完全一致：

```tsx
import { StarCard, StarNineSliceButton } from 'stardew-valley-ui/auto'
// 样式会在模块加载时注入到 <style>，无需再 import css
```

两条路径**只选一条**，取舍见[接入指南](docs/consumer-integration.md)。

### 2. 使用组件

```tsx
import { useState } from 'react'
import { StarCard, StarNineSliceButton, StarDialog, message } from 'stardew-valley-ui'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <StarCard title="欢迎来到星露谷" showTitle>
      <StarNineSliceButton variant="primary" onClick={() => setOpen(true)}>
        打开对话框
      </StarNineSliceButton>

      <StarDialog
        open={open}
        title="皮埃尔"
        content="欢迎来到我的商店！"
        onClose={() => setOpen(false)}
        actions={[
          { text: '再想想', variant: 'secondary', onClick: () => setOpen(false) },
          { text: '成交', variant: 'primary', onClick: () => message.success('已送达！') },
        ]}
      />
    </StarCard>
  )
}
```

`message` 是命令式 API，可在任意位置调用，包括 React 渲染阶段之外。

---

## 在其他前端项目中使用

库内部类名使用 CSS Modules，不会向宿主项目写入全局组件样式，所以可以放心地和
Ant Design、Element Plus 等现有设计体系共存。

**自定义图片资源**：内置的默认按钮、季节按钮、日历背景、空状态和加载动画素材均随包发布，
安装即可用。传入 `backgroundSrc`、`imageSrc`、`src` 等自定义地址时，部署与缓存由宿主项目负责；
Vite 项目中推荐传入静态导入得到的 URL：

```tsx
import customButtonBackground from './assets/custom-button.png'
import { StarNineSliceButton } from 'stardew-valley-ui'

export function SaveButton() {
  return <StarNineSliceButton backgroundSrc={customButtonBackground}>保存</StarNineSliceButton>
}
```

**SSR / RSC 边界**：`StarDialog`、`message`、画布背景和浏览器存储 Hooks 会在客户端访问
DOM、Canvas 或 Storage。使用 Next.js、RSC 等 SSR 框架时，请将调用它们的交互组件标记为
客户端组件（`'use client'`）；不要在服务端渲染阶段调用 `message(...)`。

素材路径、样式入口取舍与发布检查清单见[接入指南](docs/consumer-integration.md)。

### 组件索引

| 分类 | 导出 |
| --- | --- |
| 容器与展示 | `StarCard`、`StarTitle`、`StarPixelText`、`StarDisplayFrame`、`StarDivider`、`StarAvatar`、`StarEmptyState`、`StarLoading`、`StarTag`、`StarBadge`、`StarCollapse`、`StarSkeleton`、`StarBackToTop` |
| 表单与操作 | `StarNineSliceButton`、`StarInput`、`StarTextarea`、`StarSwitch`、`StarRadio`、`StarCheckbox`、`StarSelect`、`StarRating`、`StarProgress` |
| 反馈与浮层 | `StarDialog`、`StarDrawer`、`StarPopup`、`message`、`StarTypewriter`、`StarAlert` |
| 日期与导航 | `StarCalendar`、`StarDatePicker`、`StarTab`、`StarPagination` |

Hooks（`useToggle`、`useClipboard`、`useLocalStorage`、`useNineSliceBackground`）、
工具函数（`classNames`、`copyToClipboard`、`resolveAssetPath`、像素形状与九宫格绘制）
和全部 Props 类型同样从根入口导出，类型以 `import type` 引入。

**完整的 Props 表在哪里？** 演示站每个组件页底部都有 API 表，双语对照、可直接对照示例验证。
从[组件总览](https://a985987819.github.io/stardewUi/components?lang=zh)进去，点任意组件即可。

本 README 不再重复维护逐组件的 Props 表——手写的表格会与真实的类型声明漂移，
而类型声明是唯一权威来源。

---

## 让 AI Agent 直接使用

仓库包含可安装的 [`stardew-valley-ui` Skill](skills/stardew-valley-ui/SKILL.md)，
供 Codex、Claude Code、Cursor 及其他支持 `SKILL.md` 的 Agent 按需读取。它把
「安装组件库 → 选择唯一的样式入口 → 按公开 API 实现 → 执行项目检查」收敛为一条
真实接入流程，避免 Agent 凭印象编造 Props。

**复制一行就行。** 选你的 Agent，粘贴，完成：

```bash
# Claude Code（用户级 —— 所有项目都能用）
mkdir -p ~/.claude/skills && git clone --depth 1 https://github.com/a985987819/stardewUi.git ~/.claude/skills/stardew-valley-ui

# Codex / 任何从项目目录读取 skills 的 Agent
git clone --depth 1 https://github.com/a985987819/stardewUi.git .agents/skills/stardew-valley-ui

# 或者装到全局，如果你的 Agent 有 skills CLI
skills add a985987819/stardewUi
```

不想装任何东西？把这段贴给你的 Agent 即可：

> 使用 `stardew-valley-ui` 这个 React 组件库。先安装它，在项目里
> **只引入一次** `stardew-valley-ui/style.css`，然后按公开 API 实现页面。
> Props 名称一律以已安装包的 `.d.ts` 为准，**不要凭印象猜**。

---

## 常见问题

<details>
<summary><b>装完之后样式全是乱的 / 没有生效？</b></summary>

99% 是样式没引入。库把样式放在独立的子路径导出里，需要你显式引一次：

```tsx
import 'stardew-valley-ui/style.css'
```

如果你用的是 `/auto` 入口，就不用再引这行——但要记得把导入源从 `stardew-valley-ui` 换成
`stardew-valley-ui/auto`。
</details>

<details>
<summary><b>Next.js 里报 <code>window is not defined</code> 或 hydration 不匹配？</b></summary>

`StarDialog`、`message`、画布类组件和存储 Hooks 会在客户端访问 DOM / Canvas / Storage。
把用到它们的组件标记为客户端组件：

```tsx
'use client'
import { StarDialog } from 'stardew-valley-ui'
```

同时 SSR 项目请用显式样式入口（`/style.css`），`/auto` 的样式是客户端才注入的，
首屏会短暂无样式并需要 CSP 放行 `unsafe-inline`。
</details>

<details>
<summary><b><code>&lt;StarTag color="green"&gt;</code> 为什么没变绿？</b></summary>

这是 0.3.0 的 breaking change：<code>color</code> 在全库统一只表示 **CSS 颜色**，
预设名单独走 `tone`（Tag）/ `surface`（Card）。所以要写：

```tsx
<StarTag tone="green">新鲜作物</StarTag>
<StarCard surface="night-village">夜之村庄</StarCard>
```

写错不会报错——`green` 不是合法 CSS 颜色，会被解析成别的颜色。完整清单见[迁移指南](docs/migration-0.3.md)。
</details>

<details>
<summary><b>控制台警告 <code>color 只接受 hex</code>？</b></summary>

`StarProgress`、`StarDivider`、`StarSwitch` 等组件的调色板要靠解析 RGB 来推导描边、
高光和阴影，所以 `color` **只接受 3/6 位 hex**（`#fff`、`#7a9c48`）。
`red`、`var(--brand)` 这类写法现在会在开发期告警——请换成 hex。
</details>

<details>
<summary><b>演示站怎么指定语言？</b></summary>

地址栏加参数即可：<https://a985987819.github.io/stardewUi/?lang=en> 或 `?lang=zh`。
参数优先于浏览器里记住的选择，所以链接可以直接分享给别人；不带参数时沿用你上次的语言，
首次访问默认中文。顶栏的地球图标会在切换时顺手改写这个参数，站内跳转也会保留它。
</details>

<details>
<summary><b>包体为什么有 4MB？</b></summary>

绝大部分是**内联的像素素材**（按钮、季节主题、日历背景、空状态、加载动画）。
换来的是零配置：不用往 `public/` 拷文件、不用配 CDN、图片路径不会因为部署目录而失效。
真正的 JS 逻辑约 100 个导出，gzip 后远小于总体积。
</details>

<details>
<summary><b>能用在商业项目里吗？</b></summary>

能。本项目是 **MIT 许可**——可以商用、可以闭源、可以放进收费产品里，
唯一的条件是保留版权声明与许可文本。完整条款见根目录 [LICENSE](LICENSE)。

本项目与《星露谷物语》开发商无任何关联或背书，也不包含其任何素材。
</details>

---

## 目录

- [它能给你什么](#它能给你什么) · [安装](#安装) · [快速开始](#快速开始) · [在其他前端项目中使用](#在其他前端项目中使用)
- [让 AI Agent 直接使用](#让-ai-agent-直接使用) · [常见问题](#常见问题)
- [说点什么吧](#说点什么吧真的什么都行) · [请我喝杯咖啡](#请我喝杯咖啡-) · [版权说明](#版权说明) · [致谢](#致谢)

### 延伸文档

| 文档 | 内容 |
| --- | --- |
| [接入指南](docs/consumer-integration.md) | 样式入口选择、素材与路径、SSR / RSC 边界 |
| [迁移指南](docs/migration-0.3.md) | 0.2.x → 0.3.0 的 breaking 变更（`visible` → `open`、`color` 语义拆分、`size` 档位） |
| [组件开发规范](docs/component-conventions.md) | 命名、五方一致性契约、文案约定、新增与移除流程 |
| [发布到 npm](docs/publishing.md) | 令牌生成、版本号、发布后核验、常见报错对照 |
| [致谢](docs/acknowledgements.md) | 视觉参考来源与许可说明 |

---

## 版权说明

**MIT 协议。** 你可以自由使用、修改、再分发本项目，包括商用、包括放进闭源产品里。
唯一的两个要求：保留版权声明与许可文本。

本项目是原创的独立项目，与 ConcernedApe LLC 及《星露谷物语》**无任何关联、背书或合作关系**，
也**不包含任何游戏素材**（美术、音乐、字体等）——这些权利归各自权利人所有。
项目名仅作描述用途，说明这个库的灵感来源。

完整条款以根目录 [LICENSE](LICENSE) 为准。

> **⚠️ 关于 npm 上的旧版本（0.1.0 – 0.4.0）**：它们发布时采用的是**非商业许可**，
> 其中 0.1.0 / 0.2.0 的 `license` 字段还写了 npm 无法解析的值，npm 会解析成 MIT——
> 于是 registry 上显示为 MIT，而 `LICENSE` 里其实禁止商用。**代码一直是 MIT 标注，
> 条款却不是。** 从 **0.5.0** 起字段改为 `"MIT"`，两者终于一致。
> 如果你锁定了旧版本并需要当时的历史条款，去对应 tag 里的 `LICENSE` 看。

打赏完全自愿，且不改变任何事：无论你支持与否，上面这份 MIT 条款都一样成立。

---

## 说点什么吧——真的什么都行

这个库最有价值的不是那 32 个组件，而是你们踩过的坑。**任何一条反馈我都会读**，
包括"这个设计我不太喜欢"。

👉 **[点这里新建 Issue](https://github.com/a985987819/stardewUi/issues/new/choose)**
—— 不好用、太难用、不好看，或者「这设计凭啥这样」都欢迎，尤其欢迎最后这类。
实现背后的取舍我写了不少在[迁移指南](docs/migration-0.3.md)和代码注释里，但那是我的视角。

> **不确定算不算 bug？** 那就当成 bug提。这个库里有很多设计只有我自己用过，
> 我很可能是最后一个发现问题的人。

---

## 请我喝杯咖啡 ☕

> **先说清楚最重要的一件事：打赏不是购买授权，而且本来就不可能是。**
> 本项目是 MIT 许可，这意味着任何人都可以不付钱、不打招呼就拿去商用。
> 支持完全自愿，它买到的是维护者的时间，不是许可证。
>
> 这就是交易：**你随意用——包括用在收费产品里——省了时间就请杯咖啡。**
> 钱只用于项目维护：组件开发、缺陷修复、文档完善与素材制作。

**→ [打开捐赠页面](https://a985987819.github.io/stardewUi/support?lang=zh)**
里面有微信支付与支付宝两个二维码，以及一份写明钱花在哪里的清单。金额随意，一杯就是心意。

其他渠道：**爱发电** —— <https://afdian.com/malatang1>

**不接受**：付费定制开发、开源挂名合作——这些是关于我的时间，不是关于许可证。
细节见 [docs/sponsoring.md](docs/sponsoring.md)。

> 单说授权：**我卖不了，也不想卖。** MIT 没有例外可卖。
> 如果你需要这份协议给不了的东西——免责赔偿、私有 SLA、你自己名下的分叉——
> 那是付费合作的范畴，不是修改许可证能解决的。

## 致谢

欢迎页的交互节奏与视觉气质受到 [Animal Island UI](https://github.com/guokaigdg/animal-island-ui) 启发。详细说明见 [docs/acknowledgements.md](docs/acknowledgements.md)；本项目未复制其代码或素材。