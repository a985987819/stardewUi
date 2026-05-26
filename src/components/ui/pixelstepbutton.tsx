import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './PixelStepButton.module.scss'

export interface PixelStepButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  color?: string
  size?: 'small' | 'medium' | 'large'
  steps?: number
  loading?: boolean
  block?: boolean
}

type CornerName = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'

interface CornerStep {
  key: string
  style: CSSProperties
}

function getCornerStepCount(level: number): number {
  if (level <= 0) return 0
  return level * 2 - 1
}

function createCornerSteps(
  level: number,
  stepSize: number,
  cornerGap: number
): CornerStep[] {
  if (level <= 0) return []

  const stepCount = getCornerStepCount(level)
  const horizontalInset = cornerGap + stepCount * stepSize
  const corners: CornerName[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left']

  return corners.flatMap((corner) =>
    Array.from({ length: stepCount }, (_, index) => {
      const offsetX = horizontalInset - stepSize * (index + 1)
      const offsetY = cornerGap + stepSize * index

      const pos =
        corner === 'top-left'
          ? { left: offsetX, top: offsetY }
          : corner === 'top-right'
            ? { right: offsetX, top: offsetY }
            : corner === 'bottom-right'
              ? { right: offsetX, bottom: offsetY }
              : { left: offsetX, bottom: offsetY }

      return {
        key: `${corner}-${index}`,
        style: { ...pos, width: stepSize, height: stepSize },
      } satisfies CornerStep
    })
  )
}

function createSurfaceClipPath(
  level: number,
  stepSize: number,
  cornerGap: number
): string {
  const stepCount = getCornerStepCount(level)
  const cutInset = cornerGap + stepCount * stepSize
  const points: string[] = []

  points.push(`${cutInset}px 0`)
  points.push(`calc(100% - ${cutInset}px) 0`)

  for (let i = 0; i < stepCount; i += 1) {
    const x = cutInset - stepSize * i
    const nextX = cutInset - stepSize * (i + 1)
    const y = stepSize * (i + 1)
    points.push(`calc(100% - ${x}px) ${y}px`)
    points.push(`calc(100% - ${nextX}px) ${y}px`)
  }

  points.push(`100% calc(100% - ${cutInset}px)`)

  for (let i = 0; i < stepCount; i += 1) {
    const x = stepSize * (i + 1)
    const y = cutInset - stepSize * i
    const nextY = cutInset - stepSize * (i + 1)
    points.push(`calc(100% - ${x}px) calc(100% - ${y}px)`)
    points.push(`calc(100% - ${x}px) calc(100% - ${nextY}px)`)
  }

  points.push(`${cutInset}px 100%`)

  for (let i = 0; i < stepCount; i += 1) {
    const x = cutInset - stepSize * i
    const nextX = cutInset - stepSize * (i + 1)
    const y = stepSize * (i + 1)
    points.push(`${x}px calc(100% - ${y}px)`)
    points.push(`${nextX}px calc(100% - ${y}px)`)
  }

  points.push(`0 ${cutInset}px`)

  for (let i = 0; i < stepCount; i += 1) {
    const x = stepSize * (i + 1)
    const y = cutInset - stepSize * i
    const nextY = cutInset - stepSize * (i + 1)
    points.push(`${x}px ${y}px`)
    points.push(`${x}px ${nextY}px`)
  }

  return `polygon(${points.join(', ')})`
}

const SIZE_CONFIG = {
  small: { stepSize: 6, borderThickness: 4, cornerGap: 2, fontSize: 13, minH: 32, px: 14, py: 5 },
  medium: { stepSize: 8, borderThickness: 5, cornerGap: 3, fontSize: 15, minH: 40, px: 20, py: 7 },
  large: { stepSize: 10, borderThickness: 6, cornerGap: 4, fontSize: 17, minH: 48, px: 26, py: 9 },
} as const

function PixelStepButton({
  children,
  color,
  size = 'medium',
  steps = 1,
  loading = false,
  block = false,
  disabled,
  className,
  style,
  ...rest
}: PixelStepButtonProps) {
  const isDisabled = disabled || loading
  const cfg = SIZE_CONFIG[size]
  const level = Math.max(1, Math.round(steps))
  const stepCount = getCornerStepCount(level)
  const cornerSteps = createCornerSteps(level, cfg.stepSize, cfg.cornerGap)
  const surfaceClipPath = createSurfaceClipPath(level, cfg.stepSize, cfg.cornerGap)
  const horizontalInset = cfg.cornerGap + stepCount * cfg.stepSize

  const buttonStyle = {
    ...style,
    '--ps-btn-color': color ?? '#7a5c3a',
    '--ps-btn-border-thickness': `${cfg.borderThickness}px`,
    '--ps-btn-horizontal-inset': `${horizontalInset}px`,
    '--ps-btn-vertical-inset': `${horizontalInset}px`,
    '--ps-btn-surface-clip': surfaceClipPath,
    '--ps-btn-font-size': `${cfg.fontSize}px`,
    '--ps-btn-min-h': `${cfg.minH}px`,
    '--ps-btn-px': `${cfg.px}px`,
    '--ps-btn-py': `${cfg.py}px`,
  } as CSSProperties

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classNames(
        styles['ps-btn'],
        isDisabled && styles['ps-btn--disabled'],
        loading && styles['ps-btn--loading'],
        block && styles['ps-btn--block'],
        className
      )}
      style={buttonStyle}
      {...rest}
    >
      <span className={styles['ps-btn__edge']} data-edge="top" aria-hidden />
      <span className={styles['ps-btn__edge']} data-edge="right" aria-hidden />
      <span className={styles['ps-btn__edge']} data-edge="bottom" aria-hidden />
      <span className={styles['ps-btn__edge']} data-edge="left" aria-hidden />
      {cornerSteps.map(({ key, style: stepStyle }) => (
        <span key={key} className={styles['ps-btn__step']} style={stepStyle} aria-hidden />
      ))}
      <span className={styles['ps-btn__surface']} aria-hidden />
      <span className={styles['ps-btn__highlight']} aria-hidden />
      <span className={styles['ps-btn__content']}>
        {loading ? (
          <span className={styles['ps-btn__spinner']} aria-hidden>
            <span className={styles['ps-btn__spinner-dot']} />
            <span className={styles['ps-btn__spinner-dot']} />
            <span className={styles['ps-btn__spinner-dot']} />
          </span>
        ) : null}
        <span className={styles['ps-btn__label']}>{children}</span>
      </span>
    </button>
  )
}

export { PixelStepButton }
export default PixelStepButton
