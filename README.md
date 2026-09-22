# Stardew Valley UI

一个 **星露谷风格、像素化的 React 组件库**，基于 React、TypeScript 与 Vite 构建。它既包含可组合的 UI 组件，也提供日期、画布九宫格和像素形状等工具函数。

面向业务项目发布：提供 ESM、CommonJS、类型声明与单独的样式入口；库自带的像素素材会被打进产物，无需在宿主项目的 `public/` 目录额外复制文件。

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

在入口文件中引入组件库样式：

```tsx
import 'stardew-valley-ui/style.css'
```

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

只需在应用的全局入口（例如 Vite 的 `main.tsx`、Next.js 的根布局或应用样式入口）**引入一次**样式。组件库的内部类名使用 CSS Modules，不会向宿主项目写入全局组件样式。

```tsx
// main.tsx / app/layout.tsx
import 'stardew-valley-ui/style.css'
```

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
| 容器与展示 | `StarCard`、`StarDisplayFrame`、`StarDivider`、`StarAvatar`、`StarEmptyState`、`StarLoading` |
| 表单与操作 | `StarNineSliceButton`、`StarInput`、`StarSwitch`、`StarRating`、`StarProgress` |
| 反馈与浮层 | `StarDialog`、`StarDrawer`、`StarPopup`、`message`、`StarTypewriter` |
| 日期与导航 | `StarCalendar`、`StarDatePicker`、`StarTab` |

完整 Props 类型可从根入口以 `import type` 方式导入；组件均支持 `className`，大部分容器类组件也支持原生 `style` 与相应 DOM 属性。

更完整的素材、SSR / RSC 边界和维护者发布检查请见 [接入指南](docs/consumer-integration.md)。

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
| variant | `'default' \| 'primary' \| 'warning' \| 'danger' \| 'dashed' \| 'text' \| 'link' \| 'concise'` | `'default'` | 按钮变体 |
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
<StarCard color="night-village">夜之村庄</StarCard>
<StarCard color="forest-farm">森林农场</StarCard>
<StarCard color="wooden-cabin">木屋</StarCard>
<StarCard color="lake-night">湖之夜</StarCard>
<StarCard color="flower-festival">花舞节</StarCard>
<StarCard color="mine-starry">矿洞星空</StarCard>

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
| color | `CardThemeColor` | - | 配色，支持预设名或自定义色值 |
| headerExtra | `ReactNode` | - | 标题栏额外内容 |
| footer | `ReactNode` | - | 页脚内容 |
| hoverable | `boolean` | `false` | 是否有悬浮效果 |

预设配色：`night-village`、`forest-farm`、`wooden-cabin`、`lake-night`、`flower-festival`、`mine-starry`、`farmland`、`orchard-grass`、`workshop-ore`、`night-celebration`

---

### StarDialog - 对话框

星露谷风格的对话/对话框组件，支持打字机效果和分页。

```tsx
import { StarDialog } from 'stardew-valley-ui'

// 基础用法
<StarDialog
  open={open}
  title="镇长"
  content="欢迎来到鹈鹕镇！"
  onClose={() => setOpen(false)}
/>

// 带角色头像
<StarDialog
  open={open}
  title="皮埃尔"
  content="欢迎光临！"
  image="/character.png"
  name="皮埃尔"
  onClose={() => setOpen(false)}
/>

// 多页内容
<StarDialog
  open={open}
  title="信件"
  content={['第一页内容', '第二页内容', '第三页内容']}
  onClose={() => setOpen(false)}
/>

// 关闭打字机效果
<StarDialog
  open={open}
  content="直接显示"
  typewriter={false}
  onClose={() => setOpen(false)}
/>

// 屏幕下方居中，并占满可用宽度
<StarDialog
  open={open}
  placement="bottom"
  content="明天再来继续探索吧。"
  onClose={() => setOpen(false)}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| open | `boolean` | - | 是否打开 |
| title | `string` | - | 对话标题 |
| content | `string \| string[]` | - | 对话内容，数组表示多页 |
| image | `string` | - | 角色头像 |
| name | `string` | - | 角色名称 |
| actions | `DialogAction[] \| null` | - | 操作按钮，null 则不显示 |
| mask | `'dark' \| 'light'` | `'dark'` | 遮罩风格 |
| placement | `'center' \| 'bottom'` | `'center'` | 屏幕位置；`bottom` 在下方居中并占满可用宽度 |
| maskClosable | `boolean` | `true` | 点击遮罩是否关闭 |
| typewriter | `boolean` | `true` | 打字机效果 |
| typewriterSpeed | `number` | `100` | 打字速度（毫秒） |
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
| open | `boolean` | - | 受控可见状态 |
| placement | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | 抽屉进入方向 |
| title | `ReactNode` | - | 可选标题 |
| footer | `ReactNode` | - | 可选固定页脚 |
| children | `ReactNode` | - | 抽屉主体内容 |
| className | `string` | - | 添加到抽屉面板的类名 |
| maskStyle | `CSSProperties` | - | 覆盖遮罩层的内联样式 |
| focusEffect | `boolean` | `true` | 是否缩小并柔化原页面 |
| maskClosable | `boolean` | `true` | 点击遮罩是否请求关闭 |
| onClose | `() => void` | - | 点击关闭按钮、遮罩或 Escape 时触发 |

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
| position | `'top' \| 'bottom-left' \| 'bottom-right'` | `'top'` | 消息位置 |
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
| todayLabel | `string` | `'回到今日'` | 「回到今日」按钮文案 |
| showToday | `boolean` | `true` | 是否显示「回到今日」按钮 |
| todayOffsetMinutes | `number` | `480` | 计算「今日」所用的时区偏移（分钟），480 即东八区 |

> 翻月、「回到今日」和下拉选月都会走 `onMonthChange`；目标月份和当前一致时不会重复触发。

`CalendarItem`：

| 属性 | 类型 | 说明 |
|------|------|------|
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

支持单选和范围选择的日期选择器。工具栏与 `StarCalendar` 共用：点击月份标题弹出年月下拉，右上角「回到今日」按东八区（UTC+8）当天把视图带回本月（只移动视图，不改动已选日期）。

```tsx
import { StarDatePicker } from 'stardew-valley-ui'

