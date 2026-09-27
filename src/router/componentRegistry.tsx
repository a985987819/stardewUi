import type { LazyExoticComponent, ReactNode } from 'react'
import {
  ArrowUp,
  Bell,
  Bone,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  ChevronDown,
  ChevronsUpDown,
  CircleDot,
  CircleUserRound,
  Columns2,
  Ellipsis,
  Frame,
  Gauge,
  Grid2X2,
  Hash,
  Heart,
  Inbox,
  LayoutList,
  LoaderCircle,
  MessageCircle,
  MessageSquare,
  MessageSquareMore,
  MousePointer,
  PanelRightOpen,
  Square,
  Tag,
  Text,
  TextCursorInput,
  ToggleRight,
  TriangleAlert,
  Type,
} from 'lucide-react'
import type { Lang } from '../i18n'
import {
  StarAlertDemoPage,
  StarAvatarDemoPage,
  StarBackToTopDemoPage,
  StarBadgeDemoPage,
  StarCalendarDemoPage,
  StarCardDemoPage,
  StarCheckboxDemoPage,
  StarCollapseDemoPage,
  StarDatePickerDemoPage,
  StarDialogDemoPage,
  StarDisplayFrameDemoPage,
  StarDividerDemoPage,
  StarDrawerDemoPage,
  StarEmptyStateDemoPage,
  StarInputDemoPage,
  StarLoadingDemoPage,
  StarMessageDemoPage,
  StarNineSliceButtonDemoPage,
  StarPaginationDemoPage,
  StarPixelTextDemoPage,
  StarPopupDemoPage,
  StarProgressDemoPage,
  StarRadioDemoPage,
  StarRatingDemoPage,
  StarSelectDemoPage,
  StarSkeletonDemoPage,
  StarSwitchDemoPage,
  StarTabDemoPage,
  StarTagDemoPage,
  StarTextareaDemoPage,
  StarTitleDemoPage,
  StarTooltipDemoPage,
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
  /** Keeps the sidebar and gallery in a familiar product-development order. */
  category: ComponentCatalogueCategory
  /** Smaller ranks are shown first inside each category. */
  usageRank: number
  title: Record<Lang, string>
  desc: Record<Lang, string>
  icon: ReactNode
  element: LazyExoticComponent<() => ReactNode>
}

/**
 * Directory categories are ordered by the frequency with which a typical
 * product team reaches for them. Add a new component to the closest category;
 * `COMPONENT_ROUTES` derives its stable display order from this sequence.
 */
export const COMPONENT_CATALOGUE_CATEGORIES = [
  'common',
  'layout',
  'navigation',
  'data-entry',
  'data-display',
  'feedback',
  'other',
] as const

export type ComponentCatalogueCategory = (typeof COMPONENT_CATALOGUE_CATEGORIES)[number]

/** Labels travel with the catalogue so the sidebar never needs a second map. */
export interface ComponentCatalogueCategoryMeta extends Record<Lang, string> {
  /** The category's Stardew-inspired rainbow hue, used by component-page titles. */
  color: string
}

/**
 * Labels and their corresponding title colours travel with the catalogue so
 * the sidebar, routes, and page headers never need separate category maps.
 */
export const COMPONENT_CATALOGUE_CATEGORY_META: Record<
  ComponentCatalogueCategory,
  ComponentCatalogueCategoryMeta
> = {
  // A muted harvest rainbow: familiar to Stardew Valley without overpowering
  // StarTitle's hand-drawn pixel outline and highlight.
  common: { zh: '通用', en: 'General', color: '#d4a72c' },
  layout: { zh: '布局', en: 'Layout', color: '#c97832' },
  navigation: { zh: '导航', en: 'Navigation', color: '#4b78a9' },
  'data-entry': { zh: '数据录入', en: 'Data Entry', color: '#6c9b5a' },
  'data-display': { zh: '数据展示', en: 'Data Display', color: '#6667a4' },
  feedback: { zh: '反馈', en: 'Feedback', color: '#b4584b' },
  other: { zh: '其他', en: 'Other', color: '#95649a' },
}

