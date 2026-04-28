import { Link } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  Heading1,
  Inbox,
  LoaderCircle,
  MessageSquare,
  MessageSquareMore,
  MousePointer,
  Square,
  Type,
} from 'lucide-react'
import StarCard from '../components/ui/Card'
import styles from './Components.module.scss'

const components = [
  {
    path: '/components/button',
    title: 'Button',
    description: 'Nine-slice action button styles and variants.',
    icon: <MousePointer size={20} />,
  },
  {
    path: '/components/calendar',
    title: 'Calendar',
    description: 'Month grid with markers, details, and custom icons.',
    icon: <CalendarDays size={20} />,
  },
  {
    path: '/components/date-picker',
    title: 'DatePicker',
    description: 'Single-date and range selection with normalized timestamps.',
    icon: <CalendarRange size={20} />,
  },
  {
    path: '/components/title',
    title: 'Title',
    description: 'Decorative title banners with size and alignment options.',
    icon: <Heading1 size={20} />,
  },
  {
    path: '/components/card',
    title: 'Card',
    description: 'Flexible content container with title, footer, and color variants.',
    icon: <Square size={20} />,
  },
  {
    path: '/components/dialog',
    title: 'Dialog',
    description: 'Conversation panel patterns for story and interaction flows.',
    icon: <MessageSquare size={20} />,
  },
  {
    path: '/components/popup',
    title: 'Popup',
    description: 'Anchored speech-bubble popups with directional placement.',
    icon: <MessageSquareMore size={20} />,
  },
  {
    path: '/components/typewriter',
    title: 'Typewriter',
    description: 'Incremental text reveal animation for dialog-style content.',
    icon: <Type size={20} />,
  },
  {
    path: '/components/loading',
    title: 'Loading',
    description: 'Canvas-based loading indicator for buttons, panels, and pages.',
    icon: <LoaderCircle size={20} />,
  },
  {
    path: '/components/message',
    title: 'Message',
    description: 'Lightweight global status and feedback notifications.',
    icon: <Bell size={20} />,
  },
  {
    path: '/components/empty-state',
    title: 'EmptyState',
    description: 'Placeholder layouts for blank lists, searches, and detail areas.',
    icon: <Inbox size={20} />,
  },
]

function StarComponentsPage() {
  return (
    <div className={styles['components-page']}>
      <StarCard className={styles['components-header-card']}>
        <div className={styles['components-header']}>
          <h1>Components</h1>
          <p>Browse the available UI demos and open each page for usage examples and a lightweight API reference.</p>
        </div>
      </StarCard>

      <div className={styles['components-grid']}>
        {components.map((item) => (
          <Link key={item.path} to={item.path} className={styles['components-card-link']}>
            <StarCard className={styles['components-card']} hoverable>
              <div className={styles['components-card-icon']}>{item.icon}</div>
              <div className={styles['components-card-content']}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
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
