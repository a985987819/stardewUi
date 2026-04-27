import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames, flipBubblePlacement, type BubblePlacement } from '../../utils'
import StarCanvasBubble from './CanvasBubble'
import StarNineSliceButton from './NineSliceButton'
import styles from './Popup.module.scss'

export type PopupPlacement = Exclude<BubblePlacement, 'none'>

export interface PopupAction {
  label: string
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
  onClick?: () => void
}

export interface StarPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  open?: boolean
  placement?: PopupPlacement
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
  open = true,
  placement = 'right',
  title,
  content,
  actions,
  offset = 12,
  children,
  className,
  ...rest
}: StarPopupProps) {
  const bubblePlacement = flipBubblePlacement(placement)

  return (
    <div {...rest} className={classNames(styles['stardew-popup'], className)}>
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
            {title ? <div className={styles['stardew-popup__title']}>{title}</div> : null}
            <div className={styles['stardew-popup__content']}>{content}</div>
            {actions?.length ? (
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
            ) : null}
          </StarCanvasBubble>
        </div>
      ) : null}
    </div>
  )
}

export default StarPopup