const COMPONENT_CATALOGUE_CATEGORY_ORDER = new Map(
  COMPONENT_CATALOGUE_CATEGORIES.map((category, index) => [category, index])
)

/**
 * Internal batch registry (tooling marker only — never imported, no runtime
 * footprint). `scripts/audit-batch-components.mjs` reads this comment.
 *
 * BATCH_2026_09_27: Badge, Alert, Skeleton, Textarea, Tooltip, Pagination, Collapse
 */

const ALL_COMPONENT_ROUTES: ComponentRoute[] = [
  {
    routePath: 'avatar',
    component: 'Avatar',
    category: 'data-display',
    usageRank: 4,
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
    category: 'layout',
    usageRank: 2,
    title: { zh: '分割线', en: 'Divider' },
    desc: {
      zh: '由像素木栅栏或像素星星等距排列组成的分割线，默认按容器宽度自动铺满。',
      en: 'A divider built from evenly spaced pixel fence posts or pixel stars that fills its container width by default.',
    },
    icon: <Columns2 size={20} />,
    element: StarDividerDemoPage,
  },
  {
    routePath: 'button',
    component: 'NineSliceButton',
    category: 'common',
    usageRank: 1,
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
    category: 'data-display',
    usageRank: 1,
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
    category: 'data-entry',
    usageRank: 3,
    title: { zh: '日期选择', en: 'DatePicker' },
    desc: {
      zh: '选择播种日或规划一段采矿假期，可选月历网格或三列可无限滚动的轮盘，并返回稳定的标准化时间戳。',
      en: 'Choose a planting day or a mining vacation range with a month grid or three endlessly scrolling wheels, returning normalized timestamps.',
    },
    icon: <CalendarRange size={20} />,
    element: StarDatePickerDemoPage,
  },
  {
    routePath: 'card',
    component: 'Card',
    category: 'layout',
    usageRank: 1,
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
    category: 'feedback',
    usageRank: 3,
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
    category: 'feedback',
    usageRank: 4,
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
    category: 'feedback',
    usageRank: 5,
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
    category: 'other',
    usageRank: 1,
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
    category: 'feedback',
    usageRank: 2,
    title: { zh: '加载', en: 'Loading' },
    desc: {
      zh: '洒水器带动八株胡萝卜一圈圈成熟的加载反馈，让等待也像小游戏。',
      en: 'A sprinkler-grown carrot garden that turns waiting into a tiny game loop.',
    },
    icon: <LoaderCircle size={20} />,
    element: StarLoadingDemoPage,
  },
  {
    routePath: 'message',
    component: 'Message',
    category: 'feedback',
    usageRank: 1,
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
    category: 'feedback',
    usageRank: 6,
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
    category: 'navigation',
    usageRank: 1,
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
    category: 'data-entry',
    usageRank: 4,
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
    category: 'data-display',
    usageRank: 2,
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
    category: 'data-entry',
    usageRank: 5,
    title: { zh: '开关', en: 'Switch' },
    desc: {
      zh: 'Checkbox 同族的木面板开关：凹槽在打开时点亮，羊皮纸滑钮以像素阶梯滑过，适合灯光与自动化设置。',
      en: 'A wooden switch panel in the Checkbox family: the groove lights up while checked and the parchment thumb slides in stepped pixel motion.',
    },
    icon: <ToggleRight size={20} />,
    element: StarSwitchDemoPage,
  },
  {
    routePath: 'checkbox',
    component: 'Checkbox',
    category: 'data-entry',
    usageRank: 2,
    title: { zh: '多选框', en: 'Checkbox' },
    desc: {
      zh: 'Card 风格方框承托红色对勾的多选控件，支持横竖排列、禁用项、尺寸和圆框。',
      en: 'Card-framed multi-select checks with red reveal motion, layouts, disabled options, sizes, and round frames.',
    },
    icon: <CheckSquare size={20} />,
    element: StarCheckboxDemoPage,
  },
  {
    routePath: 'input',
    component: 'Input',
    category: 'data-entry',
    usageRank: 1,
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
    category: 'data-display',
    usageRank: 3,
    title: { zh: '展示框', en: 'DisplayFrame' },
    desc: {
      zh: '像田间立牌一样醒目的像素边框，用来托住要展示的数字和指标。',
      en: 'A pixel-bordered plate for the numbers and metrics you need on display.',
    },
    icon: <Frame size={20} />,
    element: StarDisplayFrameDemoPage,
  },
  {
    routePath: 'back-to-top',
    component: 'BackToTop',
    category: 'navigation',
    usageRank: 2,
    title: { zh: '回到顶部', en: 'BackToTop' },
    desc: {
      zh: '页面滚动后浮现的像素纸飞机，一点就回到页面顶部。',
      en: 'A pixel paper plane that floats in once the page scrolls and takes you back to the top.',
    },
    icon: <ArrowUp size={20} />,
    element: StarBackToTopDemoPage,
  },
  {
    routePath: 'title',
    component: 'Title',
    category: 'common',
    usageRank: 2,
    title: { zh: '标题', en: 'Title' },
    desc: {
      zh: '带金色内高光、深色锯齿描边和下落阴影的像素标题。',
      en: 'A pixel title with a gold fill, inner highlight, jagged dark outline, and drop shadow.',
    },
    icon: <Type size={20} />,
    element: StarTitleDemoPage,
  },
  {
    routePath: 'pixel-text',
    component: 'PixelText',
    category: 'other',
    usageRank: 2,
    title: { zh: '像素化文本', en: 'Pixel Text' },
    desc: {
      zh: '将文本栅格化为粗颗粒像素字形，可用于表情、徽章和复古 HUD。',
      en: 'Rasterize text into chunky pixel glyphs for emojis, badges, and retro HUDs.',
    },
    icon: <Grid2X2 size={20} />,
    element: StarPixelTextDemoPage,
  },
  {
    routePath: 'tag',
    component: 'Tag',
    category: 'data-display',
    usageRank: 5,
    title: { zh: '标签', en: 'Tag' },
    desc: {
      zh: '像钉在告示板上的木牌小签，用来标记作物品质、任务状态与分类。',
      en: 'Little wooden name tags for crop quality, quest states, and categories.',
    },
    icon: <Tag size={20} />,
    element: StarTagDemoPage,
  },
  {
    routePath: 'radio',
    component: 'Radio',
    category: 'data-entry',
    usageRank: 6,
    title: { zh: '单选框', en: 'Radio' },
    desc: {
      zh: 'Card 风格圆框承托像素圆点的单选控件，一次只选一个，支持禁用项与尺寸。',
      en: 'A Card-framed single-choice control with a pixel dot; one choice at a time, with disabled options and sizes.',
    },
    icon: <CircleDot size={20} />,
    element: StarRadioDemoPage,
  },
  {
    routePath: 'select',
    component: 'Select',
    category: 'data-entry',
    usageRank: 7,
    title: { zh: '下拉选择', en: 'Select' },
    desc: {
      zh: '木框凹陷的下拉选择器，从折叠清单里挑出作物、工具或村民。',
      en: 'A recessed pixel dropdown for picking crops, tools, or villagers from a folded list.',
    },
    icon: <ChevronDown size={20} />,
    element: StarSelectDemoPage,
  },
  {
    routePath: 'badge',
    component: 'Badge',
    category: 'data-display',
    usageRank: 6,
    title: { zh: '徽标', en: 'Badge' },
    desc: {
      zh: '像物品栏角落的数量角标，把计数、提醒和新消息钉在图标或按钮上。',
      en: 'An inventory-style counter badge that pins counts, reminders, and new messages onto icons and buttons.',
    },
    icon: <Hash size={20} />,
    element: StarBadgeDemoPage,
  },
  {
    routePath: 'textarea',
    component: 'Textarea',
    category: 'data-entry',
    usageRank: 8,
    title: { zh: '多行输入', en: 'Textarea' },
    desc: {
      zh: '木框凹陷的多行输入框，用来写长信、备注和任务描述。',
      en: 'A recessed multi-line field for letters, notes, and quest descriptions.',
    },
    icon: <Text size={20} />,
    element: StarTextareaDemoPage,
  },
  {
    routePath: 'alert',
    component: 'Alert',
    category: 'feedback',
    usageRank: 7,
    title: { zh: '警告提示', en: 'Alert' },
    desc: {
      zh: '钉在告示板顶端的横幅告示，用四种颜色区分提示、成功、警告与错误。',
      en: 'Notice-board banners in four colours for info, success, warning, and error.',
    },
    icon: <TriangleAlert size={20} />,
    element: StarAlertDemoPage,
  },
  {
    routePath: 'skeleton',
    component: 'Skeleton',
    category: 'feedback',
    usageRank: 8,
    title: { zh: '骨架屏', en: 'Skeleton' },
    desc: {
      zh: '内容就位前的像素条纹占位骨架，像矿洞里先搭好的支架。',
      en: 'Pixel-striped placeholders that prop the page up like mine supports before content arrives.',
    },
    icon: <Bone size={20} />,
    element: StarSkeletonDemoPage,
  },
  {
    routePath: 'tooltip',
    component: 'Tooltip',
    category: 'feedback',
    usageRank: 9,
    title: { zh: '文字提示', en: 'Tooltip' },
    desc: {
      zh: '悬停或聚焦时浮现的像素小气泡，像 NPC 的即时指点。',
      en: 'A pixel bubble that floats in on hover or focus, like an NPC pointing the way.',
    },
    icon: <MessageCircle size={20} />,
    element: StarTooltipDemoPage,
  },
  {
    routePath: 'pagination',
    component: 'Pagination',
    category: 'navigation',
    usageRank: 3,
    title: { zh: '分页', en: 'Pagination' },
    desc: {
      zh: '翻看公告板上一页页委托的像素翻页器。',
      en: 'A pixel pager for flipping through notice-board quests one page at a time.',
    },
    icon: <Ellipsis size={20} />,
    element: StarPaginationDemoPage,
  },
  {
    routePath: 'collapse',
    component: 'Collapse',
    category: 'data-display',
    usageRank: 7,
    title: { zh: '折叠面板', en: 'Collapse' },
    desc: {
      zh: '可折叠的木牌分节，像翻开的手账逐节收纳任务说明。',
      en: 'Foldable wooden sections that tuck quest notes away like a journal.',
    },
    icon: <ChevronsUpDown size={20} />,
    element: StarCollapseDemoPage,
  },
]

/**
 * Components that remain implemented and exported, but are temporarily kept
 * out of the public gallery, sidebar, and generated routes while their visual
 * direction is being revisited. Remove an entry here to publish it again.
 */
export const HIDDEN_COMPONENTS = ['Avatar'] as const

export const COMPONENT_ROUTES: ComponentRoute[] = ALL_COMPONENT_ROUTES
  .filter(({ component }) => !(HIDDEN_COMPONENTS as readonly string[]).includes(component))
  .toSorted(
    (left, right) => {
      const categoryOrder =
        (COMPONENT_CATALOGUE_CATEGORY_ORDER.get(left.category) ?? Infinity) -
        (COMPONENT_CATALOGUE_CATEGORY_ORDER.get(right.category) ?? Infinity)

      return categoryOrder || left.usageRank - right.usageRank || left.title.en.localeCompare(right.title.en)
    }
  )
