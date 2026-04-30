import { Link } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  Heading1,
  Inbox,
  LayoutList,
  LoaderCircle,
  MessageSquare,
  MessageSquareMore,
  MousePointer,
  ScanLine,
  Square,
  Type,
  Joystick,
} from 'lucide-react'
import StarCard from '../components/ui/Card'
import { useI18n, type Lang } from '../i18n'
import styles from './Components.module.scss'

interface ComponentInfo {
  path: string
  title: Record<Lang, string>
  desc: Record<Lang, string>
  icon: React.ReactNode
}

const components: ComponentInfo[] = [
  {
    path: '/components/button',
    title: { zh: '按钮', en: 'Button' },
    desc: {
      zh: '像工具栏一样可靠的九宫格按钮，适合确认、交易、升级和危险操作。',
      en: 'Nine-slice action buttons for confirms, trades, upgrades, and dangerous moves.',
    },
    icon: <MousePointer size={20} />,
  },
  {
    path: '/components/calendar',
    title: { zh: '日历', en: 'Calendar' },
    desc: {
      zh: '把节日、收获日和村民生日钉在月历上，别再错过花舞节。',
      en: 'Pin festivals, harvest days, and birthdays to a month grid so the Flower Dance is never missed.',
    },
    icon: <CalendarDays size={20} />,
  },
  {
    path: '/components/date-picker',
    title: { zh: '日期选择', en: 'DatePicker' },
    desc: {
      zh: '选择播种日或规划一段采矿假期，并返回稳定的标准化时间戳。',
      en: 'Choose a planting day or a mining vacation range with normalized timestamps.',
    },
    icon: <CalendarRange size={20} />,
  },
  {
    path: '/components/title',
    title: { zh: '标题', en: 'Title' },
    desc: {
      zh: '像镇口木牌一样醒目的标题横幅，用来标记章节、任务和活动入口。',
      en: 'Town-sign style title banners for chapters, quests, and event entrances.',
    },
    icon: <Heading1 size={20} />,
  },
  {
    path: '/components/card',
    title: { zh: '卡片', en: 'Card' },
    desc: {
      zh: '像公告栏纸条一样承载任务、物品、提示和操作区。',
      en: 'Notice-board cards for quests, items, hints, and action panels.',
    },
    icon: <Square size={20} />,
  },
  {
    path: '/components/dialog',
    title: { zh: '对话框', en: 'Dialog' },
    desc: {
      zh: '用于 NPC 台词、剧情提示和确认流程的像素对话面板。',
      en: 'Pixel dialog panels for NPC lines, story prompts, and confirmation flows.',
    },
    icon: <MessageSquare size={20} />,
  },
  {
    path: '/components/popup',
    title: { zh: '弹窗', en: 'Popup' },
    desc: {
      zh: '像气泡提示一样贴近目标，适合展示奖励、状态和小提示。',
      en: 'Anchored bubble popups for rewards, statuses, and compact hints.',
    },
    icon: <MessageSquareMore size={20} />,
  },
  {
    path: '/components/typewriter',
    title: { zh: '打字机', en: 'Typewriter' },
    desc: {
      zh: '让文本像 NPC 逐字说话一样出现，适合剧情、引导和成就提示。',
      en: 'Reveal text like NPC dialog for story beats, onboarding, and achievements.',
    },
    icon: <Type size={20} />,
  },
  {
    path: '/components/loading',
    title: { zh: '加载', en: 'Loading' },
    desc: {
      zh: '包子被一口口吃掉的加载反馈，让等待也像小游戏。',
      en: 'A bun-bite loading indicator that turns waiting into a tiny game loop.',
    },
    icon: <LoaderCircle size={20} />,
  },
  {
    path: '/components/message',
    title: { zh: '消息', en: 'Message' },
    desc: {
      zh: '像右下角收获提示一样，轻量展示成功、警告和错误反馈。',
      en: 'Lightweight success, warning, and error feedback like a harvest toast.',
    },
    icon: <Bell size={20} />,
  },
  {
    path: '/components/empty-state',
    title: { zh: '空状态', en: 'EmptyState' },
    desc: {
      zh: '背包空了、搜索没结果、任务板暂无委托时，用它保持页面友好。',
      en: 'Friendly placeholders for empty backpacks, no search results, and quiet quest boards.',
    },
    icon: <Inbox size={20} />,
  },
  {
    path: '/components/tab',
    title: { zh: '选项卡', en: 'Tab' },
    desc: {
      zh: '用季节、区域或任务分类切换内容，像翻看农场手册。',
      en: 'Switch content by season, location, or quest type like flipping through a farm manual.',
    },
    icon: <LayoutList size={20} />,
  },
  {
    path: '/components/gap-border',
    title: { zh: '缺口边框', en: 'Gap Border' },
    desc: {
      zh: '四边分开绘制并在四角留白，形成故意断开的像素边框。',
      en: 'Separate edge segments leave corner gaps for an intentionally broken pixel border.',
    },
    icon: <ScanLine size={20} />,
  },
  {
    path: '/components/pixel-button',
    title: { zh: '像素按钮', en: 'PixelButton' },
    desc: {
      zh: '锯齿边框的复古像素按钮，支持自定义配色和立体阴影效果。',
      en: 'Retro pixel button with锯齿边框, supporting custom colors and 3D shadow effects.',
    },
    icon: <Joystick size={20} />,
  },
]

function StarComponentsPage() {
  const { t, lang } = useI18n()

  return (
    <div className={styles['components-page']}>
      <StarCard className={styles['components-header-card']}>
        <div className={styles['components-header']}>
          <h1>{t('components.title')}</h1>
          <p>{t('components.desc')}</p>
        </div>
      </StarCard>

      <div className={styles['components-grid']}>
        {components.map((item) => (
          <Link key={item.path} to={item.path} className={styles['components-card-link']}>
            <StarCard className={styles['components-card']} hoverable>
              <div className={styles['components-card-icon']}>{item.icon}</div>
              <div className={styles['components-card-content']}>
                <h3>{item.title[lang]}</h3>
                <p>{item.desc[lang]}</p>
              </div>
              <ChevronRight size={20} className={styles['components-card-arrow']} />
            </StarCard>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default StarComponentsPage
