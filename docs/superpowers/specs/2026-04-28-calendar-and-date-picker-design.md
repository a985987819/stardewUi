# 日历与日期选择器组件设计说明

- 日期：2026-04-28
- 范围：新增 `StarCalendar` 与 `StarDatePicker` 两个可复用组件，以及共享底层 `CalendarGrid`

## 目标

在当前像素风 UI 组件库中新增一套公历日期组件，视觉风格参考星露谷式米黄色像素日历，但不逐像素复刻原图。

本次交付包含两部分：

1. `StarCalendar`
   - 提供月视图展示
   - 支持年月跳转
   - 支持为某一天挂载多条业务数据
   - 支持在日期格中显示标识图标
   - 支持鼠标悬浮查看当天详情
2. `StarDatePicker`
   - 支持按年、月、日选择
   - 支持选择单日或日期区间
   - 最终通过回调统一返回毫秒时间戳

## 范围定义

本次新增内容：

- 新增共享月历网格底层 `CalendarGrid`
- 新增展示型组件 `StarCalendar`
- 新增选择型组件 `StarDatePicker`
- 新增日历相关工具函数
- 新增两个 demo 页面并接入现有组件展示路由
- 新增单元测试覆盖关键日期逻辑与组件行为

本次不做的内容：

- 不实现时分秒选择
- 不实现多月并排展示
- 不实现农历、节假日、时区切换等高级日历能力
- 不实现移动端原生弹层式选择器替代方案
- 不引入第三方日期库，优先使用原生 `Date`

## 总体方案

采用“共享底层网格 + 两个上层组件”的方案。

### 组件分层

1. `CalendarGrid`
   - 负责生成并渲染月视图网格
   - 负责日期状态样式和通用点击逻辑
   - 不感知业务语义，只接收标准化后的日期单元与状态
2. `StarCalendar`
   - 基于 `CalendarGrid` 实现纯展示能力
   - 负责处理事件数据、图标展示、悬浮信息
3. `StarDatePicker`
   - 基于 `CalendarGrid` 实现单日/区间选择
   - 负责年份、月份导航与时间戳结果输出
4. `calendar utils`
   - 负责公历月数据生成、时间戳归一化、区间计算与月份跳转

### 方案理由

- 日历展示和日期选择共享同一套网格，视觉与交互一致
- 上层职责清晰，避免单个组件因模式切换导致 props 膨胀
- 便于后续扩展，例如未来增加只读区间高亮、禁用日期等能力

## 时间模型

本次组件统一使用真实公历日期。

时间戳约定如下：

- 日级别数据一律归一化为“本地时区当天 00:00:00.000”的毫秒时间戳
- `StarDatePicker` 对外返回值也遵循上述规则
- 区间选择时，开始和结束均返回对应自然日零点时间戳

这样可以减少时分秒和时区偏移导致的选中错位问题，也符合当前组件的“按天工作”定位。

## 视觉设计

### 整体风格

- 参考图的核心特征为米黄色底色、深色描边、粗线条网格、像素字体、轻装饰感
- 视觉上保持“同类气质”，不追求精确复刻
- 导航按钮优先复用现有按钮组件，避免新造一套按钮语言

### 网格结构

- 固定 7 列，按周一到周日排序
- 表头显示中文 `一 二 三 四 五 六 日`
- 日期格在 demo 中尽量接近正方形
- 每个日期格包含三层内容：
  - 左上角日期数字
  - 中部或底部的标识区域
  - 悬浮详情触发区域

### 状态层级

展示模式重点状态：

- 默认日期
- 当月外日期
- 今天
- 有数据日期
- 悬浮日期

选择模式重点状态：

- 默认
- 选中
- 区间中
- 区间起点
- 区间终点
- 悬浮预览区间

## 数据模型

### 日历数据项

`StarCalendar` 使用 `items: CalendarItem[]` 作为主要输入，每条数据绑定到某一天。

建议结构：

```ts
type CalendarItem = {
  date: number | string | Date
  title: string
  description?: string
  iconKey?: string
  iconSrc?: string
  iconNode?: React.ReactNode
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  meta?: Record<string, unknown>
}
```

说明：

- `date` 支持 `Date`、可解析日期字符串或毫秒时间戳，内部统一转为日级时间戳
- 图标输入支持三种方式并存，优先级固定为 `iconNode > iconSrc > iconKey`
- `tone` 用于控制 tooltip 或标记颜色语义
- `meta` 保留给业务方透传附加信息

### 图标映射

组件需同时支持两种来源：

1. 直接传图标资源
   - 通过 `iconNode` 或 `iconSrc`
2. 传业务类型键值
   - 通过 `iconKey`
   - 结合 `iconMap` 之类的外部映射配置渲染

这样可以兼顾通用性与业务接入效率。

### 同日多条数据

- 同一天允许存在多条 `CalendarItem`
- 日期格内默认仅展示前 `N` 个标识
- 超出数量时显示聚合提示，例如 `+2`
- Tooltip 展示该日完整数据列表

## 组件设计

### `StarCalendar`

职责：

- 展示当前月份
- 支持切换上月和下月
- 渲染当天图标与聚合数量
- 显示悬浮详情
- 支持自定义初始月份与外部受控月份

建议 props 范围：

```ts
type StarCalendarProps = {
  value?: number
  defaultValue?: number
  onMonthChange?: (monthTimestamp: number) => void
  items?: CalendarItem[]
  maxVisibleMarkers?: number
  iconMap?: Record<string, React.ReactNode | string>
  showOutsideDays?: boolean
  className?: string
}
```

