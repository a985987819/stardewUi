import type { BaseProps } from './common'

export interface ComponentDemoProps extends BaseProps {
  title: string
  description?: string
}

export interface ApiTableProps extends BaseProps {
  data: ApiProperty[]
}

export interface ApiProperty {
  name: string
  description: string
  type: string
  default?: string
  required?: boolean
}

export interface CodeBlockProps extends BaseProps {
  code: string
  language?: string
  showCopy?: boolean
  showLineNumbers?: boolean
}

export interface SidebarItem {
  id: string
  title: string
  path: string
  icon?: React.ReactNode
  children?: SidebarItem[]
}

export interface SidebarProps extends BaseProps {
  items: SidebarItem[]
  activeId?: string
  onItemClick?: (item: SidebarItem) => void
}

export interface HeaderProps extends BaseProps {
  logo?: React.ReactNode
  title?: string
  navItems?: NavItem[]
}

export interface NavItem {
  label: string
  path: string
  external?: boolean
}
