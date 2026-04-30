import { type ButtonHTMLAttributes, type CSSProperties } from 'react'
import { classNames } from '../../utils/classNames'
import { createPixelPillClip, createPixelCircleClip } from '../../utils/pixelShape'
import styles from './Switch.module.scss'

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  color?: string
}

const SWITCH_SIZES = {
  small: { trackWidth: 36, trackHeight: 20, thumbSize: 16 },
  medium: { trackWidth: 44, trackHeight: 24, thumbSize: 20 },
  large: { trackWidth: 52, trackHeight: 28, thumbSize: 24 },
} as const

const DEFAULT_ON_COLOR = '#4ade80'
const DEFAULT_OFF_COLOR = '#9ca3af'
const DEFAULT_THUMB_COLOR = '#ffffff'

type SwitchCssVariables = CSSProperties & {
  '--switch-track-width': string
  '--switch-track-height': string
  '--switch-thumb-size': string
  '--switch-track-clip': string
  '--switch-thumb-clip': string
  '--switch-on-color': string
  '--switch-off-color': string
  '--switch-thumb-color': string
  '--switch-thumb-translate': string
}

function StarSwitch({
  checked = false,
  onChange,
  disabled = false,
  size = 'medium',
  color = DEFAULT_ON_COLOR,
  className = '',
  style,
  ...rest
}: SwitchProps) {
  const { trackWidth, trackHeight, thumbSize } = SWITCH_SIZES[size]
  const trackClip = createPixelPillClip(trackWidth, trackHeight)
  const thumbClip = createPixelCircleClip(thumbSize)

  const thumbOffset = (trackHeight - thumbSize) / 2
  const thumbTranslate = checked ? trackWidth - thumbSize - thumbOffset * 2 : 0

  const switchStyle: SwitchCssVariables = {
    '--switch-track-width': `${trackWidth}px`,
    '--switch-track-height': `${trackHeight}px`,
    '--switch-thumb-size': `${thumbSize}px`,
    '--switch-track-clip': trackClip.clipPath,
    '--switch-thumb-clip': thumbClip.clipPath,
    '--switch-on-color': color,
    '--switch-off-color': DEFAULT_OFF_COLOR,
    '--switch-thumb-color': DEFAULT_THUMB_COLOR,
    '--switch-thumb-translate': `${thumbTranslate}px`,
    ...style,
  }

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <button
      {...rest}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={classNames(
        styles['stardew-switch'],
        styles[`stardew-switch--${size}`],
        checked && styles['stardew-switch--checked'],
        disabled && styles['stardew-switch--disabled'],
        className
      )}
      style={switchStyle}
      onClick={handleClick}
    >
      <span className={styles['stardew-switch__track']}>
        <span className={styles['stardew-switch__thumb']} />
      </span>
    </button>
  )
}

export { StarSwitch }
export default StarSwitch
