import { Link } from 'react-router-dom'
import {
  Bell,
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
    title: 'Button 按钮',
    description: '用于触发操作的九宫格像素风按钮组件。',
    icon: <MousePointer size={20} />,
  },
  {
    path: '/components/title',
    title: 'Title 标题',
    description: '带像素风背景与多尺寸配置的标题组件。',
    icon: <Heading1 size={20} />,
  },
  {
    path: '/components/card',
    title: 'Card 卡片',
    description: '支持标题区、内容区与多种视觉风格的卡片容器。',
    icon: <Square size={20} />,
  },
  {
    path: '/components/dialog',
    title: 'Dialog 对话框',
    description: '支持分页、角色侧栏与打字机效果的统一弹窗组件。',
    icon: <MessageSquare size={20} />,
  },
  {
    path: '/components/popup',
    title: 'Popup 气泡弹窗',
    description: '支持四向定位与 start/end 对齐的像素风气泡组件。',
    icon: <MessageSquareMore size={20} />,
  },
  {
    path: '/components/typewriter',
    title: 'Typewriter 打字机',
    description: '按字逐步显示文本内容的打字机动画组件。',
    icon: <Type size={20} />,
  },
  {
    path: '/components/loading',
    title: 'Loading 加载',
    description: '基于 canvas 的包子加载动画组件，适合按钮、区域和页面级等待状态。',
    icon: <LoaderCircle size={20} />,
  },
  {
    path: '/components/message',
    title: 'Message 消息提示',
    description: '用于轻量级全局反馈与状态通知的消息提示组件。',
    icon: <Bell size={20} />,
  },
  {
    path: '/components/empty-state',
    title: 'EmptyState 空状态',
    description: '适合列表、搜索结果和占位区域的空状态组件。',
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
