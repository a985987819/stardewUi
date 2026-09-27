import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarAlert } from '../components/ui'
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
    toc: ['四种类型', '可关闭', '布告板', 'API'],
    demos: [
      ['四种类型', '四条横幅共用一套羊皮纸材质，只切换左侧色带与标题墨色；色板与 Input 的 status 保持一致，表单校验和横幅永远说同一种颜色语言；showIcon 开槽后还能用 icon 换上自己的图标。'],
      ['可关闭', '设置 closable 后右上角出现像素 ×，点击后横幅整体退场并触发 onClose。'],
      ['布告板', '点「张贴告示」把新横幅钉上板：类型按 信息 → 成功 → 警告 → 错误 轮转，每张都能单独撢下，板上最多同时留三张。'],
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
    board: '布告板',
    postNext: '张贴下一张告示',
    boardEmpty: '板子上空空如也——贴一张试试。',
    starTitle: '祝尼魔任务',
    starBody: '给 Gunther 捐 60 件展品，祝尼魔会亲自道谢。',
    boardClose: '撣下这张告示',
  },
  en: {
    title: 'Alert',
    desc: 'A parchment banner pinned to the notice board: a semantic stripe on the left marks the message kind (info/success/warning/error), with a bold title followed by body text. Error banners announce themselves via role="alert", and closable adds a pixel × up top.',
    toc: ['Four Types', 'Closable', 'Notice Board', 'API'],
    demos: [
      ['Four Types', 'All four banners share one parchment material; only the stripe colour and title ink change. The palette matches the Input status colours, so form validation and banners always speak the same colour language — and once showIcon opens the slot, icon swaps in your own mark.'],
      ['Closable', 'With closable set, a pixel × appears at the top-right; clicking it removes the banner and fires onClose.'],
      ['Notice Board', 'Click "post" to pin a new banner onto the board: kinds rotate info → success → warning → error, each can be taken down alone, and the board holds three at most.'],
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
    board: 'Notice board',
    postNext: 'Post the next notice',
    boardEmpty: 'The board is bare — pin something.',
    boardClose: 'Take this notice down',
    starTitle: 'Junimo quest',
    starBody: 'Donate 60 exhibits to Gunther and the junimo will thank you in person.',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; planted: string; plantedBody: string; storm: string; stormBody: string; full: string; fullBody: string; ghost: string; ghostBody: string; closableTitle: string; closableBody: string; dismissLabel: string; board: string; postNext: string; boardEmpty: string; boardClose: string; starTitle: string; starBody: string }>

const apiData = {
  zh: [
    { property: 'type', description: '语义类型，决定色带与标题颜色', type: "'info' | 'success' | 'warning' | 'error'", default: "'info'" },
    { property: 'title', description: '加粗标题', type: 'ReactNode', default: '-' },
    { property: 'children', description: '横幅正文', type: 'ReactNode', default: '-' },
    { property: 'showIcon', description: '显示与色带同色的语义图标（可用 icon 替换）', type: 'boolean', default: 'false' },
    { property: 'icon', description: '自定义图标，替换内置的语义图标', type: 'ReactNode', default: '-' },
    { property: 'closable', description: '是否显示关闭按钮', type: 'boolean', default: 'false' },
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
    { property: 'onClose', description: 'Fired after the banner is dismissed.', type: '() => void', default: '-' },
    { property: 'closeLabel', description: 'Accessible name of the close button.', type: 'string', default: "'Close'" },
  ],
}

const typesCode = `import { StarAlert } from 'stardew-valley-ui'

<StarAlert type="info" title="Weather forecast">Rain tomorrow.</StarAlert>
<StarAlert type="success" title="Planted" showIcon>Parsnip seeds are in.</StarAlert>
<StarAlert type="warning" title="Backpack full">Tidy up first.</StarAlert>
<StarAlert type="error" title="Mine danger" showIcon>Leave floor 40 now!</StarAlert>
<StarAlert type="success" title="Junimo quest" showIcon icon={<span>★</span>}>Donate 60 exhibits.</StarAlert>`

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

const boardCode = `import { useState } from 'react'
import { StarAlert } from 'stardew-valley-ui'

export function NoticeBoard() {
  const [notices, setNotices] = useState([])
  // Rotate the four kinds, newest first, keep three at most.
  return (
    <>
      <button onClick={postNext}>Post the next notice</button>
      {notices.map((notice) => (
        <StarAlert
          key={notice.id}
          type={notice.type}
          title={notice.title}
          closable
          onClose={() => takeDown(notice.id)}
        >
          {notice.body}
        </StarAlert>
      ))}
    </>
  )
}`

function StarAlertDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['types', 'closable', 'board', 'api'][index], title, level: 1 }))

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
        id="board"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={boardCode}
      >
        <NoticeBoard posts={BOARD_POSTS[lang]} postLabel={t.postNext} emptyLabel={t.boardEmpty} closeLabel={t.boardClose} />
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Alert API" data={apiData[lang]} />
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

export default StarAlertDemoPage

function NoticeBoard({ posts, postLabel, emptyLabel, closeLabel }: { posts: NoticePost[]; postLabel: string; emptyLabel: string; closeLabel: string }) {
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
      <div>
        <button type="button" onClick={postNext} style={{ padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-pixel)', fontSize: 12 }}>
          {postLabel}
        </button>
      </div>
      {board.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>{emptyLabel}</p>
      ) : (
        board.map(({ id, post }) => (
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
        ))
      )}
    </div>
  )
}
