import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Book, Box, ChevronDown } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import styles from './Sidebar.module.css'

interface MenuItem {
  path: string
  label: string
  icon?: ReactNode
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
      { path: '/components/title', label: 'Title 标题' },
      { path: '/components/card', label: 'Card 卡片' },
      { path: '/components/dialog', label: 'Dialog 对话框' },
      { path: '/components/popup', label: 'Popup 气泡弹窗' },
      { path: '/components/typewriter', label: 'Typewriter 打字机' },
      { path: '/components/message', label: 'Message 消息提示' },
      { path: '/components/empty-state', label: 'EmptyState 空状态' },
    ],
  },
]

function StarSidebar() {
  const location = useLocation()
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['/components'])

  const toggleExpand = (path: string) => {
    setExpandedKeys((prev) => (prev.includes(path) ? prev.filter((key) => key !== path) : [...prev, path]))
  }

  const isExpanded = (path: string) => expandedKeys.includes(path)
  const isActive = (path: string) => location.pathname.startsWith(path)

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = Boolean(item.children?.length)
    const expanded = isExpanded(item.path)
    const active = isActive(item.path)

    return (
      <div key={item.path} className={styles['doc-sidebar-item']}>
        <NavLink
          to={item.path}
          className={classNames(
            styles['doc-sidebar-link'],
            active && styles['is-active'],
            level > 0 && styles[`level-${level}`]
          )}
          onClick={(event) => {
            if (hasChildren) {
              event.preventDefault()
              toggleExpand(item.path)
            }
          }}
        >
          {item.icon ? <span className={styles['doc-sidebar-icon']}>{item.icon}</span> : null}
          <span className={styles['doc-sidebar-text']}>{item.label}</span>
          {hasChildren ? (
            <span className={classNames(styles['doc-sidebar-arrow'], expanded && styles['is-expanded'])}>
              <ChevronDown size={16} />
            </span>
          ) : null}
        </NavLink>

        {hasChildren && expanded ? (
          <div className={styles['doc-sidebar-children']}>
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <aside className={styles['doc-sidebar']}>
      <nav className={styles['doc-sidebar-nav']}>{menuItems.map((item) => renderMenuItem(item))}</nav>
    </aside>
  )
}

export default StarSidebar
