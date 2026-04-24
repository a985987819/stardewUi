import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames, flipBubblePlacement, type BubblePlacement } from '../../utils'
import CanvasBubble from './CanvasBubble'
import NineSliceButton from './NineSliceButton'
import './Popup.css'

export type PopupPlacement = Exclude<BubblePlacement, 'none'>

export interface PopupAction {
  label: string
  variant?: 'default' | 'primary'
  onClick?: () => void
}

export interface PopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
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

function Popup({
  open = true,
  placement = 'right',
  title,
  content,
  actions,
  offset = 12,
  children,
  className,
  ...rest
}: PopupProps) {
  const bubblePlacement = flipBubblePlacement(placement)

  return (
    <div {...rest} className={classNames('stardew-popup', className)}>
      <div className="stardew-popup__trigger">{children}</div>
      {open ? (
        <div className="stardew-popup__bubble-wrap" style={getPopupPositionStyle(placement, offset)}>
          <CanvasBubble
            className="stardew-popup__bubble"
            bubblePlacement={bubblePlacement}
            fillColor="#f8f7f3"
            borderColor="#2f3440"
            borderWidth={4}
            cornerSize={10}
            arrowWidth={20}
            arrowDepth={12}
            contentPadding={14}
          >
            {title ? <div className="stardew-popup__title">{title}</div> : null}
            <div className="stardew-popup__content">{content}</div>
            {actions?.length ? (
              <div className="stardew-popup__actions">
                {actions.map((action) => (
                  <NineSliceButton
                    key={action.label}
                    type="button"
                    variant={action.variant ?? 'default'}
                    size="small"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </NineSliceButton>
                ))}
              </div>
            ) : null}
          </CanvasBubble>
        </div>
      ) : null}
    </div>
  )
}

export default Popup
