import StarCodeBlock from '../components/layout/CodeBlock'
import { StarTitle, StarTypewriter } from '../components/ui'
import { useI18n } from '../i18n'
import styles from './Guide.module.scss'

const installCode = `npm install stardew-valley-ui
# or
yarn add stardew-valley-ui
# or
pnpm add stardew-valley-ui`

const usageCode = `import { StarNineSliceButton } from 'stardew-valley-ui'

function App() {
  return <StarNineSliceButton>Hello World</StarNineSliceButton>
}`

const viteConfigCode = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
})`

function StarGuidePage() {
  const { t } = useI18n()

  return (
    <div className={styles['guide-section']}>
      <header className={styles['guide-intro']}>
        <span>FIRST DAY CHECKLIST</span>
        <StarTitle level={1} className={styles['guide-intro-title']}>自行使用</StarTitle>
        <p className={styles['guide-intro-desc']}>
          <StarTypewriter text="把组件库放进背包，再从最常用的一把工具开始；下面这条路线适合在自己的 React 项目里慢慢搭一座小镇。" speed={60} />
        </p>
      </header>
      <h2>{t('guide.install')}</h2>
      <p>{t('guide.installDesc')}</p>
      <StarCodeBlock code={installCode} language="bash" />

      <h2>{t('guide.usage')}</h2>
      <p>{t('guide.usageDesc')}</p>
      <StarCodeBlock code={usageCode} language="tsx" />

      <h2>{t('guide.config')}</h2>
      <p>{t('guide.configDesc')}</p>
      <StarCodeBlock code={viteConfigCode} language="ts" />

      <h2>{t('guide.features')}</h2>
      <ul>
        <li>{t('guide.feature1')}</li>
        <li>{t('guide.feature2')}</li>
        <li>{t('guide.feature3')}</li>
        <li>{t('guide.feature4')}</li>
        <li>{t('guide.feature5')}</li>
      </ul>
    </div>
  )
}

export default StarGuidePage
