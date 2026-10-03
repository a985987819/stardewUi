import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Select.module.scss'

export type SelectSize = 'small' | 'medium' | 'large'

export interface SelectOption {
  /** Stable value reported from `onChange`. */
  value: string
  /** Visible caption for this option. */
  label: ReactNode
  /** Makes only this option read-only. */
  disabled?: boolean
}

export interface StarSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Options rendered inside the folded panel. */
  options: SelectOption[]
  /** Controlled selected value. */
  value?: string
  /** Initial selected value when the select is uncontrolled. */
  defaultValue?: string
  /** Called with the next selected value. */
  onChange?: (value: string) => void
  /** Shown in the trigger while nothing is selected. */
  placeholder?: string
  /** Disables the trigger and keeps the current value visible. */
  disabled?: boolean
  /** Scale of the recessed wooden field. */
  size?: SelectSize
  /** Stretches the select to the container width. */
  block?: boolean
  /**
   * Form field name. The root is a `<div>`, so `name` would be ignored by the
   * browser if it merely spread onto it; a hidden input carries the selected
   * value into `new FormData(form)` instead.
   */
  name?: string
  /** Accessible name of the trigger. */
  'aria-label'?: string
}

/**
 * Corner staircase: 2 levels × 4px = an 8px span — the exact same geometry as
 * `Input`, so the trigger reads as a sibling of the text field. The ring is
 * 4px (`$select-frame-width` in `Select.module.scss`); the fill layer is inset
 * by exactly that much and reuses this same polygon.
 */
const SELECT_CORNER_STEPS = 2
const SELECT_CORNER_STEP = 4

const SELECT_CLIP_PATH = createSteppedRectClipPath(SELECT_CORNER_STEPS, SELECT_CORNER_STEP)

/**
 * Chevron chip geometry: the same staircase language as the field, scaled down
 * to the 24px key that holds the arrow (2 levels × 2px = a 4px span, against
 * the field's 8px).
 */
const SELECT_CHEVRON_CORNER_STEPS = 2
const SELECT_CHEVRON_CORNER_STEP = 2

const SELECT_CHEVRON_CLIP_PATH = createSteppedRectClipPath(
  SELECT_CHEVRON_CORNER_STEPS,
  SELECT_CHEVRON_CORNER_STEP,
)

type SelectCssVariables = CSSProperties & {
  '--star-select-clip': string
  '--star-select-chevron-clip': string
}

/**
 * Select — a recessed pixel dropdown in the Input family. The trigger shares
 * Input's two-layer staircase ring and bevels; the folded panel below reuses
 * the same polygon so both surfaces keep the same stepped corners. Selection
 * commits on click, the panel closes on outside clicks and on Escape.
 */
function StarSelect({
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled = false,
  size = 'medium',
  block = false,
  className,
  name,
  style,
  'aria-label': ariaLabel = 'Select',
  ...rest
}: StarSelectProps) {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedValue = value ?? internalValue
  const selectedOption = options.find((option) => option.value === selectedValue)

  const setOpenSafe = (next: boolean) => {
    if (disabled) return
    setOpen(next)
  }

  // Outside clicks close the folded panel; clicks on the trigger itself are
  // handled by its own toggle handler instead.
  useEffect(() => {
    if (!open) return undefined

    const handleDocClick = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('click', handleDocClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleDocClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const commit = (option: SelectOption) => {
    if (disabled || option.disabled) return

    if (value === undefined) setInternalValue(option.value)
    onChange?.(option.value)
    setOpen(false)
  }

  const cssVariables: SelectCssVariables = {
    '--star-select-clip': SELECT_CLIP_PATH,
    '--star-select-chevron-clip': SELECT_CHEVRON_CLIP_PATH,
  }

  return (
    <div
      {...rest}
      ref={containerRef}
      className={classNames(
        styles['star-select'],
        styles[`star-select--${size}`],
        block && styles['star-select--block'],
        disabled && styles['star-select--disabled'],
        open && styles['is-open'],
        className,
      )}
      style={{ ...cssVariables, ...style }}
    >
      {/* One `clip-path` can only cut one outline, so the hover highlight,
          focus halo, ring, and fill are separate absolutely positioned layers
          sharing the same polygon. The hover layer sits underneath the focus
          halo so the two never fight when a trigger is both hovered and open. */}
      <span className={styles['star-select__hover']} aria-hidden />
      <span className={styles['star-select__glow']} aria-hidden />
      <span className={styles['star-select__plate']} aria-hidden />
      <button
        type="button"
        className={styles['star-select__trigger']}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpenSafe(!open)}
      >
        <span className={styles['star-select__field']}>
          <span
            className={classNames(
              styles['star-select__value'],
              !selectedOption && styles['star-select__value--placeholder'],
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className={styles['star-select__chevron-badge']} aria-hidden>
            <ChevronDown
              className={styles['star-select__chevron']}
              size={16}
              strokeWidth={3}
              aria-hidden
            />
          </span>
        </span>
      </button>

      {open ? (
        <div className={styles['star-select__panel']} role="listbox" aria-label={ariaLabel}>
          <div className={styles['star-select__list']}>
            {options.map((option) => {
              const selected = option.value === selectedValue
              const optionDisabled = disabled || Boolean(option.disabled)

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={optionDisabled}
                  className={classNames(
                    styles['star-select__option'],
                    selected && styles['star-select__option--selected'],
                    optionDisabled && styles['star-select__option--disabled'],
                  )}
                  onClick={() => commit(option)}
                >
                  <span className={styles['star-select__option-label']}>{option.label}</span>
                  {selected ? (
                    <span className={styles['star-select__option-check']} aria-hidden>
                      ✔
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
      {/* Form participation. The root is a `<div>`, so a `name` passed through
          `...rest` would land on a div and be ignored by the browser — the
          selected value would silently never appear in `new FormData(form)`.
          A hidden input carries it into the form instead. */}
      {name ? <input type="hidden" name={name} value={selectedValue ?? ''} aria-hidden /> : null}
    </div>
  )
}

export { StarSelect }
export default StarSelect
