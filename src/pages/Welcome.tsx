import { StarNineSliceButton, StarTitle } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './Welcome.module.scss'

interface StarWelcomePageProps {
  onStart: () => void
}

/**
 * The splash a visitor sees first, so every string here switches with the app
 * language — it used to be hardcoded Chinese, meaning an English visitor read a
 * fully Chinese front door before reaching any content at all.
 */
const copy = {
  zh: {
    eyebrow: 'STARDEW VALLEY UI · 像素组件库',
    title: '欢迎来到小镇',
    leadLine1: '把好看的像素细节，种进你的项目里。',
    leadLine2: '每一块界面，都从一颗小小的种子开始。',
    start: '开始使用',
    startHint: '按下按钮，推开农场小门',
    sloganAria: '老乡，你真中！！',
    sloganLine1: '老乡，',
    sloganLine2: '你真中！！',
    season: '春日 · 第 1 年',
    wish: '愿你的界面四季丰收',
  },
  en: {
    eyebrow: 'STARDEW VALLEY UI · Pixel Component Kit',
    title: 'Welcome to town',
    leadLine1: 'Plant good-looking pixel details into your project.',
    leadLine2: 'Every interface starts from one small seed.',
    start: 'Get started',
    startHint: 'Press the button to open the farm gate',
    // Kept as a single phrase rather than two lines: the Chinese split is a
    // typographic device (a pause after the comma) that does not carry over.
    sloganAria: 'Now that is farm spirit!',
    sloganLine1: 'Now',
    sloganLine2: 'THAT is farm spirit!!',
    season: 'Spring · Year 1',
    wish: 'May your interface harvest all year',
  },
} satisfies Record<
  Lang,
  {
    eyebrow: string
    title: string
    leadLine1: string
    leadLine2: string
    start: string
    startHint: string
    sloganAria: string
    sloganLine1: string
    sloganLine2: string
    season: string
    wish: string
  }
>

function StarWelcomePage({ onStart }: StarWelcomePageProps) {
  const { lang } = useI18n()
  const t = copy[lang]

  return (
    <main className={styles.welcome} aria-labelledby="welcome-title">
      <div className={styles['welcome__grain']} aria-hidden="true" />
      <div className={styles['welcome__sparkles']} aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>

      <div className={styles['welcome__stage']}>
        <section className={styles['welcome__content']}>
          <p className={styles['welcome__eyebrow']}>{t.eyebrow}</p>
          <StarTitle level={1} id="welcome-title" className={styles['welcome__heading']} color="#F6DA72" fontSize={64}>
            {t.title}
          </StarTitle>
          <p className={styles['welcome__lead']}>
            {t.leadLine1}
            <br />
            {t.leadLine2}
          </p>
          <div className={styles['welcome__actions']}>
            <StarNineSliceButton type="button" size="large" variant="primary" onClick={onStart}>
              {t.start}
            </StarNineSliceButton>
            <span>{t.startHint}</span>
          </div>
        </section>

        <div className={styles['welcome__slogan']} aria-label={t.sloganAria}>
          <StarTitle fontSize={120} color="#F6DA72">{t.sloganLine1}</StarTitle>
          <StarTitle fontSize={120} color="#F6DA72">{t.sloganLine2}</StarTitle>
        </div>
      </div>

      <footer className={styles['welcome__footer']}>
        <span>{t.season}</span>
        <span aria-hidden="true">✦</span>
        <span>{t.wish}</span>
      </footer>
    </main>
  )
}

export type { StarWelcomePageProps }
export default StarWelcomePage