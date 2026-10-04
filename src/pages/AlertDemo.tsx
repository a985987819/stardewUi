import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarAlert, StarDisplayFrame, StarNineSliceButton } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

type AlertKind = 'info' | 'success' | 'warning' | 'error'

interface NoticePost {
  type: AlertKind
  title: string
  body: string
}

const BOARD_POSTS: Record<Lang, NoticePost[]> = {
  zh: [
    { type: 'info', title: '集市预告', body: '周五晚上 8 点，镇广场见——记得带上最好的农产品。' },
    { type: 'success', title: '订单完成', body: '刘易斯收下了 12 个防风草，报酬已入账。' },
    { type: 'warning', title: '道路施工', body: '通往矿车的桥在检修，这两天请绕行山路。' },
    { type: 'error', title: '宵禁通知', body: '今晚凌晨 2:00 后不要在矿洞逗留，哥布林出没。' },
  ],
  en: [
    { type: 'info', title: 'Fair forecast', body: 'The town plaza opens its fair night this Friday at 8 PM — bring your best produce.' },
    { type: 'success', title: 'Order complete', body: 'Lewis picked up 12 parsnips; the gold is already in.' },
    { type: 'warning', title: 'Road works', body: 'The minecart bridge is under repair — take the mountain path for two days.' },
    { type: 'error', title: 'Curfew notice', body: 'Do not stay in the mines past 2:00 AM tonight — goblins about.' },
  ],
}

