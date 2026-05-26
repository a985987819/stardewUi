import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import {
  createStepButtonPalette,
  type StepButtonPalette,
} from '../../utils/stepButtonTheme'
import styles from './StarStepBtn.module.scss'

export type StepBtnTheme = 'spring' | 'summer' | 'autumn' | 'winter'

export interface StarStepBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  color?: string
  theme?: StepBtnTheme
  size?: 'small' | 'medium' | 'large'
  steps?: number
  loading?: boolean
  block?: boolean
  icon?: ReactNode
  disabled?: boolean
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
  small: { stepSize: 5, borderThickness: 3, cornerGap: 2, fontSize: 13, minH: 30, px: 12, py: 4 },
  medium: { stepSize: 6, borderThickness: 4, cornerGap: 2, fontSize: 15, minH: 38, px: 18, py: 6 },
  large: { stepSize: 7, borderThickness: 5, cornerGap: 3, fontSize: 17, minH: 46, px: 24, py: 8 },
} as const

function computeMinHeight(level: number, cfg: typeof SIZE_CONFIG.medium): number {
  const stepCount = getCornerStepCount(level)
  const cutInset = cfg.cornerGap + stepCount * cfg.stepSize
  const needed = (cutInset + cfg.borderThickness) * 2
  return Math.max(cfg.minH, needed)
}

function StarStepBtn({
  children,
  color,
  theme,
  size = 'medium',
  steps = 1,
  loading = false,
  block = false,
  icon,
  disabled,
  className,
  style,
  ...rest
}: StarStepBtnProps) {
  const isDisabled = disabled || loading
  const hasIcon = icon !== undefined && icon !== null
  const level = Math.max(1, Math.round(steps))
  const cfg = SIZE_CONFIG[size]
  const stepCount = getCornerStepCount(level)
  const dynamicMinH = computeMinHeight(level, cfg)
  const cornerSteps = createCornerSteps(level, cfg.stepSize, cfg.cornerGap)
  const surfaceClipPath = createSurfaceClipPath(level, cfg.stepSize, cfg.cornerGap)
  const horizontalInset = cfg.cornerGap + stepCount * cfg.stepSize

  const palette: StepButtonPalette = createStepButtonPalette(color, theme)

  const buttonStyle = {
    ...style,
    '--sb-fill': palette.fill,
    '--sb-fill-hover': palette.fillHover,
    '--sb-fill-active': palette.fillActive,
    '--sb-border': palette.border,
    '--sb-text': palette.text,
    '--sb-text-shadow': palette.textShadow,
    '--sb-border-thickness': `${cfg.borderThickness}px`,
    '--sb-h-inset': `${horizontalInset}px`,
    '--sb-v-inset': `${horizontalInset}px`,
    '--sb-surface-clip': surfaceClipPath,
    '--sb-font-size': `${cfg.fontSize}px`,
    '--sb-min-h': `${dynamicMinH}px`,
    '--sb-px': `${cfg.px}px`,
    '--sb-py': `${cfg.py}px`,
  } as CSSProperties

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classNames(
        styles['sb'],
        isDisabled && styles['sb--disabled'],
        loading && styles['sb--loading'],
        block && styles['sb--block'],
        hasIcon && styles['sb--icon'],
        className
      )}
      style={buttonStyle}
      {...rest}
    >
      <span className={styles['sb__edge']} data-edge="top" aria-hidden />
      <span className={styles['sb__edge']} data-edge="right" aria-hidden />
      <span className={styles['sb__edge']} data-edge="bottom" aria-hidden />
      <span className={styles['sb__edge']} data-edge="left" aria-hidden />
      {cornerSteps.map(({ key, style: stepStyle }) => (
        <span key={key} className={styles['sb__step']} style={stepStyle} aria-hidden />
      ))}
      <span className={styles['sb__surface']} aria-hidden />
      <span className={styles['sb__content']}>
        {loading ? (
          <span className={styles['sb__spinner']} aria-hidden>
            <span className={styles['sb__spinner-dot']} />
            <span className={styles['sb__spinner-dot']} />
            <span className={styles['sb__spinner-dot']} />
          </span>
        ) : null}
        {hasIcon ? <span className={styles['sb__icon']} aria-hidden>{icon}</span> : null}
        {children !== undefined && children !== null ? (
          <span className={styles['sb__label']}>{children}</span>
        ) : null}
      </span>
    </button>
  )
}

export { StarStepBtn }
export default StarStepBtn
