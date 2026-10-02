// Batch: 2026-09-27 P0 batch — internal marker for tooling only; no runtime effect.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Alert.module.scss'

/** Semantic banner tints, matching the Message toast palette. */
export type AlertType = 'info' | 'success' | 'warning' | 'error'

export interface StarAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Semantic tint for the ring, fill, icon, and title ink. */
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
  /**
   * Renders the banner as a blocking overlay dialog instead of an inline
   * notice — the "you must read this" form of an alert. The page behind dims
   * and stops taking clicks, and nothing dismisses it but an explicit action
   * unless `maskClosable` / `escClosable` say otherwise.
   */
  modal?: boolean
  /** Modal only: let a click on the backdrop dismiss the alert. Off by default. */
  maskClosable?: boolean
  /** Modal only: let Escape dismiss the alert. Off by default. */
  escClosable?: boolean
  /** Footer actions, e.g. an acknowledge button (right-aligned under the copy). */
  actions?: ReactNode
  /** Accessible name of the modal alert itself, when used as an alertdialog. */
  modalLabel?: string
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
 * Alert — a notice-board banner tinted the same way as Message: the whole
 * plate takes the type's fill and border colour, a semantic glyph sits in its
 * own slot behind an accent seam, and a bold ink heading leads the body. The
 * four tints reuse the Message theme palette so a toast and a banner of the
 * same kind always agree on what info, success, warning, and error look like.
 *
 * With `modal`, the same plate is hoisted into a blocking overlay: the page
 * dims, body scroll locks, and only an explicit action gets out — backdrop
 * clicks and Escape stay inert unless the caller opts in. That is the
 * difference between "a notice you can ignore" and a forced alert.
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
  modal = false,
  maskClosable = false,
  escClosable = false,
  actions,
  modalLabel,
  'aria-label': ariaLabel,
  className,
  style,
  ...rest
}: StarAlertProps) {
  const [dismissed, setDismissed] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const IconGlyph = ALERT_ICONS[type]

  const handleClose = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      setDismissed(true)
      onClose?.()
    },
    [onClose],
  )

  const requestClose = useCallback(() => {
    setDismissed(true)
    onClose?.()
  }, [onClose])

  // Modal housekeeping: lock the page behind the alert and move focus into it,
  // so a forced notice is read rather than tabbed past.
  useEffect(() => {
    if (!modal || dismissed) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [dismissed, modal])

  useEffect(() => {
    if (!modal || !escClosable || dismissed) return undefined

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dismissed, escClosable, modal, requestClose])

  if (dismissed) return null

  const cssVariables: AlertCssVariables = {
    '--star-alert-clip': ALERT_CLIP_PATH,
  }

  const plate = (
    <div
      {...rest}
      ref={modal ? panelRef : undefined}
      tabIndex={modal ? -1 : undefined}
      role={modal ? 'alertdialog' : type === 'error' ? 'alert' : undefined}
      aria-modal={modal ? true : undefined}
      aria-label={modal ? modalLabel ?? ariaLabel ?? 'Alert' : ariaLabel}
      className={classNames(
        styles['star-alert'],
        styles[`star-alert--${type}`],
        modal && styles['star-alert--modal'],
        className,
      )}
      style={{ ...cssVariables, ...style }}
    >
      {/* One `clip-path` can only cut one outline, so the ring and the fill
          are separate layers sharing the same staircase polygon. */}
      <span className={styles['star-alert__plate']} aria-hidden />
      <div className={styles['star-alert__body']}>
        {showIcon ? (
          <span className={styles['star-alert__icon-box']} aria-hidden>
            <span className={styles['star-alert__icon']}>
              {icon ?? <IconGlyph size={16} strokeWidth={2.5} />}
            </span>
          </span>
        ) : null}
        <div className={styles['star-alert__text']}>
          {title ? <div className={styles['star-alert__title']}>{title}</div> : null}
          {children ? <div className={styles['star-alert__content']}>{children}</div> : null}
          {actions ? <div className={styles['star-alert__actions']}>{actions}</div> : null}
        </div>
        {closable ? (
          <button
            type="button"
            className={styles['star-alert__close']}
            aria-label={closeLabel}
            onClick={handleClose}
          >
            <X size={12} strokeWidth={3} aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  )

  if (!modal) return plate

  const portalTarget = typeof document !== 'undefined' ? document.body : null
  if (!portalTarget) return plate

  return createPortal(
    <div
      className={classNames(
        styles['star-alert-overlay'],
        maskClosable && styles['star-alert-overlay--clickable'],
      )}
      onClick={() => {
        if (maskClosable) requestClose()
      }}
    >
      <div
        className={styles['star-alert-overlay__panel']}
        onClick={(event) => event.stopPropagation()}
      >
        {plate}
      </div>
    </div>,
    portalTarget,
  )
}

export { StarAlert }
export default StarAlert
