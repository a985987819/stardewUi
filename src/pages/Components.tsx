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
  Square,
  Type,
} from 'lucide-react'
import StarCard from '../components/ui/Card'
import { useI18n } from '../i18n'
import styles from './Components.module.scss'

interface ComponentInfo {
  path: string
  titleZh: string
  titleEn: string
  descZh: string
  descEn: string
  icon: React.ReactNode
}

const components: ComponentInfo[] = [
  {
    path: '/components/button',
    titleZh: '按钮',
    titleEn: 'Button',
    descZh: '九宫格动作按钮样式和变体。',
    descEn: 'Nine-slice action button styles and variants.',
    icon: <MousePointer size={20} />,
  },
  {
    path: '/components/calendar',
    titleZh: '日历',
    titleEn: 'Calendar',
    descZh: '带标记、详情和自定义图标的月度网格。',
    descEn: 'Month grid with markers, details, and custom icons.',
    icon: <CalendarDays size={20} />,
  },
  {
    path: '/components/date-picker',
    titleZh: '日期选择',
    titleEn: 'DatePicker',
    descZh: '单日期和范围选择，支持标准化时间戳。',
    descEn: 'Single-date and range selection with normalized timestamps.',
    icon: <CalendarRange size={20} />,
  },
  {
    path: '/components/title',
    titleZh: '标题',
    titleEn: 'Title',
    descZh: '装饰性标题横幅，支持尺寸和对齐选项。',
    descEn: 'Decorative title banners with size and alignment options.',
    icon: <Heading1 size={20} />,
  },
  {
    path: '/components/card',
    titleZh: '卡片',
    titleEn: 'Card',
    descZh: '灵活的内容容器，支持标题、页脚和颜色变体。',
    descEn: 'Flexible content container with title, footer, and color variants.',
    icon: <Square size={20} />,
  },
  {
    path: '/components/dialog',
    titleZh: '对话框',
    titleEn: 'Dialog',
    descZh: '用于故事和交互流程的对话面板模式。',
    descEn: 'Conversation panel patterns for story and interaction flows.',
    icon: <MessageSquare size={20} />,
  },
  {
    path: '/components/popup',
    titleZh: '弹窗',
    titleEn: 'Popup',
    descZh: '带方向定位的锚定气泡弹窗。',
    descEn: 'Anchored speech-bubble popups with directional placement.',
    icon: <MessageSquareMore size={20} />,
  },
  {
    path: '/components/typewriter',
    titleZh: '打字机',
    titleEn: 'Typewriter',
    descZh: '对话式内容的渐进式文本显示动画。',
    descEn: 'Incremental text reveal animation for dialog-style content.',
    icon: <Type size={20} />,
  },
  {
    path: '/components/loading',
    titleZh: '加载',
    titleEn: 'Loading',
    descZh: '基于 Canvas 的加载指示器，适用于按钮、面板和页面。',
    descEn: 'Canvas-based loading indicator for buttons, panels, and pages.',
    icon: <LoaderCircle size={20} />,
  },
  {
    path: '/components/message',
    titleZh: '消息',
    titleEn: 'Message',
    descZh: '轻量级全局状态和反馈通知。',
    descEn: 'Lightweight global status and feedback notifications.',
    icon: <Bell size={20} />,
  },
  {
    path: '/components/empty-state',
    titleZh: '空状态',
    titleEn: 'EmptyState',
    descZh: '空白列表、搜索和详情区域的占位布局。',
    descEn: 'Placeholder layouts for blank lists, searches, and detail areas.',
    icon: <Inbox size={20} />,
  },
  {
    path: '/components/tab',
    titleZh: '选项卡',
    titleEn: 'Tab',
    descZh: '带图标、自定义选中样式和顶部/底部放置的选项卡导航。',
    descEn: 'Tabbed navigation with icons, custom active styles, and top/bottom placement.',
    icon: <LayoutList size={20} />,
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
                <h3>
                  {item.titleZh}
                  {lang === 'en' && <span style={{ opacity: 0.6, marginLeft: '8px' }}>{item.titleEn}</span>}
                </h3>
                <p>
                  {item.descZh}
                  {lang === 'en' && <span style={{ opacity: 0.6, display: 'block', marginTop: '4px' }}>{item.descEn}</span>}
                </p>
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
