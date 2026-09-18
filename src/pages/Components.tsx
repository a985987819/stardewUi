import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import StarCard from '../components/ui/Card'
import { useI18n } from '../i18n'
import { COMPONENT_ROUTES } from '../router/componentRegistry'
import styles from './Components.module.scss'

function StarComponentsPage() {
  const { t, lang } = useI18n()

  return (
    <div className={styles['components-page']}>
      <StarCard className={styles['components-header-card']}>
        <div className={styles['components-header']}>
          <h1>{t('components.title')}</h1>
          <p>{t('components.desc')}</p>
        </div>
      </StarCard>

      <div className={styles['components-grid']}>
        {COMPONENT_ROUTES.map((item) => (
          <Link key={item.routePath} to={`/components/${item.routePath}`} className={styles['components-card-link']}>
            <StarCard className={styles['components-card']} hoverable>
              <div className={styles['components-card-icon']}>{item.icon}</div>
              <div className={styles['components-card-content']}>
                <h3>{item.title[lang]}</h3>
                <p>{item.desc[lang]}</p>
              </div>
              <ChevronRight size={20} className={styles['components-card-arrow']} />
            </StarCard>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default StarComponentsPage
