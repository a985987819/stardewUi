import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Book, Box, Layers } from 'lucide-react'
import './Sidebar.css'
import { classNames } from '../../utils/classNames'

interface MenuItem {
  path: string
  label: string
  icon?: React.ReactNode
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    path: '/guide',
    label: '快速开始',
    icon: <Book size={18} />,
  },
  {
    path: '/components',
    label: '组件',
    icon: <Box size={18} />,
    children: [
      { path: '/components/button', label: 'Button 按钮' },
      { path: '/components/card', label: 'Card 卡片' },
      { path: '/components/dialog', label: 'Dialog 弹窗' },
    ],
  },
]

function Sidebar() {
  const location = useLocation()
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['/components'])

  const toggleExpand = (path: string) => {
    setExpandedKeys((prev) =>
      prev.includes(path)
        ? prev.filter((key) => key !== path)
        : [...prev, path]
    )
  }

  const isExpanded = (path: string) => expandedKeys.includes(path)

  const isActive = (path: string) => location.pathname.startsWith(path)

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const expanded = isExpanded(item.path)
    const active = isActive(item.path)

    return (
      <div key={item.path} className="doc-sidebar-item">
        <NavLink
          to={item.path}
          className={classNames(
            'doc-sidebar-link',
            active && 'is-active',
            `level-${level}`
          )}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault()
              toggleExpand(item.path)
            }
          }}
        >
          {item.icon && (
            <span className="doc-sidebar-icon">{item.icon}</span>
          )}
          <span className="doc-sidebar-text">{item.label}</span>
          {hasChildren && (
            <span
              className={classNames(
                'doc-sidebar-arrow',
                expanded && 'is-expanded'
              )}
            >
              <ChevronDown size={16} />
            </span>
          )}
        </NavLink>

        {hasChildren && expanded && (
          <div className="doc-sidebar-children">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="doc-sidebar">
      <nav className="doc-sidebar-nav">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
    </aside>
  )
}

export default Sidebar
