import { useCallback, useEffect, useRef, useState } from 'react'
import { classNames } from '../../utils/classNames'
import StarCard from './Card'
import {
  MESSAGE_ICON_MAP,
  MESSAGE_THEME_MAP,
  resolveMessagePlacement,
  type MessageBottom,
  type MessagePosition,
  type MessageType,
} from './messageConfig'
import styles from './Message.module.scss'

const EXIT_ANIMATION_MS = 200
const ENTER_DELAY_MS = 10

export interface StarMessageCardProps {
  id: string
  content: string
  type?: MessageType
  duration?: number
  position?: MessagePosition
  bottom?: MessageBottom
  /** Stable, module-level handler. Receives the message id so it never needs to be re-created. */
  onDismiss: (id: string) => void
}

function StarMessageCard({
  id,
  content,
  type = 'normal',
  duration = 3000,
  position,
  bottom,
  onDismiss,
}: StarMessageCardProps) {
  const [visible, setVisible] = useState(false)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const placement = resolveMessagePlacement(position, bottom)

  // `onDismiss` is a stable module-level function and `id`/`duration` only change
  // when the message itself changes, so these timers survive unrelated re-renders.
  // Previously the parent rebuilt an `onClose` closure on every `renderMessages()`
  // call, which re-ran this effect for *every* toast and restarted their countdowns.
  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), ENTER_DELAY_MS)
    const closeTimer =
      duration > 0
        ? setTimeout(() => {
            setVisible(false)
            exitTimerRef.current = setTimeout(() => {
              exitTimerRef.current = null
              onDismiss(id)
            }, EXIT_ANIMATION_MS)
          }, duration)
        : null

    return () => {
      clearTimeout(enterTimer)

      if (closeTimer !== null) {
        clearTimeout(closeTimer)
      }

      if (exitTimerRef.current !== null) {
        clearTimeout(exitTimerRef.current)
        exitTimerRef.current = null
      }
    }
  }, [duration, id, onDismiss])

  const handleClose = useCallback(() => {
    setVisible(false)

    if (exitTimerRef.current !== null) {
      clearTimeout(exitTimerRef.current)
    }

    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null
      onDismiss(id)
    }, EXIT_ANIMATION_MS)
  }, [id, onDismiss])

  const theme = MESSAGE_THEME_MAP[type]

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
          <span className={styles['stardew-message__icon']}>{MESSAGE_ICON_MAP[type]}</span>
        </div>
        <span className={styles['stardew-message__content']}>{content}</span>
        <button
          type="button"
          aria-label="Close message"
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

export default StarMessageCard
