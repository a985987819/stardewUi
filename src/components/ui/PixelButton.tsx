import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './PixelButton.module.scss'

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  bgColor?: string
  textColor?: string
  borderColor?: string
  shadowColor?: string
}

function PixelButton({
  children,
  bgColor = '#e2d3b8',
  textColor = '#4a2c1a',
  borderColor = '#a38a6b',
  shadowColor = '#b49c7e',
  className = '',
  ...rest
}: PixelButtonProps) {
  const buttonStyle = {
    '--button-custom-bg': bgColor,
    '--button-custom-text': textColor,
    '--button-custom-border': borderColor,
    '--button-custom-shadow': shadowColor,
  } as React.CSSProperties

  return (
    <button
      type="button"
      className={classNames(styles['pixel-button'], className)}
      style={buttonStyle}
      {...rest}
    >
      {children}
    </button>
  )
}

export { PixelButton }
export default PixelButton
