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
  bgColor = '#4b9df2',
  textColor = '#ffffff',
  borderColor = '#3c3c3c',
  shadowColor = '#236ca9',
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
