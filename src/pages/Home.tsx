import { Link } from 'react-router-dom'
import { Package, Code, BookOpen, ArrowRight } from 'lucide-react'
import StarCard from '../components/ui/Card'
import { classNames } from '../utils/classNames'
import styles from './Home.module.scss'

const features = [
  {
    title: '像素风组件',
    description: '围绕按钮、卡片、日历、日期选择器、对话框等基础能力，逐步构建统一的像素风视觉语言。',
    icon: <Package size={28} />,
  },
  {
    title: '可直接体验',
    description: '每个组件都配有独立演示页和示例内容，可以先看效果、再看用法，降低接入和试错成本。',
    icon: <Code size={28} />,
  },
  {
    title: '有氛围的界面',
    description: '适合活动页、游戏感页面和需要风格表达的前端项目，让界面不只可用，也更有记忆点。',
    icon: <BookOpen size={28} />,
  },
]

function StarHomePage() {
  return (
    <div className={styles.home}>
      <StarCard className={styles['home-hero-card']}>
        <section className={styles['home-hero']}>
          <div className={styles['home-hero-content']}>
            <h1 className={styles['home-title']}>
              StardewValley UI
              <span className={styles['home-title-badge']}>像素风 UI Kit</span>
            </h1>
            <p className={styles['home-desc']}>
              一个受星露谷气质启发的像素风 UI 组件库。这里提供带有田园感、游戏感和复古界面氛围的组件与 demo，适合用来搭建更有个性的网页和交互页面。
            </p>
            <div className={styles['home-actions']}>
              <Link to="/guide" className={classNames(styles['home-btn'], styles['home-btn-primary'])}>
                开始浏览
                <ArrowRight size={18} />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={classNames(styles['home-btn'], styles['home-btn-secondary'])}
              >
                查看 GitHub
              </a>
            </div>
          </div>
        </section>
      </StarCard>

      <section className={styles['home-features']}>
        {features.map((item) => (
          <StarCard key={item.title} className={styles['home-feature-card']} showTitle title={item.title} hoverable>
            <div className={styles['home-feature-body']}>
              <div className={styles['home-feature-icon']}>{item.icon}</div>
              <p>{item.description}</p>
            </div>
          </StarCard>
        ))}
      </section>
    </div>
  )
}

export default StarHomePage
