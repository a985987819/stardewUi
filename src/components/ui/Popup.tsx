import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import {
  classNames,
  deriveProgressPaletteWithWarning,
  flipBubblePlacement,
  resolveBubblePlacement,
  WOOD_PANEL_THEME,
  type BubblePlacement,
} from '../../utils'
import { createInsetSteppedRectClipPath } from '../../utils/pixelCorners'
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
  /** Controlled visibility; leave undefined to let hover/click own it. */
  open?: boolean
  /** Called when hover/click wants to change visibility. */
  onOpenChange?: (open: boolean) => void
  placement?: PopupPlacement
  trigger?: PopupTrigger
  title?: ReactNode
  content: ReactNode
  actions?: PopupAction[]
  offset?: number
  /** Initial visibility for the uncontrolled mode. */
  defaultOpen?: boolean
  /** Hover-in delay in ms — the tooltip contract, so sweeping a row never flashes. */
  mouseEnterDelay?: number
  /** Hover-out delay in ms. */
  mouseLeaveDelay?: number
  /** Shows the pixel arrow pointing back at the trigger. */
  arrow?: boolean
  /** Custom plate fill; ring, bevel and cream ink derive from it. */
  color?: string
  /**
   * ARIA role of the bubble. Defaults to `dialog` once `actions` are present
   * (interactive content) and `tooltip` otherwise, which is what assistive
   * tech expects from a hover hint.
   */
  role?: 'tooltip' | 'dialog' | 'none'
  children: ReactNode
}

/**
 * Frame geometry of the panel. The panel is plain DOM: three stacked layers
 * (dark border ring → lit bevel ring → surface) each clipped by the house-style
 * staircase-corner polygon, so the corners step like every other frame in the
 * kit and the header/footer backgrounds can never cut a different corner.
 * Ring thicknesses live in `Popup.module.scss` (4px border + 4px bevel).
 */
const PANEL_STEPS = 2
const PANEL_STEP = 4

/**
 * Pixel triangle arrow: a 16×16 stepped wedge poking out of one side.
 */
const ARROW_SIZE = 16
/** How far the arrow protrudes beyond the panel edge. */
const ARROW_OUT = 12

const PANEL_CLIP_PATH = createInsetSteppedRectClipPath(PANEL_STEPS, PANEL_STEP)

// 16×16 stepped triangle polygons, keyed by the edge the arrow sits on. The
// hypotenuses stair down in 2px runs so the arrow reads as pixel art, not a
// smooth wedge.
const ARROW_CLIP_PATHS = {
  top: 'polygon(0px 16px, 16px 16px, 16px 12px, 14px 12px, 14px 8px, 12px 8px, 12px 4px, 10px 4px, 10px 0px, 6px 0px, 6px 4px, 4px 4px, 4px 8px, 2px 8px, 2px 12px, 0px 12px)',
  bottom: 'polygon(0px 0px, 16px 0px, 16px 4px, 14px 4px, 14px 8px, 12px 8px, 12px 12px, 10px 12px, 10px 16px, 6px 16px, 6px 12px, 4px 12px, 4px 8px, 2px 8px, 2px 4px, 0px 4px)',
  left: 'polygon(16px 0px, 16px 16px, 12px 16px, 12px 14px, 8px 14px, 8px 12px, 4px 12px, 4px 10px, 0px 10px, 0px 6px, 4px 6px, 4px 4px, 8px 4px, 8px 2px, 12px 2px, 12px 0px)',
  right: 'polygon(0px 0px, 0px 16px, 4px 16px, 4px 14px, 8px 14px, 8px 12px, 12px 12px, 12px 10px, 16px 10px, 16px 6px, 12px 6px, 12px 4px, 8px 4px, 8px 2px, 4px 2px, 4px 0px)',
} as const

