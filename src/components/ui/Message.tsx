import { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import './Message.css'

export type MessageType = 'normal' | 'info' | 'success' | 'warning' | 'error'

export interface MessageProps {
  content: string
  type?: MessageType
  duration?: number
  onClose?: () => void
}

interface MessageItem extends MessageProps {
  id: string
}

const iconMap = {
  normal: null,
  info: <Info size={16} />,
  success: <CheckCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  error: <XCircle size={16} />,
}

function MessageItem({
  content,
  type = 'normal',
  duration = 3000,
  onClose,
}: MessageItem) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10)
    
    // Auto close
    const closeTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 200)
    }, duration)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(closeTimer)
    }
  }, [duration, onClose])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 200)
  }, [onClose])

  return (
    <div
      className={classNames(
        'stardew-message',
        `stardew-message--${type}`,
        visible && 'stardew-message--visible'
      )}
    >
      {iconMap[type] && (
        <span className="stardew-message__icon">{iconMap[type]}</span>
      )}
      <span className="stardew-message__content">{content}</span>
      <button className="stardew-message__close" onClick={handleClose}>
        <X size={14} />
      </button>
    </div>
  )
}

// Global message container
let messageContainer: HTMLDivElement | null = null
let messageRoot: ReturnType<typeof createRoot> | null = null
let messageId = 0
const messages: Map<string, MessageItem> = new Map()

function renderMessages() {
  if (!messageRoot) return
  
  messageRoot.render(
    <div className="stardew-message-container">
      {Array.from(messages.values()).map((msg) => (
        <MessageItem
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
    messageContainer.id = 'stardew-message-root'
    document.body.appendChild(messageContainer)
    messageRoot = createRoot(messageContainer)
  }
  return messageRoot
}

export function message(props: MessageProps | string) {
  const config: MessageProps = typeof props === 'string' ? { content: props } : props
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

// Convenience methods
message.normal = (content: string, duration?: number) =>
  message({ content, type: 'normal', duration })
message.info = (content: string, duration?: number) =>
  message({ content, type: 'info', duration })
message.success = (content: string, duration?: number) =>
  message({ content, type: 'success', duration })
message.warning = (content: string, duration?: number) =>
  message({ content, type: 'warning', duration })
message.error = (content: string, duration?: number) =>
  message({ content, type: 'error', duration })

export default message
