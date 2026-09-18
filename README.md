# Stardew Valley UI

一个 **星露谷风格、像素化的前端组件库**，基于 React + TypeScript + Vite 构建，使用 Bun 作为默认包管理器和运行时。
目标是打造一个复古像素风格的 UI 组件库，适合网页和应用开发。

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
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| open | `boolean` | - | 是否打开 |
| title | `string` | - | 对话标题 |
| content | `string \| string[]` | - | 对话内容，数组表示多页 |
| image | `string` | - | 角色头像 |
| name | `string` | - | 角色名称 |
| actions | `DialogAction[] \| null` | - | 操作按钮，null 则不显示 |
| maskClosable | `boolean` | `true` | 点击遮罩是否关闭 |
| typewriter | `boolean` | `true` | 打字机效果 |
| typewriterSpeed | `number` | `100` | 打字速度（毫秒） |
| onClose | `() => void` | - | 关闭回调 |

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

像素风日历组件，支持事件标记。

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

支持单选和范围选择的日期选择器。

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

---

### StarTitle - 标题

像素风格标题组件，使用 Canvas 绘制背景。

```tsx
import { StarTitle } from 'stardew-valley-ui'

<StarTitle size="large">星露谷物语</StarTitle>
<StarTitle size="medium" align="left">副标题</StarTitle>
<StarTitle size="small" as="h1">小标题</StarTitle>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | `string` | - | 标题文字 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 标题尺寸 |
| align | `'left' \| 'center'` | `'center'` | 对齐方式 |
| as | `'div' \| 'h1' \| 'h2' \| 'h3' \| 'p'` | `'h2'` | 渲染标签 |
| backgroundSrc | `string` | `'/titleBg.png'` | 背景图片 |

---

### StarLoading - 加载

像素风加载动画组件，包子被吃掉的动画效果。

```tsx
import { StarLoading } from 'stardew-valley-ui'

<StarLoading />
<StarLoading active={false} text="加载完成" />
<StarLoading size={48} text="请稍候..." />
<StarLoading center />
<StarLoading fill />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| active | `boolean` | `true` | 是否激活动画 |
| text | `string` | `'正在加载...'` | 加载文字 |
| size | `number` | `28` | 图标尺寸 |
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

### StarGapBorder - 缺角边框

像素风缺角边框容器。

```tsx
import { StarGapBorder } from 'stardew-valley-ui'

<StarGapBorder>
  <p>内容</p>
</StarGapBorder>

<StarGapBorder
  borderColor="#8B4513"
  backgroundColor="#FFF8DC"
  cornerLevel={2}
  borderThickness={6}
>
  <p>自定义边框</p>
</StarGapBorder>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| borderColor | `string` | `'#5f4322'` | 边框颜色 |
| backgroundColor | `string` | `'#f7efc5'` | 背景颜色 |
| borderThickness | `number` | `8` | 边框粗细 |
| cornerGap | `number` | `8` | 角落间距 |
| cornerLevel | `1 \| 2 \| 3` | - | 角落阶梯级别 |
| contentPadding | `number` | `24` | 内容内边距 |
| contentClassName | `string` | - | 内容区域类名 |

---

### StarGapBorderCorners - 缺角边框装饰

独立的缺角边框装饰组件，可在任意 `position: relative` 容器中渲染边角效果。适合用于自定义容器边框、叠加层装饰等场景。

```tsx
import { StarGapBorderCorners } from 'stardew-valley-ui'

// 在自定义容器中使用
<div style={{ position: 'relative', width: 200, height: 100 }}>
  <StarGapBorderCorners level={1} />
  <div style={{ position: 'relative', zIndex: 2, padding: 16 }}>
    内容区域
  </div>
</div>

// 自定义颜色
<div style={{ position: 'relative' }}>
  <StarGapBorderCorners
    level={2}
    borderColor="#8B4513"
    backgroundColor="#FFF8DC"
    borderThickness={6}
  />
  <div style={{ position: 'relative', zIndex: 2 }}>内容</div>
</div>

// 不同阶梯级别
<StarGapBorderCorners level={1} />  // 每角 1 个阶梯
<StarGapBorderCorners level={2} />  // 每角 3 个阶梯
<StarGapBorderCorners level={3} />  // 每角 5 个阶梯
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| level | `1 \| 2 \| 3` | `1` | 角落阶梯级别 |
| borderColor | `string` | `'#5f4322'` | 边框颜色 |
| backgroundColor | `string` | `'#f7efc5'` | 背景颜色 |
| borderThickness | `number` | `8` | 边框粗细 |
| cornerGap | `number` | `8` | 角落间距 |

**注意**：父容器需要设置 `position: relative`，内容区域需要设置 `position: relative; z-index: 2` 以显示在边角装饰之上。

---

### createGapBorderCorners - 缺角边框计算函数

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

### PixelButton - 像素按钮

简单像素风格按钮，支持自定义颜色。

```tsx
import { PixelButton } from 'stardew-valley-ui'

<PixelButton
  bgColor="#ffffff"
  textColor="#333333"
  borderColor="#ff0000"
  shadowColor="#999999"
>
  像素按钮
</PixelButton>
```

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
  MessageProps,
  MessageType,
  StarCalendarProps,
  CalendarItem,
  StarDatePickerProps,
  StarTitleProps,
  TitleSize,
  StarLoadingProps,
  StarPopupProps,
  PopupPlacement,
  StarEmptyStateProps,
  StarTypewriterProps,
  StarTabProps,
  StarTabItem,
  SwitchProps,
  StarGapBorderProps,
  StarGapBorderCornersProps,
  GapBorderCornerData,
  CreateGapBorderCornersOptions,
  PixelButtonProps,
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
- `style.css` — 样式文件
- `index.d.ts` — 类型声明

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

## 新增组件

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

完整约定（命名、五方一致性契约、视觉与主题、文案、完成定义）见 [docs/component-conventions.md](docs/component-conventions.md)。

---

## 版权说明

由于版权问题，本项目 **不会直接使用星露谷的官方素材**。
所有 UI 元素均由我自己编写或通过 AI 生成，力求还原星露谷风格，但不会涉及版权风险。

---

## 参与共建

- 如果你在使用过程中遇到问题、疑问或有改进建议，欢迎提交 **Issues**。
- 如果你有兴趣帮忙维护，需要了解：React + TypeScript、Bun、Vite、SCSS、Vitest。
