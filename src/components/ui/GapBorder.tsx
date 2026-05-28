import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { createGapBorderCorners } from './gapBorderCornersUtils'
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
  const { cornerSteps, cssVariables } = createGapBorderCorners({
    level: resolvedCornerLevel,
    borderColor,
    backgroundColor,
    borderThickness,
    cornerGap,
  })

  const componentStyle = {
    ...cssVariables,
    ...style,
    '--gap-border-content-padding': `${contentPadding}px`,
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
