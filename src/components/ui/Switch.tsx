import { type ButtonHTMLAttributes, type CSSProperties, type MouseEvent } from 'react'
import { classNames } from '../../utils/classNames'
import { deriveProgressPalette } from '../../utils/progressPalette'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Switch.module.scss'

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Controlled on/off value. */
  checked?: boolean
  /** Called with the value the switch is moving to. */
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  /** Colour the slot lights up with while checked. Its edge tint is derived from it. */
  color?: string
}

const SWITCH_SIZES = {
  small: { trackWidth: 46, trackHeight: 26, thumbSize: 18 },
  medium: { trackWidth: 58, trackHeight: 32, thumbSize: 22 },
  large: { trackWidth: 70, trackHeight: 38, thumbSize: 28 },
} as const

/** A muted crop-green rather than a generic green makes the switch read as a farm control. */
const DEFAULT_ON_COLOR = '#71964A'

/**
 * Corner staircases share `pixelCorners` with Input/Tag: the housing uses the
 * control-scale 2×3px steps, the thumb a slightly finer 2×2px so the smaller
 * block still reads two clear steps per corner.
 */
const SWITCH_CORNER_STEPS = 2
const SWITCH_CORNER_STEP = 3
const SWITCH_THUMB_CORNER_STEP = 2

const SWITCH_CLIP_PATH = createSteppedRectClipPath(SWITCH_CORNER_STEPS, SWITCH_CORNER_STEP)
const SWITCH_THUMB_CLIP_PATH = createSteppedRectClipPath(SWITCH_CORNER_STEPS, SWITCH_THUMB_CORNER_STEP)

/** Horizontal room around the thumb inside the housing, per side. */
const THUMB_GUTTER = 4
/** Frame ring width shared with the stylesheet's size blocks. */
const FRAME_WIDTH = 3

type SwitchCssVariables = CSSProperties & {
  '--switch-thumb-translate': string
  '--switch-on-color': string
  '--switch-on-edge': string
  '--switch-clip': string
  '--switch-thumb-clip': string
}

/**
 * A wooden switch panel in the Checkbox material family: a warm framed
 * housing carries a recessed slot that lights up with the checked colour,
 * while a parchment thumb with a lit top edge slides across in stepped
 * pixel motion. The centre dot echoes the slot colour like a latch keyhole.
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
  const { trackWidth, thumbSize } = SWITCH_SIZES[size]
  const palette = deriveProgressPalette(color)
  // Keep valid CSS colour values usable for the lit slot. Hex colours also
  // receive a matched palette from Progress; other CSS values fall back to the
  // stable farm-material colours rather than being discarded.
  const visibleColor = typeof color === 'string' && color.trim() ? color.trim() : DEFAULT_ON_COLOR
  const slotInset = FRAME_WIDTH + THUMB_GUTTER
  const thumbTranslate = checked ? trackWidth - thumbSize - slotInset * 2 : 0

  const switchStyle: SwitchCssVariables = {
    '--switch-thumb-translate': `${thumbTranslate}px`,
    '--switch-on-color': visibleColor,
    '--switch-on-edge': palette.border,
    '--switch-clip': SWITCH_CLIP_PATH,
    '--switch-thumb-clip': SWITCH_THUMB_CLIP_PATH,
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
        styles['star-switch'],
        styles[`star-switch--${size}`],
        checked && styles['star-switch--checked'],
        disabled && styles['star-switch--disabled'],
        className,
      )}
      style={switchStyle}
      onClick={handleClick}
    >
      <span className={styles['star-switch__track']} aria-hidden>
        {/* One `clip-path` can only cut one outline, so the frame ring and the
            housing fill are separate layers sharing the same staircase. */}
        <span className={styles['star-switch__plate']} />
        <span className={styles['star-switch__housing']} />
        <span className={styles['star-switch__slot']} />
        <span className={styles['star-switch__thumb']}>
          <span className={styles['star-switch__thumb-dot']} />
        </span>
      </span>
    </button>
  )
}

export { StarSwitch }
export default StarSwitch
