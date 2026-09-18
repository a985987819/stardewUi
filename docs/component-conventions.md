# 组件开发规范

本组件库把「一个组件」的信息收敛到**一处**：`src/router/componentRegistry.tsx` 里的 `COMPONENT_ROUTES`。
路由表、左侧导航、组件总览页、冒烟测试都从它派生，因此新增组件的正确做法只有一条 —— **补目录条目**，
其余入口自动跟随。

```bash
bun run gen:component Switch \
  --zh 开关 --en Switch --icon ToggleRight \
  --desc-zh "像素药丸形状的开关。" \
  --desc-en "A pixel pill switch."
```

上面这一条命令会写 4 个新文件、改 3 个文件，然后自动跑一遍同步守卫。

---

## 1. 单一数据源与派生关系

`COMPONENT_ROUTES` 同时喂给四个消费方，**任何一处都不要自己维护组件列表**：

| 消费方 | 位置 | 派生方式 |
| --- | --- | --- |
| 路由表 | `src/router/index.tsx` | `COMPONENT_ROUTES.map(...)` → `/components/<routePath>` |
| 左侧导航 | `src/components/layout/Sidebar.tsx` | `COMPONENT_ROUTES.map(...)`，标签直接取 `title.zh/en` |
| 组件总览 | `src/pages/Components.tsx` | `COMPONENT_ROUTES.map(...)` 渲染卡片 |
| 冒烟测试 | `scripts/smoke-routes.mjs` | 从 registry 源码里读 `routePath` |
| 语言切换 | 无需处理 | 组件名不在 `i18n/dictionaries.ts` 里 |

> 历史坑：左侧导航曾漏掉 `/components/switch`（`StarSwitch` 已导出但没有目录条目），
> 冒烟测试的手写路由表也曾漏掉 `rating` / `progress`。现在这两种漂移都会被守卫拦下。

## 2. 五方一致性契约

```
componentRegistry.tsx ──► lazyPages.ts ──► pages/<Component>Demo.tsx
        │
        └──────────────► components/ui/<Component>.tsx ──► components/ui/index.ts
```

`src/router/componentRegistry.sync.test.tsx` 会断言：

1. `routePath` / `component` 唯一，`routePath` 为 kebab-case，`component` 为 PascalCase；
2. `title`、`desc` 的 `zh` / `en` 均非空，`icon` 存在 —— 侧边栏与总览页都会渲染它们；
3. 每条条目的 `element` 对应 `lazyPages.ts` 中 `Star<Component>DemoPage = lazy(() => import('../pages/<Component>Demo'))`；
4. `pages/` 下**每个 `*Demo.tsx` 都被某条目录引用**，且每条目录都有对应的 `pages/<Component>Demo.tsx`；
5. `components/ui/<Component>.tsx` 存在，并从 `components/ui/index.ts` 导出；
6. `ui/index.ts` 里导出的模块要么有目录条目，要么登记在 `SHARED_ROUTE_MODULES`（共用一个路由的模块，如 `GapBorderCorners` 挂在 `gap-border` 下）；
7. 渲染 `Sidebar`，断言每条目录都出现为 `/components/<routePath>` 链接 —— 这是「新增组件自动进左侧路由」的直接证明；
8. `router` / `gallery` / `Sidebar` 三个文件都必须是 `COMPONENT_ROUTES` 的派生（防止有人再抄一份手写列表）。

失败时先看报错里的文件路径，再补文件或补字段：

```bash
bun run check:components     # 只跑守卫，秒级
bun run test:run             # 全量测试（含守卫）
```

## 3. 命名与文件职责

