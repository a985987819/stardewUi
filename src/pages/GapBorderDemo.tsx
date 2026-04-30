import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarGapBorder } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './GapBorderDemo.module.scss'

const copy = {
  zh: {
    title: 'Gap Border 缺口边框',
    desc: '默认保留 8x8 断角，也可以通过 cornerLevel={1|2|3} 把缺角做成更明显的像素阶梯。',
    toc: ['默认效果', '阶梯断角'],
    demoDefault: ['默认效果', '不传 cornerLevel 时，保持当前 8x8 断角样式。'],
    demoLevel: ['阶梯断角', '传入 cornerLevel 后，四边会继续收短，并在断角位置追加阶梯过渡方块。'],
    label: '像素边框有意在四角断开。',
    level1: 'cornerLevel = 1',
    level2: 'cornerLevel = 2',
    level3: 'cornerLevel = 3',
  },
  en: {
    title: 'Gap Border',
    desc: 'The default style keeps an 8x8 corner gap, and cornerLevel={1|2|3} adds stronger pixel stair corners.',
    toc: ['Default', 'Stepped Corners'],
    demoDefault: ['Default', 'Without cornerLevel, the component keeps the current 8x8 broken-corner style.'],
    demoLevel: ['Stepped Corners', 'Passing cornerLevel shortens the four edges further and adds step blocks around each broken corner.'],
    label: 'The pixel border intentionally breaks at each corner.',
    level1: 'cornerLevel = 1',
    level2: 'cornerLevel = 2',
    level3: 'cornerLevel = 3',
  },
} satisfies Record<
  Lang,
  {
    title: string
    desc: string
    toc: string[]
    demoDefault: [string, string]
    demoLevel: [string, string]
    label: string
    level1: string
    level2: string
    level3: string
  }
>

const codeDefault = `<StarGapBorder contentClassName={styles['gap-border-content']}>
  Pixel border with corner gaps.
</StarGapBorder>`

const codeLevel = `<StarGapBorder cornerLevel={2} contentClassName={styles['gap-border-content']}>
  Pixel border with stepped corners.
</StarGapBorder>`

function StarGapBorderDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['default', 'level'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="default" title={t.demoDefault[0]} description={t.demoDefault[1]} code={codeDefault}>
        <div className={styles['gap-border-box']}>
          <StarGapBorder contentClassName={styles['gap-border-content']}>{t.label}</StarGapBorder>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="level" title={t.demoLevel[0]} description={t.demoLevel[1]} code={codeLevel}>
        <div className={styles['gap-border-level-grid']}>
          <div className={styles['gap-border-box']}>
            <StarGapBorder cornerLevel={1} contentClassName={styles['gap-border-content']}>
              {t.level1}
            </StarGapBorder>
          </div>
          <div className={styles['gap-border-box']}>
            <StarGapBorder cornerLevel={2} contentClassName={styles['gap-border-content']}>
              {t.level2}
            </StarGapBorder>
          </div>
          <div className={styles['gap-border-box']}>
            <StarGapBorder cornerLevel={3} contentClassName={styles['gap-border-content']}>
              {t.level3}
            </StarGapBorder>
          </div>
        </div>
      </StarComponentDemo>
    </StarComponentPage>
  )
}

export default StarGapBorderDemoPage
