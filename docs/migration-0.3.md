# 迁移指南

> [返回 README 目录](../README.md#目录)

本文列出 0.3.0 引入的 **breaking 变更**，以及从 0.2.x 升级要改的地方。
每一项都写清了「为什么改」和「改之前 / 改之后」，可以直接照着搜。

升级前建议先在 0.2.x 下跑一遍类型检查，改完后同样的命令应当零报错：

```bash
npx tsc --noEmit
```

---

## 1. 可见性 prop 统一为 `open`

**为什么**：库里有两套拼法 —— `open`（Dialog / Drawer / Popup）和 `visible`
（Alert / BackToTop / Tag）。同一个概念两个名字，意味着从 Dialog 学到的用法到 Tag
还得再查一次；而拼错的那个 prop 会静默落进 `...rest`，变成一个多余的 DOM 属性，
不报错。`open` 还是 Radix UI / Headless UI 的行业约定，肌肉记忆可以直接迁移。
`visible` 另有一层歧义：它是 CSS `visibility` 属性的名字，而那个属性指的是
「占位但不绘制」，和这里的「在不在场」不是一回事。

### 受影响组件

| 组件 | 0.2.x | 0.3.0 |
|------|-------|-------|
| `StarAlert` | `visible` / `defaultVisible` | `open` / `defaultOpen` |
| `StarTag` | `visible` / `defaultVisible` | `open` / `defaultOpen` |
| `StarBackToTop` | `visible` / `onVisibleChange` | `open` / `onOpenChange` |

`StarDialog` / `StarDrawer` / `StarPopup` 本来就是 `open`，无需改动。

### 改法

```diff
- <StarAlert visible={hasError} onClose={clearError}>
+ <StarAlert open={hasError} onClose={clearError}>

- <StarTag visible={!removed} closable onClose={remove}>
+ <StarTag open={!removed} closable onClose={remove}>

- <StarTag defaultVisible={false}>…</StarTag>
+ <StarTag defaultOpen={false}>…</StarTag>

- <StarBackToTop visible={pinned} />
+ <StarBackToTop open={pinned} />

- <StarBackToTop onVisibleChange={(v) => setPinned(v)} />
+ <StarBackToTop onOpenChange={(v) => setPinned(v)} />
```

JSX 的裸属性写法同样要改：`<StarTag visible>` → `<StarTag open>`。

> 命名空间里的 CSS 类名 `--visible` **没有**跟着改 —— 那是样式层的状态类，
> 描述的是「画出来了」这个结果，与 prop 名无关。`visibilityNaming.test.ts`
> 专门锁住了这一点，免得下次「顺手改干净」。

---

## 2. `color` 统一为 CSS 颜色，预设名单独走 prop

**为什么**：这是四项里最危险的一个。0.2.x 里 `color` 在两个组件上含义不同：

```tsx
<StarTag color="green">…</StarTag>   // 预设名 → 查表 → CSS 类
<StarCard color="green">…</StarCard>  // 预设名未命中 → 交给 canvas 解析
```

`green` 不是合法的 CSS 颜色，所以同一个词在两个组件上得到两个结果，且都不报错 ——
卡片只是悄悄变成了另一种颜色。把 Tag 的示例复制到 Card 上就会踩到。

现在 `color` 在**全库 14 个组件**里都只表示 CSS 颜色。预设名单独走 prop，
命名上直接说明是「从哪几档里挑」：

| 组件 | 预设 prop | 取值 |
|------|----------|------|
| `StarTag` | `tone` | `default` / `green` / `red` / `yellow` / `blue` / `purple` |
| `StarCard` | `surface` | `night-village` / `forest-farm` / `wooden-cabin` / … 共 10 档 |

**为什么不用 `variant`**：两个组件都已经用 `variant` 表示别的东西了
（`StarCard` 的 `variant` 是视觉风格 `default | outlined | elevated`），
复用会让一个 prop 同时改变形状和颜色。

### StarTag

```diff
- <StarTag color="green">新鲜作物</StarTag>
+ <StarTag tone="green">新鲜作物</StarTag>
```

新增能力：`color` 现在也收任意 CSS 颜色，优先级高于 `tone`。

```tsx
<StarTag tone="green" color="#4a7c2f">新鲜作物</StarTag>
```

### StarCard

```diff
- <StarCard color="night-village">夜之村庄</StarCard>
+ <StarCard surface="night-village">夜之村庄</StarCard>
```

传 hex / CSS 颜色名的用法**不变**，本来就是 `color`：

```tsx
<StarCard color="#2f6b4f">…</StarCard>   // 不变
```

两者都传时 `surface` 优先 —— 它是更明确的请求。

### 类型导出

| 0.2.x | 0.3.0 |
|-------|-------|
| `TagColor` | `TagTone`（`TagColor` 保留为 `@deprecated` 别名） |
| `CardThemeColor` | 已移除，用 `CardColor`（预设名）或 `string`（CSS 色） |

---

## 3. `size` 统一为三档预设，保留 number 逃生口

**为什么**：0.2.x 里 9 个组件的 `size` 收 `'small' | 'medium' | 'large'`，
`StarLoading` 却只收 `number` —— 而它的 96 / 144 / 192 三个值恰好就是三档素材的真实
尺寸，只是没有名字。写 `size={144}` 在别的组件上会直接类型报错，在 Loading 上却
看不出这是个档位。`StarAvatar` 已经是正确的形态（预设 + number 逃生口），
`StarLoading` 现在与它对齐。

### 改法

```diff
- <StarLoading size={96} />
+ <StarLoading size="small" />

- <StarLoading size={144} />
+ <StarLoading size="medium" />

- <StarLoading size={192} />
+ <StarLoading size="large" />
```

**0.2.x 的数字仍然可用**，且语义不变 —— 需要一个非档位的尺寸时继续传 number：

```tsx
<StarLoading size={120} />   // 仍然有效
```

三档对应的像素与 0.2.x 完全一致（96 / 144 / 192），`size` 的默认值从 `144`
变成 `'medium'`，渲染结果相同。

新增导出：`LoadingSize`。

---

## 4. 没有改动的：`onChange` 的六种传出类型

0.2.x 的一致性问题清单里列了「onChange 传出类型 6 种」。**这一项刻意不改**，
理由如下：

| 组件 | 传出 |
|------|------|
| `StarInput` / `StarTextarea` / `StarSelect` / `StarRadio` / `StarTab` | `string` |
| `StarCheckbox` | `string[]` |
| `StarCollapse` | `string[]` |
| `StarRating` | `number` |
| `StarSwitch` | `boolean` |
| `StarPagination` | `(page, pageSize)` |
| `StarDatePicker` | `{ dateTimestamp }` \| `{ startTimestamp, endTimestamp }` |

这些不是命名不一致，而是**各组件值域的真实反映**：多选框就该传出数组，评分就该
传出数字。统一成 `(value: unknown)` 只会丢掉全部类型信息，让调用方从编译期退回到
运行时才知道拿到的是什么 —— 那是把一个不是问题的设计问题化。

`StarPagination` 的双参数同理：换每页条数时调用方需要同时知道新页码和新页长，
合成一个对象反而要写 `({ page, pageSize }) => …`，可读性更差。

如果你的代码库需要统一回调**命名**（而不是类型），可以在自己的封装层做，
不必让库来承担这个成本。

---

## 检查清单

升级后按顺序确认：

- [ ] `npx tsc --noEmit` 零报错（TypeScript 会指出所有 `visible` / `color="green"` 的残留）
- [ ] 搜索 `defaultVisible`、`onVisibleChange` 应无结果
- [ ] 搜索 `<StarTag color="` 应只命中真正的 CSS 颜色
- [ ] 搜索 `<StarCard color="` 应只命中真正的 CSS 颜色
- [ ] 跑一遍你的表单页：Alert / Tag / BackToTop 的受控用法最容易漏