const copy = {
  zh: {
    title: '警告提示 Alert',
    desc: '一块钉在布告板上的羊皮纸横幅：左侧一条语义色带标明消息性质（信息/成功/警告/错误），标题加粗、正文紧随其后；错误横幅会以 role="alert" 播报，closable 时右上角有一枚像素 ×。',
    toc: ['四种类型', '可关闭', '强制弹窗', '布告板', 'API'],
    demos: [
      ['四种类型', '四条横幅共用一套材质语言，只切换主色、描边与标题墨色；色板与 Message 保持一致，通知和横幅永远说同一种颜色语言；showIcon 开槽后还能用 icon 换上自己的图标。'],
      ['可关闭', '设置 closable 后右上角出现像素 ×，点击后横幅整体退场并触发 onClose。'],
      ['强制弹窗', 'modal 把同一块横幅抬到遮罩之上：背景变暗、页面锁滚动、焦点自动落进告示里，默认点遮罩和按 Esc 都关不掉，必须点「知道了」才放行——这才是真正的强制告知。只想提醒、允许忽略时，把 maskClosable / escClosable 打开即可。'],
      ['布告板', '整块板子是一个展示框，告示一张张贴在框里；点「张贴下一张告示」按 信息 → 成功 → 警告 → 错误 轮转贴上新告示，每张都能单独撅下，板上最多同时留三张。'],
    ],
    planted: '播种成功',
    plantedBody: '防风草种子已种下，4 天后收获。',
    storm: '天气预报',
    stormBody: '明天有暴雨，记得给作物浇足水。',
    full: '背包已满',
    fullBody: '请整理背包后再拾取物品。',
    ghost: '矿洞遇险',
    ghostBody: '第 40 层发现幽灵，战斗力不足请及时撤离！',
    closableTitle: '任务提示',
    closableBody: '点击 × 即可关闭这条横幅。日志里会记录这次关闭操作。',
    dismissLabel: '关掉这条',
    modalTitle: '矿洞封锁',
    modalBody: '今晚 22:00 起矿洞封闭检修，任何人不得进入。点遮罩或按 Esc 都不会关上这条告示，只有点「我知道了」才放行。',
    modalAck: '我知道了',
    modalOpen: '拉起强制告示',
    modalSoftTitle: '允许忽略的告示',
    modalSoftBody: '这条打开了 maskClosable：点遮罩或按 Esc 就能关掉。',
    modalSoftOpen: '拉起可忽略告示',
    board: '布告板',
    boardEmpty: '板子上空空如也——贴一张试试。',
    postNext: '张贴下一张告示',
    starTitle: '祝尼魔任务',
    starBody: '给冈瑟捐 60 件展品，祝尼魔会亲自道谢。',
    boardClose: '撅下这张告示',
  },
  en: {
    title: 'Alert',
    desc: 'A parchment banner pinned to the notice board: a semantic stripe on the left marks the message kind (info/success/warning/error), with a bold title followed by body text. Error banners announce themselves via role="alert", and closable adds a pixel × up top.',
    toc: ['Four Types', 'Closable', 'Forced Modal', 'Notice Board', 'API'],
    demos: [
      ['Four Types', 'All four banners share one material language; only the accent, ring, and title ink change — and they match Message, so a toast and a banner of the same kind always speak the same colour. Once showIcon opens the slot, icon swaps in your own mark.'],
      ['Closable', 'With closable set, a pixel × appears at the top-right; clicking it removes the banner and fires onClose.'],
      ['Forced Modal', 'modal hoists the same plate above a dimmed backdrop: page scroll locks, focus lands inside the notice, and neither a backdrop click nor Escape gets out — only the acknowledge action does. That is what makes it forced. Turn on maskClosable / escClosable when a hint may be ignored.'],
      ['Notice Board', 'The whole board is a DisplayFrame with notices pinned inside; posting rotates info → success → warning → error, each can be taken down alone, and the board holds three at most.'],
    ],
    planted: 'Planted',
    plantedBody: 'Parsnip seeds are in the ground, ready in 4 days.',
    storm: 'Weather forecast',
    stormBody: 'A storm is coming tomorrow — water your crops in advance.',
    full: 'Backpack full',
    fullBody: 'Tidy up your inventory before picking up more items.',
    ghost: 'Mine danger',
    ghostBody: 'A ghost was spotted on floor 40 — leave now if underpowered!',
    closableTitle: 'Quest hint',
    closableBody: 'Click the × to dismiss this banner. The action is logged to onClose.',
    dismissLabel: 'Dismiss this',
    modalTitle: 'Mine lockdown',
    modalBody: 'The mine closes for repairs at 22:00 tonight and nobody goes in. A backdrop click or Escape will not dismiss this notice — only the acknowledge button will.',
    modalAck: 'Understood',
    modalOpen: 'Raise a forced alert',
    modalSoftTitle: 'A notice you may ignore',
    modalSoftBody: 'This one has maskClosable on: a backdrop click or Escape closes it.',
    modalSoftOpen: 'Raise a dismissible alert',
    board: 'Notice board',
    boardEmpty: 'The board is bare — pin something.',
    postNext: 'Post the next notice',
    starTitle: 'Junimo quest',
    starBody: 'Donate 60 exhibits to Gunther and the junimo will thank you in person.',
    boardClose: 'Take this notice down',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; planted: string; plantedBody: string; storm: string; stormBody: string; full: string; fullBody: string; ghost: string; ghostBody: string; closableTitle: string; closableBody: string; dismissLabel: string; modalTitle: string; modalBody: string; modalAck: string; modalOpen: string; modalSoftTitle: string; modalSoftBody: string; modalSoftOpen: string; board: string; postNext: string; boardEmpty: string; boardClose: string; starTitle: string; starBody: string }>

const apiData = {
  zh: [
    { property: 'type', description: '语义类型，决定色带与标题颜色', type: "'info' | 'success' | 'warning' | 'error'", default: "'info'" },
    { property: 'title', description: '加粗标题', type: 'ReactNode', default: '-' },
    { property: 'children', description: '横幅正文', type: 'ReactNode', default: '-' },
    { property: 'showIcon', description: '显示与色带同色的语义图标（可用 icon 替换）', type: 'boolean', default: 'false' },
    { property: 'icon', description: '自定义图标，替换内置的语义图标', type: 'ReactNode', default: '-' },
    { property: 'closable', description: '是否显示关闭按钮', type: 'boolean', default: 'false' },
    { property: 'visible', description: '受控可见性；不传则由组件自持关闭状态', type: 'boolean', default: '-' },
    { property: 'defaultVisible', description: '非受控模式的初始可见性', type: 'boolean', default: 'true' },
    { property: 'modal', description: '以遮罩层强制弹窗形式展示（背景变暗、锁定滚动）', type: 'boolean', default: 'false' },
    { property: 'maskClosable', description: '弹窗模式下点击遮罩层是否可关闭', type: 'boolean', default: 'false' },
    { property: 'escClosable', description: '弹窗模式下按 Esc 是否可关闭', type: 'boolean', default: 'false' },
    { property: 'actions', description: '底部操作区（如「知道了」按钮）', type: 'ReactNode', default: '-' },
    { property: 'modalLabel', description: '弹窗模式下的无障碍名称', type: 'string', default: "'Alert'" },
    { property: 'onClose', description: '点击关闭后触发', type: '() => void', default: '-' },
    { property: 'closeLabel', description: '关闭按钮的无障碍名称', type: 'string', default: "'Close'" },
  ],
  en: [
    { property: 'type', description: 'Semantic kind; drives the stripe and title colours.', type: "'info' | 'success' | 'warning' | 'error'", default: "'info'" },
    { property: 'title', description: 'Bold heading.', type: 'ReactNode', default: '-' },
    { property: 'children', description: 'Banner body.', type: 'ReactNode', default: '-' },
    { property: 'showIcon', description: 'Shows the built-in semantic icon (replace it with icon).', type: 'boolean', default: 'false' },
    { property: 'icon', description: 'Custom icon swapping out the built-in glyph.', type: 'ReactNode', default: '-' },
    { property: 'closable', description: 'Shows the built-in close button.', type: 'boolean', default: 'false' },
    { property: 'visible', description: 'Controlled visibility; omit to let the alert own it.', type: 'boolean', default: '-' },
    { property: 'defaultVisible', description: 'Starting visibility for the uncontrolled mode.', type: 'boolean', default: 'true' },
    { property: 'modal', description: 'Renders as a blocking overlay alert (dims the page, locks scroll).', type: 'boolean', default: 'false' },
    { property: 'maskClosable', description: 'Modal only: lets a backdrop click dismiss it.', type: 'boolean', default: 'false' },
    { property: 'escClosable', description: 'Modal only: lets Escape dismiss it.', type: 'boolean', default: 'false' },
    { property: 'actions', description: 'Footer slot, e.g. an acknowledge button.', type: 'ReactNode', default: '-' },
    { property: 'modalLabel', description: 'Accessible name of the modal alert.', type: 'string', default: "'Alert'" },
    { property: 'onClose', description: 'Fired after the banner is dismissed.', type: '() => void', default: '-' },
    { property: 'closeLabel', description: 'Accessible name of the close button.', type: 'string', default: "'Close'" },
  ],
}

// Wrapped in a fragment: a bare list of sibling JSX elements is a parse error
// anywhere it gets pasted, and this snippet is meant to be pasted.
const typesCode = `import { StarAlert } from 'stardew-valley-ui'

export function WeatherAlerts() {
  return (
    <>
      <StarAlert type="info" title="Weather forecast">Rain tomorrow.</StarAlert>
      <StarAlert type="success" title="Planted" showIcon>Parsnip seeds are in.</StarAlert>
      <StarAlert type="warning" title="Backpack full">Tidy up first.</StarAlert>
      <StarAlert type="error" title="Mine danger" showIcon>Leave floor 40 now!</StarAlert>
      <StarAlert type="success" title="Junimo quest" showIcon icon={<span>★</span>}>
        Donate 60 exhibits.
      </StarAlert>
    </>
  )
}`

const closableCode = `import { useState } from 'react'
import { StarAlert } from 'stardew-valley-ui'

export function QuestHint() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <StarAlert
      type="info"
      title="Quest hint"
      closable
      closeLabel="Dismiss this"
      onClose={() => setVisible(false)}
    >
      Click the × to dismiss.
    </StarAlert>
  )
}`

const modalCode = `import { useState } from 'react'
import { StarAlert, StarNineSliceButton } from 'stardew-valley-ui'

export function MineLockdown() {
  const [open, setOpen] = useState(false)
  // Forced: maskClosable / escClosable stay off, so only the action gets out.
  return (
    <>
      <StarNineSliceButton onClick={() => setOpen(true)}>Raise a forced alert</StarNineSliceButton>
      {open ? (
        <StarAlert
          modal
          type="error"
          showIcon
          title="Mine lockdown"
          modalLabel="Mine lockdown"
          actions={
            <StarNineSliceButton variant="danger" onClick={() => setOpen(false)}>
              Understood
            </StarNineSliceButton>
          }
        >
          The mine closes for repairs at 22:00 tonight.
        </StarAlert>
      ) : null}
      {/* Same plate, but a dismissible version */}
      <StarAlert modal maskClosable escClosable type="info" title="Heads up">...</StarAlert>
    </>
  )
}`

const boardCode = `import { useState } from 'react'
import { StarAlert, StarDisplayFrame, StarNineSliceButton } from 'stardew-valley-ui'

// The four notice kinds the board cycles through.
const POSTS = [
  { type: 'info', title: 'Fair forecast', body: 'The plaza opens Friday night.' },
  { type: 'success', title: 'Order complete', body: 'Lewis paid for 12 parsnips.' },
  { type: 'warning', title: 'Road works', body: 'Take the mountain path.' },
  { type: 'error', title: 'Curfew', body: 'Leave the mines by 2 AM.' },
]

export function NoticeBoard() {
  const [notices, setNotices] = useState([])
  // Rotate the four kinds, newest first, keep three at most.
  const postNext = () => {
    setNotices((current) => {
      const id = (current[0]?.id ?? 0) + 1
      return [{ id, post: POSTS[id % POSTS.length] }, ...current].slice(0, 3)
    })
  }
  const takeDown = (id) => setNotices((current) => current.filter((item) => item.id !== id))

  return (
    <>
      <StarNineSliceButton onClick={postNext}>Post the next notice</StarNineSliceButton>
      {/* The board itself is one DisplayFrame; notices pin inside it */}
      <StarDisplayFrame>
        {notices.map(({ id, post }) => (
          <StarAlert key={id} type={post.type} title={post.title} closable onClose={() => takeDown(id)}>
            {post.body}
          </StarAlert>
        ))}
      </StarDisplayFrame>
    </>
  )
}`

function StarAlertDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['types', 'closable', 'modal', 'board', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="types"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={typesCode}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <StarAlert type="info" title={t.storm}>{t.stormBody}</StarAlert>
          <StarAlert type="success" title={t.planted} showIcon>{t.plantedBody}</StarAlert>
          <StarAlert type="warning" title={t.full}>{t.fullBody}</StarAlert>
          <StarAlert type="error" title={t.ghost} showIcon>{t.ghostBody}</StarAlert>
          <StarAlert type="success" title={t.starTitle} showIcon icon={<span style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, lineHeight: 1 }}>★</span>}>{t.starBody}</StarAlert>
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="closable"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={closableCode}
      >
        <ClosableAlert title={t.closableTitle} closeLabel={t.dismissLabel}>{t.closableBody}</ClosableAlert>
      </StarComponentDemo>
      <StarComponentDemo
        id="modal"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={modalCode}
      >
        <ModalAlerts
          forcedLabel={t.modalOpen}
          forcedTitle={t.modalTitle}
          forcedBody={t.modalBody}
          forcedAck={t.modalAck}
          softLabel={t.modalSoftOpen}
          softTitle={t.modalSoftTitle}
          softBody={t.modalSoftBody}
        />
      </StarComponentDemo>
      <StarComponentDemo
        id="board"
        title={t.demos[3][0]}
        description={t.demos[3][1]}
        code={boardCode}
      >
        <NoticeBoard posts={BOARD_POSTS[lang]} postLabel={t.postNext} emptyLabel={t.boardEmpty} closeLabel={t.boardClose} />
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

