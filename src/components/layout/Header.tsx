import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Coffee, ExternalLink, Menu } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { useI18n } from '../../i18n'
import StarLangSwitch from './LangSwitch'
import styles from './Header.module.scss'

function StarHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { lang, t } = useI18n()

  // Both READMEs carry a coffee section, but GitHub slugs the Chinese heading
  // differently from the English one, so the link has to follow the language.
  const sponsorUrl =
    lang === 'zh'
      ? 'https://github.com/a985987819/stardewUi#请我喝杯咖啡-'
      : 'https://github.com/a985987819/stardewUi#buy-me-a-coffee-'

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
          <a
            href={sponsorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles['doc-header-sponsor']}
            title={t('header.sponsor')}
            aria-label={t('header.sponsor')}
          >
            <Coffee size={20} />
          </a>
          <a
            href="https://github.com/a985987819/stardewUi"
            target="_blank"
            rel="noopener noreferrer"
            className={styles['doc-header-github']}
            // An icon-only link has no accessible name, so a screen reader
            // announced it as a bare "link". `header.github` existed in the
            // dictionary the whole time with nothing reading it.
            title={t('header.github')}
            aria-label={t('header.github')}
          >
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
