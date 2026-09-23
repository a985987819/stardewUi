import { Link } from 'react-router-dom'
import { ArrowRight, Blocks, BookOpen, ExternalLink, Palette, ShieldCheck, Sprout } from 'lucide-react'
import StarCard from '../components/ui/Card'
import heroImage from '../assets/hero.png'
import { COMPONENT_ROUTES } from '../router/componentRegistry'
import { classNames } from '../utils/classNames'
import { useI18n } from '../i18n'
import styles from './Home.module.scss'

const copy = {
  zh: {
    eyebrow: 'PIXEL UI COMPONENT LIBRARY · REACT + TYPESCRIPT',
    titleBefore: '给你的界面，',
    titleAccent: '种下一座小镇',
    description: '一套可组合、带类型提示的像素风 React 组件。把清晰的产品交互装进有泥土气息的边框里，让每一次点击都有一点收成。',
    explore: '浏览组件田地',
    guide: '从使用指南开始',
    install: '把种子放进项目',
    installHint: '安装后从一个 Card、Button 或 Dialog 开始；其余工具会在需要时慢慢长出来。',
    componentCount: '块可试种的组件田',
    typeSafe: 'TypeScript 类型守卫',
    noCommercial: '仅限非商业使用',
    routesTitle: '从第一天开始，不用翻箱倒柜',
    routesDescription: '无论你独自搭建、与 Agent 协作，还是想先对齐设计与授权边界，这里都有一条已经铺好的小路。',
    routes: [
      ['自行使用', '安装、引入样式，再挑选今天要用的组件。'],
      ['Agent 帮我使用', '把场景和验收条件写进提示词，让它帮你搭好结构。'],
      ['设计规范', '用一致的层级、像素节拍和反馈，让页面好看也好用。'],
    ],
    license: '许可提醒：本项目仅供非商业学习、研究与原型使用。',
  },
  en: {
    eyebrow: 'PIXEL UI COMPONENT LIBRARY · REACT + TYPESCRIPT',
    titleBefore: 'Plant a small town',
    titleAccent: 'inside your interface',
    description: 'A composable, typed React component library with a pixel-art soul. Put clear product interactions inside frames with a little soil under their boots.',
    explore: 'Browse components',
    guide: 'Start with the guide',
    install: 'Plant the seed in your project',
    installHint: 'Install it, then begin with one Card, Button, or Dialog. The rest of the toolkit can grow when you need it.',
    componentCount: 'component plots to explore',
    typeSafe: 'TypeScript type safety',
    noCommercial: 'Non-commercial use only',
    routesTitle: 'A clear path from day one',
    routesDescription: 'Whether you are building alone, pairing with an agent, or aligning design and licensing first, there is a trail ready for you.',
    routes: [
      ['Use it yourself', 'Install, add the style entry, and pick the component you need today.'],
      ['Use it with an agent', 'Describe the scenario and acceptance checks, then let an agent build the structure.'],
      ['Design system', 'Use consistent hierarchy, pixel rhythm, and feedback so pages look good and work well.'],
    ],
    license: 'License note: this project is for non-commercial learning, research, and prototypes only.',
  },
} as const

const guidePaths = ['/guide/self-use', '/guide/agent-use', '/guide/design-system']

function StarHomePage() {
  const { lang } = useI18n()
  const text = copy[lang]

  const highlights = [
    { icon: <Blocks size={21} />, value: COMPONENT_ROUTES.length, label: text.componentCount },
    { icon: <ShieldCheck size={21} />, value: '100%', label: text.typeSafe },
    { icon: <Palette size={21} />, value: 'PIXEL', label: text.noCommercial },
  ]

  return (
    <div className={styles.home}>
      <section className={styles['home-hero']}>
        <div className={styles['home-hero-copy']}>
          <p className={styles['home-eyebrow']}><Sprout size={16} />{text.eyebrow}</p>
          <h1 className={styles['home-title']}>
            {text.titleBefore}
            <em>{text.titleAccent}</em>
          </h1>
          <p className={styles['home-desc']}>{text.description}</p>
          <div className={styles['home-actions']}>
            <Link to="/components" className={classNames(styles['home-btn'], styles['home-btn--primary'])}>
              {text.explore}<ArrowRight size={18} />
            </Link>
            <Link to="/guide/self-use" className={classNames(styles['home-btn'], styles['home-btn--secondary'])}>
              <BookOpen size={18} />{text.guide}
            </Link>
          </div>
        </div>

        <div className={styles['home-hero-art']} aria-hidden>
          <img src={heroImage} alt="" />
          <span className={styles['home-art-sign']}>WELCOME!</span>
          <span className={styles['home-art-cloud']} />
        </div>
      </section>

      <section className={styles['home-highlights']} aria-label="Library highlights">
        {highlights.map((highlight) => (
          <div key={highlight.label} className={styles['home-highlight']}>
            <span>{highlight.icon}</span>
            <strong>{highlight.value}</strong>
            <small>{highlight.label}</small>
          </div>
        ))}
      </section>

      <section className={styles['home-install']}>
        <div>
          <span className={styles['home-section-kicker']}>QUICK START</span>
          <h2>{text.install}</h2>
          <p>{text.installHint}</p>
        </div>
        <code>npm install stardew-valley-ui</code>
      </section>

      <section className={styles['home-routes']}>
        <header>
          <span className={styles['home-section-kicker']}>TRAIL MAP</span>
          <h2>{text.routesTitle}</h2>
          <p>{text.routesDescription}</p>
        </header>
        <div className={styles['home-route-grid']}>
          {text.routes.map(([title, description], index) => (
            <Link key={title} to={guidePaths[index]} className={styles['home-route-link']}>
              <StarCard className={styles['home-route-card']} hoverable>
                <span className={styles['home-route-number']}>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className={styles['home-route-arrow']}><ArrowRight size={18} /></span>
              </StarCard>
            </Link>
          ))}
        </div>
      </section>

      <footer className={styles['home-license']}>
        <span>{text.license}</span>
        <Link to="/guide/license">{lang === 'zh' ? '查看版权相关' : 'Read license details'}</Link>
        <a href="https://github.com/a985987819/stardewUi" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <ExternalLink size={18} />
        </a>
      </footer>
    </div>
  )
}

export default StarHomePage
