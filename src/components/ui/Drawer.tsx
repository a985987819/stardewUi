import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { classNames } from '../../utils/classNames'
import StarCard from './Card'
import { OVERLAY_ENTER_TOTAL_MS, OVERLAY_EXIT_TOTAL_MS, overlayMotionStyle } from './overlayMotion'
import { useComponentCopy } from './useComponentCopy'
import { useFocusTrap } from './useFocusTrap'
import styles from './Drawer.module.scss'

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'

export interface StarDrawerProps {
  /**
   * Controlled visibility of the drawer. Leave it out to let the drawer own its
   * state, in which case `defaultOpen` decides whether it starts open and
   * `onOpenChange` reports every change.
   */
  open?: boolean
  /** Starting visibility for the uncontrolled mode. */
  defaultOpen?: boolean
  /** Edge the drawer enters from. */
  placement?: DrawerPlacement
  /** Optional heading shown in the drawer frame. */
  title?: ReactNode
  /** Optional content rendered in a fixed footer region. */
  footer?: ReactNode
  /** Drawer body content. */
  children?: ReactNode
  /** Applied to the drawer panel for caller-owned layout and styling hooks. */
  className?: string
  /** Inline styles applied to the backdrop mask. */
  maskStyle?: CSSProperties
  /** Scale and soften the underlying application while the drawer is visible. */
  focusEffect?: boolean
  /** Whether clicking the backdrop requests a close. */
  maskClosable?: boolean
  /** Accessible name for the close button. */
  closeLabel?: string
  /** Accessible name for the panel when no string `title` is supplied. */
  ariaLabel?: string
  /**
   * Called with the visibility the drawer is moving to, on open and on close.
   * Fires for the close button, the backdrop, and Escape alike.
   */
  onOpenChange?: (open: boolean) => void
  /** Called when the close button, backdrop, or Escape key requests closing. */
  onClose?: () => void
}

const PAGE_FOCUS_CLASS = 'stardew-drawer-page-focused'
const focusedAppRoots = new Map<HTMLElement, number>()
type DrawerMotionState = 'closed' | 'opening' | 'open' | 'closing'

function addPageFocus(appRoot: HTMLElement) {
  const currentCount = focusedAppRoots.get(appRoot) ?? 0
  focusedAppRoots.set(appRoot, currentCount + 1)
  appRoot.classList.add(PAGE_FOCUS_CLASS)
}

function removePageFocus(appRoot: HTMLElement) {
  const nextCount = (focusedAppRoots.get(appRoot) ?? 1) - 1

  if (nextCount > 0) {
    focusedAppRoots.set(appRoot, nextCount)
    return
  }

  focusedAppRoots.delete(appRoot)
  appRoot.classList.remove(PAGE_FOCUS_CLASS)
}

/**
 * A controlled, pixel-framed drawer that enters from any page edge. Its
 * optional focus effect deliberately transforms the app root, while this
 * portal remains on `document.body` so the drawer stays crisp and full-sized.
 */
