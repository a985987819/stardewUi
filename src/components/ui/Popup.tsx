import { useCallback, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames, flipBubblePlacement, type BubblePlacement } from '../../utils'
import { StarCard } from './Card'
import StarCanvasBubble from './CanvasBubble'
import StarNineSliceButton from './NineSliceButton'
import styles from './Popup.module.scss'

export type PopupPlacement = Exclude<BubblePlacement, 'none'>
export type PopupTrigger = 'hover' | 'click'

export interface PopupAction {
  label: string
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
  onClick?: () => void
}

export interface StarPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  open?: boolean
  placement?: PopupPlacement
  trigger?: PopupTrigger
  title?: ReactNode
  content: ReactNode
  actions?: PopupAction[]
  offset?: number
  children: ReactNode
}

const getPopupPositionStyle = (placement: PopupPlacement, offset: number): CSSProperties => {
  switch (placement) {
    case 'top-start':
      return { bottom: `calc(100% + ${offset}px)`, left: 0 }
    case 'top':
      return { bottom: `calc(100% + ${offset}px)`, left: '50%', transform: 'translateX(-50%)' }
    case 'top-end':
      return { bottom: `calc(100% + ${offset}px)`, right: 0 }
    case 'right-start':
      return { left: `calc(100% + ${offset}px)`, top: 0 }
    case 'right':
      return { left: `calc(100% + ${offset}px)`, top: '50%', transform: 'translateY(-50%)' }
    case 'right-end':
      return { left: `calc(100% + ${offset}px)`, bottom: 0 }
    case 'bottom-start':
      return { top: `calc(100% + ${offset}px)`, left: 0 }
    case 'bottom':
      return { top: `calc(100% + ${offset}px)`, left: '50%', transform: 'translateX(-50%)' }
    case 'bottom-end':
      return { top: `calc(100% + ${offset}px)`, right: 0 }
    case 'left-start':
      return { right: `calc(100% + ${offset}px)`, top: 0 }
    case 'left':
      return { right: `calc(100% + ${offset}px)`, top: '50%', transform: 'translateY(-50%)' }
    case 'left-end':
      return { right: `calc(100% + ${offset}px)`, bottom: 0 }
    default:
      return {}
  }
}

function StarPopup({
  open: openProp,
  placement = 'right',
  trigger = 'hover',
  title,
  content,
  actions,
  offset = 12,
  children,
  className,
  ...rest
}: StarPopupProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bubblePlacement = flipBubblePlacement(placement)

  const show = useCallback(() => {
    if (!isControlled) setInternalOpen(true)
  }, [isControlled])

  const hide = useCallback(() => {
    if (!isControlled) setInternalOpen(false)
  }, [isControlled])

  const handleMouseEnter = useCallback(() => {
    if (trigger !== 'hover') return
    if (timerRef.current) clearTimeout(timerRef.current)
    show()
  }, [trigger, show])

  const handleMouseLeave = useCallback(() => {
    if (trigger !== 'hover') return
    timerRef.current = setTimeout(() => {
      hide()
    }, 120)
  }, [trigger, hide])

  const handleClick = useCallback(() => {
    if (trigger !== 'click') return
    setInternalOpen((prev) => !prev)
  }, [trigger])

  useEffect(() => {
    if (trigger !== 'click') return
    const handleDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setInternalOpen(false)
      }
    }
    document.addEventListener('click', handleDocClick)
    return () => document.removeEventListener('click', handleDocClick)
  }, [trigger])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const cardFooter = actions?.length ? (
    <div className={styles['stardew-popup__actions']}>
      {actions.map((action) => (
        <StarNineSliceButton
          key={action.label}
          type="button"
          variant={action.variant ?? 'default'}
          size="small"
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </StarNineSliceButton>
      ))}
    </div>
  ) : null

  return (
    <div
      ref={containerRef}
      {...rest}
      className={classNames(styles['stardew-popup'], className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className={styles['stardew-popup__trigger']}>{children}</div>
      {open ? (
        <div className={styles['stardew-popup__bubble-wrap']} style={getPopupPositionStyle(placement, offset)}>
          <StarCanvasBubble
            className={styles['stardew-popup__bubble']}
            bubblePlacement={bubblePlacement}
            fillColor="#ffe0b2"
            borderColor="#9d4100"
            borderWidth={6}
            cornerSize={14}
            arrowWidth={24}
            arrowDepth={14}
            contentPadding={12}
          >
            <StarCard
              title={title}
              showTitle={Boolean(title)}
              footer={cardFooter}
              variant="default"
              size="small"
              className={styles['stardew-popup__card']}
            >
              {content}
            </StarCard>
          </StarCanvasBubble>
        </div>
      ) : null}
    </div>
  )
}

export default StarPopup
