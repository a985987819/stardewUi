import { Link } from 'react-router-dom'
import { Package, Code, BookOpen, ArrowRight } from 'lucide-react'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-decoration">
          <div className="home-circle home-circle-1" />
          <div className="home-circle home-circle-2" />
          <div className="home-circle home-circle-3" />
        </div>

        <div className="home-hero-content">
          <h1 className="home-title">
            StardewValley UI
            <span className="home-title-badge">React 组件库</span>
          </h1>
          <p className="home-desc">
            一套基于 React 的高质量 UI 组件库，为你的项目提供优雅、易用的界面解决方案
          </p>
          <div className="home-actions">
            <Link to="/guide" className="home-btn home-btn-primary">
              开始使用
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="home-btn home-btn-secondary"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-feature">
          <div className="home-feature-icon">
            <Package size={28} />
          </div>
          <h3>丰富的组件</h3>
          <p>提供数十个高质量组件，覆盖常见业务场景</p>
        </div>

        <div className="home-feature">
          <div className="home-feature-icon">
            <Code size={28} />
          </div>
          <h3>TypeScript</h3>
          <p>完整的 TypeScript 类型定义，提供更好的开发体验</p>
        </div>

        <div className="home-feature">
          <div className="home-feature-icon">
            <BookOpen size={28} />
          </div>
          <h3>完善的文档</h3>
          <p>详细的文档和示例，帮助你快速上手</p>
        </div>
      </section>
    </div>
  )
}

export default Home
