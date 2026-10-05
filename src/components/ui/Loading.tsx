import { useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import carrotStage2 from '../../assets/Carrot_Stage_2.png'
import carrotStage4 from '../../assets/Carrot_Stage_4.png'
import qualitySprinkler from '../../assets/Quality_Sprinkler.png'
import { classNames } from '../../utils/classNames'
import { useComponentCopy } from './useComponentCopy'
import styles from './Loading.module.scss'

export type LoadingSize = 'small' | 'medium' | 'large'

/**
 * The three preset diameters, in pixels. The numbers are the sizes the sprite
 * sheet was drawn at, so a preset always lands on a whole source pixel.
 */
const LOADING_SIZES: Record<LoadingSize, number> = {
  small: 96,
  medium: 144,
  large: 192,
}

export interface StarLoadingProps extends HTMLAttributes<HTMLDivElement> {
  /** Stops the loop in its current state. Resuming starts a fresh crop. */
  active?: boolean
  text?: string
  /**
   * Preset size, or an exact pixel diameter for the one-off case. Takes the
   * same shape as every other `size` in the library, with `number` kept as the
   * escape hatch — the three presets are just the diameters the sprite was
   * drawn at, so nothing is lost by naming them.
   */
  size?: LoadingSize | number
  /** Milliseconds between each carrot growth step. Lower values run faster. Defaults to 600. */
  speed?: number
  gap?: number
  center?: boolean
  block?: boolean
  fill?: boolean
}

const CARROT_COUNT = 8
// One full eight-carrot cycle lands at 4.8s: fast enough to read as "working",
// slow enough to keep the trailing dots from flickering.
const DEFAULT_GROW_SPEED = 600

const initialState = 0

function StarLoading({
  active = true,
  text,
  size = 'medium',
  speed = DEFAULT_GROW_SPEED,
  gap = 8,
  center = false,
  block = false,
  fill = false,
  className,
  style,
  role,
  ...rest
}: StarLoadingProps) {
  const [grownCarrots, setGrownCarrots] = useState(initialState)
  const previousActive = useRef(active)
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : DEFAULT_GROW_SPEED

  useEffect(() => {
    if (active && !previousActive.current) {
      setGrownCarrots(initialState)
    }

    previousActive.current = active
  }, [active])

  useEffect(() => {
    if (!active) return

    const timer = window.setTimeout(() => {
      setGrownCarrots((current) => (current >= CARROT_COUNT ? initialState : current + 1))
    }, safeSpeed)

    return () => window.clearTimeout(timer)
  }, [active, grownCarrots, safeSpeed])

  // Trailing-dot trail. Both the ASCII run and the typographic ellipsis are
  // stripped first: the English string ends in `…`, which is not matched by a
  // plain-dot pattern and would leave the trail glued to a permanent ellipsis.
  const copy = useComponentCopy()
  const resolvedText = text === undefined ? copy.t('ui.loading.default') : text
  const displayedText =
    resolvedText && active
      ? `${resolvedText.replace(/[.…]+$/, '')}${'.'.repeat(grownCarrots % 4)}`
      : resolvedText
  const isAriaHidden = rest['aria-hidden'] === true || rest['aria-hidden'] === 'true'
  // Same escape hatch as Avatar: a preset name, or a caller-supplied diameter.
  const sizePx = typeof size === 'number' ? size : LOADING_SIZES[size]
  const rootStyle = useMemo(
    () =>
      ({
        ...style,
        '--star-loading-size': `${sizePx}px`,
        '--star-loading-gap': `${gap}px`,
      }) as CSSProperties,
    [gap, sizePx, style]
  )

  return (
    <div
      {...rest}
      className={classNames(
        styles.loading,
        center && styles['loading--center'],
        block && styles['loading--block'],
        fill && styles['loading--fill'],
        className
      )}
      style={rootStyle}
      role={isAriaHidden ? undefined : role ?? 'status'}
      aria-label={isAriaHidden ? undefined : displayedText || copy.t('ui.loading.loading')}
      data-active={active || undefined}
      data-phase={grownCarrots === CARROT_COUNT ? 'complete' : 'growing'}
    >
      <div className={styles['loading__garden']} aria-hidden>
        <img className={styles['loading__sprinkler']} src={qualitySprinkler} alt="" />
        {Array.from({ length: CARROT_COUNT }, (_, index) => {
          const grown = index < grownCarrots
          const angle = (index / CARROT_COUNT) * Math.PI * 2

          return (
            <span
              key={index}
              className={styles['loading__carrot']}
              data-grown={grown || undefined}
              style={
                {
                  '--star-loading-carrot-x': Math.sin(angle).toFixed(4),
                  '--star-loading-carrot-y': (-Math.cos(angle)).toFixed(4),
                } as CSSProperties
              }
            >
              <img src={grown ? carrotStage4 : carrotStage2} alt="" />
            </span>
          )
        })}
      </div>
      {displayedText ? <span className={styles['loading__text']}>{displayedText}</span> : null}
    </div>
  )
}

export { StarLoading }
export default StarLoading
