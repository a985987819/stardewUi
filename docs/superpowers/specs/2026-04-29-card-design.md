# Card 组件像素化重构设计

**日期：** 2026-04-29
**目标组件：** `src/components/ui/Card.tsx`

## 目标

重写 Card 组件的绘制方式，让用户只输入一个 `color` 主题色，就能自动推导出完整的 Stardew 风格卡片视觉体系，包括：

- 最外层完整边框（4px 主边框 + 2px 外边框 + 2px 内边框）
- 上边框与右边框内部的 2px 光影层
- 标题区域的 4 段纵向断层渐变
- 内容区域的 8 段纵向断层渐变
- 最外层三级台阶像素边角
- 标题区域与内容区域各自独立的像素边框和内阴影

同时要把颜色推导和尺寸规则抽离出来，简化组件结构，降低后续维护边距、边框宽度、阴影宽度等数值的成本。

---

## 现状问题

当前实现存在三个核心问题：

1. **结构层、绘制层、配色层耦合过重**
   `src/components/ui/Card.tsx` 同时承担组件结构、颜色变量拼装、canvas 绘制挂载等职责。

2. **视觉实现过度依赖 canvas 节点**
   header 和 body 都通过独立 canvas surface + overlay 实现断层和阴影，导致 DOM 为绘制服务，而不是为组件语义服务。

3. **样式数值分散，维护成本高**
   边框、padding、阴影宽度、内外层关系分散在 TS 和 SCSS 中，没有统一 token。

这使得后续调整视觉时，需要同时修改多处 TS、DOM 和 SCSS，成本偏高。

---

## 设计结论

本次重构采用以下固定方案：

### 1. 绘制方案

采用 **纯 CSS/Tailwind 变量驱动 + TypeScript 颜色推导函数**，不再用 canvas 负责 header/body 的表面绘制。

原因：

- 需求本质是固定视觉语法的像素卡片，而不是自由绘图
- CSS 更适合维护 1px / 2px 台阶、边框和内阴影
- 结构更稳定，后续调间距和数值更直接

### 2. 颜色推导方案

采用 **固定 Stardew 风格算法**。
输入任意 `color`，按统一的明度、饱和度、暖色偏移规则，生成完整的边框、阴影、标题色带和内容色带。

不做“严格复刻示例橙色值映射”，而是保证所有主题色都稳定落在同一视觉语言里。

### 3. 像素角方案

只有 **最外层卡片** 带三级台阶像素角。
header 和 body 只保留像素边框和光影，不再各自做独立锯齿角。

### 4. 色带方向

标题区域的 4 段色带和内容区域的 8 段色带都使用 **纵向断层分段**（从上到下硬切分段）。

---

## 视觉规则

### 外层完整边框

对外暴露的完整边框结构固定为：

- `4px` 主边框：直接使用用户输入的主题色
- `2px` 外边框：比主题色更深，用于最外层收口
- `2px` 内边框：比主题色次级加深，用于形成内部包边
- `2px` 顶部内高光：位于内边框之内
- `2px` 右侧内阴影：位于内边框之内

在默认橙色卡片中，目标视觉参考为：

- 主边框：`#dc7b05`
- 内边框：`#b14e05`
- 外边框：`#853605`
- 内部光影：`#d79f6f`

后续其他颜色不要求逐值匹配这组橙色，但要保持相同风格关系。

### 标题区域

标题区域需要具备：

- 独立边框结构
- 顶部高光与右侧阴影
- 4 段纵向断层渐变

默认视觉参考为 4 段硬切色带：

1. `#ffc576`
2. `#fdbc6e`
3. `#f5b56f`
4. `#f4ab65`

四段平分，不做平滑插值。

### 内容区域

内容区域需要具备：

- 独立边框结构
- 顶部高光与右侧阴影
- 8 段纵向断层渐变

8 段都采用固定分段，不使用平滑渐变。
颜色由同一套算法从主题色推导，前几段偏亮，中间回归基色附近，后几段转向更深、更钝的材质色。

### 像素角

最外层卡片使用 **三级台阶像素角**：

- 不使用圆角
- 每一层台阶只退 1 个像素点
- 放大观察时表现为三级离散台阶

实现层面以统一轮廓驱动所有边框层，避免各层轮廓不一致。

---

## 架构设计

### 职责拆分

#### `src/components/ui/Card.tsx`

仅负责：

