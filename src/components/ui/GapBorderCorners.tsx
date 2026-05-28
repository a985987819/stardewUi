import { type CSSProperties, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import { createGapBorderCorners } from './gapBorderCornersUtils'
import styles from './GapBorderCorners.module.scss'

export interface StarGapBorderCornersProps extends HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3
  borderColor?: string
  backgroundColor?: string
  borderThickness?: number
  cornerGap?: number
}

export function StarGapBorderCorners({
  level = 1,
  borderColor,
  backgroundColor,
  borderThickness,
  cornerGap,
  className,
  style,
  ...rest
}: StarGapBorderCornersProps) {
  const { cornerSteps, cssVariables } = createGapBorderCorners({
    level,
    borderColor,
    backgroundColor,
    borderThickness,
    cornerGap,
  })

  const mergedStyle = {
    ...cssVariables,
    ...style,
  } as CSSProperties

  return (
    <div {...rest} className={classNames(styles['gap-border-corners'], className)} style={mergedStyle}>
      {cornerSteps.map(({ key, style: stepStyle }) => (
        <span key={key} className={styles['gap-border-corners__step']} style={stepStyle} aria-hidden />
      ))}
      <div className={styles['gap-border-corners__surface']} aria-hidden />
    </div>
  )
}
