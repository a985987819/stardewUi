import { StarTitle, StarTypewriter } from '../components/ui'
import styles from './Guide.module.scss'

const principles = [
  ['先读信息，再看装饰', '标题、操作和反馈保持高对比；木纹、像素纹理与插画只为层级服务。'],
  ['像素要有节拍', '优先使用 2px、3px、4px 等稳定单位。边框、阴影与位移沿同一网格落点，避免半像素和柔焦。'],
  ['一块面板，只做一件事', '卡片用于分组，Tab 用于同级切换，Dialog 用于需要用户暂停确认的事务；不要把三种容器堆成套娃。'],
  ['动效像工具，不像烟花', '交互动画应明确指向打开、切换或完成。支持减少动态效果，且不能成为理解内容的唯一途径。'],
]

function StarGuideDesignSystemPage() {
  return (
    <article className={styles['guide-section']}>
      <header className={styles['guide-intro']}>
        <span>THE TOWN NOTICEBOARD</span>
        <StarTitle level={1} className={styles['guide-intro-title']}>设计规范</StarTitle>
        <p className={styles['guide-intro-desc']}>
          <StarTypewriter text="这一套组件的目标不是把每个页面都扮成游戏截图，而是用可读、可点、可复用的像素语言，让产品界面有自己的季节感。" speed={60} />
        </p>
      </header>

      <section className={styles['guide-principles']}>
        {principles.map(([title, description], index) => (
          <div key={title} className={styles['guide-principle']}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </section>

      <h2>组件使用顺序</h2>
      <ol className={styles['guide-steps']}>
        <li><strong>先选结构：</strong>页面区域用布局与 Card 划分，避免先堆按钮再找容器。</li>
        <li><strong>再选状态：</strong>切换用 Tab / Switch，输入用 Input / Checkbox，需要决策才用 Dialog。</li>
        <li><strong>最后加情绪：</strong>通过主题色、插画和短句赋予氛围，关键操作仍应使用清晰直接的动词。</li>
      </ol>

      <aside className={styles['guide-callout']}>
        <strong>验收信号：</strong>即使关闭图片、缩小到手机宽度或开启减少动态效果，用户依然能知道当前位置、下一步和操作结果。
      </aside>
    </article>
  )
}

export default StarGuideDesignSystemPage
