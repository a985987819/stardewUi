import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Book, Box, ChevronDown, Search } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { useI18n } from '../../i18n'
import {
  COMPONENT_CATALOGUE_CATEGORIES,
  COMPONENT_CATALOGUE_CATEGORY_META,
  COMPONENT_ROUTES,
} from '../../router/componentRegistry'
import styles from './Sidebar.module.scss'

interface MenuItem {
  id: string
  path?: string
  labelZh: string
  labelEn: string
  icon?: ReactNode
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    id: '/guide',
    labelZh: '指南',
    labelEn: 'Guide',
    icon: <Book size={18} />,
    children: [
      { id: '/guide/self-use', path: '/guide/self-use', labelZh: '自行使用', labelEn: 'Use it yourself' },
      { id: '/guide/agent-use', path: '/guide/agent-use', labelZh: 'Agent 帮我使用', labelEn: 'Use it with an agent' },
      { id: '/guide/design-system', path: '/guide/design-system', labelZh: '设计规范', labelEn: 'Design system' },
      { id: '/guide/license', path: '/guide/license', labelZh: '版权相关', labelEn: 'License & attribution' },
    ],
  },
  {
    id: '/components',
    path: '/components',
    labelZh: '组件',
    labelEn: 'Components',
    icon: <Box size={18} />,
    children: COMPONENT_CATALOGUE_CATEGORIES.map((category) => ({
      id: `category-${category}`,
      labelZh: COMPONENT_CATALOGUE_CATEGORY_META[category].zh,
      labelEn: COMPONENT_CATALOGUE_CATEGORY_META[category].en,
      children: COMPONENT_ROUTES
        .filter((component) => component.category === category)
        .map((component) => ({
          id: `/components/${component.routePath}`,
          path: `/components/${component.routePath}`,
          labelZh: component.title.zh,
          labelEn: component.title.en,
        })),
    })),
  },
]

function bilingualLabel(item: Pick<MenuItem, 'labelZh' | 'labelEn'>) {
  return `${item.labelZh} ${item.labelEn}`
}

function StarSidebar() {
  const location = useLocation()
  const { t } = useI18n()
  const [expandedKeys, setExpandedKeys] = useState<string[]>([
    '/guide',
    '/components',
    ...COMPONENT_CATALOGUE_CATEGORIES.map((category) => `category-${category}`),
  ])
  const [searchQuery, setSearchQuery] = useState('')

  const toggleExpand = (id: string) => {
    setExpandedKeys((prev) => (prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]))
  }

  const isExpanded = (id: string) => expandedKeys.includes(id)
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`)

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems

    const query = searchQuery.toLowerCase()
    const filterItem = (item: MenuItem): MenuItem | null => {
      if (!item.children) {
        return `${item.labelZh} ${item.labelEn}`.toLowerCase().includes(query) ? item : null
      }

      const children = item.children.map(filterItem).filter((child): child is MenuItem => child !== null)
      return children.length > 0 || item.id === '/components' ? { ...item, children } : null
    }

    return menuItems.map(filterItem).filter((item): item is MenuItem => item !== null)
  }, [searchQuery])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value) {
      setExpandedKeys([
        '/guide',
        '/components',
        ...COMPONENT_CATALOGUE_CATEGORIES.map((category) => `category-${category}`),
      ])
    }
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isComponentsMenu = item.id === '/components'
    const hasChildren = Boolean(item.children)
    const hasVisibleChildren = Boolean(item.children?.length)
    const expanded = isExpanded(item.id)
    const active = item.path
      ? isActive(item.path)
      : Boolean(item.children?.some((child) => child.path && isActive(child.path)))

    if (searchQuery && hasChildren && !hasVisibleChildren && !isComponentsMenu) {
      return null
    }

    return (
      <div key={item.id} className={styles['doc-sidebar-item']}>
        {item.path ? (
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
                toggleExpand(item.id)
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
        ) : (
          <button
            type="button"
            className={classNames(
              styles['doc-sidebar-link'],
              styles['doc-sidebar-category'],
              active && styles['is-active'],
              styles[`level-${level}`]
            )}
            onClick={() => toggleExpand(item.id)}
            aria-expanded={expanded}
          >
            <span className={styles['doc-sidebar-text']}>{bilingualLabel(item)}</span>
            <span className={classNames(styles['doc-sidebar-arrow'], expanded && styles['is-expanded'])}>
              <ChevronDown size={14} />
            </span>
          </button>
        )}

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
