import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Skeleton.module.scss'

export interface StarSkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Renders children instead of the placeholder when false. */
  loading?: boolean
  /** Number of paragraph placeholder rows. */
  rows?: number
  /** Shows the bold heading row above the paragraphs. */
  title?: boolean
  /** Shows a square avatar block on the left. */
  avatar?: boolean
  /** Real content swapped in when loading turns false. */
  children?: ReactNode
}

/**
 * Corner staircase: the avatar block gets the standard 2px steps; the thin
 * rows use 2 levels × 1px so the chamfer stays readable at 10px height.
 */
const SKELETON_CLIP_AVATAR = createSteppedRectClipPath(2, 2)
const SKELETON_CLIP_ROW = createSteppedRectClipPath(2, 1)

/** Row widths cycle through this rhythm; the last row always shortens. */
const ROW_WIDTH_CYCLE = [100, 92, 96, 78]

type SkeletonCssVariables = CSSProperties & {
  '--star-skeleton-clip-avatar': string
  '--star-skeleton-clip-row': string
}

/**
 * Skeleton — pixel-striped placeholders that prop the page up like mine
 * supports before content arrives: an optional avatar block, an optional
 * bold title row, and a few paragraph rows whose marching stripes step
 * forward in pixel jumps until loading turns false and children take over.
 */
function StarSkeleton({
  loading = true,
  rows = 3,
  title = true,
  avatar = false,
  children,
  className,
  style,
  ...rest
}: StarSkeletonProps) {
  if (!loading) return <>{children}</>

  const rowWidths = Array.from({ length: rows }, (_, index) =>
    index === rows - 1 ? 60 : ROW_WIDTH_CYCLE[index % ROW_WIDTH_CYCLE.length],
  )

  const cssVariables: SkeletonCssVariables = {
    '--star-skeleton-clip-avatar': SKELETON_CLIP_AVATAR,
    '--star-skeleton-clip-row': SKELETON_CLIP_ROW,
  }

  return (
    <div
      {...rest}
      aria-busy="true"
      className={classNames(styles['star-skeleton'], className)}
      style={{ ...cssVariables, ...style }}
    >
      {avatar ? (
        <span className={styles['star-skeleton__avatar']} aria-hidden />
      ) : null}
      <div className={styles['star-skeleton__body']}>
        {title ? (
          <span
            className={classNames(styles['star-skeleton__row'], styles['star-skeleton__row--title'])}
            style={{ width: '40%' }}
            aria-hidden
          />
        ) : null}
        {rowWidths.map((width, index) => (
          <span
            key={index}
            className={styles['star-skeleton__row']}
            style={{ width: `${width}%` }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  )
}

export { StarSkeleton }
export default StarSkeleton
