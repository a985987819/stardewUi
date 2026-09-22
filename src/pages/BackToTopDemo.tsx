import { useEffect, useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { BACK_TO_TOP_FLIGHT_MS, StarBackToTop, StarNineSliceButton } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './BackToTopDemo.module.scss'

/** 村民联系人：`[中文名, 英文名, 中文身份, 英文身份, 好感度]`。 */
const CONTACTS: ReadonlyArray<readonly [string, string, string, string, number]> = [
  ['阿比盖尔', 'Abigail', '冒险者', 'Adventurer', 8],
  ['艾利欧特', 'Elliott', '作家', 'Writer', 6],
  ['艾米丽', 'Emily', '裁缝', 'Tailor', 10],
  ['哈维', 'Harvey', '医生', 'Doctor', 7],
  ['海莉', 'Haley', '摄影爱好者', 'Photographer', 5],
  ['莉亚', 'Leah', '雕塑家', 'Sculptor', 9],
  ['玛鲁', 'Maru', '发明家', 'Inventor', 6],
  ['佩妮', 'Penny', '教师', 'Teacher', 8],
  ['萨姆', 'Sam', '乐队吉他手', 'Guitarist', 7],
  ['塞巴斯蒂安', 'Sebastian', '程序员', 'Programmer', 5],
  ['谢恩', 'Shane', '牧场帮工', 'Ranch Hand', 4],
  ['亚历克斯', 'Alex', '运动员', 'Athlete', 6],
  ['卡洛琳', 'Caroline', '茶艺师', 'Tea Grower', 3],
  ['克林特', 'Clint', '铁匠', 'Blacksmith', 2],
  ['德米特里厄斯', 'Demetrius', '科学家', 'Scientist', 4],
  ['艾芙琳', 'Evelyn', '烘焙师', 'Baker', 5],
  ['乔治', 'George', '退休矿工', 'Retired Miner', 3],
  ['格斯', 'Gus', '酒馆老板', 'Saloon Keeper', 6],
  ['贾斯', 'Jas', '小学生', 'Student', 4],
  ['乔迪', 'Jodi', '家庭主妇', 'Homemaker', 5],
  ['肯特', 'Kent', '退伍军人', 'Veteran', 3],
  ['科罗布斯', 'Krobus', '影子商人', 'Shadow Merchant', 9],
  ['莱纳斯', 'Linus', '山林隐士', 'Hermit', 7],
  ['玛妮', 'Marnie', '牧场主', 'Rancher', 6],
  ['帕姆', 'Pam', '巴士司机', 'Bus Driver', 2],
  ['皮埃尔', 'Pierre', '杂货店老板', 'Shopkeeper', 4],
]

/** 受控示例里那只纸飞机，比默认位置高出来的距离，px。 */
const PINNED_OFFSET = 108

const copy = {
  zh: {
    title: '回到顶部 BackToTop',
    desc: '页面滚动之后才浮现的像素纸飞机，机头朝着页面顶部。它自己盯着滚动位置，点击后向上飞出去并淡出，调用方不必操心什么时候该显示。',
    toc: ['基础用法', '联系人长列表', '自定义显示', 'API'],
    demos: [
      [
        '基础用法',
        '组件监听滚动：页面停在顶部时隐藏，一旦滚动就浮现。点击后纸飞机向上飞出去、同时淡到全透明，页面平滑回到顶部，上面的读数会跟着变化。',
      ],
      [
        '联系人长列表',
        '这份村民名单长过一屏，负责把页面撑出滚动条。进入本页时会自动滚到底部，好让纸飞机立刻出现在右下角。',
      ],
      [
        '自定义显示',
        'threshold 决定滚多少像素才浮现，bottom / right 决定停靠位置；传 visible 则显示时机完全由调用方接管。',
      ],
    ],
    liveScrollTop: '页面滚动',
    liveVisible: '纸飞机',
    liveOn: '已浮现',
    liveOff: '已隐藏',
    toBottom: '滚到底部',
    toTop: '滚到顶部',
    listTitle: '村民联系人',
    listHint: '共 26 位 · 好感度按当前进度',
    hearts: '好感度',
    pinOn: '固定显示纸飞机',
    pinOff: '取消固定',
    pinnedHint: `受控实例：visible 交给按钮，bottom 抬高 ${PINNED_OFFSET}px；点一下纸飞机，本页会在飞走动画放完后替它把 visible 收回。`,
  },
  en: {
    title: 'BackToTop',
    desc: 'A pixel paper plane with its nose up, appearing only once the page has scrolled. It watches the scroll position itself, flies out of the corner when clicked, and leaves the caller out of it.',
    toc: ['Basic Usage', 'Long Contact List', 'Controlled Visibility', 'API'],
    demos: [
      [
        'Basic Usage',
        'The component listens for scrolling: hidden while the page sits at the top, floating in as soon as it moves. Clicking sends the plane climbing out of its corner as it fades to nothing, while the page scrolls smoothly back up. The readout follows along.',
      ],
      [
        'Long Contact List',
        'This villager roster is taller than a viewport, which is what gives the page something to scroll. The demo drops you at the bottom so the plane is right there in the corner.',
      ],
      [
        'Controlled Visibility',
        'threshold decides how far the page must scroll, bottom / right decide where the plane parks, and passing visible hands the timing over to the caller entirely.',
      ],
    ],
    liveScrollTop: 'Scroll offset',
    liveVisible: 'Plane',
    liveOn: 'visible',
    liveOff: 'hidden',
    toBottom: 'Scroll to bottom',
    toTop: 'Scroll to top',
    listTitle: 'Villager Contacts',
    listHint: '26 of them, with friendship as it stands today',
    hearts: 'friendship',
    pinOn: 'Pin the plane',
    pinOff: 'Unpin',
    pinnedHint: `A controlled instance: the button owns \`visible\`, and \`bottom\` lifts it ${PINNED_OFFSET}px. Click it and this page hands \`visible\` back once the flight is over.`,
  },
} satisfies Record<
  Lang,
  {
    title: string
    desc: string
    toc: string[]
    demos: string[][]
    liveScrollTop: string
    liveVisible: string
    liveOn: string
    liveOff: string
    toBottom: string
    toTop: string
    listTitle: string
    listHint: string
    hearts: string
    pinOn: string
    pinOff: string
    pinnedHint: string
  }
>

const apiData = {
  zh: [
    { property: 'threshold', description: '页面滚动多少像素后浮现', type: 'number', default: '0' },
    { property: 'bottom', description: '距视口底部的固定距离', type: 'number', default: '32' },
    { property: 'right', description: '距视口右侧的固定距离', type: 'number', default: '32' },
    {
      property: 'scrollBehavior',
      description: '回顶动画；prefers-reduced-motion 下强制为瞬间跳转',
      type: "'auto' | 'instant' | 'smooth'",
      default: "'smooth'",
    },
    { property: 'visible', description: '传入后由调用方接管显示时机', type: 'boolean', default: '-' },
    {
      property: 'container',
      description: '要监听的滚动容器，默认监听 window',
      type: 'HTMLElement | null',
      default: 'null',
    },
    { property: 'label', description: '按钮的无障碍名称', type: 'string', default: "'Back to top'" },
    { property: 'children', description: '替换默认的纸飞机图案', type: 'ReactNode', default: '像素纸飞机' },
    {
      property: 'onVisibleChange',
      description: '纸飞机浮现 / 隐藏时触发，挂载时也会触发一次',
      type: '(visible: boolean) => void',
      default: '-',
    },
    { property: 'className', description: '附加类名', type: 'string', default: '-' },
  ],
  en: [
    { property: 'threshold', description: 'Scroll distance before the plane appears.', type: 'number', default: '0' },
    { property: 'bottom', description: 'Fixed distance from the viewport bottom.', type: 'number', default: '32' },
    { property: 'right', description: 'Fixed distance from the viewport right edge.', type: 'number', default: '32' },
    {
      property: 'scrollBehavior',
      description: 'Scroll animation; forced to an instant jump for reduced motion.',
      type: "'auto' | 'instant' | 'smooth'",
      default: "'smooth'",
    },
    { property: 'visible', description: 'Hands the timing over to the caller.', type: 'boolean', default: '-' },
    {
      property: 'container',
      description: 'Scroll container to watch; the window by default.',
      type: 'HTMLElement | null',
      default: 'null',
    },
    { property: 'label', description: 'Accessible name of the button.', type: 'string', default: "'Back to top'" },
    { property: 'children', description: 'Replaces the default paper plane.', type: 'ReactNode', default: 'pixel plane' },
    {
      property: 'onVisibleChange',
      description: 'Fires when the plane appears or disappears, including on mount.',
      type: '(visible: boolean) => void',
      default: '-',
    },
    { property: 'className', description: 'Extra class name.', type: 'string', default: '-' },
  ],
}

function StarBackToTopDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [visible, setVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [pinned, setPinned] = useState(false)
  const toc = t.toc.map((title, index) => ({
    id: ['basic', 'contacts', 'custom', 'api'][index],
    title,
    level: 1,
  }))

  // 进页面先落到底部：纸飞机是「滚动之后才出现」的组件，停在顶部就什么都演示不了。
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' })
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  // 只给读数用的滚动监听；组件内部那份是它自己的，不对外暴露。
  useEffect(() => {
    const sync = () => setScrollY(Math.round(window.scrollY))

    sync()
    window.addEventListener('scroll', sync, { passive: true })

    return () => window.removeEventListener('scroll', sync)
  }, [])

  const scrollToBottom = () =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      {/* 固定的纸飞机整页只需要一只，它就是本页实际在跑的那份实例。 */}
      <StarBackToTop onVisibleChange={setVisible} />

      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        data={[
          { label: t.liveScrollTop, value: `${scrollY}px` },
          { label: t.liveVisible, value: visible ? t.liveOn : t.liveOff },
        ]}
        code="<StarBackToTop />"
      >
        <div className={styles['back-to-top-demo__actions']}>
          <StarNineSliceButton size="small" onClick={scrollToBottom}>
            {t.toBottom}
          </StarNineSliceButton>
          <StarNineSliceButton size="small" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {t.toTop}
          </StarNineSliceButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="contacts" title={t.demos[1][0]} description={t.demos[1][1]} defaultShowCode={false}>
        <div className={styles['back-to-top-demo__contacts']}>
          <div className={styles['back-to-top-demo__contacts-heading']}>
            <span>{t.listTitle}</span>
            <span>{t.listHint}</span>
          </div>
          <ul className={styles['back-to-top-demo__contact-list']}>
            {CONTACTS.map(([zh, en, roleZh, roleEn, hearts]) => {
              const name = lang === 'zh' ? zh : en

              return (
                <li key={en} className={styles['back-to-top-demo__contact']}>
                  <span className={styles['back-to-top-demo__contact-avatar']} aria-hidden>
                    {name[0]}
                  </span>
                  <span className={styles['back-to-top-demo__contact-identity']}>
                    <span className={styles['back-to-top-demo__contact-name']}>{name}</span>
                    <span className={styles['back-to-top-demo__contact-role']}>
                      {lang === 'zh' ? roleZh : roleEn}
                    </span>
                  </span>
                  <span className={styles['back-to-top-demo__contact-hearts']} title={t.hearts}>
                    {`♥ ${hearts}`}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="custom"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        data={[
          { label: 'visible', value: String(pinned) },
          { label: 'bottom', value: `${32 + PINNED_OFFSET}px` },
        ]}
        code={`<StarBackToTop threshold={400} bottom={32} right={32} />

// 或者完全接管显示时机
<StarBackToTop visible={pinned} bottom={${32 + PINNED_OFFSET}} />`}
      >
        <div className={styles['back-to-top-demo__actions']}>
          <StarNineSliceButton size="small" variant="primary" onClick={() => setPinned((current) => !current)}>
            {pinned ? t.pinOff : t.pinOn}
          </StarNineSliceButton>
          <p className={styles['back-to-top-demo__hint']}>{t.pinnedHint}</p>
        </div>
        <StarBackToTop
          visible={pinned}
          bottom={32 + PINNED_OFFSET}
          // 受控实例不会自己隐藏，所以这一页替它收尾：等飞走动画放完再摘掉 visible，
          // 动画才不会被腰斩。这正是 BACK_TO_TOP_FLIGHT_MS 对调用方的用处。
          onClick={() => window.setTimeout(() => setPinned(false), BACK_TO_TOP_FLIGHT_MS + 60)}
        />
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable title="BackToTop API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarBackToTopDemoPage
