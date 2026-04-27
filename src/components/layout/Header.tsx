import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ExternalLink, Menu } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import styles from './Header.module.css'

function StarHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { path: '/guide', label: '指南' },
    { path: '/components', label: '组件' },
    { path: '/api', label: 'API' },
  ]

  return (
    <header className={styles['doc-header']}>
      <div className={styles['doc-header-container']}>
        <Link to="/" className={styles['doc-header-logo']}>
          <span className={styles['doc-header-logo-text']}>StardewValley UI</span>
        </Link>

        <nav className={classNames(styles['doc-header-nav'], isMenuOpen && styles['is-open'])}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                classNames(styles['doc-header-nav-item'], isActive && styles['is-active'])
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles['doc-header-actions']}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles['doc-header-github']}>
            <ExternalLink size={20} />
          </a>
          <button className={styles['doc-header-menu-btn']} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default StarHeader