| 对象 | 约定 | 示例 |
| --- | --- | --- |
| 组件名 | PascalCase，公共组件统一 `Star` 前缀 | `StarSwitch` |
| 组件文件 | `components/ui/<Component>.tsx` | `Switch.tsx` |
| 样式文件 | `components/ui/<Component>.module.scss`，类名 `star-<kebab>` | `.star-switch` |
| 单测 | `components/ui/<Component>.test.tsx` | `Switch.test.tsx` |
| 演示页 | `pages/<Component>Demo.tsx`，**文件名必须与组件名一致** | `SwitchDemo.tsx` |
| 懒加载导出 | `router/lazyPages.ts` 里的 `Star<Component>DemoPage` | `StarSwitchDemoPage` |
| URL | `routePath` 为 kebab-case | `switch` / `nine-slice-button` |
| 导出 | 组件文件同时提供具名与默认导出；公共入口只从 `ui/index.ts` 转出 | `export { StarSwitch }` |

> 历史坑：按钮的演示页曾叫 `ButtonDemo.tsx` 而组件叫 `NineSliceButton.tsx`，两者对不上，
> 生成器也就无法按组件名推算文件路径。现已统一为 `NineSliceButtonDemo.tsx`。

## 4. 视觉与主题

- **阶梯像素角只有一份几何**：`src/utils/pixelCorners.ts`。canvas 绘制与 CSS `clip-path` 必须共用，不要各写一份；
  要调形状只改 `DEFAULT_CORNER_STEPS` / `DEFAULT_CORNER_STEP`。
- **主题色只有一条推导链**：给定一个主题色，用 `src/utils/cardLighting.ts` 推导边框、光照、条纹；
  面板类组件复用同一套配色，不要手调颜色常量。
- 一个 `clip-path` 只能刻一条轮廓，且会一起裁掉 `::after` / `outline` / `box-shadow`；
  需要「外圈光环 + 被刻实体」时把实体放进绝对定位的装饰层，不要给组件根节点再包一层 shell。
- 组件根节点要保留 `className` 透传与 `...rest` 透传（消费方会直接挂布局类）。

## 5. 文案与 API 表

- 组件标题/描述：写在目录条目里（`title` / `desc`），**不要**加到 `i18n/dictionaries.ts`。
- 演示页文案：页面内自建 `copy` 对象，`zh` / `en` 两套齐全，并用 `satisfies Record<Lang, ...>` 锁住形状。
  `const t = copy[lang]` 之后所有文案都从 `t` 取，方便一次性补翻译。
- 每个演示页结尾必须有 API 表：`<div id="api" className="component-page-api"><StarApiTable ... /></div>`，
  数据字段是 `property` / `description` / `type` / `default`。
- 每个演示槽位都要有 `id`，并出现在 `toc` 的 `id` 数组里（`TableOfContents` 依赖它做锚点）。

## 6. 完成定义（DoD）

新增一个组件，合并前必须满足：

- [ ] `bun run gen:component <Name>` 生成的四类文件都存在，且把 demo 里的 `TODO` 换成了真实文案与示例；
- [ ] `components/ui/<Component>.test.tsx` 覆盖基础渲染 + 关键交互（受控值、禁用态等）；
- [ ] `bun run check:components` 通过；
- [ ] `bunx tsc -b`、`bun run lint`、`bun run test:run` 全绿；
- [ ] `bun run dev` 后手点左侧导航里的新条目，或跑 `bun run test:smoke http://127.0.0.1:5199/stardewUi`；
- [ ] README 的组件列表里补上该组件的用法与 API 表。

## 7. 命令速查

```bash
bun run gen:component <Name> [--zh --en --icon --desc-zh --desc-en --route]  # 脚手架
bun run gen:component <Name> --dry-run                                       # 只看计划不落盘
bun run check:components                                                     # 目录同步守卫
bunx vitest run src/components/ui/<Component>.test.tsx                       # 单组件测试
bun run test:smoke http://127.0.0.1:5199/stardewUi                           # 无头路由冒烟
```

## 8. 已知欠账

- `PixelButton`、`Tab`、`GapBorderCorners` 尚无同名单测（守卫暂未强制单测文件，因为现在是欠账状态，
  补齐后可以考虑把「每个公共组件必须有同名单测」也写进守卫）。
- 演示页文案（`copy`）与 API 表仍写在页面里，未来若要自动生成文档站，需要把 `meta` 单独抽成模块。
