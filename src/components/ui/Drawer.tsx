import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { classNames } from '../../utils/classNames'
import StarCard from './Card'
import styles from './Drawer.module.scss'

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'

export interface StarDrawerProps {
  /** Controlled visibility of the drawer. */
  open: boolean
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
  /** Called when the close button, backdrop, or Escape key requests closing. */
  onClose?: () => void
}

const DRAWER_TRANSITION_MS = 200
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
  open,
  placement = 'right',
  title,
  footer,
  children,
  className,
  maskStyle,
  focusEffect = true,
  maskClosable = true,
  onClose,
}: StarDrawerProps) {
  const [rendered, setRendered] = useState(open)
  const [motionState, setMotionState] = useState<DrawerMotionState>(open ? 'opening' : 'closed')

  useEffect(() => {
    let exitTimer: ReturnType<typeof setTimeout> | null = null
    let frameId: number | null = null

    if (open) {
      frameId = window.requestAnimationFrame(() => {
        setRendered(true)
        setMotionState('opening')
        frameId = window.requestAnimationFrame(() => setMotionState('open'))
      })
    } else {
      frameId = window.requestAnimationFrame(() => setMotionState('closing'))
      exitTimer = setTimeout(() => {
        setMotionState('closed')
        setRendered(false)
      }, DRAWER_TRANSITION_MS)
    }

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      if (exitTimer !== null) clearTimeout(exitTimer)
    }
  }, [open])

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
      if (event.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!rendered || typeof document === 'undefined') return null

  const handleMaskClick = () => {
    if (maskClosable) onClose?.()
  }

  return createPortal(
    <div className={styles['stardew-drawer-layer']} data-state={motionState}>
      <div
        aria-hidden
        className={classNames(styles['stardew-drawer__mask'], maskClosable && styles['stardew-drawer__mask--clickable'])}
        style={maskStyle}
        onClick={handleMaskClick}
      />
      <aside
        className={classNames(
          styles['stardew-drawer'],
          styles[`stardew-drawer--${placement}`],
          className
        )}
        data-state={motionState}
        data-placement={placement}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Drawer'}
      >
        <StarCard
          className={styles['stardew-drawer__shell']}
          title={title}
          showTitle={Boolean(title)}
          headerExtra={
            title && onClose ? (
              <button type="button" className={styles['stardew-drawer__close']} aria-label="Close drawer" onClick={onClose}>
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
              aria-label="Close drawer"
              onClick={onClose}
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
