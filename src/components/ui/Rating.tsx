import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
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
        <span
          className={styles['star-rating__glyph-fill']}
          style={{ '--star-rating-fill': `${fill * 100}%` } as CSSProperties}
        >
          <svg viewBox={`0 0 ${gridSize} ${gridSize}`} focusable="false">
            {pixels.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)}
          </svg>
        </span>
      ) : null}
    </span>
  )
}

interface RatingIconButtonProps {
  icon: RatingIcon
  fill: number
  position: number
  count: number
  disabled: boolean
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void
  onDoubleClick: () => void
}

/** Shared shake-then-shrink motion; half the former 540ms Rating exit. */
const OUT_MOTION_MS = 270

/**
 * One score icon. It remembers how it looked last render so it can play the
 * matching motion: earned icons pop in exactly like a Progress cell, and lost
 * icons wobble before their fill shrinks away.
 */
function RatingIconButton({ icon, fill, position, count, disabled, onPointerUp, onDoubleClick }: RatingIconButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const previousFilledRef = useRef(fill > 0)
  const previousFillRef = useRef(fill)
  const filled = fill > 0
  /**
   * The amount of colour actually painted. An icon that just lost its fill keeps
   * painting the amount it had until the shrink finishes — otherwise there would
   * be nothing left on screen to animate.
   */
  const [paintedFill, setPaintedFill] = useState(fill)

  useEffect(() => {
    const button = buttonRef.current
    const wasFilled = previousFilledRef.current
    const hadFill = previousFillRef.current
    previousFilledRef.current = filled
    previousFillRef.current = fill

    if (!button) return undefined

    // Same presence, different amount (a half step): just repaint, nothing moves.
    if (wasFilled === filled) {
      setPaintedFill(fill)
      return undefined
    }

    button.dataset.motion = filled ? 'in' : 'out'
    setPaintedFill(filled ? fill : hadFill)

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      delete button.dataset.motion
      if (!filled) setPaintedFill(0)
    }

    // `animationend` normally wins; the timer is the safety net for reduced
    // motion, where the CSS turns the animation off entirely.
    button.addEventListener('animationend', finish, { once: true })
    const timer = window.setTimeout(finish, OUT_MOTION_MS + 60)

    return () => {
      button.removeEventListener('animationend', finish)
      window.clearTimeout(timer)
    }
  }, [fill, filled])

  return (
    <button
      ref={buttonRef}
      type="button"
      tabIndex={-1}
      disabled={disabled}
      className={styles['star-rating__button']}
      aria-label={`${position} / ${count}`}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <PixelGlyph icon={icon} fill={paintedFill} />
    </button>
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
  color,
  emptyColor = '#CDBDA8',
  'aria-label': ariaLabel = 'Rating',
  className,
  style,
}: StarRatingProps) {
  const [internalValue, setInternalValue] = useState(() => clamp(defaultValue, count))
  const pendingActivationRef = useRef<{ index: number; timer: number } | null>(null)
  const ignoreNativeDoubleClickRef = useRef(false)
  const currentValue = clamp(value ?? internalValue, count)
  const step = allowHalf ? 0.5 : 1
  const filledColor = color ?? (icon === 'heart' ? '#E53935' : '#D7992E')

  useEffect(
    () => () => {
      if (pendingActivationRef.current) window.clearTimeout(pendingActivationRef.current.timer)
    },
    []
  )

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

  const toggleHalf = (index: number) => {
    const iconValue = currentValue - index
    setRating(index + (iconValue >= 0.75 ? 0.5 : 1))
  }

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    if (disabled || !event.isPrimary) return

    const pending = pendingActivationRef.current
    if (allowHalf && pending?.index === index) {
      window.clearTimeout(pending.timer)
      pendingActivationRef.current = null
      ignoreNativeDoubleClickRef.current = true
      window.setTimeout(() => {
        ignoreNativeDoubleClickRef.current = false
      }, 100)
      toggleHalf(index)
      return
    }

    if (pending) window.clearTimeout(pending.timer)
    setRating(index + 1)
    const timer = window.setTimeout(() => {
      pendingActivationRef.current = null
    }, allowHalf ? 350 : 0)
    pendingActivationRef.current = { index, timer }
  }

  const handleDoubleClick = (index: number) => {
    if (disabled || !allowHalf || ignoreNativeDoubleClickRef.current) return
    const pending = pendingActivationRef.current
    if (pending) window.clearTimeout(pending.timer)
    pendingActivationRef.current = null
    toggleHalf(index)
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
      style={{ '--star-rating-color': filledColor, '--star-rating-empty-color': emptyColor, ...style } as CSSProperties}
      onKeyDown={handleKeyDown}
    >
      {Array.from({ length: count }, (_, index) => {
        const position = index + 1

        return (
          <RatingIconButton
            key={position}
            icon={icon}
            fill={clamp(currentValue - index, 1)}
            position={position}
            count={count}
            disabled={disabled}
            onPointerUp={(event) => handlePointerUp(event, index)}
            onDoubleClick={() => handleDoubleClick(index)}
          />
        )
      })}
    </div>
  )
}

export { StarRating }
export default StarRating