// 单选模式
<StarDatePicker
  mode="single"
  onChange={(value) => console.log(value.dateTimestamp)}
/>

// 范围选择
<StarDatePicker
  mode="range"
  onChange={(value) => console.log(value.startTimestamp, value.endTimestamp)}
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
| value | `number \| { startTimestamp: number \| null; endTimestamp: number \| null }` | - | 受控值 |
| defaultValue | 同 value | - | 默认值 |
| onChange | `(value) => void` | - | 变化回调 |
| minDate | `number` | - | 最小日期 |
| maxDate | `number` | - | 最大日期 |
| disabledDates | `number[]` | `[]` | 禁用日期 |
| showOutsideDays | `boolean` | `true` | 显示非当月日期 |
| todayLabel | `string` | `'回到今日'` | 「回到今日」按钮文案 |
| showToday | `boolean` | `true` | 是否显示「回到今日」按钮 |
| todayOffsetMinutes | `number` | `480` | 计算「今日」所用的时区偏移（分钟），480 即东八区；仅影响「今日」的判断与按钮落点，不会改动选中值 |

---

### StarLoading - 加载

像素风加载动画组件：中央洒水器带动八株胡萝卜沿扁圆轨迹顺时针成熟，提示文案的尾部点号会随每秒的生长节奏循环。

```tsx
import { StarLoading } from 'stardew-valley-ui'

<StarLoading />
<StarLoading active={false} text="加载完成" />
<StarLoading size={144} text="请稍候..." />
<StarLoading speed={500} text="快速生长" />
<StarLoading center />
<StarLoading fill />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| active | `boolean` | `true` | 是否激活动画 |
| text | `string` | `'正在加载...'` | 加载文字 |
| size | `number` | `144` | 完整花圃的直径 |
| speed | `number` | `1000` | 每株胡萝卜生长的间隔（毫秒）；数值越小动画越快 |
| gap | `number` | `8` | 图标与文字间距 |
| center | `boolean` | `false` | 居中显示 |
| block | `boolean` | `false` | 块级显示 |
| fill | `boolean` | `false` | 填满容器 |

---

### StarPopup - 弹窗

气泡弹窗组件，支持多种位置和触发方式。

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
| actions | `PopupAction[]` | - | 操作按钮 |
| offset | `number` | `12` | 偏移距离 |

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

像素风开关组件。

```tsx
import { StarSwitch } from 'stardew-valley-ui'

<StarSwitch checked={on} onChange={setOn} />
<StarSwitch size="small" />
<StarSwitch size="large" color="#4ade80" />
<StarSwitch disabled />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| checked | `boolean` | `false` | 是否选中 |
| onChange | `(checked: boolean) => void` | - | 变化回调 |
| disabled | `boolean` | `false` | 是否禁用 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 开关尺寸 |
| color | `string` | `'#4ade80'` | 开启颜色 |

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
| aria-label | `string` | `'Checkbox'` | 多选框组的无障碍名称 |

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

其余原生属性（`placeholder`、`disabled`、`readOnly`、`maxLength`、`name`、`onFocus`…）会透传到内部的 `<input>`。

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
  StarDisplayFrameProps,
  StarAvatarProps,
  AvatarShape,
  AvatarSize,
  StarDividerProps,
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

### 构建库

```bash
bun run build:lib
```

输出到 `dist/` 目录：
- `stardew-valley-ui.mjs` — ESM 格式
- `stardew-valley-ui.cjs` — CommonJS 格式
- `stardew-valley-ui.css` — 样式文件（通过 `stardew-valley-ui/style.css` 导入）
- `index.d.ts` — 类型声明
- 内置像素素材 — 自动由组件引用（在 Vite 库构建中会随 JS 嵌入或作为构建资产输出）

发布前执行：

```bash
bun run build:lib
bun run verify:package
```

`verify:package` 会校验 ESM、CommonJS、类型和样式子路径导出是否真实存在，并确保内置素材已经打入库产物、未遗留演示站专用路径。

### 构建演示站

```bash
bun run build:app
```

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

由于版权问题，本项目 **不会直接使用星露谷的官方素材**。
所有 UI 元素均由我自己编写或通过 AI 生成，力求还原星露谷风格，但不会涉及版权风险。

---

## 参与共建

- 如果你在使用过程中遇到问题、疑问或有改进建议，欢迎提交 **Issues**。
- 如果你有兴趣帮忙维护，需要了解：React + TypeScript、Bun、Vite、SCSS、Vitest。