- 接收 `color`、`title`、`showTitle`、`headerExtra`、`footer` 等 props
- 调用颜色推导函数生成 palette
- 将 palette 映射为 CSS variables
- 输出精简后的语义 DOM 结构

不再承担：

- canvas surface 绘制
- 绘制层挂载逻辑
- 复杂视觉算法细节

#### `src/utils/cardLighting.ts`

作为唯一颜色计算入口，负责：

- 解析输入 hex 色值
- 进行明度、饱和度、暖色偏移与钳制
- 生成结构化的 Card palette
- 输出 frame、header、body、text 等分组 token

这个文件会成为本次重构后最核心、最稳定、也最值得测试的逻辑文件。

#### `src/components/ui/Card.module.scss`

只负责消费 CSS variables，完成视觉拼装：

- 外层像素角轮廓
- 外边框 / 主边框 / 内边框
- 顶部高光与右侧阴影
- header 和 body 的断层色带
- spacing 与尺寸 token 的消费

不再与 canvas surface 结构耦合。

---

## 颜色模型设计

### 输入

唯一必需输入为：

- `color: string`

可以是：

- 预设主题 key
- 原始 hex 色值

最终都会被解析成一套统一的基础色。

### 输出结构

`createCardPalette(color)` 返回结构化 palette，而不是平铺的一堆松散变量：

```ts
interface CardPalette {
  frame: {
    borderBase: string
    borderInner: string
    borderOuter: string
    highlightTop: string
    shadowRight: string
  }
  header: {
    stripes: [string, string, string, string]
    borderBase: string
    borderInner: string
    borderOuter: string
    highlightTop: string
    shadowRight: string
  }
  body: {
    stripes: [string, string, string, string, string, string, string, string]
    borderBase: string
    borderInner: string
    borderOuter: string
    highlightTop: string
    shadowRight: string
  }
  text: {
    primary: string
    secondary: string
    shadow: string
  }
}
```

实际实现时字段名可以微调，但必须保持按职责分组，不能重新退回为语义混乱的平铺变量。

### 推导原则

以输入色作为 **主边框基色**，围绕它衍生三类颜色：

1. **更深的结构色**
   用于外边框、内边框、底部压暗、后段色带。

2. **更亮的受光色**
   用于顶部高光、标题区前段、内容区前段。

3. **低饱和暖偏移色**
   用于右侧阴影和文本阴影，避免阴影只靠纯黑叠加，保留 Stardew 的泥土感和木质感。

### 约束规则

为了保证不同主题色都稳定：

- 太亮的输入色要先压低基础明度，避免高光区过曝
- 太暗的输入色要先抬高基础明度，避免整张卡片糊成一片
- 高饱和输入色的高光和阴影都要自动降一点饱和度
- 接近灰色的输入色要补一点暖度，避免卡片发死灰

### 标题区分层规则

标题区为 4 段纵向断层：

- 第一段最亮
- 第二段轻微回落
- 第三段继续下沉
- 第四段接近标题区底部结构色

相邻段之间必须有足够差值，保证是“断层”，而不是弱渐变。

### 内容区分层规则

内容区为 8 段纵向断层：

- 前 2~3 段偏亮，形成顶部受光感
- 中段逐步回到基底
- 后 2~3 段转为更深、更钝的材质色

这 8 段的目的不是做彩虹式层次，而是让内容面板有厚度感。

---

## 尺寸 Token 设计

需要把关键尺寸从散落样式中抽离成统一 token，至少包括：

- `corner.step = 1px`
- `corner.levels = 3`
- `border.baseWidth = 4px`
- `border.ringWidth = 2px`
- `shadow.inlineWidth = 2px`
- `spacing.headerX`
- `spacing.headerY`
- `spacing.bodyX`
- `spacing.bodyY`

这些 token 可以最终表现为 CSS 自定义属性、SCSS 变量或二者结合，但必须保证：

- 数值定义集中
- 视觉和 spacing 调整不需要翻找多个文件
- 外层边框、header、body 的厚度关系明确

---

## DOM 结构设计

当前 DOM 偏向“绘制节点驱动”，重构后要收敛为更干净的语义结构。

目标结构如下：

```tsx
<div className={styles.cardRoot}>
  {showTitle ? (
    <div className={styles.cardHeader}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {headerExtra ? <div className={styles.cardExtra}>{headerExtra}</div> : null}
    </div>
  ) : null}

  <div className={styles.cardBody}>
    <div className={styles.cardBodyContent}>{children}</div>
  </div>

  {footer ? <div className={styles.cardFooter}>{footer}</div> : null}
</div>
```

