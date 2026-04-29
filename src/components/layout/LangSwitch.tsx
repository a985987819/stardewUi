import { Globe } from 'lucide-react'
import { useI18n, type Lang } from '../../i18n'
import styles from './LangSwitch.module.scss'

function StarLangSwitch() {
  const { lang, setLang } = useI18n()

  const toggleLang = () => {
    const next: Lang = lang === 'zh' ? 'en' : 'zh'
    setLang(next)
  }

  return (
    <button
      className={styles['lang-switch']}
      type="button"
      onClick={toggleLang}
      title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <Globe size={18} />
      <span className={styles['lang-switch-text']}>{lang === 'zh' ? 'EN' : '中'}</span>
    </button>
  )
}

export default StarLangSwitch
