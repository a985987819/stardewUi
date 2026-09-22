import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Checkbox.module.scss'

export type CheckboxDirection = 'horizontal' | 'vertical'
export type CheckboxShape = 'square' | 'round'
export type CheckboxSize = 'small' | 'medium' | 'large'

export interface CheckboxOption {
  /** Stable value returned from `onChange`. */
  value: string
  /** Visible caption for this option. */
  label: ReactNode
  /** Makes only this option read-only. */
  disabled?: boolean
}

export interface StarCheckboxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Options rendered by the group. */
  options: CheckboxOption[]
  /** Controlled selected values. */
  value?: string[]
  /** Initial selected values when the group is uncontrolled. */
  defaultValue?: string[]
  /** Called with the complete next selection. */
  onChange?: (value: string[]) => void
  /** Horizontal by default; use vertical for a settings list. */
  direction?: CheckboxDirection
  /** Disables every option while preserving checked state. */
  disabled?: boolean
  /** Scale of the Card-inspired checkbox frame. */
  size?: CheckboxSize
  /** Square Card frame by default; round turns the frame into a seal. */
  shape?: CheckboxShape
  /** Accessible name of the group. */
  'aria-label'?: string
}

const CHECK_IN_DURATION_MS = 360
/** Shared Rating-loss motion, now deliberately half of its former 540ms pace. */
const CHECK_OUT_DURATION_MS = 270

/**
 * Keeps a red check in the DOM while it leaves. That lets removal reuse the
 * Rating component's shake-and-shrink rhythm instead of disappearing abruptly.
 */
function CheckboxMark({ checked }: { checked: boolean }) {
  const previousChecked = useRef(checked)
  const [visible, setVisible] = useState(checked)
  const [motion, setMotion] = useState<'in' | 'out' | null>(null)

  useEffect(() => {
    const wasChecked = previousChecked.current
    previousChecked.current = checked

    if (wasChecked === checked) return undefined

    if (checked) {
      setVisible(true)
      setMotion('in')
      const timer = window.setTimeout(() => setMotion(null), CHECK_IN_DURATION_MS)
      return () => window.clearTimeout(timer)
    }

    setMotion('out')
    const timer = window.setTimeout(() => {
      setMotion(null)
      setVisible(false)
    }, CHECK_OUT_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [checked])

  if (!visible) return null

  return (
    <span className={styles['star-checkbox__mark']} data-motion={motion ?? undefined} aria-hidden>
      <span className={styles['star-checkbox__mark-glyph']}>✔</span>
    </span>
  )
}

/**
 * A multi-select checkbox group with compact Card-material frames. Its red
 * check is revealed by a left-to-right mask when added; removal intentionally
 * follows Rating's shake, enlarge, shrink, and fade sequence.
 */
function StarCheckbox({
  options,
  value,
  defaultValue = [],
  onChange,
  direction = 'horizontal',
  disabled = false,
  size = 'medium',
  shape = 'square',
  className,
  style,
  'aria-label': ariaLabel = 'Checkbox',
  ...rest
}: StarCheckboxProps) {
  const [internalValue, setInternalValue] = useState<string[]>(() => [...new Set(defaultValue)])
  const selectedValues = value ?? internalValue

  const toggle = (option: CheckboxOption) => {
    if (disabled || option.disabled) return

    const nextValue = selectedValues.includes(option.value)
      ? selectedValues.filter((item) => item !== option.value)
      : [...selectedValues, option.value]

    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue)
  }

  return (
    <div
      {...rest}
      role="group"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={classNames(
        styles['star-checkbox'],
        styles[`star-checkbox--${direction}`],
        styles[`star-checkbox--${size}`],
        styles[`star-checkbox--${shape}`],
        disabled && styles['star-checkbox--disabled'],
        className,
      )}
      style={style as CSSProperties}
    >
      {options.map((option) => {
        const checked = selectedValues.includes(option.value)
        const optionDisabled = disabled || Boolean(option.disabled)

        return (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={checked}
            disabled={optionDisabled}
            className={classNames(
              styles['star-checkbox__option'],
              checked && styles['star-checkbox__option--checked'],
              optionDisabled && styles['star-checkbox__option--disabled'],
            )}
            onClick={() => toggle(option)}
          >
            <span className={styles['star-checkbox__control']} aria-hidden>
              <span className={styles['star-checkbox__surface']} />
              <span className={styles['star-checkbox__frame']} />
              <CheckboxMark checked={checked} />
            </span>
            <span className={styles['star-checkbox__label']}>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export { StarCheckbox }
export default StarCheckbox