const panelCssVariables = {
  '--wood-panel-border': WOOD_PANEL_THEME.border,
  '--wood-panel-frame': WOOD_PANEL_THEME.frame,
  '--wood-panel-surface': WOOD_PANEL_THEME.surface,
  '--wood-panel-text': WOOD_PANEL_THEME.text,
  '--wood-panel-text-secondary': WOOD_PANEL_THEME.textSecondary,
  '--wood-panel-title-shadow': WOOD_PANEL_THEME.titleShadow,
  '--wood-panel-divider': WOOD_PANEL_THEME.divider,
  '--wood-panel-top-highlight': WOOD_PANEL_THEME.topHighlight,
  '--wood-panel-footer-top': WOOD_PANEL_THEME.footerTop,
  '--wood-panel-footer-bottom': WOOD_PANEL_THEME.footerBottom,
  '--wood-panel-footer-border': WOOD_PANEL_THEME.footerBorder,
  '--wood-panel-header-grain-1': WOOD_PANEL_THEME.headerGrain[0],
  '--wood-panel-header-grain-2': WOOD_PANEL_THEME.headerGrain[1],
  '--wood-panel-header-grain-3': WOOD_PANEL_THEME.headerGrain[2],
  '--wood-panel-header-grain-4': WOOD_PANEL_THEME.headerGrain[3],
} as CSSProperties

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

/**
 * Position of the arrow span along the attachment edge. The arrow points back
 * at the trigger, so it lives on the side facing the trigger (`bubblePlacement`
 * is already the flipped placement).
 */
const getArrowStyle = (bubblePlacement: BubblePlacement): CSSProperties => {
  const { side, align } = resolveBubblePlacement(bubblePlacement)
  const inset = 16
  const style: CSSProperties = { width: ARROW_SIZE, height: ARROW_SIZE }

  switch (side) {
    case 'top':
      style.top = -ARROW_OUT
      if (align === 'start') style.left = inset
      else if (align === 'end') style.right = inset
      else {
        style.left = '50%'
        style.transform = 'translateX(-50%)'
      }
      break
    case 'bottom':
      style.bottom = -ARROW_OUT
      if (align === 'start') style.left = inset
      else if (align === 'end') style.right = inset
      else {
        style.left = '50%'
        style.transform = 'translateX(-50%)'
      }
      break
    case 'left':
      style.left = -ARROW_OUT
      if (align === 'start') style.top = inset
      else if (align === 'end') style.bottom = inset
      else {
        style.top = '50%'
        style.transform = 'translateY(-50%)'
      }
      break
    case 'right':
      style.right = -ARROW_OUT
      if (align === 'start') style.top = inset
      else if (align === 'end') style.bottom = inset
      else {
        style.top = '50%'
        style.transform = 'translateY(-50%)'
      }
      break
    default:
      style.display = 'none'
  }

  return style
}

