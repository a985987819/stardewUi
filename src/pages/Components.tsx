import { Link } from 'react-router-dom'
import { MousePointer, ChevronRight } from 'lucide-react'
import './Components.css'

const components = [
  {
    path: '/components/button',
    title: 'Button 按钮',
    description: '用于触发操作的按钮组件',
    icon: <MousePointer size={20} />,
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
