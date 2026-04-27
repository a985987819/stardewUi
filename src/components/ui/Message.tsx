import { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { classNames } from '../../utils/classNames'
import StarCard from './Card'
import styles from './Message.module.scss'

export type MessageType = 'normal' | 'info' | 'success' | 'warning' | 'error'
export type MessageBottom = 'left' | 'right'
export type MessagePosition = 'top' | 'bottom-left' | 'bottom-right'

export interface MessageOptions {
  position?: MessagePosition
  bottom?: MessageBottom
  duration?: number
}

export interface MessageProps {
  content: string
  type?: MessageType
  position?: MessagePosition
  bottom?: MessageBottom
  duration?: number
  onClose?: () => void
}

interface MessageRecord extends MessageProps {
  id: string
}

const placements: MessagePosition[] = ['top', 'bottom-left', 'bottom-right']

const iconMap = {
  normal: '💬',
  info: '📘',
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

const themeMap: Record<MessageType, { fill: string; border: string; text: string }> = {
  normal: { fill: '#F5E6CC', border: '#3A2E39', text: '#3A2E39' },
  info: { fill: '#E0F7FA', border: '#2E4057', text: '#2E4057' },
  success: { fill: '#E6F2D9', border: '#2F5233', text: '#2F5233' },
  warning: { fill: '#FFF2D5', border: '#6B4226', text: '#6B4226' },
  error: { fill: '#FFD1E3', border: '#5C3A57', text: '#5C3A57' },
}

function resolvePlacement(position?: MessagePosition, bottom?: MessageBottom): MessagePosition {
  if (position) {
    return position
  }

  if (bottom === 'left') {
    return 'bottom-left'
  }

  if (bottom === 'right') {
    return 'bottom-right'
  }

  return 'top'
}

function StarMessageCard({ content, type = 'normal', duration = 3000, position, bottom, onClose }: MessageRecord) {
  const [visible, setVisible] = useState(false)
  const theme = themeMap[type]
  const placement = resolvePlacement(position, bottom)

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
    <StarCard
      className={classNames(
        styles['stardew-message'],
        styles[`stardew-message--${type}`],
        placement !== 'top' && styles['stardew-message--bottom'],
        visible && styles['stardew-message--visible']
      )}
      size="small"
    >
      <div className={styles['stardew-message__body']}>
        <div className={styles['stardew-message__icon-box']} aria-hidden>
          <span className={styles['stardew-message__icon']}>{iconMap[type]}</span>
        </div>
        <span className={styles['stardew-message__content']}>{content}</span>
        <button
          type="button"
          aria-label="关闭消息"
          className={styles['stardew-message__close']}
          onClick={handleClose}
          style={{ color: theme.text }}
        >
          ×
        </button>
      </div>
    </StarCard>
  )
}

let messageContainer: HTMLDivElement | null = null
let messageRoot: ReturnType<typeof createRoot> | null = null
let messageId = 0
const messages: Map<string, MessageRecord> = new Map()

function renderMessages() {
  if (!messageRoot) return

  const messageList = Array.from(messages.values())

  messageRoot.render(
    <div className={styles['stardew-message-layer']}>
      {placements.map((placement) => {
        const groupedMessages = messageList.filter((msg) => resolvePlacement(msg.position, msg.bottom) === placement)
        if (groupedMessages.length === 0) {
          return null
        }

        return (
          <div
            key={placement}
            className={classNames(
              styles['stardew-message-container'],
              styles[`stardew-message-container--${placement}`]
            )}
          >
            {groupedMessages.map((msg) => (
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
      })}
    </div>
  )
}

function getContainer() {
  if (!messageContainer) {
    messageContainer = document.createElement('div')
    messageContainer.id = 'star-message-root'
    const appRoot = document.querySelector('[class*="starApp"]')
      ; (appRoot ?? document.body).appendChild(messageContainer)
    messageRoot = createRoot(messageContainer)
  }

  return messageRoot
}

export function message(props: MessageProps | string, options?: MessageOptions | number) {
  const resolvedOptions = typeof options === 'number' ? { duration: options } : options
  const config: MessageProps =
    typeof props === 'string'
      ? {
        content: props,
        ...resolvedOptions,
      }
      : {
        ...props,
        ...resolvedOptions,
      }
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

message.normal = (content: string, options?: MessageOptions | number) =>
  message({ content, type: 'normal' }, options)
message.info = (content: string, options?: MessageOptions | number) =>
  message({ content, type: 'info' }, options)
message.success = (content: string, options?: MessageOptions | number) =>
  message({ content, type: 'success' }, options)
message.warning = (content: string, options?: MessageOptions | number) =>
  message({ content, type: 'warning' }, options)
message.error = (content: string, options?: MessageOptions | number) =>
  message({ content, type: 'error' }, options)

export default message
