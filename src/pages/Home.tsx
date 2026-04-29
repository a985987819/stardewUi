import { Link } from 'react-router-dom'
import { Package, Code, BookOpen, ArrowRight } from 'lucide-react'
import StarCard from '../components/ui/Card'
import { classNames } from '../utils/classNames'
import { useI18n } from '../i18n'
import styles from './Home.module.scss'

function StarHomePage() {
  const { t } = useI18n()

  const features = [
    {
      title: t('home.feature1.title'),
      description: t('home.feature1.desc'),
      icon: <Package size={28} />,
    },
    {
      title: t('home.feature2.title'),
      description: t('home.feature2.desc'),
      icon: <Code size={28} />,
    },
    {
      title: t('home.feature3.title'),
      description: t('home.feature3.desc'),
      icon: <BookOpen size={28} />,
    },
  ]

  return (
    <div className={styles.home}>
      <StarCard className={styles['home-hero-card']}>
        <section className={styles['home-hero']}>
          <div className={styles['home-hero-content']}>
            <h1 className={styles['home-title']}>
              StardewValley UI
              <span className={styles['home-title-badge']}>{t('home.badge')}</span>
            </h1>
            <p className={styles['home-desc']}>{t('home.desc')}</p>
            <div className={styles['home-actions']}>
              <Link to="/guide" className={classNames(styles['home-btn'], styles['home-btn-primary'])}>
                {t('home.start')}
                <ArrowRight size={18} />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={classNames(styles['home-btn'], styles['home-btn-secondary'])}
              >
                {t('home.github')}
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
