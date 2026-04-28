# Default 按钮改用 defaultBtn.png 设计说明

- 日期：2026-04-28
- 范围：仅修改 `StarNineSliceButton` 的 `variant="default"`

## 目标

把项目中的默认按钮背景改为使用 `public/defaultBtn.png` 绘制，同时保持现有按钮组件结构、交互状态和尺寸能力不变。

## 范围定义

本次只调整默认按钮：

- 修改对象：`src/components/ui/NineSliceButton.tsx` 中的 `variant="default"`
- 不修改：`primary`、`warning`、`danger`、`dashed`、`text`、`link`
- 不修改：四季主题按钮 `theme="spring" | "summer" | "autumn" | "winter"`

## 视觉规则

### 背景资源

默认按钮改为使用：

- `public/defaultBtn.png`

默认按钮继续沿用现有九宫格背景能力进行绘制，不新增独立按钮组件，也不重写为四季主题那种单独 canvas 绘制逻辑。

### 色值语义

以下色值作为默认按钮的视觉语义约束：

- 背景色：`#FDF4E6`
- 外层边框：`#8B4513`
- 内层边框：`#D2B48C`
- 正常文字色：`#5D4037`
- Hover 文字色：`#3E2723`
- Active 文字色：`#2E1B15`
- Disabled 文字色：`#B0BEC5`
- 禁用态背景遮罩：`#F0E6D2`，60% 透明度

其中背景色和边框色以 `defaultBtn.png` 的实际像素表现为准，代码不重复绘制这三层颜色；代码主要负责正确使用图片、切换文字色，以及在禁用态叠加遮罩。

## 状态设计

### normal

- 背景使用 `defaultBtn.png`
- 文字色使用 `#5D4037`

### hover

- 背景仍使用 `defaultBtn.png`
- 保留现有 hover 位移交互
- 文字色切换为 `#3E2723`

### active

- 背景仍使用 `defaultBtn.png`
- 保留现有 active 按压位移交互
- 文字色切换为 `#2E1B15`

### disabled

- 背景仍使用 `defaultBtn.png`
- 在背景层叠加 `rgba(240, 230, 210, 0.6)` 遮罩
- 文字色使用 `#B0BEC5`
- 保持不可点击状态

## 实现设计

### 组件逻辑

在 `src/components/ui/NineSliceButton.tsx` 中：

1. 仅让普通默认按钮使用 `/defaultBtn.png`
2. 四季主题按钮继续走现有 seasonal 绘制逻辑，不受影响
3. 其他图片按钮类型继续保持现有背景资源和逻辑不变
4. default 按钮增加状态感知：根据 hover / active / disabled 切换文字色
5. disabled 的 default 按钮通过背景层叠加遮罩来表达禁用态

### 样式逻辑

在 `src/components/ui/NineSliceButton.module.scss` 中：

1. 更新 default 按钮的默认文字色变量
2. 保持现有尺寸、布局、loading、block 相关样式结构不变
3. 不调整其他 variant 的样式定义

## 兼容性与边界

- `backgroundSrc` 自定义能力保留，但组件默认行为对默认按钮会切到 `/defaultBtn.png`
- `small`、`medium`、`large` 继续沿用现有内边距和字号规则
- `block`、`loading`、`disabled`、`children` 渲染结构不改
- 不引入新的主题枚举、组件拆分或额外抽象

## 验证点

需要验证以下场景：

1. `ButtonDemo` 页面中的默认按钮背景已切换为 `defaultBtn.png`
2. 默认按钮 normal / hover / active / disabled 的文字色符合设计
3. disabled 默认按钮具有禁用遮罩效果
4. 默认按钮的 `small`、`block`、`loading` 状态正常
5. `primary` / `warning` / `danger` / `dashed` / `text` / `link` 未变化
6. 四季主题按钮未变化

## 不做的事

本次明确不做以下内容：

- 不调整四季主题按钮资源
- 不新增新的按钮组件
- 不重构整个按钮背景绘制体系
- 不为 hover / active 新增额外背景特效
