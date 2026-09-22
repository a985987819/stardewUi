import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { classNames } from '../../utils/classNames'
import StarCard from './Card'
import {
  MESSAGE_ICON_MAP,
  MESSAGE_THEME_MAP,
  resolveMessagePlacement,
  type MessageBottom,
  type MessageAction,
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
  onClick?: () => void
  action?: MessageAction
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
  onClick,
  action,
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

  const handleMessageClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  const handleActionClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      action?.onClick()
    },
    [action]
  )

  const theme = MESSAGE_THEME_MAP[type]
  const entranceClass =
    placement.startsWith('bottom')
      ? styles['stardew-message--from-bottom']
      : placement === 'left'
        ? styles['stardew-message--from-left']
        : placement === 'right'
          ? styles['stardew-message--from-right']
          : undefined

  return (
    <StarCard
      className={classNames(
        styles['stardew-message'],
        styles[`stardew-message--${type}`],
        entranceClass,
        visible && styles['stardew-message--visible']
      )}
      color={theme.fill}
      size="small"
      onClick={onClick ? handleMessageClick : undefined}
      style={
        {
          '--message-accent': theme.border,
          '--message-action-bg': theme.border,
          '--message-action-text': theme.fill,
        } as CSSProperties
      }
    >
      <div className={styles['stardew-message__body']}>
        <div className={styles['stardew-message__icon-box']} aria-hidden>
          <span className={styles['stardew-message__icon']}>{MESSAGE_ICON_MAP[type]}</span>
        </div>
        <span className={styles['stardew-message__content']}>{content}</span>
        {action ? (
          <button
            type="button"
            className={styles['stardew-message__action']}
            onClick={handleActionClick}
          >
            {action.label}
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Close message"
          className={styles['stardew-message__close']}
          onClick={(event) => {
            event.stopPropagation()
            handleClose()
          }}
          style={{ color: theme.text }}
        >
          ×
        </button>
      </div>
    </StarCard>
  )
}

export default StarMessageCard
