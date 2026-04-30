import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Book, Box, ChevronDown, Search } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { useI18n } from '../../i18n'
import styles from './Sidebar.module.scss'

interface MenuItem {
  path: string
  labelZh: string
  labelEn: string
  icon?: ReactNode
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    path: '/guide',
    labelZh: '指南',
    labelEn: 'Guide',
    icon: <Book size={18} />,
  },
  {
    path: '/components',
    labelZh: '组件',
    labelEn: 'Components',
    icon: <Box size={18} />,
    children: [
      { path: '/components/button', labelZh: '按钮', labelEn: 'Button' },
      { path: '/components/calendar', labelZh: '日历', labelEn: 'Calendar' },
      { path: '/components/date-picker', labelZh: '日期选择', labelEn: 'DatePicker' },
      { path: '/components/title', labelZh: '标题', labelEn: 'Title' },
      { path: '/components/card', labelZh: '卡片', labelEn: 'Card' },
      { path: '/components/dialog', labelZh: '对话框', labelEn: 'Dialog' },
      { path: '/components/popup', labelZh: '弹窗', labelEn: 'Popup' },
      { path: '/components/typewriter', labelZh: '打字机', labelEn: 'Typewriter' },
      { path: '/components/loading', labelZh: '加载', labelEn: 'Loading' },
      { path: '/components/message', labelZh: '消息', labelEn: 'Message' },
      { path: '/components/empty-state', labelZh: '空状态', labelEn: 'EmptyState' },
      { path: '/components/tab', labelZh: '选项卡', labelEn: 'Tab' },
      { path: '/components/gap-border', labelZh: '缺口边框', labelEn: 'Gap Border' },
    ],
  },
]

function bilingualLabel(item: Pick<MenuItem, 'labelZh' | 'labelEn'>) {
  return `${item.labelZh} ${item.labelEn}`
}

function StarSidebar() {
  const location = useLocation()
  const { t } = useI18n()
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['/components'])
  const [searchQuery, setSearchQuery] = useState('')

  const toggleExpand = (path: string) => {
    setExpandedKeys((prev) => (prev.includes(path) ? prev.filter((key) => key !== path) : [...prev, path]))
  }

  const isExpanded = (path: string) => expandedKeys.includes(path)
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`)

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems

    const query = searchQuery.toLowerCase()
    return menuItems.map((item) => {
      if (!item.children) return item

      const filteredChildren = item.children.filter((child) =>
        `${child.labelZh} ${child.labelEn}`.toLowerCase().includes(query)
      )
      return { ...item, children: filteredChildren }
    })
  }, [searchQuery])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value && !expandedKeys.includes('/components')) {
      setExpandedKeys((prev) => [...prev, '/components'])
    }
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isComponentsMenu = item.path === '/components'
    const hasChildren = Boolean(item.children)
    const hasVisibleChildren = Boolean(item.children?.length)
    const expanded = isExpanded(item.path)
    const active = isActive(item.path)

    if (searchQuery && hasChildren && !hasVisibleChildren && !isComponentsMenu) {
      return null
    }

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
          <span className={styles['doc-sidebar-text']}>{bilingualLabel(item)}</span>
          {hasChildren ? (
            <span className={classNames(styles['doc-sidebar-arrow'], expanded && styles['is-expanded'])}>
              <ChevronDown size={16} />
            </span>
          ) : null}
        </NavLink>

        {hasChildren && expanded ? (
          <div className={styles['doc-sidebar-children']}>
            {isComponentsMenu ? (
              <div className={styles['doc-sidebar-search']}>
                <Search size={14} className={styles['doc-sidebar-search-icon']} />
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={styles['doc-sidebar-search-input']}
                />
              </div>
            ) : null}
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <aside className={styles['doc-sidebar']}>
      <nav className={styles['doc-sidebar-nav']}>{filteredMenuItems.map((item) => renderMenuItem(item))}</nav>
    </aside>
  )
}

export default StarSidebar
