import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './GapBorder.module.scss'

export interface StarGapBorderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  borderColor?: string
  backgroundColor?: string
  borderThickness?: number
  cornerGap?: number
  contentPadding?: number
  contentClassName?: string
}

function StarGapBorder({
  children,
  borderColor = '#5f4322',
  backgroundColor = '#f7efc5',
  borderThickness = 8,
  cornerGap = 8,
  contentPadding = 24,
  contentClassName,
  className,
  style,
  ...rest
}: StarGapBorderProps) {
  const componentStyle = {
    ...style,
    '--gap-border-color': borderColor,
    '--gap-border-background': backgroundColor,
    '--gap-border-thickness': `${borderThickness}px`,
    '--gap-border-corner-gap': `${cornerGap}px`,
    '--gap-border-content-padding': `${contentPadding}px`,
  } as CSSProperties

  return (
    <div {...rest} className={classNames(styles['gap-border'], className)} style={componentStyle}>
      <span className={classNames(styles['gap-border__edge'], styles['gap-border__edge--top'])} aria-hidden />
      <span className={classNames(styles['gap-border__edge'], styles['gap-border__edge--right'])} aria-hidden />
      <span className={classNames(styles['gap-border__edge'], styles['gap-border__edge--bottom'])} aria-hidden />
      <span className={classNames(styles['gap-border__edge'], styles['gap-border__edge--left'])} aria-hidden />
      <div className={styles['gap-border__surface']}>
        <div className={classNames(styles['gap-border__content'], contentClassName)}>{children}</div>
      </div>
    </div>
  )
}

export default StarGapBorder
