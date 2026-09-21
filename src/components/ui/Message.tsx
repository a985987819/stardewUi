import { createRoot, type Root } from 'react-dom/client'
import { classNames } from '../../utils/classNames'
import StarMessageCard from './MessageCard'
import {
  MESSAGE_PLACEMENTS,
  resolveMessagePlacement,
  type MessageOptions,
  type MessageProps,
  type MessageRecord,
} from './messageConfig'
import styles from './Message.module.scss'

export type {
  MessageBottom,
  MessageOptions,
  MessagePosition,
  MessageProps,
  MessageType,
} from './messageConfig'

const MESSAGE_ROOT_ID = 'star-message-root'

type MessageContainer = HTMLDivElement & { __stardewMessageRoot?: Root }

const messages = new Map<string, MessageRecord>()
let messageId = 0
let cachedContainer: MessageContainer | null = null

/**
 * Resolves the portal host that toasts are rendered into.
 *
 * The React root is cached on the container element itself, not just in module
 * scope. Vite re-evaluates this module on hot update, which used to reset the
 * module-level cache while leaving the old node (and its root) in the document,
 * so every reload appended another message layer and orphaned the previous one.
 */
function getMessageHost(): { container: MessageContainer; root: Root } | null {
  if (typeof document === 'undefined') {
    return null
  }

  if (cachedContainer?.isConnected && cachedContainer.__stardewMessageRoot) {
    return { container: cachedContainer, root: cachedContainer.__stardewMessageRoot }
  }

  const existing = document.getElementById(MESSAGE_ROOT_ID) as MessageContainer | null

  if (existing?.__stardewMessageRoot) {
    cachedContainer = existing
    return { container: existing, root: existing.__stardewMessageRoot }
  }

  const container = (existing ?? document.createElement('div')) as MessageContainer
  container.id = MESSAGE_ROOT_ID

  if (!container.isConnected) {
    const appRoot = document.querySelector('[class*="starApp"]')
    ;(appRoot ?? document.body).appendChild(container)
  }

  const root = createRoot(container)
  container.__stardewMessageRoot = root
  cachedContainer = container

  return { container, root }
}

/** Stable dismissal handler shared by every card, so cards never see a new prop identity. */
function dismissMessage(id: string) {
  const record = messages.get(id)

  if (!record) {
    return
  }

  messages.delete(id)
  renderMessages()
  record.onClose?.()
}

function renderMessages() {
  const host = getMessageHost()

  if (!host) {
    return
  }

  const messageList = Array.from(messages.values())

  host.root.render(
    <div className={styles['stardew-message-layer']}>
      {MESSAGE_PLACEMENTS.map((placement) => {
        const groupedMessages = messageList.filter(
          (msg) => resolveMessagePlacement(msg.position, msg.bottom) === placement
        )

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
                id={msg.id}
                content={msg.content}
                type={msg.type}
                duration={msg.duration}
                position={msg.position}
                bottom={msg.bottom}
                onDismiss={dismissMessage}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function message(props: MessageProps | string, options?: MessageOptions | number) {
  const resolvedOptions = typeof options === 'number' ? { duration: options } : options
  const config: MessageProps =
    typeof props === 'string' ? { content: props, ...resolvedOptions } : { ...props, ...resolvedOptions }
  const id = `message-${++messageId}`

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
