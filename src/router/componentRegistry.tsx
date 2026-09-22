import type { LazyExoticComponent, ReactNode } from 'react'
import {
  Bell,
  CircleUserRound,
  Columns2,
  CalendarDays,
  CalendarRange,
  Frame,
  Gauge,
  Heart,
  Inbox,
  LayoutList,
  LoaderCircle,
  MessageSquare,
  MessageSquareMore,
  MousePointer,
  PanelRightOpen,
  Square,
  TextCursorInput,
  ToggleRight,
  Type,
} from 'lucide-react'
import type { Lang } from '../i18n'
import {
  StarCalendarDemoPage,
  StarAvatarDemoPage,
  StarDividerDemoPage,
  StarCardDemoPage,
  StarDatePickerDemoPage,
  StarDialogDemoPage,
  StarDrawerDemoPage,
  StarDisplayFrameDemoPage,
  StarEmptyStateDemoPage,
  StarInputDemoPage,
  StarLoadingDemoPage,
  StarMessageDemoPage,
  StarNineSliceButtonDemoPage,
  StarPopupDemoPage,
  StarProgressDemoPage,
  StarRatingDemoPage,
  StarSwitchDemoPage,
  StarTabDemoPage,
  StarTypewriterDemoPage,
} from './lazyPages'

/**
 * One catalogue entry per documented component. This file is the single source
 * of truth for the component library's public surface: the router, the gallery
 * page, the sidebar and the demo route index are all derived from it, so adding
 * an entry is the only manual step to publish a component.
 *
 * The shape is deliberately strict — `componentRegistry.sync.test.ts` fails the
 * test run when any part of the chain drifts:
 *
 * | field       | must agree with                                            |
 * | ----------- | ---------------------------------------------------------- |
 * | `component` | `src/components/ui/<component>.tsx`                         |
 * |             | `export … from './<component>'` in `src/components/ui/index.ts` |
 * | `component` | `src/pages/<component>Demo.tsx` (one demo page per component) |
 * | `element`   | `Star<component>DemoPage` in `src/router/lazyPages.ts`       |
 * | `routePath` | the visible URL `/components/<routePath>` (kebab-case, unique) |
 *
 * Prefer `bun run gen:component <Name>` over hand-editing: it writes every file
 * in the chain and appends the entry below.
 */
export interface ComponentRoute {
  /** Child route below `/components`. Kebab-case and unique. */
  routePath: string
  /** Module basename in `src/components/ui`, shared with the demo page name. */
  component: string
  title: Record<Lang, string>
  desc: Record<Lang, string>
  icon: ReactNode
  element: LazyExoticComponent<() => ReactNode>
}

