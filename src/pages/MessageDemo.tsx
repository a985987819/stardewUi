import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarNineSliceButton, message, type MessagePosition } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './MessageDemo.module.scss'

const POSITION_DEMOS: Array<{ position: MessagePosition; zh: string; en: string }> = [
  { position: 'top-left', zh: '左上', en: 'Top Left' },
  { position: 'top', zh: '上方', en: 'Top' },
  { position: 'top-right', zh: '右上', en: 'Top Right' },
  { position: 'left', zh: '左侧', en: 'Left' },
  { position: 'center', zh: '正中央', en: 'Center' },
  { position: 'right', zh: '右侧', en: 'Right' },
  { position: 'bottom-left', zh: '左下', en: 'Bottom Left' },
  { position: 'bottom', zh: '下方', en: 'Bottom' },
  { position: 'bottom-right', zh: '右下', en: 'Bottom Right' },
]

const copy = {
  zh: {
    title: 'Message 消息',
    desc: '消息提示像收获时跳出的反馈，用于轻量展示状态、操作和提醒。',
    toc: ['基础消息', '消息类型', '九宫格位置', '带操作按钮', '回调事件', 'API'],
    demos: [
      ['基础消息', '点击按钮触发一条普通提示。'],
      ['消息类型', '不同状态使用不同色彩和图标。'],
      ['九宫格位置', '九个按钮分别对应页面的上下左右、四个角和正中央。'],
      ['带操作按钮', 'Info 消息可附带一个不会触发消息点击事件的操作按钮。'],
      ['回调事件', '主动关闭时触发 onClose；点击消息主体时触发 onClick。'],
    ],
    show: '显示消息',
    positionMessage: (label: string) => `这条消息出现在页面${label}。`,
    gift: '你收到了邻居赠送的南瓜。',
    accept: '接受',
    accepted: '南瓜已收进背包。',
    closeDemo: '显示可关闭消息',
    clickDemo: '显示可点击消息',
    closeMessage: '点击右侧 × 主动关闭我。',
    clickMessage: '点击这条消息主体。',
    closed: '已触发 onClose。',
    clicked: '已触发 onClick。',
    waiting: '等待操作…',
  },
  en: {
    title: 'Message',
    desc: 'Harvest-style feedback for lightweight statuses, actions, and reminders.',
    toc: ['Basic Message', 'Types', 'Nine Positions', 'Action Button', 'Callbacks', 'API'],
    demos: [
      ['Basic Message', 'Click the button to trigger a normal toast.'],
      ['Types', 'Each status uses its own color and icon.'],
      ['Nine Positions', 'The nine buttons map to the sides, corners, and center of the page.'],
      ['Action Button', 'An info message can include an action that does not trigger the message click callback.'],
      ['Callbacks', 'Manually closing triggers onClose; clicking the message body triggers onClick.'],
    ],
    show: 'Show Message',
    positionMessage: (label: string) => `This message appears at ${label}.`,
    gift: 'Your neighbor gave you a pumpkin.',
    accept: 'Accept',
    accepted: 'The pumpkin is now in your backpack.',
    closeDemo: 'Show closable message',
    clickDemo: 'Show clickable message',
    closeMessage: 'Click × on the right to close me.',
    clickMessage: 'Click this message body.',
    closed: 'onClose fired.',
    clicked: 'onClick fired.',
    waiting: 'Waiting for an action…',
  },
} satisfies Record<
  Lang,
  {
    title: string
    desc: string
    toc: string[]
    demos: string[][]
    show: string
    positionMessage: (label: string) => string
    gift: string
    accept: string
    accepted: string
    closeDemo: string
    clickDemo: string
    closeMessage: string
    clickMessage: string
    closed: string
    clicked: string
    waiting: string
  }
>

