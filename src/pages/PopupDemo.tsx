import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarNineSliceButton, StarPopup, type PopupPlacement } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './PopupDemo.module.scss'

/**
 * The dial reads clockwise from 12 o'clock. Each entry pairs an angle with the
 * placement that points away from the circle's centre, so the bubble always
 * flies outward and its arrow keeps pointing back at the button.
 *
 * Eight of the twelve placements, because a radial layout only has room for
 * eight spokes at readable angles. The remaining four (`top-start`,
 * `top-end`, `bottom-start`, `bottom-end`) are the corners of a horizontal
 * bubble on a vertical edge, and they have no meaningful angle — they get the
 * grid below instead. Both galleries together show all twelve.
 */
const DIAL_ITEMS: { placement: PopupPlacement; angle: number }[] = [
  { placement: 'top', angle: 90 },
  { placement: 'right-start', angle: 45 },
  { placement: 'right', angle: 0 },
  { placement: 'right-end', angle: -45 },
  { placement: 'bottom', angle: -90 },
  { placement: 'left-end', angle: -135 },
  { placement: 'left', angle: 180 },
  { placement: 'left-start', angle: 135 },
]

/**
 * All twelve, in the order the API table lists them. Kept as the full list so
 * the gallery and the table cannot drift: `popupPlacements.test.ts` asserts the
 * two agree, and that every value here is a real `PopupPlacement`.
 */
const ALL_PLACEMENTS: PopupPlacement[] = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
]

/** Satellite positions as percentages of the dial box. */
const DIAL_RADIUS = 40

const dialPosition = (angle: number) => {
  const radians = (angle * Math.PI) / 180
  return {
    left: `${50 + Math.cos(radians) * DIAL_RADIUS}%`,
    top: `${50 - Math.sin(radians) * DIAL_RADIUS}%`,
  }
}

