import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './GapBorder.module.scss'

export interface StarGapBorderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  borderColor?: string
  backgroundColor?: string
  borderThickness?: number
  cornerGap?: number
  cornerLevel?: 1 | 2 | 3
  contentPadding?: number
  contentClassName?: string
}

type CornerName = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'

interface CornerStep {
  key: string
  style: CSSProperties
}

function getCornerStepCount(level: number): number {
  if (level <= 0) {
    return 0
  }

  return level * 2 - 1
}

function createCornerSteps(level: number, stepSize: number, horizontalInset: number, stepStartOffset: number): CornerStep[] {
  if (level <= 0) {
    return []
  }

  const stepCount = getCornerStepCount(level)
  const corners: CornerName[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left']

  return corners.flatMap((corner) =>
    Array.from({ length: stepCount }, (_, index) => {
      const offsetX = horizontalInset - stepSize * (index + 1)
      const offsetY = stepStartOffset + stepSize * index

      const style =
        corner === 'top-left'
          ? { left: offsetX, top: offsetY }
          : corner === 'top-right'
            ? { right: offsetX, top: offsetY }
            : corner === 'bottom-right'
              ? { right: offsetX, bottom: offsetY }
              : { left: offsetX, bottom: offsetY }

      return {
        key: `${corner}-${index}`,
        style,
      } satisfies CornerStep
    })
  )
}

function createSurfaceClipPath(
  level: number,
  stepSize: number,
  horizontalInset: number,
  sideEdgeInset: number,
  cornerGap: number
): string {
  if (level <= 0) {
    return `polygon(${cornerGap}px 0, calc(100% - ${cornerGap}px) 0, 100% ${cornerGap}px, 100% calc(100% - ${cornerGap}px), calc(100% - ${cornerGap}px) 100%, ${cornerGap}px 100%, 0 calc(100% - ${cornerGap}px), 0 ${cornerGap}px)`
  }

  const stepCount = getCornerStepCount(level)
  const cutInset = Math.min(horizontalInset - stepSize, sideEdgeInset - stepSize)
  const points: string[] = []

  points.push(`${cutInset}px 0`)
  points.push(`calc(100% - ${cutInset}px) 0`)

  for (let index = 0; index < stepCount; index += 1) {
    const x = cutInset - stepSize * index
    const nextX = cutInset - stepSize * (index + 1)
    const y = stepSize * (index + 1)
    points.push(`calc(100% - ${x}px) ${y}px`)
    points.push(`calc(100% - ${nextX}px) ${y}px`)
  }

  points.push(`100% calc(100% - ${cutInset}px)`)

  for (let index = 0; index < stepCount; index += 1) {
    const x = stepSize * (index + 1)
    const y = cutInset - stepSize * index
    const nextY = cutInset - stepSize * (index + 1)
    points.push(`calc(100% - ${x}px) calc(100% - ${y}px)`)
    points.push(`calc(100% - ${x}px) calc(100% - ${nextY}px)`)
  }

  points.push(`${cutInset}px 100%`)

  for (let index = 0; index < stepCount; index += 1) {
    const x = cutInset - stepSize * index
    const nextX = cutInset - stepSize * (index + 1)
    const y = stepSize * (index + 1)
    points.push(`${x}px calc(100% - ${y}px)`)
    points.push(`${nextX}px calc(100% - ${y}px)`)
  }

  points.push(`0 ${cutInset}px`)

  for (let index = 0; index < stepCount; index += 1) {
    const x = stepSize * (index + 1)
    const y = cutInset - stepSize * index
    const nextY = cutInset - stepSize * (index + 1)
    points.push(`${x}px ${y}px`)
    points.push(`${x}px ${nextY}px`)
  }

  return `polygon(${points.join(', ')})`
}

function StarGapBorder({
  children,
  borderColor = '#5f4322',
  backgroundColor = '#f7efc5',
  borderThickness = 8,
  cornerGap = 8,
  cornerLevel,
  contentPadding = 24,
  contentClassName,
  className,
  style,
  ...rest
}: StarGapBorderProps) {
  const resolvedCornerLevel = cornerLevel ?? 0
  const stepCount = getCornerStepCount(resolvedCornerLevel)
  const horizontalInset = cornerGap + stepCount * borderThickness
  const stepStartOffset = cornerGap
  const sideEdgeInset = cornerGap + stepCount * borderThickness
  const cornerSteps = createCornerSteps(resolvedCornerLevel, borderThickness, horizontalInset, stepStartOffset)
  const surfaceClipPath = createSurfaceClipPath(
    resolvedCornerLevel,
    borderThickness,
    horizontalInset,
    sideEdgeInset,
    cornerGap
  )

  const componentStyle = {
    ...style,
    '--gap-border-color': borderColor,
    '--gap-border-background': backgroundColor,
    '--gap-border-thickness': `${borderThickness}px`,
    '--gap-border-horizontal-inset': `${horizontalInset}px`,
    '--gap-border-vertical-inset': `${sideEdgeInset}px`,
    '--gap-border-content-padding': `${contentPadding}px`,
    '--gap-border-surface-clip-path': surfaceClipPath,
  } as CSSProperties

  return (
    <div {...rest} className={classNames(styles['gap-border'], className)} style={componentStyle}>
      <span className={classNames(styles['gap-border__edge'], styles['gap-border__edge--top'])} aria-hidden />
      <span className={classNames(styles['gap-border__edge'], styles['gap-border__edge--right'])} aria-hidden />
      <span className={classNames(styles['gap-border__edge'], styles['gap-border__edge--bottom'])} aria-hidden />
      <span className={classNames(styles['gap-border__edge'], styles['gap-border__edge--left'])} aria-hidden />
      {cornerSteps.map(({ key, style: stepStyle }) => (
        <span key={key} className={styles['gap-border__step']} style={stepStyle} aria-hidden />
      ))}
      <div className={styles['gap-border__surface']} aria-hidden />
      <div className={classNames(styles['gap-border__content'], contentClassName)}>{children}</div>
    </div>
  )
}

export default StarGapBorder
