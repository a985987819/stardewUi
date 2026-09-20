import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import { deriveProgressPalette, DEFAULT_PROGRESS_COLOR } from '../../utils/progressPalette'
import styles from './Progress.module.scss'

export interface StarProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Current amount. Values outside 0…max are clamped for display. */
  value: number
  /** Total amount represented by a full bar. */
  max?: number
  /** Amount represented by one complete pixel cell. Defaults to ten. */
  segmentSize?: number
  /** Visible fill colour. Frame, shadow, and highlight are derived from it. */
  color?: string
  /** Shows the current amount as a numeric label. */
  showLabel?: boolean
  /** Standard life cells or a dense six-pixel-wide HUD row. */
  variant?: ProgressVariant
}

export type ProgressVariant = 'default' | 'compact'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

interface ProgressCellProps {
  filled: boolean
}

function ProgressCell({ filled }: ProgressCellProps) {
  const cellRef = useRef<HTMLSpanElement>(null)
  const previousFilledRef = useRef(filled)

  useEffect(() => {
    const cell = cellRef.current
    const previousFilled = previousFilledRef.current
    previousFilledRef.current = filled

    if (!cell || previousFilled === filled) return

    cell.dataset.motion = filled ? 'in' : 'out'
    const clearMotion = () => { delete cell.dataset.motion }
    cell.addEventListener('animationend', clearMotion, { once: true })

    return () => cell.removeEventListener('animationend', clearMotion)
  }, [filled])

  return (
    <span ref={cellRef} className={styles['star-progress__cell']} data-slot="progress-cell" data-filled={filled || undefined}>
      <span className={styles['star-progress__cell-surface']} />
      <span className={styles['star-progress__cell-fill']} />
      <span className={styles['star-progress__cell-bevel']} />
    </span>
  )
}

function StarProgress({
  value,
  max = 100,
  segmentSize = 10,
  color = DEFAULT_PROGRESS_COLOR,
  showLabel = false,
  variant = 'default',
  className,
  style,
  ...rest
}: StarProgressProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1
  const safeSegmentSize = Number.isFinite(segmentSize) && segmentSize > 0 ? segmentSize : 10
  const safeValue = clamp(Number.isFinite(value) ? value : 0, 0, safeMax)
  const segmentCount = Math.max(1, Math.ceil(safeMax / safeSegmentSize))
  const completedSegments = Math.min(segmentCount, Math.floor(safeValue / safeSegmentSize))
  const palette = deriveProgressPalette(color)

  return (
    <div
      {...rest}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeValue}
      aria-valuetext={`${safeValue} / ${safeMax}`}
      className={classNames(styles['star-progress'], styles[`star-progress--${variant}`], className)}
      style={{
        '--star-progress-fill': palette.fill,
        '--star-progress-border': palette.border,
        '--star-progress-shadow': palette.shadow,
        '--star-progress-highlight': palette.highlight,
        '--star-progress-empty': palette.empty,
        '--star-progress-segment-count': segmentCount,
        ...style,
      } as CSSProperties}
    >
      <div className={styles['star-progress__segments']} aria-hidden>
        {Array.from({ length: segmentCount }, (_, index) => {
          const isFilled = index < completedSegments

          return <ProgressCell key={index} filled={isFilled} />
        })}
      </div>
      {showLabel ? <span className={styles['star-progress__label']}>{`${safeValue} / ${safeMax}`}</span> : null}
    </div>
  )
}

export { StarProgress }
export default StarProgress
