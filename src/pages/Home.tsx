import { Link } from 'react-router-dom'
import { Package, Code, BookOpen, ArrowRight } from 'lucide-react'
import Card from '../components/ui/Card'
import './Home.css'

const features = [
  {
    title: '丰富的组件',
    description: '提供多种高质量组件，覆盖常见业务场景。',
    icon: <Package size={28} />,
  },
  {
    title: 'TypeScript',
    description: '完整的类型定义，提升项目集成和维护体验。',
    icon: <Code size={28} />,
  },
  {
    title: '完善的文档',
    description: '提供清晰示例和 API 说明，降低上手成本。',
    icon: <BookOpen size={28} />,
  },
]

function Home() {
  return (
    <div className="home">
      <Card className="home-hero-card">
        <section className="home-hero">
          <div className="home-hero-content">
            <h1 className="home-title">
              StardewValley UI
              <span className="home-title-badge">React 组件库</span>
            </h1>
            <p className="home-desc">
              一套基于 React 的星露谷风格 UI 组件集合，提供更统一、更有氛围感的界面基础。
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
      </Card>

      <section className="home-features">
        {features.map((item) => (
          <Card key={item.title} className="home-feature-card" showTitle title={item.title} hoverable>
            <div className="home-feature-body">
              <div className="home-feature-icon">{item.icon}</div>
              <p>{item.description}</p>
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}

export default Home