function StarPopup({
  open: openProp,
  onOpenChange,
  placement = 'right',
  trigger = 'hover',
  title,
  content,
  actions,
  offset = 12,
  defaultOpen = false,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 120,
  arrow = true,
  color,
  role,
  children,
  className,
  ...rest
}: StarPopupProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bubbleId = `star-popup-${useId()}`

  const bubblePlacement = flipBubblePlacement(placement)

  // A plain hover bubble is a tooltip; once it carries buttons it is a dialog.
  // The caller can always say so explicitly with `role`.
  const resolvedRole = role ?? (actions?.length ? 'dialog' : 'tooltip')

  const show = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(true)
      return
    }

    setInternalOpen(true)
  }, [isControlled, onOpenChange])

  const hide = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(false)
      return
    }

    setInternalOpen(false)
  }, [isControlled, onOpenChange])

  // Enter/leave delays mirror the tooltip contract: brushing past a row of
  // triggers never flashes bubbles, and a zero delay reacts in the same tick.
  const schedule = useCallback(
    (next: boolean, delay: number) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (delay <= 0) {
        if (next) show()
        else hide()
        return
      }
      timerRef.current = setTimeout(() => {
        if (next) show()
        else hide()
      }, delay)
    },
    [hide, show],
  )

  const handleMouseEnter = useCallback(() => {
    if (trigger !== 'hover') return
    schedule(true, mouseEnterDelay)
  }, [mouseEnterDelay, schedule, trigger])

  const handleMouseLeave = useCallback(() => {
    if (trigger !== 'hover') return
    schedule(false, mouseLeaveDelay)
  }, [mouseLeaveDelay, schedule, trigger])

  // Keyboard parity with hover: focusing inside raises the bubble, blur drops
  // it without a delay.
  const handleFocus = useCallback(() => {
    if (trigger !== 'hover') return
    schedule(true, 0)
  }, [schedule, trigger])

  const handleBlur = useCallback(() => {
    if (trigger !== 'hover') return
    schedule(false, 0)
  }, [schedule, trigger])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      rest.onKeyDown?.(event)
    },
    [rest],
  )

  const handleClick = useCallback(() => {
    if (trigger !== 'click') return

    if (isControlled) {
      onOpenChange?.(!open)
      return
    }

    setInternalOpen((prev) => !prev)
  }, [isControlled, onOpenChange, open, trigger])

  useEffect(() => {
    if (trigger !== 'click') return
    const handleDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        hide()
      }
    }
    document.addEventListener('click', handleDocClick)
    return () => document.removeEventListener('click', handleDocClick)
  }, [hide, trigger])

  // Escape closes an open bubble per the WAI-ARIA tooltip pattern. The listener
  // lives on the window: it has to fire even when focus sits outside the popup.
  useEffect(() => {
    if (!open) return undefined

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') schedule(false, 0)
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, schedule])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const footer = actions?.length ? (
    <div className={styles['stardew-popup__footer']}>
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

  // The offset keeps the old visual gap: the arrow now protrudes out of the
  // panel's box, so it is added back so the tip lands where the frame used to.
  const bubbleWrapStyle = {
    ...getPopupPositionStyle(placement, offset + ARROW_OUT),
    ...panelCssVariables,
    // A custom colour repaints the whole plate — ring, bevel, fill — and flips
    // the ink to cream so text stays readable on a saturated surface.
    ...(color
      ? (() => {
          const palette = deriveProgressPaletteWithWarning(color, 'Popup')
          return {
            '--wood-panel-border': palette.border,
            '--wood-panel-frame': palette.border,
            '--wood-panel-surface': palette.fill,
            '--wood-panel-text': 'var(--star-raw-hex-f4ead6)',
            '--wood-panel-text-secondary': 'var(--star-raw-hex-f4ead6)',
          } as CSSProperties
        })()
      : null),
  } as CSSProperties

  const arrowSide = resolveBubblePlacement(bubblePlacement).side
  const arrowClip = arrowSide ? ARROW_CLIP_PATHS[arrowSide] : undefined

  return (
    <div
      ref={containerRef}
      {...rest}
      className={classNames(styles['stardew-popup'], className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      aria-describedby={open && resolvedRole === 'tooltip' ? bubbleId : undefined}
    >
      <div className={styles['stardew-popup__trigger']}>{children}</div>
      {open ? (
        <div className={styles['stardew-popup__bubble-wrap']} style={bubbleWrapStyle}>
          {arrow ? (
            <div className={styles['stardew-popup__arrow-host']} style={getArrowStyle(bubblePlacement)}>
              <span
                aria-hidden
                className={styles['stardew-popup__arrow']}
                style={arrowClip ? { clipPath: arrowClip } : undefined}
              />
            </div>
          ) : null}
          <div
            id={bubbleId}
            role={resolvedRole === 'none' ? undefined : resolvedRole}
            className={styles['stardew-popup__panel']}
            style={{ clipPath: PANEL_CLIP_PATH }}
          >
            <span aria-hidden className={styles['stardew-popup__bevel']} style={{ clipPath: PANEL_CLIP_PATH }} />
            <div className={styles['stardew-popup__surface']} style={{ clipPath: PANEL_CLIP_PATH }}>
              {title ? (
                <div className={styles['stardew-popup__header']}>
                  <h3 className={styles['stardew-popup__title']}>{title}</h3>
                </div>
              ) : null}
              <div
                className={classNames(
                  styles['stardew-popup__body'],
                  !title ? styles['stardew-popup__body--without-title'] : undefined
                )}
              >
                {content}
              </div>
              {footer}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default StarPopup
