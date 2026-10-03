import { useState, type ButtonHTMLAttributes, type CSSProperties, type MouseEvent } from 'react'
import { classNames } from '../../utils/classNames'
import { deriveProgressPaletteWithWarning } from '../../utils/progressPalette'
import { isSupportedPaletteColor } from '../../utils/devWarnings'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Switch.module.scss'

export interface StarSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /**
   * Controlled on/off value. Leave it out to let the switch own its state, in
   * which case `defaultChecked` decides the starting position.
   */
  checked?: boolean
  /**
   * Starting position for the uncontrolled mode. Ignored once `checked` is
   * provided.
   *
   * This prop is why `<StarSwitch />` works on its own. Without it the switch
   * was controlled-only, so a bare `<StarSwitch />` — or one without an
   * `onChange` — accepted clicks silently changed nothing, which reads as a
   * broken component rather than as a controlled-input contract. Every other
   * input in this library (Input, Textarea, Checkbox, Radio, Select, Rating)
   * has always offered this pair.
   */
  defaultChecked?: boolean
  /** Called with the value the switch is moving to. */
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  /** Colour the slot lights up with while checked. Its edge tint is derived from it. */
  color?: string
  /**
   * Form field name. When set, the switch also writes a hidden input so
   * `new FormData(form)` receives `'true'` / `'false'`.
   *
   * Note this is a different contract from a native checkbox, which submits
   * only when checked. The switch is a two-state control rather than a
   * checkable one, so it always submits — pass `name` only when that is what
   * the server expects.
   */
  name?: string
  /** Submitted as `'required'` by the browser's own validation. */
  required?: boolean
}

/**
 * Kept because `SwitchProps` shipped in the first public release. Prefer
 * `StarSwitchProps`, which matches the naming of every other component here.
 */
export type SwitchProps = StarSwitchProps

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
/**
 * The thumb slides in discrete jumps to stay on the pixel grid, so each frame
 * must advance a whole number of pixels. Two is the grid the whole library
 * draws on; anything finer produces a sub-pixel smear that reads as a
 * rendering fault rather than as stepped motion.
 */
const SWITCH_TRAVEL_STEP_PX = 2

/** Full left-to-right distance the thumb covers inside the slot. */
function thumbTravel(trackWidth: number, thumbSize: number) {
  return trackWidth - thumbSize - (FRAME_WIDTH + THUMB_GUTTER) * 2
}

type SwitchCssVariables = CSSProperties & {
  '--switch-thumb-translate': string
  '--switch-travel-steps': string
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
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = 'medium',
  color = DEFAULT_ON_COLOR,
  className,
  style,
  onClick,
  name,
  required = false,
  ...rest
}: StarSwitchProps) {
  // Same controlled/uncontrolled shape as Checkbox and the rest of the input
  // family: `value ?? internal` resolves the visible state, and the click
  // handler writes to the internal store *only* when uncontrolled.
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isControlled = checked !== undefined
  const currentChecked = isControlled ? checked : internalChecked

  const { trackWidth, thumbSize } = SWITCH_SIZES[size]

  // `color` has two jobs here and they need different tolerances. The *fill* of
  // the lit slot is a plain CSS custom property, so any colour the browser
  // understands will render. The *edge tint* is derived by mixing channels, which
  // only works from a hex value. The switch used to accept anything for the fill
  // while the edge silently took the default palette, producing a fill/edge
  // mismatch that was harder to diagnose than either behaviour alone.
  //
  // So: pass the fill through as-is, warn only when the derived edge would be
  // wrong, and say so in the message rather than making the caller guess which
  // half of the switch is broken.
  const palette = deriveProgressPaletteWithWarning(color, 'Switch', () => true)
  const visibleColor = typeof color === 'string' && color.trim() ? color.trim() : DEFAULT_ON_COLOR
  if (typeof color === 'string' && color.trim() && !isSupportedPaletteColor(color)) {
    console.warn(
      `[stardew-ui] <Switch color="${color.trim()}"> renders the slot in that colour, but its ` +
        `edge tint is derived by mixing channels and needs a hex value, so the edge fell back to ` +
        `the default. Pass a hex colour such as "#71964A" to get a matched edge.`,
    )
  }
  const travel = thumbTravel(trackWidth, thumbSize)

  const switchStyle: SwitchCssVariables = {
    '--switch-thumb-translate': `${currentChecked ? travel : 0}px`,
    // The stylesheet steps the slide by this many jumps, so it must be derived
    // from the same geometry or the last frame lands between pixels.
    '--switch-travel-steps': String(Math.max(1, Math.round(travel / SWITCH_TRAVEL_STEP_PX))),
    '--switch-on-color': visibleColor,
    '--switch-on-edge': palette.border,
    '--switch-clip': SWITCH_CLIP_PATH,
    '--switch-thumb-clip': SWITCH_THUMB_CLIP_PATH,
    ...style,
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || disabled) return

    const next = !currentChecked
    if (!isControlled) setInternalChecked(next)
    onChange?.(next)
  }

  return (
    <button
      {...rest}
      type="button"
      role="switch"
      aria-checked={currentChecked}
      disabled={disabled}
      className={classNames(
        styles['star-switch'],
        styles[`star-switch--${size}`],
        currentChecked && styles['star-switch--checked'],
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
      {/* Form participation. The switch is a `<button>`, and a button's content
          model excludes *interactive* descendants — `input[type="hidden"]` is
          explicitly not interactive, so this is valid nesting and avoids
          wrapping the root element in an extra node (which would change the
          public DOM shape and every existing test selector).
          Without it, `<StarSwitch name="x" />` contributes nothing to
          `new FormData(form)`: the value silently never arrives on submit.
          `aria-hidden` because the button already carries `role="switch"`;
          a second live control would make a screen reader announce it twice. */}
      {name ? (
        <input
          type="hidden"
          name={name}
          value={currentChecked ? 'true' : 'false'}
          // `required` lives here rather than on the button: `<button>` has no
          // such attribute, and this is the element the browser actually
          // validates. A hidden input is barred from constraint validation, so
          // the flag is accepted for symmetry with the other inputs and
          // documented as decorative.
          required={required}
          aria-hidden
        />
      ) : null}
    </button>
  )
}

export { StarSwitch }
export default StarSwitch