const ALL_COMPONENT_ROUTES: ComponentRoute[] = [
  {
    routePath: 'avatar',
    component: 'Avatar',
    title: { zh: '头像', en: 'Avatar' },
    desc: {
      zh: '带多层木纹与受光边框的像素头像，支持方框和圆框。',
      en: 'A pixel avatar with layered wood grain and lighting, in square or round frames.',
    },
    icon: <CircleUserRound size={20} />,
    element: StarAvatarDemoPage,
  },
  {
    routePath: 'divider',
    component: 'Divider',
    title: { zh: '分割线', en: 'Divider' },
    desc: {
      zh: '由像素木栅栏等距排列组成的分割线，默认按容器宽度自动铺满。',
      en: 'A divider built from evenly spaced pixel fence posts that fills its container width by default.',
    },
    icon: <Columns2 size={20} />,
    element: StarDividerDemoPage,
  },
  {
    routePath: 'button',
    component: 'NineSliceButton',
    title: { zh: '按钮', en: 'Button' },
    desc: {
      zh: '像工具栏一样可靠的九宫格按钮，适合确认、交易、升级和危险操作。',
      en: 'Nine-slice action buttons for confirms, trades, upgrades, and dangerous moves.',
    },
    icon: <MousePointer size={20} />,
    element: StarNineSliceButtonDemoPage,
  },
  {
    routePath: 'calendar',
    component: 'Calendar',
    title: { zh: '日历', en: 'Calendar' },
    desc: {
      zh: '把节日、收获日和村民生日钉在月历上，别再错过花舞节。',
      en: 'Pin festivals, harvest days, and birthdays to a month grid so the Flower Dance is never missed.',
    },
    icon: <CalendarDays size={20} />,
    element: StarCalendarDemoPage,
  },
  {
    routePath: 'date-picker',
    component: 'DatePicker',
    title: { zh: '日期选择', en: 'DatePicker' },
    desc: {
      zh: '选择播种日或规划一段采矿假期，并返回稳定的标准化时间戳。',
      en: 'Choose a planting day or a mining vacation range with normalized timestamps.',
    },
    icon: <CalendarRange size={20} />,
    element: StarDatePickerDemoPage,
  },
  {
    routePath: 'card',
    component: 'Card',
    title: { zh: '卡片', en: 'Card' },
    desc: {
      zh: '像公告栏纸条一样承载任务、物品、提示和操作区。',
      en: 'Notice-board cards for quests, items, hints, and action panels.',
    },
    icon: <Square size={20} />,
    element: StarCardDemoPage,
  },
  {
    routePath: 'dialog',
    component: 'Dialog',
    title: { zh: '对话框', en: 'Dialog' },
    desc: {
      zh: '用于 NPC 台词、剧情提示和确认流程的像素对话面板。',
      en: 'Pixel dialog panels for NPC lines, story prompts, and confirmation flows.',
    },
    icon: <MessageSquare size={20} />,
    element: StarDialogDemoPage,
  },
  {
    routePath: 'drawer',
    component: 'Drawer',
    title: { zh: '抽屉', en: 'Drawer' },
    desc: {
      zh: '从页面四边滑入的像素抽屉，适合编辑、筛选和上下文操作。',
      en: 'Pixel drawers that slide in from any edge for editing, filters, and contextual actions.',
    },
    icon: <PanelRightOpen size={20} />,
    element: StarDrawerDemoPage,
  },
  {
    routePath: 'popup',
    component: 'Popup',
    title: { zh: '弹窗', en: 'Popup' },
    desc: {
      zh: '像气泡提示一样贴近目标，适合展示奖励、状态和小提示。',
      en: 'Anchored bubble popups for rewards, statuses, and compact hints.',
    },
    icon: <MessageSquareMore size={20} />,
    element: StarPopupDemoPage,
  },
  {
    routePath: 'typewriter',
    component: 'Typewriter',
    title: { zh: '打字机', en: 'Typewriter' },
    desc: {
      zh: '让文本像 NPC 逐字说话一样出现，适合剧情、引导和成就提示。',
      en: 'Reveal text like NPC dialog for story beats, onboarding, and achievements.',
    },
    icon: <Type size={20} />,
    element: StarTypewriterDemoPage,
  },
  {
    routePath: 'loading',
    component: 'Loading',
    title: { zh: '加载', en: 'Loading' },
    desc: {
      zh: '包子被一口口吃掉的加载反馈，让等待也像小游戏。',
      en: 'A bun-bite loading indicator that turns waiting into a tiny game loop.',
    },
    icon: <LoaderCircle size={20} />,
    element: StarLoadingDemoPage,
  },
  {
    routePath: 'message',
    component: 'Message',
    title: { zh: '消息', en: 'Message' },
    desc: {
      zh: '像右下角收获提示一样，轻量展示成功、警告和错误反馈。',
      en: 'Lightweight success, warning, and error feedback like a harvest toast.',
    },
    icon: <Bell size={20} />,
    element: StarMessageDemoPage,
  },
  {
    routePath: 'empty-state',
    component: 'EmptyState',
    title: { zh: '空状态', en: 'EmptyState' },
    desc: {
      zh: '背包空了、搜索没结果、任务板暂无委托时，用它保持页面友好。',
      en: 'Friendly placeholders for empty backpacks, no search results, and quiet quest boards.',
    },
    icon: <Inbox size={20} />,
    element: StarEmptyStateDemoPage,
  },
  {
    routePath: 'tab',
    component: 'Tab',
    title: { zh: '选项卡', en: 'Tab' },
    desc: {
      zh: '用季节、区域或任务分类切换内容，像翻看农场手册。',
      en: 'Switch content by season, location, or quest type like flipping through a farm manual.',
    },
    icon: <LayoutList size={20} />,
    element: StarTabDemoPage,
  },
  {
    routePath: 'rating',
    component: 'Rating',
    title: { zh: '评分', en: 'Rating' },
    desc: {
      zh: '用像素爱心或星星记录好感与评价，支持半格评分和禁用状态。',
      en: 'Pixel hearts or stars for friendship and reviews, with half steps and disabled state.',
    },
    icon: <Heart size={20} />,
    element: StarRatingDemoPage,
  },
  {
    routePath: 'progress',
    component: 'Progress',
    title: { zh: '进度条', en: 'Progress' },
    desc: {
      zh: '农场 HUD 风格的像素进度条，可自定义体力、危险或成熟度颜色。',
      en: 'A farm-HUD pixel bar with colors for stamina, danger, or crop growth.',
    },
    icon: <Gauge size={20} />,
    element: StarProgressDemoPage,
  },
  {
    routePath: 'switch',
    component: 'Switch',
    title: { zh: '开关', en: 'Switch' },
    desc: {
      zh: '像素药丸形状的开关，用来点亮灯、开启自动浇水或切换难度。',
      en: 'A pixel pill switch for lamps, auto-watering, and difficulty toggles.',
    },
    icon: <ToggleRight size={20} />,
    element: StarSwitchDemoPage,
  },
  {
    routePath: 'input',
    component: 'Input',
    title: { zh: '输入框', en: 'Input' },
    desc: {
      zh: '木框凹陷的像素输入框，用来写农场名、村民昵称或给皮埃尔留言。',
      en: 'A recessed pixel text field for farm names, villager nicknames, and notes to Pierre.',
    },
    icon: <TextCursorInput size={20} />,
    element: StarInputDemoPage,
  },
  {
    routePath: 'display-frame',
    component: 'DisplayFrame',
    title: { zh: '展示框', en: 'DisplayFrame' },
    desc: {
      zh: '像田间立牌一样醒目的像素边框，用来托住要展示的数字和指标。',
      en: 'A pixel-bordered plate for the numbers and metrics you need on display.',
    },
    icon: <Frame size={20} />,
    element: StarDisplayFrameDemoPage,
  },
]

/**
 * Components that remain implemented and exported, but are temporarily kept
 * out of the public gallery, sidebar, and generated routes while their visual
 * direction is being revisited. Remove an entry here to publish it again.
 */
export const HIDDEN_COMPONENTS = ['Avatar', 'Switch'] as const

export const COMPONENT_ROUTES: ComponentRoute[] = ALL_COMPONENT_ROUTES.filter(
  ({ component }) => !(HIDDEN_COMPONENTS as readonly string[]).includes(component)
)