允许存在极少量装饰层或伪元素，但原则是：

- DOM 为语义和插槽服务
- 视觉层尽量通过 `::before` / `::after` 与 background 组合完成
- 不再为了色带和阴影额外挂载 canvas surface 节点

---

## 像素角实现方案

最外层卡片的三级台阶角采用 CSS 实现。

### 方案要求

- 不用 `border-radius`
- 不用 canvas
- 所有可见边框层共享同一套像素角轮廓
- 轮廓能随尺寸 token 调整，而不是写死为一次性魔法值

### 实现方式

采用统一的像素轮廓规则，通过以下层次完成：

- 根节点负责主体背景与主边框
- `::before` 负责外边框层
- `::after` 负责内边框与内侧光影层

三层使用同一套像素角轮廓，并通过 `inset`、border 与 shadow 关系形成三级包边。

轮廓本质上是 3 级离散台阶，不是平滑圆角。四个角镜像一致。

---

## 对现有文件的影响

### 保留

- `Card` 公开 API 基本不变
- `color` 同时支持 preset key 与 raw hex
- `showTitle`、`headerExtra`、`footer` 等插槽继续保留
- `Card.Image`、`Card.Meta` 是否保留取决于当前实现耦合情况，但不应阻碍主卡片结构简化

### 收敛或删除

- 删除 `CardSurfaceCanvas`
- 删除 header/body 的 surface canvas 节点
- 删除依赖 canvas 的 stripe 绘制路径
- 删除与 surface canvas 强绑定的 SCSS 层

### 重点修改文件

- `src/components/ui/Card.tsx`
- `src/components/ui/Card.module.scss`
- `src/utils/cardLighting.ts`
- 相关测试文件：
  - `src/utils/cardLighting.test.ts`
  - `src/components/ui/Card.theme.test.tsx`
  - `src/components/ui/Card.title.test.tsx`
  - 其他与 Card surface 结构相关的测试

---

## 测试策略

重构后测试重点从“验证具体绘制实现”切换为“验证视觉 contract”。

### 需要验证的内容

1. **颜色推导**
   - 给定原始 hex 色值，可以稳定生成完整 palette
   - header 4 段与 body 8 段数量和顺序正确
   - frame/header/body/text 分组完整

2. **变量注入**
   - `Card` 渲染后会把关键 palette 值挂到样式变量上
   - 外层边框、标题区、内容区的独立视觉变量都存在

3. **结构简化后行为不变**
   - `showTitle` 控制标题渲染逻辑不变
   - `headerExtra`、`footer` 等插槽行为不变
   - `color` 继续兼容 preset key 与 raw hex

4. **像素角与区域 contract**
   - 卡片根节点挂载像素角相关 class / style contract
   - header 和 body 仍然存在独立边框与阴影 contract
   - 不再要求测试 canvas 节点存在

### 不再作为核心断言的内容

- `card-header-surface` canvas 节点
- `card-body-surface` canvas 节点
- 与 canvas overlay 强耦合的 DOM 结构

---

## 范围控制

本次设计只解决以下问题：

- Card 的边框与光影计算
- 标题区与内容区的断层背景
- 最外层像素角
- 颜色与尺寸 token 的抽离
- 组件结构简化

明确不包含：

- 新增动画体系
- 新增纹理噪点或材质贴图
- 新增独立的 header/body 像素角
- 对其他 UI 组件做联动重构
- 把整个组件系统迁移到 canvas

---

## 最终结果

重构完成后，Card 组件应满足以下结果：

- 用户只传一个 `color`
- 组件自动推导外边框、主边框、内边框、高光、阴影、标题 4 段、内容 8 段
- 最外层具备三级台阶像素角
- header/body 各自保留像素边框和光影，但不再各自做锯齿角
- 组件 DOM 更短、更语义化
- 颜色规则与尺寸规则集中管理
- 后续调整边框厚度、padding、阴影宽度时，改动面明显缩小

---

## 审核结论

该设计聚焦单一目标：**把 Card 从“混合绘制组件”收敛为“结构清晰、变量驱动、可维护的像素化 UI 组件”**。

方案没有引入新的绘图依赖，没有扩大到组件体系级重构，也没有保留 canvas 作为过渡层，因此范围清晰、方向一致，适合进入实现计划阶段。
