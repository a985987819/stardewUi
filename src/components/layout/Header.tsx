import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ExternalLink, Menu } from 'lucide-react'
import './Header.css'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { path: '/guide', label: '指南' },
    { path: '/components', label: '组件' },
    { path: '/api', label: 'API' },
  ]

  return (
    <header className="doc-header">
      <div className="doc-header-container">
        <Link to="/" className="doc-header-logo">
          <span className="doc-header-logo-text">StardewValley UI</span>
        </Link>

        <nav className={`doc-header-nav ${isMenuOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `doc-header-nav-item ${isActive ? 'is-active' : ''}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="doc-header-actions">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="doc-header-github"
          >
            <ExternalLink size={20} />
          </a>
          <button
            className="doc-header-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
