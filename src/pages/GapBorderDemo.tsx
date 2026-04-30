import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarGapBorder } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './GapBorderDemo.module.scss'

const copy = {
  zh: {
    title: 'Gap Border 缺口边框',
    desc: '四条边分开绘制，每条边都缩短 16px 并居中，让四个角各留出 8x8 的断开空白。',
    toc: ['基础示例'],
    demo: ['基础示例', '边框不是完整闭合，而是用四条独立线段拼出带缺口的像素感外框。'],
    label: '像素边框有意在四角断开。',
  },
  en: {
    title: 'Gap Border',
    desc: 'Draw the four edges separately and shorten each by 16px so every corner keeps an 8x8 gap.',
    toc: ['Basic Example'],
    demo: ['Basic Example', 'The border stays intentionally broken at the corners by using four independent edge segments.'],
    label: 'The pixel border intentionally breaks at each corner.',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demo: [string, string]; label: string }>

const code = `<div className={styles['gap-border-box']}>
  <StarGapBorder contentClassName={styles['gap-border-content']}>
    Pixel border with corner gaps.
  </StarGapBorder>
</div>`

function StarGapBorderDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demo[0]} description={t.demo[1]} code={code}>
        <div className={styles['gap-border-box']}>
          <StarGapBorder contentClassName={styles['gap-border-content']}>{t.label}</StarGapBorder>
        </div>
      </StarComponentDemo>
    </StarComponentPage>
  )
}

export default StarGapBorderDemoPage