设计说明：

- `value/defaultValue` 表示当前显示月份，建议使用该月 1 号零点时间戳
- `showOutsideDays` 控制是否显示前后月补位日期
- 当鼠标悬浮在某一天时，如果该天有数据，则显示 tooltip

### `StarDatePicker`

职责：

- 支持单日选择与区间选择
- 支持按年、月切换查看
- 支持通过点击格子确认日期
- 对外返回毫秒时间戳结果

建议 props 范围：

```ts
type StarDatePickerProps = {
  mode?: 'single' | 'range'
  value?: number | { startTimestamp: number | null; endTimestamp: number | null }
  defaultValue?: number | { startTimestamp: number | null; endTimestamp: number | null }
  onChange?: (
    value:
      | { dateTimestamp: number }
      | { startTimestamp: number | null; endTimestamp: number | null }
  ) => void
  minDate?: number
  maxDate?: number
  disabledDates?: number[]
  showOutsideDays?: boolean
  className?: string
}
```

设计说明：

- `mode="single"` 时返回 `{ dateTimestamp }`
- `mode="range"` 时返回 `{ startTimestamp, endTimestamp }`
- `disabledDates` 以日级时间戳传入
- 若第二次点击落在起始日期之前，则自动交换顺序

## 交互设计

### 月份跳转

- 顶部显示当前年份和月份
- 提供上月、下月按钮
- 日期选择器保留年份与月份的快速切换能力

### 单日选择

- 点击某日即选中
- 再次点击其他日期时直接替换当前选中值
- 触发 `onChange({ dateTimestamp })`

### 区间选择

- 第一次点击设置开始日期
- 第二次点击设置结束日期
- 若结束日期早于开始日期，则自动交换顺序
- 当只存在开始日期时，鼠标悬浮其他日期可预览候选区间
- 若区间已完整，再次点击任意新日期，则以该日期重新开始新一轮区间选择

### Tooltip 展示

- 仅在 `StarCalendar` 中默认启用
- 仅当天存在数据时展示
- 展示内容至少包括：
  - 日期
  - 每条数据的标题
  - 描述
  - 图标或标识

### 禁用日期

- `StarDatePicker` 支持禁用日期
- 禁用日期不可点击，不参与区间高亮
- 若 `minDate/maxDate` 存在，则超出范围日期也视为禁用

## 工具函数设计

计划新增 `src/utils/calendar.ts`，至少包含以下能力：

- `normalizeToDayTimestamp`
  - 任意输入转本地自然日零点时间戳
- `getMonthStartTimestamp`
  - 获取某个月 1 号零点时间戳
- `addMonths`
  - 月份前后跳转
- `buildCalendarCells`
  - 构建一个月视图需要的 6 x 7 日期单元
- `isSameDay`
  - 判断两个时间是否同一天
- `isDayInRange`
  - 判断某天是否在区间内
- `sortRangeTimestamps`
  - 归一化区间起止顺序

## 文件组织

计划新增或修改如下文件：

- `src/components/ui/CalendarGrid.tsx`
- `src/components/ui/CalendarGrid.module.scss`
- `src/components/ui/Calendar.tsx`
- `src/components/ui/Calendar.module.scss`
- `src/components/ui/DatePicker.tsx`
- `src/components/ui/DatePicker.module.scss`
- `src/utils/calendar.ts`
- `src/utils/calendar.test.ts`
- `src/components/ui/Calendar.test.tsx`
- `src/components/ui/DatePicker.test.tsx`
- `src/pages/CalendarDemo.tsx`
- `src/pages/DatePickerDemo.tsx`
- `src/router/index.tsx`
- `src/components/ui/index.ts`
- `src/pages/Components.tsx`

## 测试策略

优先覆盖底层逻辑，再覆盖组件行为。

### 工具函数测试

需要覆盖：

1. 月网格生成是否按周一开头正确补齐
2. 月切换是否正确处理跨年
3. 日期归一化是否稳定输出自然日零点时间戳
4. 区间起止顺序是否自动纠正

### `StarCalendar` 测试

需要覆盖：

1. 事件数据是否正确落入对应日期格
2. 图标优先级是否为 `iconNode > iconSrc > iconKey`
3. 同日多条数据时是否出现聚合提示
4. 悬浮后是否展示完整详情

### `StarDatePicker` 测试

需要覆盖：

1. 单日模式点击后是否返回正确时间戳
2. 区间模式两次点击后是否返回起止时间戳
3. 区间逆序点击时是否自动交换
4. 已完成区间后再次点击是否重新开始选择
5. 禁用日期是否不可选

## Demo 页面要求

### `CalendarDemo`

用于展示：

- 基础月历
- 带多种标识的数据月历
- 鼠标悬浮查看当天详情
- 使用 `iconKey` 和自定义图标两种接入方式

### `DatePickerDemo`

用于展示：

- 单日选择
- 区间选择
- 返回值示例
- 禁用日期或最小最大范围示例

## 验收标准

满足以下条件视为本次设计落地成功：

1. 组件可在当前组件库风格下自然融入
2. `StarCalendar` 可正确展示公历月视图与日期数据
3. `StarDatePicker` 可完成单日和区间选择
4. 选择结果按约定返回毫秒时间戳
5. 图标输入既支持 `iconKey` 映射，也支持直接传图标
6. 关键日期逻辑和核心组件行为具备自动化测试