const copy = {
  zh: {
    title: '弹窗 Popup',
    desc: '贴着物品弹出的小气泡：悬停或点击触发，内容区和展示框同款外框，箭头指回触发元素。它同时承担了「悬停提示」的角色——纯文本气泡就是 tooltip（自动带 role="tooltip"），带按钮的气泡自动变成 role="dialog"，所以库内不再单列文字提示组件。',
    toc: ['方位演示', '十二档方位', '悬停触发', '点击触发', '带操作按钮', 'API'],
    demos: [
      ['方位演示', '八个按钮围成一圈，每个按钮都用朝向圆环外侧的 placement：鼠标绕着圈扫一圈，气泡依次从 top / right-start / right / right-end / bottom / left-end / left / left-start 飞出来，箭头始终指回按钮——比看文字说明直观得多。'],
      ['十二档方位', '转盘只放得下八根辐条，剩下四档是「竖直边上的横向气泡」，没有角度可言。这里把十二档全部列出，逐个悬停即可看到气泡相对按钮的位置。'],
      ['悬停触发', 'trigger="hover"（默认）时鼠标悬停展示提示；mouseEnterDelay / mouseLeaveDelay 控制进出延迟，聚焦同样唤出、Esc 收起，和 tooltip 的手感一致。'],
      ['点击触发', 'trigger="click" 时点击后保持打开，适合移动端；点外部区域收起。'],
      ['带操作按钮', '气泡底部可以放操作按钮，此时 role 自动变成 dialog；也可以传 color 给整块气泡换装。'],
    ],
    dialCenter: 'placement\n方位',
    dialHint: '悬停圆环上的按钮，看气泡从哪一侧飞出来',
    galleryHint: '悬停任意一格，查看该档位下气泡相对按钮的位置',
    trigger: '查看种子',
    buy: '购买',
    colorLabel: '换色气泡',
    colorTip: '杨桃夏季下种，秋季丰收——种子店见！',
    seedTip: '草莓种子：春季作物，成熟后可多次收获。',
    noArrow: '无箭头',
    noArrowTip: '关掉箭头就是一枚安静的小牌子。',
  },
  en: {
    title: 'Popup',
    desc: 'A bubble that pops beside an item: hover- or click-triggered, framed like the DisplayFrame, with a pixel arrow pointing back at the trigger. It also covers the hover-hint role — a text-only bubble is a tooltip (it carries role="tooltip"), and one with buttons becomes role="dialog" — so the library ships no separate tooltip component.',
    toc: ['Placement Dial', 'All Twelve Placements', 'Hover Trigger', 'Click Trigger', 'With Actions', 'API'],
    demos: [
      ['Placement Dial', 'Eight buttons around a ring, each using the placement that faces away from the centre: sweep the pointer around and bubbles fly out from top / right-start / right / right-end / bottom / left-end / left / left-start in turn, arrow always pointing back — far clearer than twelve lines of prose.'],
      ['All Twelve Placements', 'A ring only fits eight spokes at readable angles, and the remaining four are horizontal bubbles on a vertical edge, which have no angle to speak of. Here are all twelve, side by side — hover any cell to see where the bubble sits relative to its button.'],
      ['Hover Trigger', 'With trigger="hover" (the default) the bubble appears on hover; mouseEnterDelay / mouseLeaveDelay tune the in and out timing, focus raises it too and Escape drops it — the same feel as a tooltip.'],
      ['Click Trigger', 'With trigger="click" the bubble stays open until you click it again or click outside — handy on touch devices.'],
      ['With Actions', 'The footer can hold action buttons, which flips the role to dialog; color repaints the whole plate when you need a tinted bubble.'],
    ],
    dialCenter: 'placement',
    dialHint: 'Hover a button on the ring and watch which side the bubble flies out from',
    galleryHint: 'Hover any cell to see where that placement puts the bubble',
    trigger: 'Inspect seed',
    buy: 'Buy',
    colorLabel: 'Tinted bubble',
    colorTip: 'Starfruit goes in during summer, pays off in fall — see you at the seed shop!',
    seedTip: 'Strawberry seeds: spring crop, regrows after harvest.',
    noArrow: 'No arrow',
    noArrowTip: 'Without the arrow it is just a quiet little plate.',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; dialCenter: string; dialHint: string; galleryHint: string; trigger: string; buy: string; colorLabel: string; colorTip: string; seedTip: string; noArrow: string; noArrowTip: string }>

const apiData = {
  zh: [
    { property: 'content', description: '气泡内容', type: 'ReactNode', default: '-', required: true },
    { property: 'placement', description: '弹出方位，共 12 档（四边 × start/center/end）', type: 'PopupPlacement', default: "'right'" },
    { property: 'trigger', description: '触发方式', type: "'hover' | 'click'", default: "'hover'" },
    { property: 'title', description: '气泡标题', type: 'ReactNode', default: '-' },
    { property: 'actions', description: '底部操作按钮，存在时 role 自动为 dialog', type: 'PopupAction[]', default: '-' },
    { property: 'arrow', description: '是否显示指回触发元素的像素箭头', type: 'boolean', default: 'true' },
    { property: 'color', description: '底色；边框、内芯与奶油墨色由它推导', type: 'string', default: '-' },
    { property: 'role', description: '气泡的无障碍角色；默认按有无 actions 推导', type: "'tooltip' | 'dialog' | 'none'", default: '自动' },
    { property: 'open', description: '受控可见性；不传则由 hover/click 接管', type: 'boolean', default: '-' },
    { property: 'defaultOpen', description: '非受控模式的初始可见性', type: 'boolean', default: 'false' },
    { property: 'mouseEnterDelay', description: '悬停显示延迟（毫秒）', type: 'number', default: '100' },
    { property: 'mouseLeaveDelay', description: '移开隐藏延迟（毫秒）', type: 'number', default: '120' },
    { property: 'offset', description: '气泡与触发元素的距离', type: 'number', default: '12' },
    { property: 'children', description: '触发元素；气泡挂在它旁边', type: 'ReactNode', default: '-' },
    { property: 'onOpenChange', description: 'hover/click 试图改变可见性时触发，可用于受控模式', type: '(open: boolean) => void', default: '-' },],
  en: [
    { property: 'content', description: 'Bubble content.', type: 'ReactNode', default: '-', required: true },
    { property: 'placement', description: 'Twelve placements (four sides × start/center/end).', type: 'PopupPlacement', default: "'right'" },
    { property: 'trigger', description: 'Trigger mode.', type: "'hover' | 'click'", default: "'hover'" },
    { property: 'title', description: 'Bubble heading.', type: 'ReactNode', default: '-' },
    { property: 'actions', description: 'Footer buttons; presence flips role to dialog.', type: 'PopupAction[]', default: '-' },
    { property: 'arrow', description: 'Shows the pixel arrow pointing back at the trigger.', type: 'boolean', default: 'true' },
    { property: 'color', description: 'Fill colour; ring, bevel, and cream ink derive from it.', type: 'string', default: '-' },
    { property: 'role', description: 'ARIA role of the bubble; derived from actions by default.', type: "'tooltip' | 'dialog' | 'none'", default: 'auto' },
    { property: 'open', description: 'Controlled visibility; omit to let hover/click own it.', type: 'boolean', default: '-' },
    { property: 'defaultOpen', description: 'Initial visibility for the uncontrolled mode.', type: 'boolean', default: 'false' },
    { property: 'mouseEnterDelay', description: 'Hover-in delay in ms.', type: 'number', default: '100' },
    { property: 'mouseLeaveDelay', description: 'Hover-out delay in ms.', type: 'number', default: '120' },
    { property: 'offset', description: 'Distance between bubble and trigger.', type: 'number', default: '12' },
    { property: 'children', description: 'The trigger element; the bubble is anchored beside it.', type: 'ReactNode', default: '-' },
    { property: 'onOpenChange', description: 'Fires when hover/click wants to change visibility; use it for controlled mode.', type: '(open: boolean) => void', default: '-' },],
}

const dialCode = `import { StarPopup, StarNineSliceButton } from 'stardew-valley-ui'

// The ring shows eight of the twelve. The other four — top-start, top-end,
// bottom-start, bottom-end — are horizontal bubbles on a vertical edge, so
// they have no radial angle; they live in the grid below.
const DIAL = [
  { placement: 'top', angle: 90 },
  { placement: 'right-start', angle: 45 },
  { placement: 'right', angle: 0 },
  { placement: 'right-end', angle: -45 },
  { placement: 'bottom', angle: -90 },
  { placement: 'left-end', angle: -135 },
  { placement: 'left', angle: 180 },
  { placement: 'left-start', angle: 135 },
]

{DIAL.map(({ placement, angle }) => (
  <StarPopup key={placement} placement={placement} content={placement}>
    <StarNineSliceButton size="small">{placement}</StarNineSliceButton>
  </StarPopup>
))}`

const galleryCode = `import { StarPopup, StarNineSliceButton } from 'stardew-valley-ui'

// All twelve placements, in the order the API table lists them.
const PLACEMENTS = [
  'top', 'top-start', 'top-end',
  'right', 'right-start', 'right-end',
  'bottom', 'bottom-start', 'bottom-end',
  'left', 'left-start', 'left-end',
]

{PLACEMENTS.map((placement) => (
  <StarPopup key={placement} placement={placement} content={placement}>
    <StarNineSliceButton size="small">{placement}</StarNineSliceButton>
  </StarPopup>
))}`

const hoverCode = `import { StarPopup, StarNineSliceButton } from 'stardew-valley-ui'

export function SeedHints() {
  return (
    <>
      {/* Text-only bubble: role="tooltip", with tooltip-style delays. */}
      <StarPopup content="Strawberry seeds regrow after harvest.">
        <StarNineSliceButton>Inspect seed</StarNineSliceButton>
      </StarPopup>

      {/* No arrow, tinted plate, slower reveal. */}
      <StarPopup arrow={false} color="#71964A" mouseEnterDelay={180} content="Starfruit!">
        <StarNineSliceButton>Seasonal</StarNineSliceButton>
      </StarPopup>
    </>
  )
}`

const clickCode = `import { StarPopup, StarNineSliceButton } from 'stardew-valley-ui'

<StarPopup trigger="click" placement="bottom" content="Tap outside to close.">
  <StarNineSliceButton>Inspect seed</StarNineSliceButton>
</StarPopup>`

const actionsCode = `import { StarPopup, StarNineSliceButton } from 'stardew-valley-ui'

// Buttons in the footer flip the bubble's role to dialog automatically.
<StarPopup
  trigger="click"
  title="Traveling Cart"
  content="Rare goods have arrived."
  actions={[{ label: 'Buy' }]}
>
  <StarNineSliceButton>Inspect stock</StarNineSliceButton>
</StarPopup>`

function StarPopupDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['dial', 'gallery', 'hover', 'click', 'actions', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="dial"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={dialCode}
      >
        <div className={styles['popup-demo-stack']}>
          <div className={styles['popup-demo-dial']}>
            <span className={styles['popup-demo-dial__ring']} aria-hidden />
            <span className={styles['popup-demo-dial__core']}>
              {t.dialCenter.split('\n').map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
            {DIAL_ITEMS.map(({ placement, angle }) => (
              <div
                key={placement}
                className={styles['popup-demo-dial__item']}
                style={dialPosition(angle)}
              >
                <StarPopup placement={placement} content={placement}>
                  <StarNineSliceButton size="small">{placement}</StarNineSliceButton>
                </StarPopup>
              </div>
            ))}
          </div>
          <p className={styles['popup-demo-dial__hint']}>{t.dialHint}</p>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="gallery"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={galleryCode}
      >
        <div className={styles['popup-demo-gallery']}>
          {ALL_PLACEMENTS.map((placement) => (
            <div key={placement} className={styles['popup-demo-gallery__cell']}>
              <StarPopup placement={placement} content={placement}>
                <StarNineSliceButton size="small">{placement}</StarNineSliceButton>
              </StarPopup>
            </div>
          ))}
        </div>
        <p className={styles['popup-demo-dial__hint']}>{t.galleryHint}</p>
      </StarComponentDemo>

      <StarComponentDemo
        id="hover"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={hoverCode}
      >
        <div className={styles['popup-demo-playground']}>
          <div className={styles['popup-demo-row']}>
            <StarPopup content={t.colorTip}>
              <StarNineSliceButton>{t.trigger}</StarNineSliceButton>
            </StarPopup>
            <StarPopup arrow={false} color="#71964A" mouseEnterDelay={180} content={t.noArrowTip}>
              <StarNineSliceButton>{t.noArrow}</StarNineSliceButton>
            </StarPopup>
            <StarPopup color="#4988C3" content={t.colorTip}>
              <StarNineSliceButton>{t.colorLabel}</StarNineSliceButton>
            </StarPopup>
          </div>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="click"
        title={t.demos[3][0]}
        description={t.demos[3][1]}
        code={clickCode}
      >
        <div className={styles['popup-demo-playground']}>
          <div className={styles['popup-demo-row']}>
            <StarPopup trigger="click" placement="bottom" content={t.seedTip}>
              <StarNineSliceButton>{t.trigger}</StarNineSliceButton>
            </StarPopup>
          </div>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="actions"
        title={t.demos[4][0]}
        description={t.demos[4][1]}
        code={actionsCode}
      >
        <div className={styles['popup-demo-playground']}>
          <div className={styles['popup-demo-row']}>
            <StarPopup
              trigger="click"
              title={lang === 'zh' ? '旅行货车' : 'Traveling Cart'}
              content={t.colorTip}
              actions={[{ label: t.buy }]}
            >
              <StarNineSliceButton>{t.trigger}</StarNineSliceButton>
            </StarPopup>
          </div>
        </div>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable title="Popup API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarPopupDemoPage
