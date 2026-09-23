import { StarNineSliceButton, StarTitle } from '../components/ui'
import styles from './Welcome.module.scss'

interface StarWelcomePageProps {
  onStart: () => void
}

function StarWelcomePage({ onStart }: StarWelcomePageProps) {
  return (
    <main className={styles.welcome} aria-labelledby="welcome-title">
      <div className={styles['welcome__grain']} aria-hidden="true" />
      <div className={styles['welcome__sparkles']} aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>

      <div className={styles['welcome__stage']}>
        <section className={styles['welcome__content']}>
          <p className={styles['welcome__eyebrow']}>STARDEW VALLEY UI · 像素组件库</p>
          <StarTitle level={1} id="welcome-title" className={styles['welcome__heading']} color="#F6DA72" fontSize={64}>
            欢迎来到小镇
          </StarTitle>
          <p className={styles['welcome__lead']}>
            把好看的像素细节，种进你的项目里。
            <br />
            每一块界面，都从一颗小小的种子开始。
          </p>
          <div className={styles['welcome__actions']}>
            <StarNineSliceButton type="button" size="large" variant="primary" onClick={onStart}>
              开始使用
            </StarNineSliceButton>
            <span>按下按钮，推开农场小门</span>
          </div>
        </section>

        <div className={styles['welcome__slogan']} aria-label="老乡，你真中！！">
          <StarTitle fontSize={120} color="#F6DA72">老乡，</StarTitle>
          <StarTitle fontSize={120} color="#F6DA72">你真中！！</StarTitle>
        </div>
      </div>

      <footer className={styles['welcome__footer']}>
        <span>春日 · 第 1 年</span>
        <span aria-hidden="true">✦</span>
        <span>愿你的界面四季丰收</span>
      </footer>
    </main>
  )
}

export type { StarWelcomePageProps }
export default StarWelcomePage
