import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Coffee, ExternalLink, Menu } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { GITHUB_REPO_URL } from '../../utils/githubIssues'
import { useI18n } from '../../i18n'
import StarLangSwitch from './LangSwitch'
import styles from './Header.module.scss'

function StarHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useI18n()

  // Only routes that exist. `/api` used to sit here, but there has never been an
  // API index page: clicking it fell through to the `*` catch-all and bounced
  // back to the home page, which reads as a broken link rather than a missing
  // feature. The per-component pages under /components carry the API tables.
  const navItems = [
    { path: '/guide/self-use', label: t('nav.guide') },
    { path: '/components', label: t('nav.components') },
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
          {/* A site route, not a GitHub link: the donation page lives here now,
              and bouncing out to the README to find it was one step too many. */}
          <Link
            to="/support"
            className={styles['doc-header-sponsor']}
            title={t('header.sponsor')}
            aria-label={t('header.sponsor')}
          >
            <Coffee size={20} />
          </Link>
          <a
            // From the shared constant, not a literal: the launcher, the footer and
            // this header all point at the same repository, and three copies of the
            // URL is three chances for one of them to be a fork or a typo.
            href={GITHUB_REPO_URL}
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
