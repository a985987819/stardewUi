import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import {
  createBtnPalette,
  type BtnPalette,
  type BtnSeason,
  SEASON_PALETTES,
} from '../../utils/btnTheme'
import styles from './StarBtn.module.scss'

export type StarBtnTheme = BtnSeason
export type StarBtnSize = 'small' | 'medium' | 'large'

export interface StarBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  color?: string
  theme?: StarBtnTheme
  size?: StarBtnSize
  steps?: number
  loading?: boolean
  block?: boolean
  icon?: ReactNode
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

const SIZE_CONFIG = {
  small: { stepSize: 6, borderThickness: 4, cornerGap: 2, fontSize: 13, minH: 32, px: 14, py: 5 },
  medium: { stepSize: 8, borderThickness: 5, cornerGap: 3, fontSize: 15, minH: 40, px: 20, py: 7 },
  large: { stepSize: 10, borderThickness: 6, cornerGap: 4, fontSize: 17, minH: 48, px: 26, py: 9 },
} as const

function clampSteps(requestedSteps: number, size: StarBtnSize): number {
  const cfg = SIZE_CONFIG[size]
  const maxSteps = 2
  const maxBySize = Math.floor(cfg.minH / (cfg.stepSize * 2))
  return Math.max(1, Math.min(requestedSteps, maxSteps, maxBySize))
}

function StarBtn({
  children,
  color,
  theme,
  size = 'medium',
  steps: stepsProp = 1,
  loading = false,
  block = false,
  disabled,
  icon,
  className,
  style,
  ...rest
}: StarBtnProps) {
  const isDisabled = disabled || loading
  const hasIcon = icon !== undefined && icon !== null
  const level = clampSteps(stepsProp, size)
  const cfg = SIZE_CONFIG[size]
  const stepCount = getCornerStepCount(level)
  const cornerSteps = createCornerSteps(level, cfg.stepSize, cfg.cornerGap)
  const horizontalInset = cfg.cornerGap + stepCount * cfg.stepSize

  const palette: BtnPalette = theme
    ? SEASON_PALETTES[theme]
    : createBtnPalette(color)

  const buttonStyle = {
    ...style,
    '--btn-fill': palette.fill,
    '--btn-fill-hover': palette.fillHover,
    '--btn-fill-active': palette.fillActive,
    '--btn-border': palette.border,
    '--btn-text': palette.text,
    '--btn-text-hover': palette.textHover,
    '--btn-text-active': palette.textActive,
    '--btn-text-shadow': palette.textShadow,
    '--btn-highlight': palette.highlight,
    '--btn-border-thickness': `${cfg.borderThickness}px`,
    '--btn-horizontal-inset': `${horizontalInset}px`,
    '--btn-vertical-inset': `${horizontalInset}px`,
    '--btn-font-size': `${cfg.fontSize}px`,
    '--btn-min-h': `${cfg.minH}px`,
    '--btn-px': `${cfg.px}px`,
    '--btn-py': `${cfg.py}px`,
  } as CSSProperties

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classNames(
        styles['star-btn'],
        isDisabled && styles['star-btn--disabled'],
        loading && styles['star-btn--loading'],
        block && styles['star-btn--block'],
        hasIcon && styles['star-btn--icon'],
        className
      )}
      style={buttonStyle}
      {...rest}
    >
      <span className={styles['star-btn__edge']} data-edge="top" aria-hidden />
      <span className={styles['star-btn__edge']} data-edge="right" aria-hidden />
      <span className={styles['star-btn__edge']} data-edge="bottom" aria-hidden />
      <span className={styles['star-btn__edge']} data-edge="left" aria-hidden />
      {cornerSteps.map(({ key, style: stepStyle }) => (
        <span key={key} className={styles['star-btn__step']} style={stepStyle} aria-hidden />
      ))}
      <span className={styles['star-btn__fill']} aria-hidden />
      <span className={styles['star-btn__highlight']} aria-hidden />
      <span className={styles['star-btn__content']}>
        {loading ? (
          <span className={styles['star-btn__spinner']} aria-hidden>
            <span className={styles['star-btn__spinner-dot']} />
            <span className={styles['star-btn__spinner-dot']} />
            <span className={styles['star-btn__spinner-dot']} />
          </span>
        ) : null}
        {icon ? (
          <span className={styles['star-btn__icon']} aria-hidden>
            {icon}
          </span>
        ) : null}
        {children !== undefined && children !== null ? (
          <span className={styles['star-btn__label']}>{children}</span>
        ) : null}
      </span>
    </button>
  )
}

export { StarBtn }
export default StarBtn
