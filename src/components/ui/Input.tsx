import {
  useId,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { X } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Input.module.scss'

export type InputSize = 'small' | 'medium' | 'large'
export type InputStatus = 'default' | 'warning' | 'error' | 'success'

export interface StarInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'prefix' | 'value' | 'defaultValue'> {
  /** Controlled text. Leave undefined to let the field keep its own state. */
  value?: string
  /** Initial text for the uncontrolled field. */
  defaultValue?: string
  /**
   * Fires with the next text while typing, and with `''` when the clear button
   * is pressed. The DOM event is intentionally dropped — use `onInput` or
   * `onKeyDown` when you actually need it.
   */
  onChange?: (value: string) => void
  /** Called after the built-in clear button empties the field. */
  onClear?: () => void
  size?: InputSize
  /** Semantic tint for the frame and for the message below it. */
  status?: InputStatus
  /** Accent for focus, caret, and the clear button. Overrides `status`. */
  color?: string
  /** Visible caption, bound to the field through `htmlFor`. */
  label?: ReactNode
  /** Hint or validation copy rendered under the field. */
  message?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
  /** Shows a pixel × that empties the field. */
  allowClear?: boolean
  /** Shows the typed length, or `typed / maxLength` when `maxLength` is set. */
  showCount?: boolean
  /** Stretches the field to the container width. */
  block?: boolean
  /** Accessible name of the built-in clear button. */
  clearLabel?: string
}

/**
 * Corner staircase: 2 levels × 4px = an 8px span. `Card` uses 12px, which reads
 * as too chunky on a control that is only 32–48px tall, but the 4px step stays
 * the same so the corner blocks line up with the frame ring.
 *
 * The ring itself is 4px (`$input-frame-width` in `Input.module.scss`). The fill
 * layer is inset by exactly that much and reuses this same polygon, which is
 * what keeps the border an even width around the stepped corners.
 */
const INPUT_CORNER_STEPS = 2
const INPUT_CORNER_STEP = 4

const INPUT_CLIP_PATH = createSteppedRectClipPath(INPUT_CORNER_STEPS, INPUT_CORNER_STEP)

type InputCssVariables = CSSProperties & {
  '--star-input-clip': string
  '--star-input-accent'?: string
}

function StarInput({
  value,
  defaultValue = '',
  onChange,
  onClear,
  size = 'medium',
  status = 'default',
  color,
  label,
  message,
  prefix,
  suffix,
  allowClear = false,
  showCount = false,
  block = false,
  clearLabel = 'Clear',
  disabled = false,
  readOnly = false,
  maxLength,
  placeholder,
  className,
  style,
  id,
  ...rest
}: StarInputProps) {
  const generatedId = useId()
  const inputId = id ?? `star-input-${generatedId}`
  // The <input> is always controlled; `value` only decides whether React or the
  // field itself owns the text.
  const [innerValue, setInnerValue] = useState(defaultValue)
  const text = value ?? innerValue
  const showClear = allowClear && text.length > 0 && !disabled && !readOnly

  const commit = (next: string) => {
    if (value === undefined) setInnerValue(next)
    onChange?.(next)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    commit(event.target.value)
  }

  const handleClear = () => {
    commit('')
    onClear?.()
  }

  const cssVariables: InputCssVariables = {
    '--star-input-clip': INPUT_CLIP_PATH,
    ...(color ? { '--star-input-accent': color } : null),
  }

  return (
    <div
      className={classNames(
        styles['star-input-wrapper'],
        styles[`star-input-wrapper--${status}`],
        block && styles['is-block'],
        disabled && styles['is-disabled'],
        readOnly && styles['is-readonly'],
        className
      )}
      style={style}
    >
      {label ? (
        <label className={styles['star-input__label']} htmlFor={inputId}>
          {label}
        </label>
      ) : null}

      <div className={classNames(styles['star-input'], styles[`star-input--${size}`])} style={cssVariables}>
        {/* One `clip-path` can only cut one outline and it takes `outline` and
            `box-shadow` with it, so the halo and the frame ring are separate
            absolutely positioned layers sharing the same polygon. */}
        <span className={styles['star-input__glow']} aria-hidden />
        <span className={styles['star-input__plate']} aria-hidden />
        <div className={styles['star-input__field']}>
          {prefix ? <span className={styles['star-input__affix']}>{prefix}</span> : null}
          <input
            {...rest}
            id={inputId}
            className={styles['star-input__control']}
            value={text}
            onChange={handleChange}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            placeholder={placeholder}
          />
          {showCount ? (
            <span className={styles['star-input__count']}>
              {maxLength ? `${text.length}/${maxLength}` : String(text.length)}
            </span>
          ) : null}
          {showClear ? (
            <button
              type="button"
              className={styles['star-input__clear']}
              onClick={handleClear}
              aria-label={clearLabel}
            >
              <X size={12} strokeWidth={3} aria-hidden />
            </button>
          ) : null}
          {suffix ? <span className={styles['star-input__affix']}>{suffix}</span> : null}
        </div>
      </div>

      {message ? (
        <p className={styles['star-input__message']} role={status === 'error' ? 'alert' : undefined}>
          {message}
        </p>
      ) : null}
    </div>
  )
}

export { StarInput }
export default StarInput
