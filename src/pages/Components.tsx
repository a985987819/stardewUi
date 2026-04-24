import { Link } from 'react-router-dom'
import { MousePointer, Square, MessageSquare, Type, Bell, ChevronRight } from 'lucide-react'
import './Components.css'

const components = [
  {
    path: '/components/button',
    title: 'Button 按钮',
    description: '用于触发操作的按钮组件，星露谷像素风格',
    icon: <MousePointer size={20} />,
  },
  {
    path: '/components/card',
    title: 'Card 卡片',
    description: '星露谷风格的卡片组件，支持多种配色主题',
    icon: <Square size={20} />,
  },
  {
    path: '/components/dialog',
    title: 'Dialog 弹窗',
    description: '星露谷风格对话弹窗，支持打字机效果和分页',
    icon: <MessageSquare size={20} />,
  },
  {
    path: '/components/typewriter',
    title: 'Typewriter 打字机',
    description: '文字逐个出现的打字机动画效果组件',
    icon: <Type size={20} />,
  },
  {
    path: '/components/message',
    title: 'Message 消息提示',
    description: '全局消息提示组件，支持5种风格类型',
    icon: <Bell size={20} />,
  },
]

function Components() {
  return (
    <div className="components-page">
      <div className="components-header">
        <h1>组件列表</h1>
        <p>以下是可用的组件列表，点击了解更多详情</p>
      </div>

      <div className="components-grid">
        {components.map((item) => (
          <Link key={item.path} to={item.path} className="components-card">
            <div className="components-card-icon">{item.icon}</div>
            <div className="components-card-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <ChevronRight size={20} className="components-card-arrow" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Components
