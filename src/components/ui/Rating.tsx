import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Rating.module.scss'

export type RatingIcon = 'heart' | 'star'

export interface StarRatingProps {
  /** Current controlled score, from 0 through `count`. */
  value?: number
  /** Initial score when the component is uncontrolled. */
  defaultValue?: number
  /** Maximum number of icons. */
  count?: number
  /** Lets each icon contribute a half point. */
  allowHalf?: boolean
  /** Uses hearts by default; set to `star` for a classic rating display. */
  icon?: RatingIcon
  /** Disables pointer and keyboard input while preserving the displayed score. */
  disabled?: boolean
  /** Called whenever a player picks a score. */
  onChange?: (value: number) => void
  /** Filled icon color. */
  color?: string
  /** Empty icon color. */
  emptyColor?: string
  /** Accessible name for the score picker. */
  'aria-label'?: string
  className?: string
  style?: CSSProperties
}

const HEART_PIXELS = [
  [1, 0], [2, 0], [4, 0], [5, 0],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
  [1, 3], [2, 3], [3, 3], [4, 3],
  [2, 4], [3, 4],
] as const

const STAR_PIXELS = [
  [3, 0],
  [2, 1], [3, 1], [4, 1],
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
  [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
  [2, 4], [3, 4], [4, 4],
  [1, 5], [2, 5], [4, 5], [5, 5],
  [0, 6], [1, 6], [5, 6], [6, 6],
] as const

const clamp = (value: number, maximum: number) => Math.min(maximum, Math.max(0, value))

const roundToStep = (value: number, step: number) => Math.round(value / step) * step

function PixelGlyph({ icon, fill }: { icon: RatingIcon; fill: number }) {
  const pixels = icon === 'heart' ? HEART_PIXELS : STAR_PIXELS
  const gridSize = icon === 'heart' ? 6 : 7

  return (
    <span className={styles['star-rating__glyph']} aria-hidden>
      <svg viewBox={`0 0 ${gridSize} ${gridSize}`} focusable="false">
        {pixels.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)}
      </svg>
      {fill > 0 ? (
        <span className={styles['star-rating__glyph-fill']} style={{ width: `${fill * 100}%` }}>
          <svg viewBox={`0 0 ${gridSize} ${gridSize}`} focusable="false">
            {pixels.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)}
          </svg>
        </span>
      ) : null}
    </span>
  )
}

function StarRating({
  value,
  defaultValue = 0,
  count = 5,
  allowHalf = false,
  icon = 'heart',
  disabled = false,
  onChange,
  color = '#D9899A',
  emptyColor = '#CDBDA8',
  'aria-label': ariaLabel = 'Rating',
  className,
  style,
}: StarRatingProps) {
  const [internalValue, setInternalValue] = useState(() => clamp(defaultValue, count))
  const currentValue = clamp(value ?? internalValue, count)
  const step = allowHalf ? 0.5 : 1

  const setRating = (nextValue: number) => {
    if (disabled) return

    const normalized = clamp(roundToStep(nextValue, step), count)
    if (value === undefined) setInternalValue(normalized)
    onChange?.(normalized)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      setRating(currentValue + step)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      setRating(currentValue - step)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setRating(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setRating(count)
    }
  }

  return (
    <div
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={currentValue}
      aria-valuetext={`${currentValue} / ${count}`}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      className={classNames(styles['star-rating'], disabled && styles['star-rating--disabled'], className)}
      style={{ '--star-rating-color': color, '--star-rating-empty-color': emptyColor, ...style } as CSSProperties}
      onKeyDown={handleKeyDown}
    >
      {Array.from({ length: count }, (_, index) => {
        const position = index + 1
        const fill = clamp(currentValue - index, 1)

        return (
          <button
            key={position}
            type="button"
            tabIndex={-1}
            disabled={disabled}
            className={styles['star-rating__button']}
            aria-label={`${position} / ${count}`}
            onClick={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect()
              const isLeftHalf = allowHalf && event.clientX - bounds.left < bounds.width / 2
              setRating(index + (isLeftHalf ? 0.5 : 1))
            }}
          >
            <PixelGlyph icon={icon} fill={fill} />
          </button>
        )
      })}
    </div>
  )
}

export { StarRating }
export default StarRating
