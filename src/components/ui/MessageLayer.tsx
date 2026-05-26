import { useCallback, useEffect, useState } from 'react'
import { classNames } from '../../utils/classNames'
import type { MessageRecord, MessagePosition } from './Message'
import StarCard from './Card'
import { resolvePlacement } from './messagePlacement'
import styles from './Message.module.scss'

const placements: MessagePosition[] = ['top', 'bottom-left', 'bottom-right']

const iconMap = {
  normal: '💬',
  info: '📘',
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

const themeMap = {
  normal: { fill: '#F5E6CC', border: '#3A2E39', text: '#3A2E39' },
  info: { fill: '#E0F7FA', border: '#2E4057', text: '#2E4057' },
  success: { fill: '#E6F2D9', border: '#2F5233', text: '#2F5233' },
  warning: { fill: '#FFF2D5', border: '#6B4226', text: '#6B4226' },
  error: { fill: '#FFD1E3', border: '#5C3A57', text: '#5C3A57' },
}

export function MessageLayer({
  messages,
  onClose,
}: {
  messages: MessageRecord[]
  onClose: (message: MessageRecord) => void
}) {
  return (
    <div className={styles['stardew-message-layer']}>
      {placements.map((placement) => {
        const groupedMessages = messages.filter((msg) => resolvePlacement(msg.position, msg.bottom) === placement)
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
              <StarMessageCard key={msg.id} {...msg} onClose={() => onClose(msg)} />
            ))}
          </div>
        )
      })}
    </div>
  )
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
