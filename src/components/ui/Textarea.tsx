// Batch: 2026-09-27 P0 batch — internal marker for tooling only; no runtime effect.
import {
  useId,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Textarea.module.scss'

export type TextareaSize = 'small' | 'medium' | 'large'
export type TextareaStatus = 'default' | 'warning' | 'error' | 'success'

export interface StarTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value' | 'defaultValue'> {
  /** Controlled text. Leave undefined to let the field keep its own state. */
  value?: string
  /** Initial text for the uncontrolled field. */
  defaultValue?: string
  /**
   * Fires with the next text while typing. The DOM event is intentionally
   * dropped — use `onInput` or `onKeyDown` when you actually need it.
   */
  onChange?: (value: string) => void
  size?: TextareaSize
  /** Semantic tint for the frame and for the message below it. */
  status?: TextareaStatus
  /** Accent for focus and caret. Overrides `status`. */
  color?: string
  /** Visible caption, bound to the field through `htmlFor`. */
  label?: ReactNode
  /** Hint or validation copy rendered under the field. */
  message?: ReactNode
  /** Shows the typed length, or `typed / maxLength` when `maxLength` is set. */
  showCount?: boolean
  /** Stretches the field to the container width. */
  block?: boolean
  /** Grows the field with its content; disables the manual resize grip. */
  autoSize?: boolean
  /** Visible text rows before the field starts scrolling. */
  rows?: number
}

/**
 * Corner staircase: the same 2 levels × 4px as `Input`, so the single-line and
 * multi-line fields read as one family — same ring width, same corner blocks.
 *
 * The ring itself is 4px (`$textarea-frame-width` in `Textarea.module.scss`).
 * The fill layer is inset by exactly that much and reuses this same polygon,
 * which keeps the border an even width around the stepped corners.
 */
const TEXTAREA_CORNER_STEPS = 2
const TEXTAREA_CORNER_STEP = 4

const TEXTAREA_CLIP_PATH = createSteppedRectClipPath(TEXTAREA_CORNER_STEPS, TEXTAREA_CORNER_STEP)

type TextareaCssVariables = CSSProperties & {
  '--star-textarea-clip': string
  '--star-textarea-accent'?: string
}

function StarTextarea({
  value,
  defaultValue = '',
  onChange,
  size = 'medium',
  status = 'default',
  color,
  label,
  message,
  showCount = false,
  block = false,
  autoSize = false,
  rows = 4,
  disabled = false,
  readOnly = false,
  maxLength,
  placeholder,
  className,
  style,
  id,
  ...rest
}: StarTextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? `star-textarea-${generatedId}`
  const controlRef = useRef<HTMLTextAreaElement>(null)
  // The <textarea> is always controlled; `value` only decides whether React or
  // the field itself owns the text.
  const [innerValue, setInnerValue] = useState(defaultValue)
  const text = value ?? innerValue

  // Auto height: collapse to the content on every text or size change. Runs
  // after paint, which is fine here — the first frame already carries `rows`.
  useEffect(() => {
    if (!autoSize) return
    const el = controlRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [text, autoSize])

  const commit = (next: string) => {
    if (value === undefined) setInnerValue(next)
    onChange?.(next)
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    commit(event.target.value)
  }

  const cssVariables: TextareaCssVariables = {
    '--star-textarea-clip': TEXTAREA_CLIP_PATH,
    ...(color ? { '--star-textarea-accent': color } : null),
  }

  return (
    <div
      className={classNames(
        styles['star-textarea-wrapper'],
        styles[`star-textarea-wrapper--${status}`],
        block && styles['is-block'],
        disabled && styles['is-disabled'],
        readOnly && styles['is-readonly'],
        className,
      )}
      style={style}
    >
      {label ? (
        <label className={styles['star-textarea__label']} htmlFor={textareaId}>
          {label}
        </label>
      ) : null}

      <div
        className={classNames(
          styles['star-textarea'],
          styles[`star-textarea--${size}`],
          autoSize && styles['is-autosize'],
        )}
        style={cssVariables}
      >
        {/* One `clip-path` can only cut one outline, so the halo and the frame
            ring are separate layers sharing the same staircase polygon. */}
        <span className={styles['star-textarea__glow']} aria-hidden />
        <span className={styles['star-textarea__plate']} aria-hidden />
        <textarea
          {...rest}
          ref={controlRef}
          id={textareaId}
          className={styles['star-textarea__control']}
          value={text}
          onChange={handleChange}
          rows={rows}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          placeholder={placeholder}
        />
        {showCount ? (
          <span className={styles['star-textarea__count']} aria-hidden>
            {maxLength ? `${text.length}/${maxLength}` : String(text.length)}
          </span>
        ) : null}
      </div>

      {message ? (
        <p className={styles['star-textarea__message']} role={status === 'error' ? 'alert' : undefined}>
          {message}
        </p>
      ) : null}
    </div>
  )
}

export { StarTextarea }
export default StarTextarea
