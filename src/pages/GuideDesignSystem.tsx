import { StarTitle, StarTypewriter } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './Guide.module.scss'

/**
 * `principles` and `steps` are parallel zh/en arrays rather than one array of
 * records: the page iterates them positionally, and keeping the two languages
 * as separate same-length lists makes a miscount a visible length mismatch
 * rather than a silent misalignment of title against description.
 */
const copy = {
  zh: {
    board: '小镇公告板',
    title: '设计规范',
    lede:
      '这一套组件的目标不是把每个页面都扮成游戏截图，而是用可读、可点、可复用的像素语言，让产品界面有自己的季节感。',
    principles: [
      ['先读信息，再看装饰', '标题、操作和反馈保持高对比；木纹、像素纹理与插画只为层级服务。'],
      ['像素要有节拍', '优先使用 2px、3px、4px 等稳定单位。边框、阴影与位移沿同一网格落点，避免半像素和柔焦。'],
      ['一块面板，只做一件事', '卡片用于分组，Tab 用于同级切换，Dialog 用于需要用户暂停确认的事务；不要把三种容器堆成套娃。'],
      ['动效像工具，不像烟花', '交互动画应明确指向打开、切换或完成。支持减少动态效果，且不能成为理解内容的唯一途径。'],
    ],
    orderTitle: '组件使用顺序',
    steps: [
      ['先选结构：', '页面区域用布局与 Card 划分，避免先堆按钮再找容器。'],
      ['再选状态：', '切换用 Tab / Switch，输入用 Input / Checkbox，需要决策才用 Dialog。'],
      ['最后加情绪：', '通过主题色、插画和短句赋予氛围，关键操作仍应使用清晰直接的动词。'],
    ],
    calloutLabel: '验收信号：',
    calloutBody:
      '即使关闭图片、缩小到手机宽度或开启减少动态效果，用户依然能知道当前位置、下一步和操作结果。',
  },
  en: {
    board: 'Town Notice Board',
    title: 'Design System',
    lede:
      'The goal of this kit is not to make every page look like a game screenshot, but to give product interfaces a sense of season through a readable, clickable, reusable pixel language.',
    principles: [
      ['Read the information first, decoration second', 'Headings, actions, and feedback keep high contrast; wood grain, pixel texture, and illustration exist only to establish hierarchy.'],
      ['Pixels need a rhythm', 'Prefer stable units — 2px, 3px, 4px. Borders, shadows, and offsets land on the same grid, avoiding half-pixels and soft focus.'],
      ['One panel, one job', 'Cards group content, Tabs switch between siblings, Dialogs handle decisions the user must confirm. Do not nest all three.'],
      ['Motion is a tool, not a firework', 'Interaction animation should point clearly at opening, switching, or completing. Respect reduced-motion, and never let it be the only way to understand the content.'],
    ],
    orderTitle: 'Component Order of Use',
    steps: [
      ['Structure first: ', 'Divide page regions with layout and Card instead of stacking buttons and hunting for a container afterwards.'],
      ['State next: ', 'Use Tab / Switch for switching, Input / Checkbox for entry, and Dialog only when a decision is required.'],
      ['Mood last: ', 'Add atmosphere through theme color, illustration, and short phrases; primary actions should still use clear, direct verbs.'],
    ],
    calloutLabel: 'Acceptance signal: ',
    calloutBody:
      'With images off, at phone width, or with reduced motion enabled, the user can still tell where they are, what comes next, and what their action did.',
  },
} satisfies Record<
  Lang,
  {
    board: string
    title: string
    lede: string
    principles: string[][]
    orderTitle: string
    steps: [string, string][]
    calloutLabel: string
    calloutBody: string
  }
>

function StarGuideDesignSystemPage() {
  const { lang } = useI18n()
  const t = copy[lang]

  return (
    <article className={styles['guide-section']}>
      <header className={styles['guide-intro']}>
        <span>{t.board}</span>
        <StarTitle level={1} className={styles['guide-intro-title']}>{t.title}</StarTitle>
        <p className={styles['guide-intro-desc']}>
          <StarTypewriter text={t.lede} speed={60} />
        </p>
      </header>

      <section className={styles['guide-principles']}>
        {t.principles.map(([title, description], index) => (
          <div key={title} className={styles['guide-principle']}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </section>

      <h2>{t.orderTitle}</h2>
      <ol className={styles['guide-steps']}>
        {t.steps.map(([lead, body]) => (
          <li key={lead}><strong>{lead}</strong>{body}</li>
        ))}
      </ol>

      <aside className={styles['guide-callout']}>
        <strong>{t.calloutLabel}</strong>{t.calloutBody}
      </aside>
    </article>
  )
}

export default StarGuideDesignSystemPage