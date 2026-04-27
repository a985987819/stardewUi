import { Link } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  Heading1,
  MessageSquare,
  MessageSquareMore,
  MousePointer,
  Square,
  Type,
} from 'lucide-react'
import Card from '../components/ui/Card'
import './Components.css'

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
    description: '基于木牌背景与像素字效果的标题组件。',
    icon: <Heading1 size={20} />,
  },
  {
    path: '/components/card',
    title: 'Card 卡片',
    description: '支持可选标题区、配色和交互状态的面板卡片组件。',
    icon: <Square size={20} />,
  },
  {
    path: '/components/dialog',
    title: 'Dialog 对话框',
    description: '支持分页和打字机效果的对话弹窗。',
    icon: <MessageSquare size={20} />,
  },
  {
    path: '/components/popup',
    title: 'Popup 气泡弹窗',
    description: '支持上下左右与 start/end 对齐的像素气泡组件。',
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
    description: '全局消息提示组件，使用纯 canvas 像素边框。',
    icon: <Bell size={20} />,
  },
]

function Components() {
  return (
    <div className="components-page">
      <Card className="components-header-card">
        <div className="components-header">
          <h1>组件列表</h1>
          <p>以下是当前可用的 UI 组件，点击卡片可查看示例与 API。</p>
        </div>
      </Card>

      <div className="components-grid">
        {components.map((item) => (
          <Link key={item.path} to={item.path} className="components-card-link">
            <Card className="components-card" hoverable>
              <div className="components-card-icon">{item.icon}</div>
              <div className="components-card-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <ChevronRight size={20} className="components-card-arrow" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Components
