import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Radio.module.scss'

export type RadioDirection = 'horizontal' | 'vertical'
export type RadioSize = 'small' | 'medium' | 'large'

export interface RadioOption {
  /** Stable value reported from `onChange`. */
  value: string
  /** Visible caption for this option. */
  label: ReactNode
  /** Makes only this option read-only. */
  disabled?: boolean
}

export interface StarRadioProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Options rendered by the group. */
  options: RadioOption[]
  /** Controlled selected value. */
  value?: string
  /** Initial selected value when the group is uncontrolled. */
  defaultValue?: string
  /** Called with the next selected value. */
  onChange?: (value: string) => void
  /** Horizontal by default; use vertical for a settings list. */
  direction?: RadioDirection
  /** Disables every option while preserving selection. */
  disabled?: boolean
  /** Scale of the Card-inspired checkbox frame. */
  size?: RadioSize
  /** Accessible name of the group. */
  'aria-label'?: string
}

const MARK_IN_DURATION_MS = 360
/**
 * Mirrors Checkbox's exit timing: a quick shake-and-shrink so a re-selection
 * never feels held back by the old check.
 */
const MARK_OUT_DURATION_MS = 150

/**
 * Keeps the red check in the DOM while it leaves, so removal can reuse the
 * Rating/Checkbox loss rhythm instead of disappearing abruptly. This is the
 * same mark Checkbox renders — Radio shares its square tile and red check.
 */
function RadioMark({ selected }: { selected: boolean }) {
  const previousSelected = useRef(selected)
  const [visible, setVisible] = useState(selected)
  const [motion, setMotion] = useState<'in' | 'out' | null>(null)

  useEffect(() => {
    const wasSelected = previousSelected.current
    previousSelected.current = selected

    if (wasSelected === selected) return undefined

    if (selected) {
      // Defer one frame so React can paint the entering state first.
      const showTimer = window.setTimeout(() => {
        setVisible(true)
        setMotion('in')
      }, 0)
      const timer = window.setTimeout(() => setMotion(null), MARK_IN_DURATION_MS)
      return () => {
        window.clearTimeout(showTimer)
        window.clearTimeout(timer)
      }
    }

    const hideMotionTimer = window.setTimeout(() => setMotion('out'), 0)
    const timer = window.setTimeout(() => {
      setMotion(null)
      setVisible(false)
    }, MARK_OUT_DURATION_MS)
    return () => {
      window.clearTimeout(hideMotionTimer)
      window.clearTimeout(timer)
    }
  }, [selected])

  return (
    <span className={styles['star-radio__mark']} data-motion={motion ?? undefined} aria-hidden>
      {visible ? <span className={styles['star-radio__mark-glyph']}>✔</span> : null}
    </span>
  )
}

/**
 * A single-choice radio group sharing Checkbox's square Card-material tile and
 * red check, so the two controls read as one material. The selected option
 * reveals its check with the shared mask reveal; losing it follows Rating's
 * shake, enlarge, shrink, and fade sequence. Selection is sticky — clicking the
 * selected option never empties the group.
 */
function StarRadio({
  options,
  value,
  defaultValue,
  onChange,
  direction = 'horizontal',
  disabled = false,
  size = 'medium',
  className,
  style,
  'aria-label': ariaLabel = 'Radio',
  ...rest
}: StarRadioProps, ref: ForwardedRef<HTMLDivElement>) {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)
  const selectedValue = value ?? internalValue

  const select = (option: RadioOption) => {
    if (disabled || option.disabled) return
    // Sticky: re-clicking the selected option keeps the group non-empty,
    // matching native radio-button behaviour.
    if (option.value === selectedValue) return

    if (value === undefined) setInternalValue(option.value)
    onChange?.(option.value)
  }

  return (
    <div
      {...rest}
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={classNames(
        styles['star-radio'],
        styles[`star-radio--${direction}`],
        styles[`star-radio--${size}`],
        disabled && styles['star-radio--disabled'],
        className,
      )}
      style={style as CSSProperties}
    >
      {options.map((option) => {
        const selected = option.value === selectedValue
        const optionDisabled = disabled || Boolean(option.disabled)

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={optionDisabled}
            className={classNames(
              styles['star-radio__option'],
              selected && styles['star-radio__option--selected'],
              optionDisabled && styles['star-radio__option--disabled'],
            )}
            onClick={() => select(option)}
          >
            <span className={styles['star-radio__control']} aria-hidden>
              <span className={styles['star-radio__surface']} />
              <span className={styles['star-radio__frame']} />
              <RadioMark selected={selected} />
            </span>
            <span className={styles['star-radio__label']}>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * The ref lands on the group root. Individual options are buttons inside it;
 * exposing the group is what lets a caller focus the control as a whole, which
 * is the only level a single ref can meaningfully point at here.
 */
const StarRadioWithRef = forwardRef<HTMLDivElement, StarRadioProps>(StarRadio)

export { StarRadioWithRef as StarRadio }
export default StarRadioWithRef
