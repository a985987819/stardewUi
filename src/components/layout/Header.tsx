import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ExternalLink, Menu, Moon, Sun } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { useI18n } from '../../i18n'
import { useTheme } from '../../theme'
import StarLangSwitch from './LangSwitch'
import styles from './Header.module.scss'

function StarHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useI18n()
  const { resolvedTheme, setTheme } = useTheme()
  const isNight = resolvedTheme === 'dark'
  const themeLabel = t('header.theme')

  const navItems = [
    { path: '/guide/self-use', label: t('nav.guide') },
    { path: '/components', label: t('nav.components') },
    { path: '/api', label: t('nav.api') },
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
          <StarLangSwitch />
          <button
            type="button"
            className={styles['doc-header-github']}
            aria-label={themeLabel}
            title={themeLabel}
            onClick={() => setTheme(isNight ? 'light' : 'dark')}
          >
            {isNight ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <a href="https://github.com/a985987819/stardewUi" target="_blank" rel="noopener noreferrer" className={styles['doc-header-github']}>
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
