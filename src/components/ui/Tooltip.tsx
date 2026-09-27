// Batch: 2026-09-27 P0 batch — internal marker for tooling only; no runtime effect.
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Tooltip.module.scss'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface StarTooltipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'title' | 'content'> {
  /** Bubble copy, or richer content. */
  title: ReactNode
  /** Which side of the trigger the bubble floats on. */
  placement?: TooltipPlacement
  /** Controlled visibility; leave undefined to let hover own it. */
  open?: boolean
  /** Initial visibility for the uncontrolled mode. */
  defaultOpen?: boolean
  /** Hover-in delay in ms. */
  mouseEnterDelay?: number
  /** Hover-out delay in ms. */
  mouseLeaveDelay?: number
  /** Shows the pixel arrow pointing back at the trigger. */
  arrow?: boolean
  /** Fires when hover wants to change visibility. */
  onOpenChange?: (open: boolean) => void
  /** Trigger element. */
  children?: ReactNode
}

/**
 * Corner staircase: 2 levels × 2px — the same small-overlay scale as Alert,
 * so floating bubbles and banners share one corner rhythm. The stepped arrow
 * is a fixed 8×8 pixel pyramid (one clip-path, rotated per placement).
 */
const TOOLTIP_CLIP_PATH = createSteppedRectClipPath(2, 2)

const TOOLTIP_ARROW_CLIP =
  'polygon(0 0, 100% 0, 100% 50%, 75% 50%, 75% 100%, 25% 100%, 25% 50%, 0 50%)'

type TooltipCssVariables = CSSProperties & {
  '--star-tooltip-clip': string
  '--star-tooltip-arrow-clip': string
}

/**
 * Tooltip — a pixel bubble that floats in on hover or focus, like an NPC
 * pointing the way: a tiny parchment plate with a stepped arrow, one of four
 * placements, and hover delays so brushing past never flashes it.
 */
function StarTooltip({
  title,
  placement = 'top',
  open,
  defaultOpen = false,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 150,
  arrow = true,
  onOpenChange,
  children,
  className,
  style,
  ...rest
}: StarTooltipProps) {
  const generatedId = useId()
  const bubbleId = `star-tooltip-${generatedId}`
  const [hoverOpen, setHoverOpen] = useState(defaultOpen)
  const timerRef = useRef<number | undefined>(undefined)

  // A hover timer left running past unmount would poke a dead component.
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const isControlled = open !== undefined
  const visible = isControlled ? open : hoverOpen

  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timerRef.current)
    // A zero delay reacts in the same tick — no timer, no flash of latency.
    if (delay <= 0) {
      if (!isControlled) setHoverOpen(next)
      onOpenChange?.(next)
      return
    }
    timerRef.current = window.setTimeout(() => {
      if (!isControlled) setHoverOpen(next)
      onOpenChange?.(next)
    }, delay)
  }

  const handleEnter = () => schedule(true, mouseEnterDelay)
  const handleLeave = () => schedule(false, mouseLeaveDelay)
  // Keyboard focus counts as "hovering" too; blur closes without a delay.
  const handleFocus = () => schedule(true, 0)
  const handleBlur = () => schedule(false, 0)
  // Escape mirrors blur: while focus sits inside the trigger, pressing it
  // dismisses the bubble right away, per the WAI-ARIA tooltip pattern.
  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    rest.onKeyDown?.(event)
    if (event.key === 'Escape' && visible) schedule(false, 0)
  }

  const cssVariables: TooltipCssVariables = {
    '--star-tooltip-clip': TOOLTIP_CLIP_PATH,
    '--star-tooltip-arrow-clip': TOOLTIP_ARROW_CLIP,
  }

  return (
    <span
      {...rest}
      className={classNames(
        styles['star-tooltip'],
        visible && styles['star-tooltip--open'],
        isControlled && styles['star-tooltip--controlled'],
        className,
      )}
      style={{ ...cssVariables, ...style }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      aria-describedby={visible ? bubbleId : undefined}
    >
      {children}
      {visible ? (
        <span
          role="tooltip"
          id={bubbleId}
          className={classNames(styles['star-tooltip__bubble'], styles[`star-tooltip__bubble--${placement}`])}
        >
          {/* A wrapper just for the pop-in animation: the keyframes animate
              `transform: scale`, which would fight the bubble's translate
              centering if they shared one element. */}
          <span className={styles['star-tooltip__inner']}>
            {/* One `clip-path` can only cut one outline, so the frame ring
                and the parchment fill are separate layers sharing one
                polygon. */}
            <span className={styles['star-tooltip__plate']} aria-hidden />
            <span className={styles['star-tooltip__content']}>{title}</span>
            {arrow ? (
              <span
                className={classNames(styles['star-tooltip__arrow'], styles[`star-tooltip__arrow--${placement}`])}
                aria-hidden
              />
            ) : null}
          </span>
        </span>
      ) : null}
    </span>
  )
}

export { StarTooltip }
export default StarTooltip
