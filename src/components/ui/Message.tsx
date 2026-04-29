import { createRoot } from 'react-dom/client'
import { MessageLayer } from './MessageLayer'

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

export interface MessageRecord extends MessageProps {
  id: string
}

let messageContainer: HTMLDivElement | null = null
let messageRoot: ReturnType<typeof createRoot> | null = null
let messageId = 0
const messages: Map<string, MessageRecord> = new Map()

function renderMessages() {
  if (!messageRoot) return

  const messageList = Array.from(messages.values())

  messageRoot.render(
    <MessageLayer
      messages={messageList}
      onClose={(msg) => {
        messages.delete(msg.id)
        renderMessages()
        msg.onClose?.()
      }}
    />
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

type MessageInvoker = {
  (props: MessageProps | string, options?: MessageOptions | number): { close: () => void }
  normal: (content: string, options?: MessageOptions | number) => { close: () => void }
  info: (content: string, options?: MessageOptions | number) => { close: () => void }
  success: (content: string, options?: MessageOptions | number) => { close: () => void }
  warning: (content: string, options?: MessageOptions | number) => { close: () => void }
  error: (content: string, options?: MessageOptions | number) => { close: () => void }
}

export const message: MessageInvoker = (function message(props: MessageProps | string, options?: MessageOptions | number) {
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
} as MessageInvoker)

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