function StarDrawer({
  open: openProp,
  defaultOpen = false,
  placement = 'right',
  title,
  footer,
  children,
  className,
  maskStyle,
  focusEffect = true,
  maskClosable = true,
  closeLabel,
  ariaLabel,
  onOpenChange,
  onClose,
}: StarDrawerProps) {
  // Uncontrolled support, same `prop ?? internal` shape as Dialog and the
  // input components. `open` became optional, so without this a caller who
  // omitted it would get a drawer that never opened.
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen

  const [rendered, setRendered] = useState(open)
  const renderedRef = useRef(open)
  const panelRef = useRef<HTMLElement | null>(null)
  const [motionState, setMotionState] = useState<DrawerMotionState>(open ? 'opening' : 'closed')
  const [activePlacement, setActivePlacement] = useState<DrawerPlacement>(placement)
  // True only when an open request arrives while the exit is still playing. The
  // entrance keyframe starts a full viewport away, so replaying it from
  // mid-exit would fling the drawer off-screen and drag it back; instead the
  // stylesheet gets `data-skip-enter` and just restores the opacity.
  const [skipEnter, setSkipEnter] = useState(false)

  useEffect(() => {
    let enterTimer: ReturnType<typeof setTimeout> | null = null
    let exitTimer: ReturnType<typeof setTimeout> | null = null
    let frameId: number | null = null
    let holdTimer: ReturnType<typeof setTimeout> | null = null

    if (open) {
      const interruptedClose = renderedRef.current
      frameId = window.requestAnimationFrame(() => {
        setActivePlacement(placement)
        renderedRef.current = true
        setRendered(true)
        setSkipEnter(interruptedClose)
        setMotionState('opening')
        // Clear the flag on the next frame. The stylesheet matches it only while
        // `data-state="opening"`, so leaving it set is harmless — but clearing it
        // keeps the DOM honest for anyone inspecting the drawer.
        if (interruptedClose) {
          holdTimer = setTimeout(() => setSkipEnter(false), OVERLAY_ENTER_TOTAL_MS + 50)
        }
        enterTimer = setTimeout(() => setMotionState('open'), OVERLAY_ENTER_TOTAL_MS)
      })
    } else if (renderedRef.current) {
      frameId = window.requestAnimationFrame(() => setMotionState('closing'))
      exitTimer = setTimeout(() => {
        setMotionState('closed')
        renderedRef.current = false
        setSkipEnter(false)
        setRendered(false)
      }, OVERLAY_EXIT_TOTAL_MS)
    }

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      if (enterTimer !== null) clearTimeout(enterTimer)
      if (exitTimer !== null) clearTimeout(exitTimer)
      if (holdTimer !== null) clearTimeout(holdTimer)
    }
  }, [open, placement])

  /** Single close path, so the uncontrolled mode has one place to write. */
  const requestClose = useCallback(() => {
    if (!isControlled) setInternalOpen(false)
    onClose?.()
  }, [isControlled, onClose])

  // Report both modes' changes from one place by watching the resolved value.
  const lastOpenRef = useRef(open)
  useEffect(() => {
    if (lastOpenRef.current === open) return
    lastOpenRef.current = open
    onOpenChange?.(open)
  }, [onOpenChange, open])

  useEffect(() => {
    if (!rendered || !focusEffect || typeof document === 'undefined') return

    const appRoot = document.querySelector('[data-star-app="true"]') as HTMLElement | null
    if (!appRoot) return

    addPageFocus(appRoot)
    return () => removePageFocus(appRoot)
  }, [focusEffect, rendered])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, requestClose])

  // The close button and the panel's own accessible name were English-only
  // literals until now, so a Chinese-speaking screen-reader user got an English
  // button in an otherwise Chinese drawer. Resolved before the `rendered` early
  // return so the hook order stays stable across a close/open cycle.
  const copy = useComponentCopy()
  const resolvedCloseLabel = closeLabel ?? copy.t('ui.drawer.close')
  const resolvedAriaLabel = ariaLabel ?? (typeof title === 'string' ? title : copy.t('ui.dialog.drawer'))

  // Same reasoning as Dialog: `aria-modal="true"` is a promise, and the drawer
  // was making it without containing focus. The close button lives inside the
  // panel, so Tab now cycles between the drawer's own controls instead of
  // walking into the page behind.
  useFocusTrap(panelRef, { active: rendered })

  if (!rendered || typeof document === 'undefined') return null

  const handleMaskClick = () => {
    if (maskClosable) requestClose()
  }

  return createPortal(
    <div
      className={styles['stardew-drawer-layer']}
      data-state={motionState}
      style={overlayMotionStyle}
    >
      <div
        aria-hidden
        className={classNames(styles['stardew-drawer__mask'], maskClosable && styles['stardew-drawer__mask--clickable'])}
        style={maskStyle}
        onClick={handleMaskClick}
      />
      <aside
        ref={panelRef}
        className={classNames(
          styles['stardew-drawer'],
          styles[`stardew-drawer--${activePlacement}`],
          className
        )}
        data-state={motionState}
        data-placement={activePlacement}
        data-skip-enter={skipEnter ? 'true' : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={resolvedAriaLabel}
      >
        <StarCard
          className={styles['stardew-drawer__shell']}
          title={title}
          showTitle={Boolean(title)}
          headerExtra={
            title && onClose ? (
              <button type="button" className={styles['stardew-drawer__close']} aria-label={resolvedCloseLabel} onClick={requestClose}>
                ×
              </button>
            ) : undefined
          }
          footer={footer}
        >
          {!title && onClose ? (
            <button
              type="button"
              className={classNames(styles['stardew-drawer__close'], styles['stardew-drawer__close--floating'])}
              aria-label={resolvedCloseLabel}
              onClick={requestClose}
            >
              ×
            </button>
          ) : null}
          <div className={styles['stardew-drawer__content']}>{children}</div>
        </StarCard>
      </aside>
    </div>,
    document.body
  )
}

export { StarDrawer }
export default StarDrawer
