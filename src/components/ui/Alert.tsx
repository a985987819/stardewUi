// Batch: 2026-09-27 P0 batch — internal marker for tooling only; no runtime effect.
import { useState, type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Alert.module.scss'

/** Semantic banner tints, matching the Input status palette. */
export type AlertType = 'info' | 'success' | 'warning' | 'error'

export interface StarAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Semantic tint for the side stripe, title, and close hover. */
  type?: AlertType
  /** Bold heading rendered above the content. */
  title?: ReactNode
  /** Banner body. */
  children?: ReactNode
  /** Shows the semantic pixel icon in front of the text. */
  showIcon?: boolean
  /** Custom icon shown in the icon slot instead of the built-in glyph; needs `showIcon`. */
  icon?: ReactNode
  /** Shows a pixel × that dismisses the banner. */
  closable?: boolean
  /** Called after the built-in close button dismisses the banner. */
  onClose?: () => void
  /** Accessible name of the built-in close button. */
  closeLabel?: string
}

/** One glyph per tint, drawn in the same accent as the stripe. */
const ALERT_ICONS: Record<AlertType, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleX,
}

/**
 * Corner staircase: 2 levels × 2px — the same small-control scale as Tag, so
 * banners and tags share one corner rhythm.
 */
const ALERT_CLIP_PATH = createSteppedRectClipPath(2, 2)

type AlertCssVariables = CSSProperties & {
  '--star-alert-clip': string
}

/**
 * Alert — a notice-board banner: a parchment plate with a coloured side
 * stripe, a tinted heading, and optional pixel × to dismiss it. The four
 * tints reuse the Input status palette so form validation and banners always
 * agree on what success, warning, and error look like.
 */
function StarAlert({
  type = 'info',
  title,
  children,
  showIcon = false,
  icon,
  closable = false,
  onClose,
  closeLabel = 'Close',
  className,
  style,
  ...rest
}: StarAlertProps) {
  const [dismissed, setDismissed] = useState(false)
  const IconGlyph = ALERT_ICONS[type]

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setDismissed(true)
    onClose?.()
  }

  if (dismissed) return null

  const cssVariables: AlertCssVariables = {
    '--star-alert-clip': ALERT_CLIP_PATH,
  }

  return (
    <div
      {...rest}
      role={type === 'error' ? 'alert' : undefined}
      className={classNames(
        styles['star-alert'],
        styles[`star-alert--${type}`],
        className,
      )}
      style={{ ...cssVariables, ...style }}
    >
      {/* One `clip-path` can only cut one outline, so the ring and the fill
          are separate layers sharing the same staircase polygon. */}
      <span className={styles['star-alert__plate']} aria-hidden />
      <span className={styles['star-alert__stripe']} aria-hidden />
      {showIcon ? (
        <span className={styles['star-alert__icon']} aria-hidden>
          {icon ?? <IconGlyph size={14} strokeWidth={2.5} />}
        </span>
      ) : null}
      <div className={styles['star-alert__body']}>
        {title ? <div className={styles['star-alert__title']}>{title}</div> : null}
        {children ? <div className={styles['star-alert__content']}>{children}</div> : null}
      </div>
      {closable ? (
        <button
          type="button"
          className={styles['star-alert__close']}
          aria-label={closeLabel}
          onClick={handleClose}
        >
          <X size={11} strokeWidth={3} aria-hidden />
        </button>
      ) : null}
    </div>
  )
}

export { StarAlert }
export default StarAlert
