import { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import StarCanvasBubble from './CanvasBubble'
import styles from './Message.module.css'

export type MessageType = 'normal' | 'info' | 'success' | 'warning' | 'error'

export interface MessageProps {
  content: string
  type?: MessageType
  duration?: number
  onClose?: () => void
}

interface MessageRecord extends MessageProps {
  id: string
}

const iconMap = {
  normal: null,
  info: <Info size={16} />,
  success: <CheckCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  error: <XCircle size={16} />,
}

const themeMap: Record<MessageType, { fill: string; border: string; text: string }> = {
  normal: { fill: '#F5E6CC', border: '#3A2E39', text: '#3A2E39' },
  info: { fill: '#E0F7FA', border: '#2E4057', text: '#2E4057' },
  success: { fill: '#E6F2D9', border: '#2F5233', text: '#2F5233' },
  warning: { fill: '#FFF2D5', border: '#6B4226', text: '#6B4226' },
  error: { fill: '#FFD1E3', border: '#5C3A57', text: '#5C3A57' },
}

function StarMessageCard({ content, type = 'normal', duration = 3000, onClose }: MessageRecord) {
  const [visible, setVisible] = useState(false)
  const theme = themeMap[type]

  useEffect(() => {
    const enterTimer = window.setTimeout(() => setVisible(true), 10)
    const closeTimer =
      duration > 0
        ? window.setTimeout(() => {
            setVisible(false)
            window.setTimeout(() => onClose?.(), 200)
          }, duration)
        : null

    return () => {
      window.clearTimeout(enterTimer)
      if (closeTimer !== null) {
        window.clearTimeout(closeTimer)
      }
    }
  }, [duration, onClose])

  const handleClose = useCallback(() => {
    setVisible(false)
    window.setTimeout(() => onClose?.(), 200)
  }, [onClose])

  return (
    <StarCanvasBubble
      className={classNames(
        styles['stardew-message'],
        styles[`stardew-message--${type}`],
        visible && styles['stardew-message--visible']
      )}
      fillColor={theme.fill}
      borderColor={theme.border}
      borderWidth={4}
      cornerSize={8}
      contentPadding={12}
    >
      {iconMap[type] ? <span className={styles['stardew-message__icon']}>{iconMap[type]}</span> : null}
      <span className={styles['stardew-message__content']}>{content}</span>
      <button type="button" className={styles['stardew-message__close']} onClick={handleClose} style={{ color: theme.text }}>
        <X size={14} />
      </button>
    </StarCanvasBubble>
  )
}

let messageContainer: HTMLDivElement | null = null
let messageRoot: ReturnType<typeof createRoot> | null = null
let messageId = 0
const messages: Map<string, MessageRecord> = new Map()

function renderMessages() {
  if (!messageRoot) return

  messageRoot.render(
    <div className={styles['stardew-message-container']}>
      {Array.from(messages.values()).map((msg) => (
        <StarMessageCard
          key={msg.id}
          {...msg}
          onClose={() => {
            messages.delete(msg.id)
            renderMessages()
            msg.onClose?.()
          }}
        />
      ))}
    </div>
  )
}

function getContainer() {
  if (!messageContainer) {
    messageContainer = document.createElement('div')
    messageContainer.id = 'star-message-root'
    const appRoot = document.querySelector('[class*="starApp"]')
    ;(appRoot ?? document.body).appendChild(messageContainer)
    messageRoot = createRoot(messageContainer)
  }

  return messageRoot
}

export function message(props: MessageProps | string, duration?: number) {
  const config: MessageProps = typeof props === 'string' ? { content: props, duration } : props
  const id = `message-${++messageId}`

  getContainer()
  messages.set(id, { ...config, id })
  renderMessages()

  return {
    close: () => {
      messages.delete(id)
      renderMessages()
    },
  }
}

message.normal = (content: string, duration?: number) => message({ content, type: 'normal', duration })
message.info = (content: string, duration?: number) => message({ content, type: 'info', duration })
message.success = (content: string, duration?: number) => message({ content, type: 'success', duration })
message.warning = (content: string, duration?: number) => message({ content, type: 'warning', duration })
message.error = (content: string, duration?: number) => message({ content, type: 'error', duration })

export default message
