import { useState, useMemo, type ReactNode, type ChangeEvent } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Book, Box, ChevronDown, Search } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { useI18n } from '../../i18n'
import styles from './Sidebar.module.scss'

interface MenuItem {
  path: string
  label: string
  labelEn?: string
  icon?: ReactNode
  children?: MenuItem[]
}

// 双语标签映射
const bilingualLabels: Record<string, { zh: string; en: string }> = {
  'sidebar.guide': { zh: '指南', en: 'Guide' },
  'sidebar.components': { zh: '组件', en: 'Components' },
  'sidebar.button': { zh: '按钮', en: 'Button' },
  'sidebar.calendar': { zh: '日历', en: 'Calendar' },
  'sidebar.datePicker': { zh: '日期选择', en: 'DatePicker' },
  'sidebar.title': { zh: '标题', en: 'Title' },
  'sidebar.card': { zh: '卡片', en: 'Card' },
  'sidebar.dialog': { zh: '对话框', en: 'Dialog' },
  'sidebar.popup': { zh: '弹窗', en: 'Popup' },
  'sidebar.typewriter': { zh: '打字机', en: 'Typewriter' },
  'sidebar.loading': { zh: '加载', en: 'Loading' },
  'sidebar.message': { zh: '消息', en: 'Message' },
  'sidebar.emptyState': { zh: '空状态', en: 'EmptyState' },
  'sidebar.tab': { zh: '选项卡', en: 'Tab' },
}

function useMenuItems(): MenuItem[] {
  const getBilingualLabel = (key: string): { zh: string; en: string } => {
    return bilingualLabels[key] || { zh: key, en: key }
  }

  const guide = getBilingualLabel('sidebar.guide')
  const components = getBilingualLabel('sidebar.components')

  // 根据语言设置生成标签：中文模式只显示中文，英文模式显示中文+英文
  const getLabel = (item: { zh: string; en: string }) => {
    return  `${item.zh} ${item.en}` 
  }

  return [
    {
      path: '/guide',
      label: getLabel(guide),
      icon: <Book size={18} />,
    },
    {
      path: '/components',
      label: getLabel(components),
      icon: <Box size={18} />,
      children: [
        { path: '/components/button', label: getBilingualLabel('sidebar.button').zh, labelEn:  getBilingualLabel('sidebar.button').en },
        { path: '/components/calendar', label: getBilingualLabel('sidebar.calendar').zh, labelEn:  getBilingualLabel('sidebar.calendar').en },
        { path: '/components/date-picker', label: getBilingualLabel('sidebar.datePicker').zh, labelEn:  getBilingualLabel('sidebar.datePicker').en },
        { path: '/components/title', label: getBilingualLabel('sidebar.title').zh, labelEn:  getBilingualLabel('sidebar.title').en },
        { path: '/components/card', label: getBilingualLabel('sidebar.card').zh, labelEn:  getBilingualLabel('sidebar.card').en },
        { path: '/components/dialog', label: getBilingualLabel('sidebar.dialog').zh, labelEn:  getBilingualLabel('sidebar.dialog').en },
        { path: '/components/popup', label: getBilingualLabel('sidebar.popup').zh, labelEn:  getBilingualLabel('sidebar.popup').en },
        { path: '/components/typewriter', label: getBilingualLabel('sidebar.typewriter').zh, labelEn:  getBilingualLabel('sidebar.typewriter').en },
        { path: '/components/loading', label: getBilingualLabel('sidebar.loading').zh, labelEn:  getBilingualLabel('sidebar.loading').en },
        { path: '/components/message', label: getBilingualLabel('sidebar.message').zh, labelEn:  getBilingualLabel('sidebar.message').en },
        { path: '/components/empty-state', label: getBilingualLabel('sidebar.emptyState').zh, labelEn:  getBilingualLabel('sidebar.emptyState').en },
        { path: '/components/tab', label: getBilingualLabel('sidebar.tab').zh, labelEn:  getBilingualLabel('sidebar.tab').en },
      ],
    },
  ]
}

function StarSidebar() {
  const location = useLocation()
  const { t } = useI18n()
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['/components'])
  const [searchQuery, setSearchQuery] = useState('')
  const menuItems = useMenuItems()

  const toggleExpand = (path: string) => {
    setExpandedKeys((prev) => (prev.includes(path) ? prev.filter((key) => key !== path) : [...prev, path]))
  }

  const isExpanded = (path: string) => expandedKeys.includes(path)
  const isActive = (path: string) => location.pathname.startsWith(path)

  // 过滤组件列表
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems

    const query = searchQuery.toLowerCase()
    return menuItems.map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter(
          (child) =>
            child.label.toLowerCase().includes(query) ||
            (child.labelEn && child.labelEn.toLowerCase().includes(query))
        )
        return { ...item, children: filteredChildren }
      }
      return item
    })
  }, [menuItems, searchQuery])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // 搜索时自动展开组件菜单
    if (e.target.value && !expandedKeys.includes('/components')) {
      setExpandedKeys((prev) => [...prev, '/components'])
    }
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = Boolean(item.children?.length)
    const expanded = isExpanded(item.path)
    const active = isActive(item.path)

    // 对于组件菜单，即使搜索无结果也要渲染（为了显示搜索框）
    const isComponentsMenu = item.path === '/components'
    const hasVisibleChildren = item.children && item.children.length > 0
    
    // 如果搜索中且没有子项，不渲染（但组件菜单除外）
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
          <span className={styles['doc-sidebar-text']}>
            {item.labelEn ? `${item.label} ${item.labelEn}` : item.label}
          </span>
          {hasChildren ? (
            <span className={classNames(styles['doc-sidebar-arrow'], expanded && styles['is-expanded'])}>
              <ChevronDown size={16} />
            </span>
          ) : null}
        </NavLink>

        {hasChildren && expanded ? (
          <div className={styles['doc-sidebar-children']}>
            {/* 在组件选项下方添加搜索框 - 始终显示 */}
            {isComponentsMenu && (
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
            )}
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
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