function ClosableAlert({ title, closeLabel, children }: { title: string; closeLabel: string; children: string }) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <StarAlert
      type="info"
      title={title}
      closable
      closeLabel={closeLabel}
      onClose={() => setVisible(false)}
      style={{ width: '100%' }}
    >
      {children}
    </StarAlert>
  )
}

/**
 * Two modal alerts side by side: a forced one (no mask / Esc escape, only the
 * acknowledge button) and a dismissible one, so the difference is one tap away.
 */
function ModalAlerts({
  forcedLabel,
  forcedTitle,
  forcedBody,
  forcedAck,
  softLabel,
  softTitle,
  softBody,
}: {
  forcedLabel: string
  forcedTitle: string
  forcedBody: string
  forcedAck: string
  softLabel: string
  softTitle: string
  softBody: string
}) {
  const [forcedOpen, setForcedOpen] = useState(false)
  const [softOpen, setSoftOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <StarNineSliceButton type="button" variant="danger" onClick={() => setForcedOpen(true)}>
        {forcedLabel}
      </StarNineSliceButton>
      <StarNineSliceButton type="button" onClick={() => setSoftOpen(true)}>
        {softLabel}
      </StarNineSliceButton>

      {forcedOpen ? (
        <StarAlert
          modal
          type="error"
          showIcon
          title={forcedTitle}
          modalLabel={forcedTitle}
          actions={
            <StarNineSliceButton type="button" variant="danger" size="small" onClick={() => setForcedOpen(false)}>
              {forcedAck}
            </StarNineSliceButton>
          }
        >
          {forcedBody}
        </StarAlert>
      ) : null}

      {softOpen ? (
        <StarAlert
          modal
          maskClosable
          escClosable
          type="info"
          showIcon
          title={softTitle}
          modalLabel={softTitle}
          onClose={() => setSoftOpen(false)}
          actions={
            <StarNineSliceButton type="button" size="small" onClick={() => setSoftOpen(false)}>
              {forcedAck}
            </StarNineSliceButton>
          }
        >
          {softBody}
        </StarAlert>
      ) : null}
    </div>
  )
}

