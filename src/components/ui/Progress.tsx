import type { CSSProperties, HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Progress.module.scss'

export interface StarProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Current amount. Values outside 0…max are clamped for display. */
  value: number
  /** Total amount represented by a full bar. */
  max?: number
  /** Pixel fill color, suitable for health, stamina, or harvest progress. */
  color?: string
  /** Shows the current amount as a numeric label. */
  showLabel?: boolean
  /** Uses the compact farm-HUD height. */
  size?: 'small' | 'medium' | 'large'
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function StarProgress({
  value,
  max = 100,
  color = '#71964A',
  showLabel = false,
  size = 'medium',
  className,
  style,
  ...rest
}: StarProgressProps) {
  const safeMax = max > 0 ? max : 1
  const safeValue = clamp(value, 0, safeMax)
  const percent = (safeValue / safeMax) * 100

  return (
    <div
      {...rest}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeValue}
      aria-valuetext={`${safeValue} / ${safeMax}`}
      className={classNames(styles['star-progress'], styles[`star-progress--${size}`], className)}
      style={{ '--star-progress-color': color, ...style } as CSSProperties}
    >
      <div className={styles['star-progress__track']}>
        <div className={styles['star-progress__fill']} style={{ width: `${percent}%` }} />
      </div>
      {showLabel ? <span className={styles['star-progress__label']}>{`${safeValue} / ${safeMax}`}</span> : null}
    </div>
  )
}

export { StarProgress }
export default StarProgress
