import { useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import carrotStage2 from '../../assets/Carrot_Stage_2.png'
import carrotStage4 from '../../assets/Carrot_Stage_4.png'
import qualitySprinkler from '../../assets/Quality_Sprinkler.png'
import { classNames } from '../../utils/classNames'
import styles from './Loading.module.scss'

export interface StarLoadingProps extends HTMLAttributes<HTMLDivElement> {
  /** Stops the loop in its current state. Resuming starts a fresh crop. */
  active?: boolean
  text?: string
  /** Diameter, in pixels, of the complete sprinkler-and-carrot garden. */
  size?: number
  /** Milliseconds between each carrot growth step. Lower values run faster. Defaults to 600. */
  speed?: number
  gap?: number
  center?: boolean
  block?: boolean
  fill?: boolean
}

const LOADING_DEFAULT_TEXT = '正在加载...'
const CARROT_COUNT = 8
// One full eight-carrot cycle lands at 4.8s: fast enough to read as "working",
// slow enough to keep the trailing dots from flickering.
const DEFAULT_GROW_SPEED = 600

const initialState = 0

function StarLoading({
  active = true,
  text,
  size = 144,
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

  const resolvedText = text === undefined ? LOADING_DEFAULT_TEXT : text
  const displayedText =
    resolvedText && active
      ? `${resolvedText.replace(/\.+$/, '')}${'.'.repeat(grownCarrots % 4)}`
      : resolvedText
  const isAriaHidden = rest['aria-hidden'] === true || rest['aria-hidden'] === 'true'
  const rootStyle = useMemo(
    () =>
      ({
        ...style,
        '--star-loading-size': `${size}px`,
        '--star-loading-gap': `${gap}px`,
      }) as CSSProperties,
    [gap, size, style]
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
      aria-label={isAriaHidden ? undefined : displayedText || LOADING_DEFAULT_TEXT}
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