export default StarAlertDemoPage

interface NoticeBoardProps {
  posts: NoticePost[]
  postLabel: string
  emptyLabel: string
  closeLabel: string
}

/**
 * The board itself is a DisplayFrame; notices pin inside it, and the post
 * control is the library's own button so the demo never hand-rolls chrome.
 */
function NoticeBoard({ posts, postLabel, emptyLabel, closeLabel }: NoticeBoardProps) {
  const [board, setBoard] = useState<{ id: number; post: NoticePost }[]>([])

  const postNext = () => {
    setBoard((current) => {
      const id = (current[0]?.id ?? 0) + 1
      const post = posts[id % posts.length]
      return [{ id, post }, ...current].slice(0, 3)
    })
  }
  const takeDown = (id: number) => setBoard((current) => current.filter((item) => item.id !== id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <StarNineSliceButton type="button" onClick={postNext}>
          {postLabel}
        </StarNineSliceButton>
      </div>
      <StarDisplayFrame
        style={{ width: '100%', ['--display-frame-surface-padding' as string]: '12px' }}
      >
        {board.length === 0 ? (
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-pixel)',
              fontSize: 12,
              color: 'var(--star-raw-hex-6a350b)',
            }}
          >
            {emptyLabel}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {board.map(({ id, post }) => (
              <StarAlert
                key={id}
                type={post.type}
                title={post.title}
                showIcon
                closable
                closeLabel={closeLabel}
                onClose={() => takeDown(id)}
              >
                {post.body}
              </StarAlert>
            ))}
          </div>
        )}
      </StarDisplayFrame>
    </div>
  )
}