const apiData = {
  zh: [
    { property: 'content', description: '消息内容', type: 'string', default: '-', required: true },
    { property: 'type', description: '消息类型', type: 'MessageType', default: "'normal'" },
    { property: 'position', description: '消息显示位置', type: 'MessagePosition', default: "'top'" },
    { property: 'duration', description: '显示时长；0 表示不自动关闭', type: 'number', default: '3000' },
    { property: 'action', description: '消息内操作按钮', type: 'MessageAction', default: '-' },
    { property: 'onClose', description: '消息关闭后触发', type: '() => void', default: '-' },
    { property: 'onClick', description: '点击消息主体时触发', type: '() => void', default: '-' },
  ],
  en: [
    { property: 'content', description: 'Message content.', type: 'string', default: '-', required: true },
    { property: 'type', description: 'Message type.', type: 'MessageType', default: "'normal'" },
    { property: 'position', description: 'Message placement.', type: 'MessagePosition', default: "'top'" },
    { property: 'duration', description: 'Visible duration; 0 disables auto-close.', type: 'number', default: '3000' },
    { property: 'action', description: 'An in-message action button.', type: 'MessageAction', default: '-' },
    { property: 'onClose', description: 'Called after the message closes.', type: '() => void', default: '-' },
    { property: 'onClick', description: 'Called when the message body is clicked.', type: '() => void', default: '-' },
  ],
}

function StarMessageDemoPage() {
  const { lang } = useI18n()
  const [callbackStatus, setCallbackStatus] = useState<string>('')
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({
    id: ['basic', 'types', 'position', 'action', 'callbacks', 'api'][index],
    title,
    level: 1,
  }))

  const showGiftMessage = () => {
    const instance = message.info(t.gift, {
      duration: 0,
      action: {
        label: t.accept,
        onClick: () => {
          instance.close()
          message.success(t.accepted)
        },
      },
    })
  }

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]}>
        <StarNineSliceButton onClick={() => message(lang === 'zh' ? '今天的草莓已经入库。' : 'Today’s strawberries are in the shed.')}>
          {t.show}
        </StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo id="types" title={t.demos[1][0]} description={t.demos[1][1]}>
        <StarNineSliceButton variant="success" onClick={() => message.success(lang === 'zh' ? '作物已出售。' : 'Crops sold.')}>Success</StarNineSliceButton>
        <StarNineSliceButton variant="info" onClick={() => message.info(lang === 'zh' ? '旅行货车到了。' : 'Traveling cart arrived.')}>Info</StarNineSliceButton>
        <StarNineSliceButton variant="warning" onClick={() => message.warning(lang === 'zh' ? '体力快耗尽了。' : 'Stamina is running low.')}>Warning</StarNineSliceButton>
        <StarNineSliceButton variant="danger" onClick={() => message.error(lang === 'zh' ? '背包已满。' : 'Backpack is full.')}>Error</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo id="position" title={t.demos[2][0]} description={t.demos[2][1]}>
        <div className={styles['message-demo__position-grid']}>
          {POSITION_DEMOS.map(({ position, zh, en }) => {
            const label = lang === 'zh' ? zh : en
            return (
              <StarNineSliceButton key={position} size="small" onClick={() => message.info(t.positionMessage(label), { position })}>
                {label}
              </StarNineSliceButton>
            )
          })}
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="action" title={t.demos[3][0]} description={t.demos[3][1]}>
        <StarNineSliceButton variant="info" onClick={showGiftMessage}>{t.gift}</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo id="callbacks" title={t.demos[4][0]} description={t.demos[4][1]}>
        <StarNineSliceButton onClick={() => { setCallbackStatus(t.waiting); message.info(t.closeMessage, { duration: 0, onClose: () => setCallbackStatus(t.closed) }) }}>
          {t.closeDemo}
        </StarNineSliceButton>
        <StarNineSliceButton variant="info" onClick={() => { setCallbackStatus(t.waiting); message.info(t.clickMessage, { duration: 0, onClick: () => setCallbackStatus(t.clicked) }) }}>
          {t.clickDemo}
        </StarNineSliceButton>
        <span className={styles['message-demo__callback-status']} aria-live="polite">{callbackStatus}</span>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable title="Message API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarMessageDemoPage
