import { useState, type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Tag.module.scss'

/** Preset ink colours, all drawn from the shared raw colour tokens. */
export type TagColor = 'default' | 'green' | 'red' | 'yellow' | 'blue' | 'purple'

export interface StarTagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Preset ink for the frame ring and text. */
  color?: TagColor
  /** Shows a pixel × that removes the tag. */
  closable?: boolean
  /** Called after the built-in close button removes the tag. */
  onClose?: () => void
  /** Accessible name of the built-in close button. */
  closeLabel?: string
  /** Tag content. */
  children?: ReactNode
}

/**
 * Corner staircase: 2 levels × 2px = a 4px span. `Input` uses the same two
 * levels with a 4px step for a 8px span; a tag is smaller, so the staircase
 * shrinks while the two-level rhythm stays recognisable.
 */
const TAG_CORNER_STEPS = 2
const TAG_CORNER_STEP = 2

const TAG_CLIP_PATH = createSteppedRectClipPath(TAG_CORNER_STEPS, TAG_CORNER_STEP)

type TagCssVariables = CSSProperties & {
  '--star-tag-clip': string
}

/**
 * Tag — a small wooden name tag pinned to the notice board, for crop quality,
 * quest states, and categories. The frame reuses the Input two-layer trick:
 * one shared staircase polygon paints the ring, the inset layer paints the
 * parchment fill, so the border stays an even 2px around the stepped corners.
 */
function StarTag({
  color = 'default',
  closable = false,
  onClose,
  closeLabel = 'Close',
  children,
  className,
  style,
  ...rest
}: StarTagProps) {
  const [closed, setClosed] = useState(false)

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    // The button lives inside the tag; swallowing the event keeps a wrapping
    // clickable (card row, filter chip) from reacting to the removal.
    event.stopPropagation()
    setClosed(true)
    onClose?.()
  }

  if (closed) return null

  const cssVariables: TagCssVariables = {
    '--star-tag-clip': TAG_CLIP_PATH,
  }

  return (
    <span
      {...rest}
      className={classNames(
        styles['star-tag'],
        color !== 'default' && styles[`star-tag--${color}`],
        className,
      )}
      style={{ ...cssVariables, ...style }}
    >
      {/* One `clip-path` can only cut one outline, so the ring and the fill are
          separate layers sharing the same staircase polygon. */}
      <span className={styles['star-tag__plate']} aria-hidden />
      <span className={styles['star-tag__content']}>
        {children}
        {closable ? (
          <button
            type="button"
            className={styles['star-tag__close']}
            aria-label={closeLabel}
            onClick={handleClose}
          >
            <X size={10} strokeWidth={3} aria-hidden />
          </button>
        ) : null}
      </span>
    </span>
  )
}

export { StarTag }
export default StarTag
