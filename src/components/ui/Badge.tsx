// Batch: 2026-09-27 P0 batch — internal marker for tooling only; no runtime effect.
import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { deriveProgressPalette } from '../../utils/progressPalette'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Badge.module.scss'

export interface StarBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Number shown inside the badge; values above `overflowCount` collapse to `N+`. */
  count?: number
  /** Renders a small square dot instead of a number. */
  dot?: boolean
  /** Counts above this collapse to `N+`. */
  overflowCount?: number
  /** Shows the badge even when the count is zero. */
  showZero?: boolean
  /** Fill colour of the badge; its frame edge is derived from it. */
  color?: string
  /**
   * Wrap target content to pin the badge to its top-right corner. Without
   * children the badge renders standalone.
   */
  children?: ReactNode
}

/** Micro staircase: 2 levels × 1px keeps a hint of the family corners at badge scale. */
const BADGE_CLIP_PATH = createSteppedRectClipPath(2, 1)

type BadgeCssVariables = CSSProperties & {
  '--star-badge-clip': string
  '--star-badge-fill': string
  '--star-badge-edge': string
}

/**
 * Badge — an inventory-style counter: a tiny stepped pixel plate pinned to the
 * top-right corner of any wrapped content (or rendered standalone). Counts
 * above `overflowCount` collapse to `N+`, and the dot mode marks "something
 * new" without a number. The frame edge is derived from the fill colour the
 * same way Progress derives its bevels.
 */
function StarBadge({
  count,
  dot = false,
  overflowCount = 99,
  showZero = false,
  color = '#E53935',
  children,
  className,
  style,
  ...rest
}: StarBadgeProps) {
  const palette = deriveProgressPalette(color)
  // Quantities are whole and non-negative: NaN and negatives read as "nothing
  // earned yet", and fractions floor to the whole items actually earned.
  const safeCount =
    count === undefined
      ? undefined
      : Number.isFinite(count)
        ? Math.max(0, Math.floor(count))
        : 0
  const visible = dot || safeCount === undefined || safeCount > 0 || showZero

  if (!visible) {
    if (children) return <span className={classNames(styles['star-badge__wrapper'], className)}>{children}</span>
    return null
  }

  const label = dot
    ? undefined
    : safeCount !== undefined
      ? safeCount > overflowCount
        ? `${overflowCount}+`
        : String(safeCount)
      : undefined

  const cssVariables: BadgeCssVariables = {
    '--star-badge-clip': BADGE_CLIP_PATH,
    '--star-badge-fill': color,
    '--star-badge-edge': palette.border,
  }

  const badge = (
    <span
      {...rest}
      className={classNames(
        styles['star-badge'],
        dot && styles['star-badge--dot'],
        !children && styles['star-badge--standalone'],
        className,
      )}
      style={{ ...cssVariables, ...style }}
    >
      {label}
    </span>
  )

  if (!children) return badge

  return (
    <span className={classNames(styles['star-badge__wrapper'], className)}>
      {children}
      {badge}
    </span>
  )
}

export { StarBadge }
export default StarBadge
