import { useState, type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Tag.module.scss'

/** Preset ink colours, all drawn from the shared raw colour tokens. */
export type TagTone = 'default' | 'green' | 'red' | 'yellow' | 'blue' | 'purple'

/** @deprecated Renamed to `TagTone` — `color` now means a CSS colour library-wide. */
export type TagColor = TagTone

export interface StarTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /**
   * Preset ink for the frame ring and text.
   *
   * Renamed from `color` to `tone`: these are named presets, not colours you
   * can read off a palette, and `color` is a CSS colour string in every other
   * component. Two components reading the same prop name as two different
   * things is how `<Tag color="green">` and `<Card color="green">` came to mean
   * different results. `tone` says "pick one of these"; `color` says "use this".
   */
  tone?: TagTone
  /** Any CSS colour for the frame ring and text, overriding `tone`. */
  color?: string
  /** Shows a pixel × that removes the tag. */
  closable?: boolean
  /** Called after the built-in close button removes the tag. */
  onClose?: () => void
  /** Accessible name of the built-in close button. */
  closeLabel?: string
  /**
   * Controlled visibility. Leave it out to let the tag own its dismissed state.
   *
   * A closable tag used to hide itself permanently once dismissed, with no way
   * back. That breaks the two common uses: a filter chip the user removes and
   * then re-adds, and a validation message that should return when the input
   * goes bad again. Both need to reset it from outside.
   *
   * Named `open` to match Dialog / Drawer / Popup / Alert, and to stop
   * colliding with the CSS `visibility` property, which means something
   * narrower than "this element is on screen".
   */
  open?: boolean
  /** Starting visibility for the uncontrolled mode. */
  defaultOpen?: boolean
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
  '--tag-ring': string
  '--tag-text': string
  '--tag-accent': string
}

/**
 * Tag — a small wooden name tag pinned to the notice board, for crop quality,
 * quest states, and categories. The frame reuses the Input two-layer trick:
 * one shared staircase polygon paints the ring, the inset layer paints the
 * parchment fill, so the border stays an even 2px around the stepped corners.
 */
function StarTag({
  tone = 'default',
  color,
  closable = false,
  onClose,
  closeLabel = 'Close',
  open,
  defaultOpen = true,
  children,
  className,
  style,
  ...rest
}: StarTagProps) {
  // Uncontrolled support, same `prop ?? internal` shape as the input family.
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : internalOpen

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    // The button lives inside the tag; swallowing the event keeps a wrapping
    // clickable (card row, filter chip) from reacting to the removal.
    event.stopPropagation()
    if (!isControlled) setInternalOpen(false)
    onClose?.()
  }

  if (!currentOpen) return null

  // `tone` arrives as a class that sets all three variables; an explicit
  // `color` then overrides them inline, which is why a custom colour wins over
  // the preset rather than merely replacing the class.
  const cssVariables: TagCssVariables = {
    '--star-tag-clip': TAG_CLIP_PATH,
    '--tag-ring': color ?? 'var(--tag-ring)',
    '--tag-text': color ?? 'var(--tag-text)',
    '--tag-accent': color ?? 'var(--tag-accent)',
  }

  return (
    <span
      {...rest}
      className={classNames(
        styles['star-tag'],
        tone !== 'default' && styles[`star-tag--${tone}`],
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
