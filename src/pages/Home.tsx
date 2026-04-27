import { Link } from 'react-router-dom'
import { Package, Code, BookOpen, ArrowRight } from 'lucide-react'
import Card from '../components/ui/Card'
import { classNames } from '../utils/classNames'
import styles from './Home.module.css'

const features = [
  {
    title: '丰富的组件',
    description: '提供多种高质量 UI 组件，覆盖常见业务场景。',
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

function StarHomePage() {
  return (
    <div className={styles.home}>
      <Card className={styles['home-hero-card']}>
        <section className={styles['home-hero']}>
          <div className={styles['home-hero-content']}>
            <h1 className={styles['home-title']}>
              StardewValley UI
              <span className={styles['home-title-badge']}>React 组件库</span>
            </h1>
            <p className={styles['home-desc']}>
              一套基于 React 的星露谷风格 UI 组件集合，提供更统一、更有氛围感的界面基础。
            </p>
            <div className={styles['home-actions']}>
              <Link to="/guide" className={classNames(styles['home-btn'], styles['home-btn-primary'])}>
                开始使用
                <ArrowRight size={18} />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={classNames(styles['home-btn'], styles['home-btn-secondary'])}
              >
                GitHub
              </a>
            </div>
          </div>
        </section>
      </Card>

      <section className={styles['home-features']}>
        {features.map((item) => (
          <Card key={item.title} className={styles['home-feature-card']} showTitle title={item.title} hoverable>
            <div className={styles['home-feature-body']}>
              <div className={styles['home-feature-icon']}>{item.icon}</div>
              <p>{item.description}</p>
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}

export default StarHomePage
