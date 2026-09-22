import { type ButtonHTMLAttributes, type CSSProperties, type MouseEvent } from 'react'
import { classNames } from '../../utils/classNames'
import { deriveProgressPalette } from '../../utils/progressPalette'
import styles from './Switch.module.scss'

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Controlled on/off value. */
  checked?: boolean
  /** Called with the value the switch is moving to. */
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  /** Visible colour of the active marker. Its bevel colours are derived from it. */
  color?: string
}

const SWITCH_SIZES = {
  small: { trackWidth: 46, trackHeight: 26, thumbSize: 18, frameWidth: 3, notch: 3 },
  medium: { trackWidth: 58, trackHeight: 32, thumbSize: 22, frameWidth: 4, notch: 4 },
  large: { trackWidth: 70, trackHeight: 38, thumbSize: 28, frameWidth: 4, notch: 5 },
} as const

/** A muted crop-green rather than a generic green makes the switch read as a farm control. */
const DEFAULT_ON_COLOR = '#71964A'

type SwitchCssVariables = CSSProperties & {
  '--switch-track-width': string
  '--switch-track-height': string
  '--switch-thumb-size': string
  '--switch-frame-width': string
  '--switch-notch': string
  '--switch-on-color': string
  '--switch-fill': string
  '--switch-border': string
  '--switch-shadow': string
  '--switch-highlight': string
  '--switch-empty': string
  '--switch-thumb-translate': string
}

/**
 * A compact, framed setting switch. The track is a warm wooden housing inspired
 * by the divider fence; its moving marker uses the same cut-corner, shadow, and
 * highlight layering as a filled progress cell.
 */
function StarSwitch({
  checked = false,
  onChange,
  disabled = false,
  size = 'medium',
  color = DEFAULT_ON_COLOR,
  className,
  style,
  onClick,
  ...rest
}: SwitchProps) {
  const { trackWidth, trackHeight, thumbSize, frameWidth, notch } = SWITCH_SIZES[size]
  const palette = deriveProgressPalette(color)
  // Keep valid CSS colour values usable for the visible fill. Hex colours also
  // receive a matched palette from Progress; other CSS values fall back to the
  // stable farm-material frame colours rather than being discarded.
  const visibleColor = typeof color === 'string' && color.trim() ? color.trim() : DEFAULT_ON_COLOR
  const thumbTranslate = trackWidth - thumbSize - frameWidth * 2 - 4

  const switchStyle: SwitchCssVariables = {
    '--switch-track-width': `${trackWidth}px`,
    '--switch-track-height': `${trackHeight}px`,
    '--switch-thumb-size': `${thumbSize}px`,
    '--switch-frame-width': `${frameWidth}px`,
    '--switch-notch': `${notch}px`,
    '--switch-on-color': visibleColor,
    '--switch-fill': visibleColor,
    '--switch-border': palette.border,
    '--switch-shadow': palette.shadow,
    '--switch-highlight': palette.highlight,
    '--switch-empty': palette.empty,
    '--switch-thumb-translate': checked ? `${thumbTranslate}px` : '0px',
    ...style,
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented && !disabled) onChange?.(!checked)
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
      <span className={styles['stardew-switch__track']} aria-hidden>
        <span className={styles['stardew-switch__rail']} />
        <span className={classNames(styles['stardew-switch__rail'], styles['stardew-switch__rail--lower'])} />
        <span className={styles['stardew-switch__thumb']} aria-hidden>
          <span className={styles['stardew-switch__thumb-surface']} />
          <span className={styles['stardew-switch__thumb-highlight']} />
        </span>
      </span>
    </button>
  )
}

export { StarSwitch }
export default StarSwitch
