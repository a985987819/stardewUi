import { Link } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  Heading1,
  Inbox,
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
    title: 'Button 按钮',
    description: '用于触发操作的九宫格像素按钮组件。',
    icon: <MousePointer size={20} />,
  },
  {
    path: '/components/title',
    title: 'Title 标题',
    description: '基于木牌背景和像素字效果的标题组件。',
    icon: <Heading1 size={20} />,
  },
  {
    path: '/components/card',
    title: 'Card 卡片',
    description: '支持标题区、配色和交互状态的卡片容器。',
    icon: <Square size={20} />,
  },
  {
    path: '/components/dialog',
    title: 'Dialog 对话框',
    description: '支持分页和打字机效果的对话弹窗组件。',
    icon: <MessageSquare size={20} />,
  },
  {
    path: '/components/popup',
    title: 'Popup 气泡弹窗',
    description: '支持四向定位和 start/end 对齐的像素气泡组件。',
    icon: <MessageSquareMore size={20} />,
  },
  {
    path: '/components/typewriter',
    title: 'Typewriter 打字机',
    description: '逐字显示文本内容的打字机动画组件。',
    icon: <Type size={20} />,
  },
  {
    path: '/components/message',
    title: 'Message 消息提示',
    description: '全局消息提示组件，适合轻量反馈和状态通知。',
    icon: <Bell size={20} />,
  },
  {
    path: '/components/empty-state',
    title: 'EmptyState 空状态',
    description: '用于列表、结果页和占位区的空状态组件，支持横向和竖向布局。',
    icon: <Inbox size={20} />,
  },
]

function StarComponentsPage() {
  return (
    <div className={styles['components-page']}>
      <StarCard className={styles['components-header-card']}>
        <div className={styles['components-header']}>
          <h1>组件列表</h1>
          <p>以下是当前可用的 UI 组件，点击卡片可以查看示例与 API。</p>
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
