# Stardew Valley UI

[![npm version](https://img.shields.io/npm/v/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![npm downloads](https://img.shields.io/npm/dm/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![license](https://img.shields.io/npm/l/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)

一个 **星露谷风格、像素化的 React 组件库**，基于 React、TypeScript 与 Vite 构建。它既包含可组合的 UI 组件，也提供日期、画布九宫格和像素形状等工具函数。

面向个人学习、研究和非商业原型：提供 ESM、CommonJS、类型声明与单独的样式入口；库自带的像素素材会被打进产物，无需在宿主项目的 `public/` 目录额外复制文件。商业用途不被允许，详见下方版权说明与根目录 [LICENSE](LICENSE)。

---

## 安装

```bash
# npm
npm install stardew-valley-ui

# bun
bun add stardew-valley-ui

# pnpm
pnpm add stardew-valley-ui

# yarn
yarn add stardew-valley-ui
```

**前置依赖**：项目需要 React >= 18.0.0 和 ReactDOM >= 18.0.0。

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

两条路径**只选一条**。若项目同时保留了两者也不会重复加载（注入前会探测样式是否已在页面上）。选择建议见[接入指南](docs/consumer-integration.md#样式引入方式)。

### 2. 使用组件

```tsx
import { useState } from 'react'
import { StarCard, StarNineSliceButton, StarDialog, message } from 'stardew-valley-ui'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <StarCard title="欢迎来到星露谷" showTitle>
        <p>这是卡片内容</p>
      </StarCard>

      <StarNineSliceButton variant="primary" onClick={() => setOpen(true)}>
        打开对话框
      </StarNineSliceButton>

      <StarDialog
        open={open}
        title="皮埃尔"
        content="欢迎来到我的商店！"
        onClose={() => setOpen(false)}
      />

      <StarNineSliceButton
        onClick={() => message.success('操作成功！')}
      >
        显示消息
      </StarNineSliceButton>
    </div>
  )
}
```

---

## 在其他前端项目中使用

样式只需在应用里生效一次。组件库内部类名使用 CSS Modules，不会向宿主项目写入全局组件样式。两种方式任选其一：

| 方式 | 写法 | 适用场景 |
| --- | --- | --- |
| **显式样式入口**（推荐） | `import 'stardew-valley-ui/style.css'` + 从 `stardew-valley-ui` 导入组件 | 所有场景，尤其是 Next.js / SSR / 需要样式走构建产物或受 CSP 约束的项目 |
| **自动注入入口** | 直接从 `stardew-valley-ui/auto` 导入组件 | 纯客户端应用（Vite / CRA 等），想省掉那一行 css 引用 |

```tsx
// 方式一：main.tsx / app/layout.tsx
import 'stardew-valley-ui/style.css'
import { StarCard } from 'stardew-valley-ui'

// 方式二：省掉 css 引用
import { StarCard } from 'stardew-valley-ui/auto'
```

> 「自动注入」在模块加载时创建 `<style id="stardew-valley-ui-styles">`。代价是：SSR/SSG 首屏可能出现短暂无样式（样式在客户端才注入）、
> 需要 `style-src 'unsafe-inline'` 的 CSP 放行。因此 SSR 项目仍建议用显式样式入口 —— 详细取舍见
> [接入指南](docs/consumer-integration.md#样式引入方式)。

内置的默认按钮、季节按钮、日历背景、空状态和加载动画素材均随构建产物发布，安装 npm 包即可使用。传入 `backgroundSrc`、`imageSrc`、`src` 等自定义图片地址时，资源的部署与缓存策略由宿主项目负责；Vite 项目中推荐传入静态导入得到的 URL：

```tsx
import customButtonBackground from './assets/custom-button.png'
import { StarNineSliceButton } from 'stardew-valley-ui'

export function SaveButton() {
  return <StarNineSliceButton backgroundSrc={customButtonBackground}>保存</StarNineSliceButton>
}
```

`StarDialog`、`message`、画布背景和浏览器存储 Hooks 会在客户端访问 DOM、Canvas 或 Storage。使用 Next.js、RSC 等 SSR 框架时，请将调用它们的交互组件标记为客户端组件（`'use client'`）；不要在服务端渲染阶段调用命令式的 `message(...)`。

### 公开组件一览

| 分类 | 导出 |
|------|------|
| 容器与展示 | `StarCard`、`StarTitle`、`StarPixelText`、`StarDisplayFrame`、`StarDivider`、`StarAvatar`、`StarEmptyState`、`StarLoading`、`StarTag`、`StarBadge`、`StarCollapse`、`StarSkeleton` |
| 表单与操作 | `StarNineSliceButton`、`StarInput`、`StarTextarea`、`StarSwitch`、`StarRadio`、`StarCheckbox`、`StarSelect`、`StarRating`、`StarProgress` |
| 反馈与浮层 | `StarDialog`、`StarDrawer`、`StarPopup`、`message`、`StarTypewriter`、`StarAlert` |
| 日期与导航 | `StarCalendar`、`StarDatePicker`、`StarTab`、`StarPagination` |

完整 Props 类型可从根入口以 `import type` 方式导入；组件均支持 `className`，大部分容器类组件也支持原生 `style` 与相应 DOM 属性。

更完整的素材、SSR / RSC 边界和维护者发布检查请见 [接入指南](docs/consumer-integration.md)。

---

## 让 AI Agent 直接使用

仓库包含可安装的 [`stardew-valley-ui` Skill](skills/stardew-valley-ui/SKILL.md)，供 Codex、Claude Code、Cursor 及其他支持 `SKILL.md` 的 Agent 按需读取。它把「安装组件库 → 选择唯一的样式入口 → 按公开 API 实现 → 执行项目检查」收敛为一条真实接入流程，避免 Agent 凭印象编造 Props。

```bash
skills add a985987819/stardewUi
```

也可以将 [`skills/stardew-valley-ui/`](skills/stardew-valley-ui/) 复制到 Agent 的 skills 目录。安装后可直接描述页面目标，或明确调用 `$stardew-valley-ui`，例如“用 Stardew Valley UI 做一个农场库存页；显式引入一次 style.css，并用 StarDialog 确认丢弃操作”。精确 Props 始终以已安装包的 TypeScript 声明为准。在线演示站的「使用指南 → Agent 帮我使用」同步解释技能的安装、实际调用方式与需求模板。

---

## 目录

- [安装](#安装) · [快速开始](#快速开始) · [在其他前端项目中使用](#在其他前端项目中使用)
- [让 AI Agent 直接使用](#让-ai-agent-直接使用)
- **组件**
  - 容器与展示：[Card](#starcard---卡片) · [Title](#startitle---标题) · [PixelText](#starpixeltext---像素化文本) · [DisplayFrame](#stardisplayframe---展示框) · [Avatar](#staravatar---头像) · [Divider](#stardivider---分割线) · [EmptyState](#staremptystate---空状态) · [Loading](#starloading---加载) · [Tag](#startag---标签) · [Badge](#starbadge---徽标) · [Collapse](#starcollapse---折叠面板) · [Skeleton](#starskeleton---骨架屏)
  - 表单与操作：[NineSliceButton](#starnineslicebutton---九宫格按钮) · [Input](#starinput---输入框) · [Textarea](#startextarea---多行输入) · [Switch](#starswitch---开关) · [Radio](#starradio---单选框) · [Checkbox](#starcheckbox---多选框) · [Select](#starselect---下拉选择) · [Rating](#starrating---评分) · [Progress](#starprogress---进度条)
  - 反馈与浮层：[Dialog](#stardialog---对话框) · [Drawer](#stardrawer---抽屉) · [Popup](#starpopup---弹窗) · [message](#message---消息提示) · [Typewriter](#startypewriter---打字机) · [Alert](#staralert---警告提示) · [BackToTop](#starbacktotop---回到顶部)
  - 日期与导航：[Calendar](#starcalendar---日历) · [DatePicker](#stardatepicker---日期选择器) · [Tab](#startab---选项卡) · [Pagination](#starpagination---分页)
- **其他**：[Hooks](#hooks) · [工具函数](#工具函数) · [类型](#类型)
- **项目**：[构建与发布](#构建与发布) · [本地开发](#本地开发) · [新增与移除组件](#新增与移除组件) · [版权说明](#版权说明) · [致谢](#致谢)

### 延伸文档

| 文档 | 内容 |
|------|------|
| [接入指南](docs/consumer-integration.md) | 样式入口选择、素材与路径、SSR / RSC 边界 |
| [迁移指南](docs/migration-0.3.md) | 0.2.x → 0.3.0 的 breaking 变更（`visible` → `open`、`color` 语义拆分、`size` 档位） |
| [组件开发规范](docs/component-conventions.md) | 命名、五方一致性契约、文案约定、新增与移除流程 |
| [发布到 npm](docs/publishing.md) | 令牌生成、版本号、发布后核验、常见报错对照 |
| [致谢](docs/acknowledgements.md) | 视觉参考来源与许可说明 |

> 在线演示站（每个组件都有可交互示例与完整 API 表）：<https://a985987819.github.io/stardewUi/>

---

## 组件列表

### StarNineSliceButton - 九宫格按钮

像素风格的按钮组件，支持多种变体和季节主题。

```tsx
import { StarNineSliceButton } from 'stardew-valley-ui'

// 基础用法
<StarNineSliceButton variant="default">默认按钮</StarNineSliceButton>
<StarNineSliceButton variant="primary">主要按钮</StarNineSliceButton>
<StarNineSliceButton variant="warning">警告按钮</StarNineSliceButton>
<StarNineSliceButton variant="danger">危险按钮</StarNineSliceButton>

// 季节主题
<StarNineSliceButton theme="spring">春天</StarNineSliceButton>
<StarNineSliceButton theme="summer">夏天</StarNineSliceButton>
<StarNineSliceButton theme="autumn">秋天</StarNineSliceButton>
<StarNineSliceButton theme="winter">冬天</StarNineSliceButton>

// 尺寸
<StarNineSliceButton size="small">小</StarNineSliceButton>
<StarNineSliceButton size="medium">中</StarNineSliceButton>
<StarNineSliceButton size="large">大</StarNineSliceButton>

// 其他变体
<StarNineSliceButton variant="dashed">虚线按钮</StarNineSliceButton>
<StarNineSliceButton variant="text">文字按钮</StarNineSliceButton>
<StarNineSliceButton variant="link">链接按钮</StarNineSliceButton>
<StarNineSliceButton variant="concise">简洁按钮</StarNineSliceButton>

// 加载状态
<StarNineSliceButton loading>加载中</StarNineSliceButton>

// 块级按钮
<StarNineSliceButton block>占满整行</StarNineSliceButton>

// 自定义颜色
<StarNineSliceButton color="#8B4513">自定义颜色</StarNineSliceButton>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'default' \| 'primary' \| 'secondary' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'disabled' \| 'dashed' \| 'text' \| 'link' \| 'concise'` | `'default'` | 按钮变体，共 12 档 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 按钮尺寸 |
| theme | `'spring' \| 'summer' \| 'autumn' \| 'winter'` | - | 季节主题 |
| appearance | `'regular' \| 'classical'` | `'regular'` | 外观风格 |
| loading | `boolean` | `false` | 加载状态 |
| block | `boolean` | `false` | 块级按钮 |
| icon | `ReactNode` | - | 图标 |
| color | `string` | - | 自定义颜色 |
| backgroundSrc | `string` | - | 自定义背景图片 |
| backgroundInsets | `{ top: number; right: number; bottom: number; left: number }` | - | 九宫格边距 |

---

### StarCard - 卡片

像素风格的卡片容器，支持多种预设配色和自定义颜色。

```tsx
import { StarCard } from 'stardew-valley-ui'

// 基础用法
<StarCard>
  <p>卡片内容</p>
</StarCard>

// 带标题
<StarCard title="公告栏" showTitle>
  <p>今天花舞节！</p>
</StarCard>

// 预设配色
<StarCard surface="night-village">夜之村庄</StarCard>
<StarCard surface="forest-farm">森林农场</StarCard>
<StarCard surface="wooden-cabin">木屋</StarCard>
<StarCard surface="lake-night">湖之夜</StarCard>
<StarCard surface="flower-festival">花舞节</StarCard>
<StarCard surface="mine-starry">矿洞星空</StarCard>

// 自定义颜色
<StarCard color="#5f4322">自定义颜色</StarCard>

// 变体
<StarCard variant="outlined">描边卡片</StarCard>
<StarCard variant="elevated">悬浮卡片</StarCard>

// 带页脚和额外内容
<StarCard
  title="任务"
  showTitle
  headerExtra={<span>进行中</span>}
  footer={<div>页脚操作</div>}
>
  内容
</StarCard>

// 子组件
<StarCard>
  <StarCard.Image src="/image.png" alt="图片" />
  <StarCard.Meta title="标题" description="描述" />
</StarCard>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `ReactNode` | - | 卡片标题 |
| showTitle | `boolean` | `false` | 是否显示标题栏 |
| variant | `'default' \| 'outlined' \| 'elevated'` | `'default'` | 卡片变体 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 卡片尺寸 |
| surface | `CardColor` | - | 预设配色名（村庄 / 森林 / 矿洞…） |
| color | `string` | - | 任意 CSS 颜色作为卡片底色，覆盖 `surface` |
| headerExtra | `ReactNode` | - | 标题栏额外内容 |
| footer | `ReactNode` | - | 页脚内容 |
| hoverable | `boolean` | `false` | 是否有悬浮效果 |
| children | `ReactNode` | - | 卡片主体内容 |

预设配色：`night-village`、`forest-farm`、`wooden-cabin`、`lake-night`、`flower-festival`、`mine-starry`、`farmland`、`orchard-grass`、`workshop-ore`、`night-celebration`

---

### StarDialog - 对话框

星露谷风格的剧情对话组件，适合镇民来访、任务信件和需要停下来确认的重要选择。默认会把身后的农场缩小并柔化，让当前台词像一段真正发生的事件；对话本体会从无到有、略微弹跳后落稳，并在关闭时淡出。传入 `focusEffect={false}` 可保留完整场景，传入 `motion={false}` 可关闭这段进退场动画。

```tsx
import { StarDialog } from 'stardew-valley-ui'

// 基础用法
<StarDialog
  open={open}
  title="镇长刘易斯"
  content="欢迎来到鹈鹕镇。明早去农场南边的信箱看看，那里有你的第一份差事。"
  onClose={() => setOpen(false)}
/>

// 带角色头像
<StarDialog
  open={open}
  title="皮埃尔"
  content="雨要下大了。把这包防风的种子带走吧，春天可不等人。"
  image="/character.png"
  name="皮埃尔"
  onClose={() => setOpen(false)}
/>

// 多页内容
<StarDialog
  open={open}
  title="一封带松针香味的信"
  content={['矿洞口的石头松了。', '带把镐子来，别忘了在天黑前回家。', '——山里的朋友']}
  onClose={() => setOpen(false)}
/>

// 关闭打字机效果
<StarDialog
  open={open}
  content="出货箱已经收走了今晚最后一篮蓝莓。"
  typewriter={false}
  onClose={() => setOpen(false)}
/>

// 屏幕下方居中，并占满可用宽度
<StarDialog
  open={open}
  placement="bottom"
  content="矿洞将在午夜封门。把战利品收好，明天再往深处走。"
  onClose={() => setOpen(false)}
/>

// 保留完整农场画面：适合路过公告板时读到的日常提醒
<StarDialog
  open={open}
  focusEffect={false}
  title="早晨的公告板"
  content="花舞节还有三天。今天去镇上时，别忘了带上最喜欢的花。"
  onClose={() => setOpen(false)}
/>

// 路过公告时不需要演出，直接显示即可
<StarDialog
  open={open}
  motion={false}
  title="广场公告板"
  content="今天的面包刚出炉。若你正好进城，别让它在雨里放凉。"
  onClose={() => setOpen(false)}
/>

// 一张只需读完的便笺，不留默认操作区
<StarDialog
  open={open}
  footer={null}
  title="贴在谷仓门上的便笺"
  content="明天会下雨。水桶和种子都放在门边。"
  onClose={() => setOpen(false)}
/>

// 用当前剧情需要的操作替换默认页脚
<StarDialog
  open={open}
  title="幽暗矿洞的遗物"
  content="这枚刻着螺旋纹的石片还带着余温。"
  footer={<button type="button" onClick={() => setOpen(false)}>放进背包</button>}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| open | `boolean` | - | 是否打开；不传则对话框自持状态 |
| defaultOpen | `boolean` | `false` | 非受控模式的初始可见性 |
| title | `string` | - | 对话标题 |
| content | `string \| string[]` | - | 对话内容，数组表示多页 |
| image | `string` | - | 角色头像 |
| name | `string` | - | 角色名称 |
| actions | `DialogAction[] \| null` | - | 操作按钮，null 则不显示 |
| footer | `ReactNode \| null` | 默认页脚 | 不传时显示内置操作与分页；传 `null` 完全移除页脚；传节点时替换为自定义页脚 |
| mask | `'dark' \| 'light'` | `'dark'` | 遮罩风格 |
| placement | `'center' \| 'bottom'` | `'center'` | 屏幕位置；`bottom` 在下方居中并占满可用宽度 |
| focusEffect | `boolean` | `true` | 是否缩小、柔化身后的页面，让当前剧情成为画面焦点 |
| motion | `boolean` | `true` | 是否播放 `0 → 105% → 100%` 的进场和缩小淡出的退场动画 |
| maskClosable | `boolean` | `true` | 点击遮罩是否关闭 |
| typewriter | `boolean` | `true` | 打字机效果 |
| typewriterSpeed | `number` | `100` | 打字速度（毫秒） |
| showPagination | `boolean` | 自动 | 是否显示上一页/下一页分页器；默认跟随内容（单页隐藏），`true` 强制显示，`false` 强制隐藏 |
| confirmLabel / cancelLabel | `string` | 跟随语言 | 内置「确认 / 取消」按钮的可覆盖文案 |
| prevLabel / nextLabel | `string` | 跟随语言 | 分页箭头的无障碍名称，同时用作悬浮提示 |
| roleLabel | `string` | 跟随语言 | `image` 的替代文本；未传时回退到 `name` 与内置文案 |
| waitingText | `string` | 跟随语言 | 打字机尚未完成标题时，正文位置显示的占位文案 |
| onOpenChange | `(open: boolean) => void` | - | 可见性变化回调；关闭按钮、遮罩、Escape 都会以 `false` 触发 |
| onClose | `() => void` | - | 关闭回调 |

---

### StarDrawer - 抽屉

从页面四边滑入的受控像素抽屉。开启时会默认缩小并柔化原页面，抽屉自身通过 body portal 保持完整尺寸；传入 `focusEffect={false}` 可关闭此视觉聚焦。

```tsx
import { useState } from 'react'
import { StarDrawer, StarNineSliceButton } from 'stardew-valley-ui'

function InventoryDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <StarNineSliceButton onClick={() => setOpen(true)}>打开背包</StarNineSliceButton>
      <StarDrawer
        open={open}
        placement="right"
        title="农场背包"
        footer={<span>12 / 24 格</span>}
        onClose={() => setOpen(false)}
      >
        <p>这里可以放置任意 React 内容。</p>
      </StarDrawer>
    </>
  )
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| open | `boolean` | - | 受控可见状态；不传则抽屉自持状态 |
| defaultOpen | `boolean` | `false` | 非受控模式的初始可见性 |
| placement | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | 抽屉进入方向 |
| title | `ReactNode` | - | 可选标题 |
| footer | `ReactNode` | - | 可选固定页脚 |
| children | `ReactNode` | - | 抽屉主体内容 |
| className | `string` | - | 添加到抽屉面板的类名 |
| maskStyle | `CSSProperties` | - | 覆盖遮罩层的内联样式 |
| focusEffect | `boolean` | `true` | 是否缩小并柔化原页面 |
| maskClosable | `boolean` | `true` | 点击遮罩是否请求关闭 |
| closeLabel | `string` | 跟随语言 | 关闭按钮的无障碍名称 |
| ariaLabel | `string` | 跟随语言 | 面板的无障碍名称；`title` 为非字符串节点时使用 |
| onOpenChange | `(open: boolean) => void` | - | 可见性变化回调；关闭按钮、遮罩、Escape 均触发 |
| onClose | `() => void` | - | 点击关闭按钮、遮罩或 Escape 时触发 |

---

### StarBackToTop - 回到顶部

页面滚动之后才浮现的像素纸飞机，机头朝着页面顶部；点击后它向上飞出去、同时淡到全透明，页面平滑回到顶部。图案画在 21 × 21 的像素网格上：左右两个 `#b2ccfa` 阶梯直角三角形，`#5899f1` 描边，中间一条 `#308be2` 脊线把两半连起来，机头是顶部那一个像素。一个美术像素固定等于 3px，所以那条描边正好是 3px，整张图 63 × 63。

```tsx
import { StarBackToTop } from 'stardew-valley-ui'

// 默认：页面停在顶部时隐藏，一滚动就从右下角浮现
<StarBackToTop />

// 滚过 400px 才出现，并停在更高的位置
<StarBackToTop threshold={400} bottom={140} />

// 显示时机交给调用方，不再监听滚动
<StarBackToTop open={pinned} />

// 监听某个滚动容器，而不是 window
<StarBackToTop container={panelElement} />

// 换页时替路由飞走一次（回顶由路由自己做，它只补上飞走那一拍）
<StarBackToTop flightKey={pathname} />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| threshold | `number` | `0` | 滚动多少像素后浮现；`0` 即离开顶部就出现 |
| bottom | `number` | `32` | 距视口底部的固定距离（px） |
| right | `number` | `32` | 距视口右侧的固定距离（px） |
| scrollBehavior | `'auto' \| 'instant' \| 'smooth'` | `'smooth'` | 回顶动画，`prefers-reduced-motion` 下强制瞬间跳转 |
| open | `boolean` | - | 传入后由调用方接管显示时机 |
| flightKey | `string \| number` | - | 值一变就飞一次（隐藏时不动），适合传路由的 `pathname` |
| container | `HTMLElement \| null` | `null` | 要监听的滚动容器，默认 `window` |
| label | `string` | `'Back to top'` | 按钮的无障碍名称 |
| children | `ReactNode` | 像素纸飞机 | 替换默认图案 |
| onOpenChange | `(open: boolean) => void` | - | 浮现 / 隐藏时触发，挂载时也会触发一次 |

隐藏期间组件仍留在 DOM 里（入场过渡需要挂载点），但会带上 `aria-hidden` 与 `tabIndex={-1}`，键盘和读屏都够不着。图案尺寸是固定的 63 × 63（21 个美术像素 × 3px），放大缩小会连带改掉描边粗细，所以没有 `size` 一类的属性。

点击后纸飞机沿单调的 `cubic-bezier(0.4, 0, 0.7, 0.2)` 向上飞 48px，位移和透明度共用同一条曲线，所以两者同时到终点；整段 280ms，即 `BACK_TO_TOP_FLIGHT_MS`。飞完它不会闪回来：动画的结束状态一直保持到页面真的回到顶部、隐藏样式接管为止。`prefers-reduced-motion` 下整段动画关掉，纸飞机直接消失。用 `open` 自己管显示时机的调用方可以拿 `BACK_TO_TOP_FLIGHT_MS` 对齐收尾动作——等动画放完再摘掉 `open`。

换页回顶是路由的事，纸飞机不会知道；把 route key 交给 `flightKey`，它就补上飞走那一拍。**当时不在屏幕上就什么都不做**——动画从全不透明开始，硬放会在一个它从没待过的角落凭空闪出来，所以路由可以每次跳转都 bump 它，不必先问一句。本仓库的文档站就是这么用的（`Layout.tsx` 挂一只、`flightKey={pathname}`，并且只在 `pathname` 变化时才回顶，页内锚点只改 hash 就不动滚动位置）。

---

### message - 消息提示

命令式调用的消息提示组件，支持多种类型和位置。

```tsx
import { message } from 'stardew-valley-ui'

// 基础用法
message('普通消息')
message.success('操作成功！')
message.error('操作失败！')
message.warning('注意！')
message.info('提示信息')

// 自定义持续时间（毫秒，0 表示不自动关闭）
message.success('保存成功', 5000)

// 自定义位置
message({ content: '底部左侧', position: 'bottom-left' })
message({ content: '底部右侧', position: 'bottom-right' })

// 手动关闭
const { close } = message('可关闭的消息')
setTimeout(() => close(), 1000)
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| content | `string` | - | 消息内容 |
| type | `'normal' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'normal'` | 消息类型 |
| position | `'top' \| 'top-left' \| 'top-right' \| 'left' \| 'center' \| 'right' \| 'bottom' \| 'bottom-left' \| 'bottom-right'` | `'top'` | 消息位置，共 9 档 |
| duration | `number` | `3000` | 持续时间，0 不自动关闭 |
| onClose | `() => void` | - | 关闭回调 |

---

### StarCalendar - 日历

像素风日历组件，支持事件标记。工具栏的月份标题可点击，弹出年月下拉做快速跳转；右上角「回到今日」按东八区（UTC+8）当天回到本月。

```tsx
import { StarCalendar } from 'stardew-valley-ui'

<StarCalendar
  items={[
    { date: '2026-05-13', title: '花舞节', iconKey: 'festival' },
    { date: '2026-05-26', title: '月光水母舞', description: '夜晚活动' },
  ]}
  iconMap={{
    festival: '🎉',
    birthday: '🎂',
  }}
  onMonthChange={(timestamp) => console.log(timestamp)}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | `number` | - | 受控月份时间戳 |
| defaultValue | `number` | - | 默认月份时间戳 |
| items | `CalendarItem[]` | `[]` | 日历事件 |
| maxVisibleMarkers | `number` | `3` | 每日最大显示标记数 |
| iconMap | `Record<string, ReactNode \| string>` | - | 图标映射 |
| showOutsideDays | `boolean` | `true` | 是否显示非当月日期 |
| onMonthChange | `(timestamp: number) => void` | - | 月份切换回调 |
| onSelect | `(dayTimestamp: number) => void` | - | 点击某一天时的回调 |
| todayLabel | `string` | `'回到今日'` | 「回到今日」按钮文案 |
| showToday | `boolean` | `true` | 是否显示「回到今日」按钮 |
| todayOffsetMinutes | `number` | `480` | 计算「今日」所用的时区偏移（分钟），480 即东八区 |
| locale | `string` | 跟随宿主语言 | 月份名、周头与年份标题的 locale，如 `'en-US'` |
| className | `string` | - | 追加到根元素的类名 |

> 翻月、「回到今日」和下拉选月都会走 `onMonthChange`；目标月份和当前一致时不会重复触发。

`CalendarItem`：

| 属性 | 类型 | 说明 |
|------|------|------|
| id | `string` | 稳定标识；同一天存在同名事件时必填，否则 React 无法区分 |
| date | `number \| string \| Date` | 日期 |
| title | `string` | 事件标题 |
| description | `string` | 事件描述 |
| iconKey | `string` | 图标键名 |
| iconSrc | `string` | 图标图片地址 |
| iconNode | `ReactNode` | 自定义图标节点 |
| tone | `string` | 标记颜色 |
| meta | `ReactNode` | 额外信息 |

---

### StarDatePicker - 日期选择器

支持单选和范围选择的日期选择器，提供两种交互类型（`interaction`）：

- **`calendar`（默认）** — 月历网格形式。工具栏与 `StarCalendar` 共用：点击月份标题弹出年月下拉，右上角「回到今日」按东八区（UTC+8）当天把视图带回本月（只移动视图，不改动已选日期）。
- **`inline`** — 行内形式。触发器下方弹出**年 / 月 / 日三列可无限滚动的轮盘**，三列同时出现、各自独立滚动（31 号之后接 1、2、3；12 月之后接 1 月）。在面板里改动的是草稿，只有点「确定」才触发 `onChange`，点「取消」原样丢弃；超出 `minDate` / `maxDate` 时「确定」按钮自动禁用。切换年月后若原日期越界（1 月 31 日 → 2 月），轮盘自动落到当月最后一天。

```tsx
import { StarDatePicker } from 'stardew-valley-ui'

// 单选模式（月历）
<StarDatePicker
  mode="single"
  onChange={(value) => console.log(value.dateTimestamp)}
/>

// 范围选择
<StarDatePicker
  mode="range"
  onChange={(value) => console.log(value.startTimestamp, value.endTimestamp)}
/>

// 行内三列轮盘：点「确定」才写回，点「取消」丢弃
<StarDatePicker
  interaction="inline"
  onChange={(value) => console.log(value.dateTimestamp)}
/>

// 限制日期范围
<StarDatePicker
  minDate={new Date(2026, 0, 1).getTime()}
  maxDate={new Date(2026, 11, 31).getTime()}
  disabledDates={[new Date(2026, 4, 15).getTime()]}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| mode | `'single' \| 'range'` | `'single'` | 选择模式 |
| interaction | `'calendar' \| 'inline'` | `'calendar'` | 交互类型：月历形式或三列轮盘的行内形式 |
| value | `number \| { startTimestamp: number \| null; endTimestamp: number \| null }` | - | 受控值 |
| defaultValue | 同 value | - | 默认值 |
| onChange | `(value) => void` | - | 变化回调 |
| minDate | `number` | - | 最小日期 |
| maxDate | `number` | - | 最大日期 |
| disabledDates | `number[]` | `[]` | 禁用日期 |
| showOutsideDays | `boolean` | `true` | 显示非当月日期（仅 `calendar`） |
| confirmLabel | `string` | `'确定'` | `inline` 形式「确定」按钮文案 |
| cancelLabel | `string` | `'取消'` | `inline` 形式「取消」按钮文案 |
| columnLabels | `[string, string, string]` | `['年', '月', '日']` | `inline` 形式三列的无障碍名称 |
| todayLabel | `string` | `'回到今日'` | 「回到今日」按钮文案 |
| showToday | `boolean` | `true` | 是否显示「回到今日」按钮（仅 `calendar`） |
| todayOffsetMinutes | `number` | `480` | 计算「今日」所用的时区偏移（分钟），480 即东八区；仅影响「今日」的判断与按钮落点，不会改动选中值 |
| locale | `string` | 跟随宿主语言 | 月份名、周头与行内触发器的 locale，如 `'en-US'` |
| className | `string` | - | 追加到行内容器根元素的类名 |

---

### StarProgress - 进度条

像素风进度条：一格一格地填充，格子的描边与高光由 `color` 推导，用于体力、经验、季节进度等需要「可数」的场合。

```tsx
<StarProgress value={7} max={10} showLabel />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | `number` | - | 当前值，超出 `0…max` 会被夹紧 |
| max | `number` | `100` | 满格代表的总量 |
| segmentSize | `number` | `10` | 一个完整像素格代表的量 |
| color | `string` | `'#ce053c'` | 填充色；描边、阴影与高光由它推导。只接受 3/6 位 hex，传 CSS 颜色名会在开发期告警 |
| showLabel | `boolean` | `false` | 是否显示数值 |
| variant | `'default' \| 'compact'` | `'default'` | 标准生命格，或密集六像素 HUD 行 |

> `variant` 描述的是**密度**而非语义色，与 `StarNineSliceButton` 的 `variant`（12 个语义值）同名不同义，容易混淆。按钮那侧叫语义，这里叫密度更准确。

---

### StarRating - 评分

像素爱心/星星评分：加星时整颗图标按进度格的弹入曲线弹一下，减星时先左右摇晃再缩小消失。用于村民好感、收藏度、任务评价。

```tsx
<StarRating value={friendship} onChange={setFriendship} count={5} aria-label="好感度" />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value / defaultValue | `number` | `0` | 受控值或非受控初始值 |
| count | `number` | `5` | 图标数量 |
| icon | `'heart' \| 'star'` | `'heart'` | 图标类型 |
| allowHalf | `boolean` | `false` | 允许半格，**需要双击**该图标 |
| disabled | `boolean` | `false` | 禁用交互但保留已获得的图标状态 |
| onChange | `(value: number) => void` | - | 用户选定评分时触发，**传出数字而非事件对象** |
| color | `string` | 心 `#e53935` / 星 `#d7992e` | 已点亮图标颜色 |
| emptyColor | `string` | `'#cdbda8'` | 未点亮图标颜色 |
| aria-label | `string` | - | 无障碍名称；控件只画图标，没有文本 |
| className / style | `string` / `CSSProperties` | - | 追加到 `role="slider"` 根元素的类名与内联样式 |

> `allowHalf` 的半格需要**精准双击**：单击先记满分，双击在 350ms 窗口内才切到半格。这是刻意的防误触设计，鼠标用户需要刻意练习才能命中。

组件支持 `ref`，指向 `role="slider"` 的根元素，可以 `.focus()`。

---

### StarLoading - 加载

像素风加载动画组件：中央洒水器带动八株胡萝卜沿扁圆轨迹顺时针成熟，每株间隔 0.6 秒，提示文案的尾部点号随生长节奏循环。

```tsx
import { StarLoading } from 'stardew-valley-ui'

<StarLoading />
<StarLoading active={false} text="加载完成" />
<StarLoading size="medium" text="请稍候..." />
<StarLoading speed={300} text="快速生长" />
<StarLoading center />
<StarLoading fill />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| active | `boolean` | `true` | 是否激活动画 |
| text | `string` | `'正在加载...'` | 加载文字 |
| size | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | 完整花圃的直径；预设档位或精确像素 |
| speed | `number` | `600` | 每株胡萝卜生长的间隔（毫秒）；数值越小动画越快 |
| gap | `number` | `8` | 图标与文字间距 |
| center | `boolean` | `false` | 居中显示 |
| block | `boolean` | `false` | 块级显示 |
| fill | `boolean` | `false` | 填满容器 |

---

### StarPopup - 弹窗

气泡弹窗组件，支持多种位置和触发方式。它同时覆盖了「悬停提示」场景：纯文本气泡自带 `role="tooltip"`，带 `actions` 时自动变为 `role="dialog"`；键盘聚焦唤出、Esc 收起，因此库内不再单列 Tooltip 组件。

```tsx
import { StarPopup } from 'stardew-valley-ui'

// 悬浮触发
<StarPopup
  title="提示"
  content={<span>这是弹窗内容</span>}
  placement="right"
  trigger="hover"
>
  <StarNineSliceButton>悬浮查看</StarNineSliceButton>
</StarPopup>

// 点击触发
<StarPopup
  content="点击弹窗"
  trigger="click"
  actions={[
    { label: '确定', variant: 'primary', onClick: () => {} },
  ]}
>
  <StarNineSliceButton>点击查看</StarNineSliceButton>
</StarPopup>

// 受控模式
<StarPopup
  open={isOpen}
  onOpenChange={setIsOpen}
  content="受控弹窗"
  placement="bottom"
>
  <span>触发元素</span>
</StarPopup>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| open | `boolean` | - | 受控打开状态 |
| onOpenChange | `(open: boolean) => void` | - | 打开状态变化回调 |
| placement | `'top' \| 'top-start' \| 'top-end' \| 'right' \| 'right-start' \| 'right-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'left' \| 'left-start' \| 'left-end'` | `'right'` | 弹出位置 |
| trigger | `'hover' \| 'click'` | `'hover'` | 触发方式 |
| title | `ReactNode` | - | 弹窗标题 |
| content | `ReactNode` | - | 弹窗内容 |
| actions | `PopupAction[]` | - | 操作按钮；存在时 role 自动为 `dialog` |
| offset | `number` | `12` | 偏移距离 |
| arrow | `boolean` | `true` | 是否显示指回触发元素的像素箭头 |
| color | `string` | - | 底色；边框、内芯与奶油墨色由它推导 |
| role | `'tooltip' \| 'dialog' \| 'none'` | 自动 | 气泡的无障碍角色，默认按有无 actions 推导 |
| defaultOpen | `boolean` | `false` | 非受控模式的初始可见性 |
| mouseEnterDelay | `number` | `100` | 悬停显示延迟（毫秒） |
| mouseLeaveDelay | `number` | `120` | 移开隐藏延迟（毫秒） |
| children | `ReactNode` | - | 触发元素；组件会把它包进定位容器 |

---

### StarEmptyState - 空状态

空数据占位组件。

```tsx
import { StarEmptyState } from 'stardew-valley-ui'

<StarEmptyState />
<StarEmptyState message="暂无数据" />
<StarEmptyState
  imageSrc="/custom-empty.png"
  message="没有找到内容"
  direction="horizontal"
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| imageSrc | `string` | 内置图片 | 图片地址 |
| imageAlt | `string` | `'暂无数据'` | 图片描述 |
| message | `ReactNode` | `'没有更多数据了'` | 提示文字 |
| showImage | `boolean` | `true` | 是否显示图片 |
| showMessage | `boolean` | `true` | 是否显示文字 |
| direction | `'horizontal' \| 'vertical'` | `'vertical'` | 排列方向 |

---

### StarTypewriter - 打字机

逐字显示文字的打字机效果组件。

```tsx
import { StarTypewriter } from 'stardew-valley-ui'

<StarTypewriter text="欢迎来到星露谷！" speed={80} />
<StarTypewriter text="延迟开始" startDelay={500} />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | `string` | - | 要显示的文字 |
| speed | `number` | `100` | 打字速度（毫秒/字） |
| startDelay | `number` | `0` | 开始延迟（毫秒） |
| onComplete | `() => void` | - | 打字完成回调 |
| completeTrigger | `number` | `0` | 外部触发立即完成 |
| className | `string` | - | 追加到根元素的类名 |

---

### StarTab - 选项卡

选项卡切换组件。

```tsx
import { StarTab } from 'stardew-valley-ui'

<StarTab
  items={[
    { key: 'spring', label: '春天', content: <div>春季内容</div> },
    { key: 'summer', label: '夏天', content: <div>夏季内容</div> },
    { key: 'fall', label: '秋天', content: <div>秋季内容</div>, disabled: true },
  ]}
  defaultActiveKey="spring"
  onChange={(key) => console.log(key)}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | `StarTabItem[]` | - | 选项卡项 |
| activeKey | `string` | - | 受控激活项 |
| defaultActiveKey | `string` | - | 默认激活项 |
| onChange | `(key: string) => void` | - | 切换回调 |
| position | `'top' \| 'bottom'` | `'top'` | 选项卡位置 |
| external | `boolean` | `false` | 外接导航：选项卡条移到内容框外，内容仍留在带边框的框里 |

```tsx
// 选项卡在内容框上方
<StarTab external items={items} />

// 选项卡挂在内容框下方
<StarTab external position="bottom" items={items} />
```

`external` 与 `position` 正交：默认（`false`）时选项卡和内容同处一个框；开启后内容框保留边框，
每个选项卡以独立像素边框显示，选中项会向内容框平移 4px 并紧贴其边缘。导出结构上，
`role="tabpanel"` 始终落在内容框上，`role="tablist"` 的位置随 `external` 变化，可以据此做样式或测试断言。

---

### StarSwitch - 开关

Checkbox 同族的木面板开关：暖木框内嵌凹槽，打开时凹槽与滑钮锁孔点点亮为 `color` 色，羊皮纸滑钮以像素阶梯节奏滑过凹槽。

```tsx
import { StarSwitch } from 'stardew-valley-ui'

<StarSwitch checked={on} onChange={setOn} />
<StarSwitch size="small" />
<StarSwitch size="large" color="#D7992E" />
<StarSwitch disabled />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| checked | `boolean` | `false` | 是否选中；不传则开关自持状态 |
| defaultChecked | `boolean` | `false` | 非受控模式的初始位置（`checked` 存在时被忽略） |
| onChange | `(checked: boolean) => void` | - | 变化回调 |
| disabled | `boolean` | `false` | 是否禁用 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 开关尺寸 |
| color | `string` | `'#71964A'` | 打开时凹槽与锁孔点亮的颜色；顶部暗边从它自动推导 |
| name | `string` | - | 表单字段名；设置后渲染隐藏 input，提交时得到 `'true'` / `'false'`（与原生 checkbox「选中才提交」的契约不同） |
| required | `boolean` | - | 交由浏览器原生校验，随表单提交 |

---

### StarCheckbox - 多选框

Card 风格边框的多选框组，默认水平排列；选中时红色对勾从左向右显示，取消时使用评分图标同款的摇晃、缩小、淡出动画。

```tsx
import { StarCheckbox } from 'stardew-valley-ui'

const crops = [
  { value: 'parsnip', label: '防风草' },
  { value: 'potato', label: '土豆' },
  { value: 'strawberry', label: '草莓', disabled: true },
]

<StarCheckbox options={crops} defaultValue={['parsnip']} />
<StarCheckbox options={crops} direction="vertical" shape="round" size="large" />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| options | `CheckboxOption[]` | - | 选项列表；每项可设置 `value`、`label`、`disabled` |
| value / defaultValue | `string[]` | `[]` | 受控选中值或非受控初始值 |
| onChange | `(value: string[]) => void` | - | 返回完整的下一组选中值 |
| direction | `'horizontal' \| 'vertical'` | `'horizontal'` | 选项排列方向 |
| disabled | `boolean` | `false` | 禁用整个多选框组 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 控件尺寸 |
| shape | `'square' \| 'round'` | `'square'` | Card 方框或圆形印章框 |
| radio | `boolean` | `false` | 单选模式；最多选择一项，并使用 `radiogroup` / `radio` 语义 |
| aria-label | `string` | `'Checkbox'` | 多选框组的无障碍名称 |

---

### StarTag - 标签

钉在告示板上的木牌小签：羊皮纸底、2px 木框与阶梯角，六种预设配色；`closable` 显示像素 ×，点击后标签自行移除并触发 `onClose`。

```tsx
import { StarTag } from 'stardew-valley-ui'

// 基础用法
<StarTag>防风草</StarTag>
<StarTag color="green">新鲜作物</StarTag>
<StarTag color="red">高峰定价</StarTag>
<StarTag color="yellow">限时任务</StarTag>
<StarTag color="blue">深海鱼</StarTag>
<StarTag color="purple">秘境种子</StarTag>

// 可关闭
<StarTag closable onClose={removeTag}>土豆</StarTag>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| tone | `'default' \| 'green' \| 'red' \| 'yellow' \| 'blue' \| 'purple'` | `'default'` | 预设配色：更换木框、文字与关闭悬停色 |
| color | `string` | - | 任意 CSS 颜色，覆盖 `tone` |
| closable | `boolean` | `false` | 显示像素 × 关闭按钮 |
| onClose | `() => void` | - | 点击关闭按钮移除标签后触发 |
| closeLabel | `string` | `'Close'` | 关闭按钮的无障碍名称 |
| open | `boolean` | - | 受控可见性；不传则关闭后由标签自持 |
| defaultOpen | `boolean` | `true` | 非受控模式的初始可见性 |
| children | `ReactNode` | - | 标签内容 |

---

### StarRadio - 单选框

与 `StarCheckbox` 同款方形木牌与红色 ✔ 的单选控件：选中时对勾揭幕入场，换选时旧对勾摇晃缩退；重复点击已选项不会清空选择，语义与 `StarCheckbox radio` 模式一致但 API 返回单个 `string`。

```tsx
import { StarRadio } from 'stardew-valley-ui'

const fences = [
  { value: 'wood', label: '木质栅栏' },
  { value: 'stone', label: '石质墙体' },
  { value: 'hardwood', label: '硬木围栏', disabled: true },
]

<StarRadio options={fences} value={fence} onChange={setFence} />
<StarRadio options={fences} direction="vertical" size="large" />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| options | `RadioOption[]` | - | 选项列表；每项可设置 `value`、`label`、`disabled` |
| value / defaultValue | `string` | - | 受控选中值或非受控初始值 |
| onChange | `(value: string) => void` | - | 选中项变化时返回新的 value |
| direction | `'horizontal' \| 'vertical'` | `'horizontal'` | 选项排列方向 |
| disabled | `boolean` | `false` | 禁用整个单选组 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 控件尺寸 |
| aria-label | `string` | `'Radio'` | 单选组的无障碍名称 |

---

### StarSelect - 下拉选择

与 `StarInput` 同族的木框凹陷下拉选择器：触发框共用阶梯角几何，展开折叠清单选择单项；支持禁用项、三种尺寸与块级布局，点击外部或按 Esc 收起。

```tsx
import { StarSelect } from 'stardew-valley-ui'

const crops = [
  { value: 'parsnip', label: '防风草' },
  { value: 'potato', label: '土豆' },
  { value: 'strawberry', label: '草莓', disabled: true },
]

<StarSelect options={crops} value={crop} onChange={setCrop} aria-label="作物" />
<StarSelect options={crops} placeholder="选择作物" size="large" block />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| options | `SelectOption[]` | - | 选项列表；每项可设置 `value`、`label`、`disabled` |
| value / defaultValue | `string` | - | 受控选中值或非受控初始值 |
| onChange | `(value: string) => void` | - | 选中项变化时返回新的 value |
| placeholder | `string` | - | 未选择时在触发框内显示的占位文案 |
| disabled | `boolean` | `false` | 禁用整个选择器 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 触发框尺寸 |
| block | `boolean` | `false` | 撑满容器宽度 |
| name | `string` | - | 表单字段名；根元素是 `<div>`，设置后渲染隐藏 input 参与提交 |
| aria-label | `string` | `'Select'` | 触发框与清单的无障碍名称 |

---

### StarInput - 输入框

木框凹陷的像素输入框：4px 阶梯边框 + 顶部内阴影，支持受控/非受控、前后缀、一键清空与校验状态。

```tsx
import { StarInput } from 'stardew-valley-ui'
import { Search } from 'lucide-react'

// 非受控
<StarInput label="农场名" placeholder="例如：鹈鹕农场" />

// 受控
const [name, setName] = useState('')
<StarInput label="农场名" value={name} onChange={setName} />

// 前缀 / 后缀 / 一键清空
<StarInput label="搜索作物" prefix={<Search size={16} />} suffix="金币" allowClear />

// 校验状态与字数限制
<StarInput
  label="农场名"
  status="error"
  message="名字最多 12 个字"
  maxLength={12}
  showCount
/>

// 尺寸与块级
<StarInput size="large" block />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value / defaultValue | `string` | `''` | 受控值或初始值 |
| onChange | `(value: string) => void` | - | 文本变化回调（只回传文本，DOM 事件用 `onInput` / `onKeyDown`） |
| label | `ReactNode` | - | 可见标题，用 for/id 绑定输入框 |
| message | `ReactNode` | - | 字段下方的提示或校验文案 |
| status | `'default' \| 'warning' \| 'error' \| 'success'` | `'default'` | 语义状态，决定边框与提示颜色 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 输入框尺寸（32 / 40 / 48px） |
| color | `string` | `'#71964a'` | 强调色（聚焦、光标、清空按钮），覆盖 status |
| prefix / suffix | `ReactNode` | - | 框内的前置 / 后置内容 |
| allowClear | `boolean` | `false` | 显示一键清空按钮 |
| showCount | `boolean` | `false` | 显示字数（配合 `maxLength` 显示 `n/max`） |
| block | `boolean` | `false` | 撑满容器宽度 |
| clearLabel | `string` | `'Clear'` | 清空按钮的无障碍名称 |
| onClear | `() => void` | - | 点击清空按钮后触发（配合 `allowClear`） |

其余原生属性（`placeholder`、`disabled`、`readOnly`、`maxLength`、`name`、`onFocus`…）会透传到内部的 `<input>`。

---

### StarTextarea - 多行输入

`StarInput` 的高个子兄弟：同款 4px 阶梯木框与羊皮纸凹槽，多行书写，支持状态染色、字数统计、竖向拖拽调高。

```tsx
import { StarTextarea } from 'stardew-valley-ui'

<StarTextarea label="给皮埃尔的信" placeholder="亲爱的皮埃尔……" rows={4} block />

// 校验状态与字数统计
<StarTextarea label="任务描述" status="error" message="再补充些细节" showCount maxLength={80} />

// 一键清空 + 回车提交
<StarTextarea label="便签" allowClear onPressEnter={pin} />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value / defaultValue | `string` | `''` | 受控值或初始值 |
| onChange | `(value: string) => void` | - | 文本变化回调（只回传文本） |
| rows | `number` | `4` | 初始可见行数 |
| label | `ReactNode` | - | 可见标题，绑定输入框 |
| message | `ReactNode` | - | 框下方的提示或校验文案 |
| status | `'default' \| 'warning' \| 'error' \| 'success'` | `'default'` | 语义状态，决定边框与光标颜色 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 输入框尺寸 |
| color | `string` | - | 自定义强调色，覆盖 status |
| showCount | `boolean` | `false` | 显示字数（配合 `maxLength` 显示 `n/max`） |
| block | `boolean` | `false` | 撑满容器宽度 |
| autoSize | `boolean` | `false` | 随内容自适应高度（开启后禁用手动拉伸） |
| allowClear | `boolean` | `false` | 显示一键清空按钮（有内容且可编辑时出现） |
| clearLabel | `string` | `'Clear'` | 清空按钮的无障碍名称 |
| onPressEnter | `(event: KeyboardEvent) => void` | - | 按下回车时触发（Shift+Enter 与输入法选词不触发） |

其余原生属性（`placeholder`、`disabled`、`readOnly`、`maxLength`、`onFocus`…）会透传到内部的 `<textarea>`，右下角可竖向拖拽调高。

---

### StarBadge - 徽标

物品栏角落的数量角标：带 2px 阶梯角的像素小牌，独立摆放或钉在目标右上角；超过上限折叠为 N+，红点模式只标记"有新东西"。

```tsx
import { StarBadge } from 'stardew-valley-ui'

<StarBadge count={7} />
<StarBadge count={120} />          // 显示 99+
<StarBadge dot color="#71964A" />  // 8px 方点
<StarBadge text="限定" color="#308BE2" />  // 文字角标

// 包裹目标：徽标钉在其右上角
<StarBadge count={12}>
  <button type="button">收件箱</button>
</StarBadge>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| count | `number` | - | 显示的数值；超过 `overflowCount` 折叠为 N+ |
| dot | `boolean` | `false` | 红点模式：只渲染 8px 方点，不显示数字 |
| overflowCount | `number` | `99` | 数值折叠上限 |
| showZero | `boolean` | `false` | count 为 0 时是否显示 |
| color | `string` | `'#E53935'` | 底色；边框色由它自动推导 |
| text | `ReactNode` | - | 用文字或表情代替数字角标 |
| children | `ReactNode` | - | 包裹目标；徽标钉在其右上角 |

---

### StarAlert - 警告提示

钉在告示板顶端的羊皮纸横幅：左侧 4px 语义色带标明消息性质，标题加粗、正文紧随；错误横幅以 `role="alert"` 播报，色板与 Input 的 status 一致。

```tsx
import { StarAlert } from 'stardew-valley-ui'

<StarAlert type="info" title="天气预报">明天有暴雨，记得提前浇水。</StarAlert>
<StarAlert type="error" title="矿洞遇险">第 40 层发现幽灵，请及时撤离！</StarAlert>

// 可关闭
<StarAlert type="success" title="播种成功" closable onClose={log}>防风草已种下。</StarAlert>

// 自定义图标
<StarAlert type="success" title="祝尼魔任务" showIcon icon={<span>★</span>}>给 Gunther 捐 60 件展品。</StarAlert>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 语义类型，决定色带与标题颜色 |
| title | `ReactNode` | - | 加粗标题 |
| children | `ReactNode` | - | 横幅正文 |
| showIcon | `boolean` | `false` | 显示与色带同色的语义图标（可用 icon 替换） |
| icon | `ReactNode` | - | 自定义图标，替换内置的语义图标 |
| closable | `boolean` | `false` | 显示像素 × 关闭按钮 |
| open | `boolean` | - | 受控可见性；不传则关闭后由横幅自持 |
| defaultOpen | `boolean` | `true` | 非受控模式的初始可见性 |
| onClose | `() => void` | - | 关闭后触发 |
| closeLabel | `string` | `'Close'` | 关闭按钮的无障碍名称 |
| modal | `boolean` | `false` | 以遮挡式警示对话框（`alertdialog`）渲染，身后的页面变暗且不可点击 |
| maskClosable | `boolean` | `false` | 仅 `modal`：点击遮罩是否关闭 |
| escClosable | `boolean` | `false` | 仅 `modal`：按 Escape 是否关闭 |
| actions | `ReactNode` | - | 底部右侧的操作区（如「知道了」确认按钮） |
| modalLabel | `string` | - | `modal` 模式下对话框本身的无障碍名称 |

---

### StarSkeleton - 骨架屏

内容就位前的像素条纹占位骨架，像矿洞里先搭好的支架：标题行、段落行和头像块以 45° 条纹填充，条纹以 `steps()` 像素步进向前跳；`loading` 变为 `false` 时支架拆掉，`children` 接管。

```tsx
import { StarSkeleton } from 'stardew-valley-ui'

<StarSkeleton rows={3} />
<StarSkeleton avatar rows={2} />
<StarSkeleton avatar avatarShape="circle" rows={2} />

// 与真实内容切换
<StarSkeleton loading={ready} rows={2}>
  <p>秋季收成：南瓜 ×112……</p>
</StarSkeleton>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| loading | `boolean` | `true` | 为 `false` 时渲染 children |
| rows | `number` | `3` | 段落占位行数；末行自动收短到 60% |
| title | `boolean` | `true` | 是否显示加粗标题行 |
| avatar | `boolean` | `false` | 是否在左侧显示头像占位 |
| avatarShape | `'square' \| 'circle'` | `'square'` | 头像占位的形状 |
| active | `boolean` | `true` | 是否播放条纹步进动画 |
| children | `ReactNode` | - | loading 为 `false` 时渲染的真实内容 |

---

### StarPagination - 分页

翻看公告板上一页页委托的像素翻页器：方形羊皮纸页码块像栅栏柱一样排开，当前页像盖了墨章一样变深；长页码用省略号搭桥，首尾永远可见。

```tsx
import { StarPagination } from 'stardew-valley-ui'

<StarPagination total={45} pageSize={10} onChange={(page) => setPage(page)} />

// 长列表：第 1 页、末页、当前页 ±1，其余省略
<StarPagination total={300} defaultCurrent={15} />

// 只有一页时整个退场
<StarPagination total={8} hideOnSinglePage />

// 每页条数切换：换档时当前页重锚到原来那条数据所在的页
<StarPagination
  total={45}
  defaultCurrent={9}
  defaultPageSize={5}
  showSizeChanger
  pageSizeOptions={[5, 10, 20]}
  onShowSizeChange={(page, size) => console.log(page, size)}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| total | `number` | - | 总条数，翻页器据此推导总页数 |
| pageSize | `number` | `10` | 每页条数 |
| current | `number` | - | 受控当前页（1-based）；不传则组件自持状态 |
| defaultCurrent | `number` | `1` | 非受控模式的初始页码 |
| defaultPageSize | `number` | `10` | 非受控模式的初始每页条数 |
| showSizeChanger | `boolean` | `false` | 是否显示每页条数切换器 |
| pageSizeOptions | `number[]` | `[10, 20, 50]` | 条数切换器的可选档位（自动并入当前值并排序） |
| onShowSizeChange | `(page: number, pageSize: number) => void` | - | 换档时触发，参数为重锚后的 (页码, 条数) |
| onChange | `(page: number, pageSize: number) => void` | - | 页码变化时触发 |
| hideOnSinglePage | `boolean` | `false` | 只有一页时是否隐藏 |
| showTotal | `(total: number, range: [number, number]) => ReactNode` | - | 自定义总条数文案，range 为当前页起止条目 |
| ariaLabel | `string` | 跟随语言 | 翻页器的无障碍名称 |

---

### StarCollapse - 折叠面板

可折叠的木牌分节，像翻开的手账逐节收纳任务说明：每节是一块 2px 阶梯框的羊皮纸木牌，像素箭头两步翻转，面板瞬开，默认多开互不影响。

```tsx
import { StarCollapse } from 'stardew-valley-ui'

const seasons = [
  { key: 'spring', label: '春季', content: '种下防风草和土豆。', extra: <span>收成 ×24</span> },
  { key: 'summer', label: '夏季', content: '蓝莓和辣椒是大户。', disabled: false },
]

<StarCollapse defaultActiveKeys={['spring']} items={seasons} onChange={setKeys} />

// 手风琴：同时只摊开一节
<StarCollapse accordion items={seasons} />

// 箭头排在头部另一端
<StarCollapse expandIconPosition="end" items={seasons} />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | `CollapseItem[]` | - | 分节列表；每项含 `key`、`label`、`content`、`disabled?`、`extra?`（钉在头部右侧，点击不触发折叠） |
| accordion | `boolean` | `false` | 手风琴模式：同时只展开一节 |
| expandIconPosition | `'start' \| 'end'` | `'start'` | 像素箭头的位置 |
| activeKeys | `string[]` | - | 受控展开键；不传则组件自持状态 |
| defaultActiveKeys | `string[]` | `[]` | 非受控初始展开键 |
| onChange | `(keys: string[]) => void` | - | 展开集合变化时触发 |
| ariaLabel | `string` | - | 整个面板的无障碍名称 |

---

### createGapBorderCorners - 缺角边框计算函数

> `StarGapBorder` 和 `StarGapBorderCorners` 两个渲染组件已移除，但这个「缺口边框」的生成函数保留了下来 —— 它是阶梯缺角的参考实现，`pixelCorners` 和各 canvas 绘制器描述 house style 时仍以它为准。

纯函数，用于计算缺角边框的几何数据。适合需要自定义渲染逻辑的高级场景。

```tsx
import { createGapBorderCorners } from 'stardew-valley-ui'
import type { GapBorderCornerData, CreateGapBorderCornersOptions } from 'stardew-valley-ui'

// 计算边角数据
const { cornerSteps, surfaceClipPath, cssVariables } = createGapBorderCorners({
  level: 1,
  borderColor: '#5f4322',
  backgroundColor: '#f7efc5',
  borderThickness: 8,
  cornerGap: 8,
})

// cornerSteps: 阶梯方块的位置数组
// surfaceClipPath: CSS clip-path polygon 字符串
// cssVariables: CSS 自定义属性对象

// 自定义渲染示例
function CustomBorder({ children }) {
  const { cornerSteps, cssVariables } = createGapBorderCorners({ level: 2 })

  return (
    <div style={{ position: 'relative', ...cssVariables }}>
      {cornerSteps.map(({ key, style }) => (
        <span
          key={key}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            background: cssVariables['--gap-border-color'],
            ...style,
          }}
        />
      ))}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  )
}
```

**返回值 `GapBorderCornerData`**：

| 属性 | 类型 | 说明 |
|------|------|------|
| cornerSteps | `{ key: string; style: CSSProperties }[]` | 阶梯方块位置数组 |
| surfaceClipPath | `string` | CSS clip-path polygon 字符串 |
| cssVariables | `CSSProperties` | CSS 自定义属性对象 |

**参数 `CreateGapBorderCornersOptions`**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| level | `number` | `1` | 角落阶梯级别 |
| borderColor | `string` | `'#5f4322'` | 边框颜色 |
| backgroundColor | `string` | `'#f7efc5'` | 背景颜色 |
| borderThickness | `number` | `8` | 边框粗细 |
| cornerGap | `number` | `8` | 角落间距 |

---

### StarDisplayFrame - 展示框

单层像素边框的展示框，用来托住要展示的数据。四层边框由外到内是 `2px #562c2b` → `4px #dd7a0b`
→ `2px #af4f0e` → `2px #fdecb1`，里面是 `#fed384` 内容面与黑色文字，**四角各缺 2px 像素**。
宽度随内容自适应，本质是纯容器，数据怎么排版由你决定。

```tsx
import { StarDisplayFrame } from 'stardew-valley-ui'

<StarDisplayFrame>
  <strong>1,240G</strong>
  <span>春季总收入</span>
</StarDisplayFrame>

// 布局类直接挂在框上
<StarDisplayFrame className="grid-cell" style={{ width: 240 }}>
  4,820G
</StarDisplayFrame>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | `ReactNode` | - | 框内内容 |
| className | `string` | - | 追加到根节点的类名，布局类挂这里 |
| ...rest | `HTMLAttributes<HTMLDivElement>` | - | 其余原生 div 属性（style / onClick / aria-* 等） |

四层厚度与颜色写死，不提供改色 props；角部是「每层裁同一条 2px 阶梯」的阶梯像素角，
几何与其它像素组件共用 `src/utils/pixelCorners.ts`。

---

### StarTitle - 标题

用于页面、任务和面板抬头的像素标题。组件以 Canvas 将每一层逐像素绘制，默认使用 `50px` 粗体和
`#ce9f00` 主色；可传入任意 Canvas 支持的 CSS `color`，文字内部的右上方 45° 高光与斑驳明暗点会由主色推导。外围由 `#493213` 的硬边偏移组合成
3px 锯齿描边（局部再外翻 1px 小齿与深浅碎片），每个字之间预留约 `4px` 间距，最后从字面下方 `5px` 开始投下长 `4px` 的
`rgba(41, 58, 44, 0.6)` 阴影（可通过 `showShadow={false}` 隐藏）。主文字也会加入低密度、
基于文本固定分布的同色系斑驳色点，因此有手绘像素质感而不会在重渲染时闪烁。四层独立出图，不会混成一种颜色。

```tsx
import { StarTitle } from 'stardew-valley-ui'

// 默认是语义化 h2
<StarTitle>春季收获</StarTitle>

// 按页面结构调整标题层级
<StarTitle level={1} id="page-title">星露谷账本</StarTitle>

// 中文标题同样以 Canvas 像素层绘制
<StarTitle>太中了</StarTitle>

// 主色会同步推导高光与斑驳；可调整尺寸、字距或关闭投影
<StarTitle color="#5f8f7a" fontSize={34} letterSpacing={10} showShadow={false}>
  Forest ledger
</StarTitle>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| level | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | 标题语义层级，决定渲染的 `h1`–`h6` 标签 |
| children | `string \| number` | - | Canvas 绘制的标题文本 |
| color | `string` | `'#ce9f00'` | 文字主色；Canvas 会从此色推导高光与斑驳明暗点 |
| fontSize | `number` | `50` | Canvas 字体大小（px） |
| letterSpacing | `number` | `4` | 字符间距（px；最小为 `0`） |
| showShadow | `boolean` | `true` | 是否显示 60% 透明度的硬像素投影 |
| className | `string` | - | 追加到根标题元素的类名 |
| ...rest | `HTMLAttributes<HTMLHeadingElement>` | - | 其余原生标题属性（`id` / `aria-*` / `style` 等） |

描边仍是固定的 3px 像素轮廓；`color`、`fontSize`、`letterSpacing` 与 `showShadow` 用于控制字面外观，不需要额外嵌套元素。

---

### StarPixelText - 像素化文本

把短文本先绘制进离屏 Canvas，再缩小成采样格并以 `imageSmoothingEnabled = false` 放大。它不是模糊滤镜：每个采样点都会成为一块清晰的粗颗粒像素，尤其适合把 emoji、徽章字符和复古 HUD 标签转成锯齿字形。

```tsx
import { StarPixelText } from 'stardew-valley-ui'

// 直接包裹纯文本
<StarPixelText pixelSize={8}>😄</StarPixelText>

// 受控文本；输入变化后自动重新栅格化
<StarPixelText text={emoji} pixelSize={10} fontSize={128} />

// 使用同一份 Canvas 源字形做 before/after 叠放时，可避免对比线两侧错位
<StarPixelText text="😆" pixelSize={9} renderMode="source" />

// 普通短标签同样适用
<StarPixelText pixelSize={7}>Farm!</StarPixelText>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | `string \| number` | - | 要栅格化的文本；存在时优先于 `children` |
| children | `string \| number` | - | 未传 `text` 时要栅格化的纯文本 |
| pixelSize | `number` | `8` | 一个可见方格像素的边长（px） |
| fontSize | `number` | `120` | 降采样前源 Canvas 的字体大小（px） |
| fontFamily | `string` | emoji 兼容字体栈 | 源 Canvas 使用的字体族 |
| padding | `number` | `12` | 字形四周保留的空白（px） |
| renderMode | `'pixelated' \| 'source'` | `'pixelated'` | 输出粗颗粒像素，或保留同尺寸的原始 Canvas 字形；后者适合无缝前后对比 |
| aria-label | `string` | 文本本身 | Canvas 图像的无障碍名称 |
| className / ...rest | `CanvasHTMLAttributes<HTMLCanvasElement>` | - | 追加样式及其余原生 Canvas 属性 |

---

### StarAvatar - 头像

带多层木纹与受光边框的像素头像，方框与圆框两种形状。图片加载失败时回退到 `name` 或 `alt` 派生的首字母缩写，不会出现破图。

```tsx
<StarAvatar src="/portrait.png" name="阿比盖尔" shape="circle" size={64} />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| src | `string` | - | 头像图片地址 |
| alt | `string` | - | 替代文本，同时也是派生首字母的来源 |
| name | `string` | - | 显式后备名称；派生首字母时优先于 `alt` |
| shape | `'square' \| 'circle'` | `'square'` | 方框（类 Card 圆角）或正圆 |
| size | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | 预设档位或精确像素 |
| color | `string` | - | 木框底色；光照层与 Card 同样按它推导 |
| children | `ReactNode` | - | 无图时的替代内容，显示在首字母缩写的位置 |
| className / style / ...rest | - | - | 追加到根元素；其余原生属性透传到根 `<span>` |

> `size` 收字面量也收数字，是全库唯一如此的 `size`：`64` 表示 64px，而 `<StarInput size={64}>` 是类型错误。想要「档位」语义时用另外六个组件的 `size`。

---

### StarDivider - 分割线

由像素木栅栏或像素星星等距排列组成的分割线，默认按容器宽度自动铺满。

```tsx
import { StarDivider } from 'stardew-valley-ui'

// 木栅栏（默认）
<StarDivider />

// 像素星星：换图案，不换节奏
<StarDivider icon="star" />

// 固定个数，适合窄栏
<StarDivider count={5} />
<StarDivider icon="star" count={5} />

// 换主体色：外框、高光、投影一起重算
<StarDivider color="#78ad55" />
<StarDivider icon="star" color="#78ad55" />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| count | `number` | - | 固定图案个数；不传则按容器宽度自动铺满（格数向上取整，宽度不是整步距时最后一格被 `overflow` 截断） |
| icon | `'fence' \| 'star'` | `'fence'` | 图案类型：20×28 的木栅栏，或 36×36 的像素星星 |
| color | `string` | `'#fa9405'` | 主体色，支持 `#rgb` / `#rrggbb`；外框、高光与左下投影据此实时推导，非法值回退到默认木色 |

两种图案共用同一套颜色与光照方向：主体 `#fa9405`、外描边 `#9b440d`、右上高光 `#ffd9a3`、左下投影 `#492b18`。
传 `color` 时这四层会整体换成以该色为基准的一套 —— 外框混向暖黑、高光是主体的淡色、投影是主体的深色，
所以换个色相进来不会留下旧的木头棕。推导逻辑独立导出为 `deriveDividerPalette`，需要自己算一套配色时可以直接调用。
栅栏每格还带两根连接横杆，星星则只保留图案本身，间距仍是 30px。几何常量从包根导出：
栅栏的 `FENCE_POST_*`，星星的 `STAR_DIVIDER_CELL` / `STAR_DIVIDER_GAP` / `STAR_DIVIDER_WIDTH` / `STAR_DIVIDER_HEIGHT` / `STAR_DIVIDER_PITCH`。

## Hooks

### useToggle

布尔值切换 Hook。

```tsx
import { useToggle } from 'stardew-valley-ui'

const [visible, toggle, setToggle] = useToggle(false)
// visible: 当前值
// toggle(): 切换
// setToggle(true): 设置值
```

### useClipboard

剪贴板操作 Hook，自动降级到 `execCommand`。

```tsx
import { useClipboard } from 'stardew-valley-ui'

const { copied, copy, reset } = useClipboard()
// copied: 是否已复制（2秒后自动重置）
// copy(text): 复制文本
// reset(): 手动重置状态
```

### useLocalStorage

localStorage 持久化 Hook，支持跨标签页同步。

```tsx
import { useLocalStorage } from 'stardew-valley-ui'

const [value, setValue] = useLocalStorage('key', 'defaultValue')
// value: 当前值
// setValue: 设置值（支持函数式更新）
```

### useNineSliceBackground

九宫格背景绘制 Hook。

```tsx
import { useNineSliceBackground } from 'stardew-valley-ui'

const { hostRef, canvasProps, isReady, redraw } = useNineSliceBackground({
  enabled: true,
  src: '/background.png',
  insets: { top: 8, right: 8, bottom: 8, left: 8 },
  imageSmoothingEnabled: false,
  backgroundColor: '#F5E6CC',
})
```

---

## 工具函数

### classNames

类名合并工具（基于 clsx）。

```tsx
import { classNames } from 'stardew-valley-ui'

classNames('a', 'b')                    // 'a b'
classNames('a', false && 'b', 'c')      // 'a c'
classNames({ active: true, disabled: false }) // 'active'
```

### copyToClipboard

复制文本到剪贴板，自动降级到 `execCommand`。

```tsx
import { copyToClipboard } from 'stardew-valley-ui'

await copyToClipboard('Hello World')
```

### resolveAssetPath

解析资源路径，自动处理 GitHub Pages base path。

```tsx
import { resolveAssetPath } from 'stardew-valley-ui'

resolveAssetPath('/image.png') // 返回带 base 的完整路径
```

### 像素形状工具

```tsx
import {
  createPixelCircleClip,
  createPixelPillClip,
  createPixelRoundedRectClip,
  createPixelCornerClip,
} from 'stardew-valley-ui'

const clip = createPixelCircleClip(20)
// clip.clipPath → 'polygon(...)' 可用于 CSS clip-path
// clip.width / clip.height → 尺寸
```

### 九宫格绘制工具

```tsx
import {
  calculateNineSliceLayout,
  drawNineSlice,
} from 'stardew-valley-ui'

const layout = calculateNineSliceLayout({
  targetWidth: 200,
  targetHeight: 100,
  sourceWidth: 64,
  sourceHeight: 64,
  insets: { top: 8, right: 8, bottom: 8, left: 8 },
})

drawNineSlice(ctx, {
  image,
  sourceWidth: 64,
  sourceHeight: 64,
  targetWidth: 200,
  targetHeight: 100,
  insets: { top: 8, right: 8, bottom: 8, left: 8 },
})
```

---

## 类型

所有组件 Props 类型均可直接导入：

```tsx
import type {
  StarNineSliceButtonProps,
  NineSliceButtonTheme,
  StarCardProps,
  StarDialogProps,
  DialogPlacement,
  StarDrawerProps,
  DrawerPlacement,
  MessageProps,
  MessageType,
  StarCalendarProps,
  CalendarItem,
  StarDatePickerProps,
  StarTitleProps,
  StarTitleLevel,
  StarDisplayFrameProps,
  StarAvatarProps,
  AvatarShape,
  AvatarSize,
  StarDividerProps,
  DividerIcon,
  StarLoadingProps,
  StarPopupProps,
  PopupPlacement,
  StarEmptyStateProps,
  StarTypewriterProps,
  StarTabProps,
  StarTabItem,
  SwitchProps,
  StarRatingProps,
  RatingIcon,
  StarProgressProps,
  ProgressVariant,
  GapBorderCornerData,
  CreateGapBorderCornersOptions,
  StarInputProps,
  InputSize,
  InputStatus,
} from 'stardew-valley-ui'
```

---

## 构建与发布

### 构建库（发布到 npm）

```bash
bun run build:lib
```

输出到 `dist/`：

| 文件 | 说明 |
| --- | --- |
| `stardew-valley-ui.mjs` | ESM 入口 |
| `stardew-valley-ui.cjs` | CommonJS 入口 |
| `stardew-valley-ui.css` | 样式文件（`stardew-valley-ui/style.css`） |
| `stardew-valley-ui.auto.mjs` / `.auto.cjs` | 自动注入样式的入口（`stardew-valley-ui/auto`），由 `scripts/build-style-entry.mjs` 生成 |
| `index.d.ts` / `auto.d.ts` 等 | 类型声明 |
| 内置像素素材 | 随 JS 内联或作为 `dist/assets/**` 发出 |

发布前执行校验，它会断言五个出口都存在、样式已内嵌进 `/auto` 入口、且没有把演示站资源路径带进包：

```bash
bun run build:lib
bun run verify:package
```

### 发布到 npm

```bash
npm publish --registry=https://registry.npmjs.org/ --access public
```

⚠️ **必须显式带 `--registry=https://registry.npmjs.org/`** —— 本机 `~/.npmrc` 保留了淘宝镜像用于装包，它是只读镜像，发布会被它接走而失败。

首次发布还需要一个**启用了 Bypass 2FA 的 Granular Access Token**（npm 现在强制要求 2FA 或该令牌，否则返回 `E403`）。

完整流程（令牌生成、版本号、发布后核验、常见报错对照、npm 政策时间表）见 **[docs/publishing.md](docs/publishing.md)**。

### 构建演示站

```bash
bun run build:app
```

`dist/` 是库产物与演示站产物**共用的目录，两种构建互相覆盖**：发布用 `build:lib`，跑演示站用 `build:app` / `build`。
线上站点由 `.github/workflows/deploy-pages.yml` 在 CI 里自行构建，本地 `dist/` 的状态不影响它。

---

## 本地开发

```bash
bun install
bun run dev
```

运行测试：

```bash
bun run test:run
bun run test:coverage
```

代码检查：

```bash
bun run lint
```

---

## 新增与移除组件

组件目录 `src/router/componentRegistry.tsx` 是组件库的唯一数据源：**路由表、左侧导航、组件总览页、冒烟测试**都从它派生。
所以新增组件的唯一手动步骤就是补一条目录条目，其余入口自动同步 —— 用脚手架一次做完：

```bash
# 生成组件 / 样式 / 单测 / 演示页，并把条目接入目录，最后自动跑一遍一致性校验
bun run gen:component Switch \
  --zh 开关 --en Switch --icon ToggleRight \
  --desc-zh "像素药丸形状的开关，用来点亮灯或切换难度。" \
  --desc-en "A pixel pill switch for lamps and difficulty toggles."

# 只打印将要写入的内容，不落盘
bun run gen:component Switch --dry-run
```

生成后需要做的是：实现组件、把演示页里的 `TODO` 换成真实文案与示例、补齐 API 表。

如果手改目录，请务必跑一次守卫 —— 它会指出第几处漏了：

```bash
bun run check:components   # 秒级；校验目录 ↔ 懒加载 ↔ 演示页 ↔ 组件文件 ↔ 导出，并断言左侧导航渲染出每条路由
```

### 移除组件

反向操作同样只有一条命令 —— 它按目录条目派生全部改动（删文件、摘条目、摘导出、清 README 与 i18n），末尾自动跑守卫：

```bash
bun run rm:component Title              # 移除 StarTitle：组件文件 / 演示页 / 条目 / 导出 / 文档文案
bun run rm:component Title --dry-run    # 只看计划，不删不改
```

`README.md` 与 `i18n/dictionaries.ts` 是手写文件，找不到对应内容时只告警不报错；其余入口漏一处守卫就会红。

完整约定（命名、五方一致性契约、视觉与主题、文案、完成定义、移除流程）见 [docs/component-conventions.md](docs/component-conventions.md)。

---

## 版权说明

本项目采用 **非商业许可证**：仅可用于个人学习、研究、作品集展示、非营利开源实验及不对外运营的内部原型。不得将本项目或其衍生成果用于销售、收费服务、商业网站、营销获客、商业客户交付，或其他直接、间接盈利活动。

使用或修改时必须保留许可证和来源说明；不得暗示本项目是《星露谷物语》官方作品、合作项目或已获得权利人背书。本项目 **不会直接使用《星露谷物语》的官方素材**；相关名称、标识及游戏素材的权利归各自权利人所有。

完整条款以根目录 [LICENSE](LICENSE) 为准。若你的用途涉及商业或法律判断，请不要使用本项目，并咨询有资质的专业人士。

## 致谢

欢迎页的交互节奏与视觉气质受到 [Animal Island UI](https://github.com/guokaigdg/animal-island-ui) 启发。详细说明见 [docs/acknowledgements.md](docs/acknowledgements.md)；本项目未复制其代码或素材。

---

## 参与共建

- 如果你在使用过程中遇到问题、疑问或有改进建议，欢迎提交 **Issues**。
- 如果你有兴趣帮忙维护，需要了解：React + TypeScript、Bun、Vite、SCSS、Vitest。
