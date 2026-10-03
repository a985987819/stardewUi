import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { classNames } from '../../utils/classNames'
import { StarCard } from './Card'
import StarNineSliceButton from './NineSliceButton'
import StarTypewriter from './Typewriter'
import { OVERLAY_ENTER_TOTAL_MS, OVERLAY_EXIT_TOTAL_MS, overlayMotionStyle } from './overlayMotion'
import { useComponentCopy } from './useComponentCopy'
import styles from './Dialog.module.scss'

export interface DialogAction {
  label: string
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
  onClick?: () => void
}

export type DialogMask = 'dark' | 'light'
export type DialogPlacement = 'center' | 'bottom'

type DialogMotionState = 'closed' | 'opening' | 'open' | 'closing'

const PAGE_FOCUS_CLASS = 'stardew-dialog-page-focused'
const focusedAppRoots = new Map<HTMLElement, number>()

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

export interface StarDialogProps {
  open: boolean
  title?: string
  content: string | string[]
  image?: string
  name?: string
  actions?: DialogAction[] | null
  /**
   * Footer content. Omit it for the built-in actions and pager, pass `null` to
   * remove the footer, or pass a React node to replace the built-in region.
   */
  footer?: ReactNode | null
  /** Backdrop tone. `dark` preserves focus; `light` keeps the page context visible. */
  mask?: DialogMask
  /** Viewport position. `bottom` centers the dialog along the lower edge at full available width. */
  placement?: DialogPlacement
  /** Scale and soften the underlying application while the dialog is visible. */
  focusEffect?: boolean
  /** Play the dialog's pop-in and fade-out transition. */
  motion?: boolean
  maskClosable?: boolean
  typewriter?: boolean
  typewriterSpeed?: number
  /**
   * Whether to show the prev/next pager. Leave it out and the pager follows the
   * content: a dialog with a single page hides it, because a lone "1 / 1" flanked
   * by two dead buttons is pure chrome. Pass `false` to hide it for a paged
   * dialog too, or an explicit `true` to keep it even on a single page.
   */
  showPagination?: boolean
  /**
   * Labels for the built-in footer and pager. Every one falls back to the host
   * app's language via `ui.dialog.*`, then to Chinese when the component is
   * used standalone — pass these to reword without touching the dictionary.
   */
  confirmLabel?: string
  cancelLabel?: string
  /** Accessible name for the pager arrows. Also used as their tooltip. */
  prevLabel?: string
  nextLabel?: string
  /** Alt text for `image` when no `name` is supplied. */
  roleLabel?: string
  /** Shown in place of the body while the typewriter is still finishing the title. */
  waitingText?: string
  onClose?: () => void
}

function StarDialog({
  open,
  title,
  content,
  image,
  name,
  actions,
  footer,
  mask = 'dark',
  placement = 'center',
  focusEffect = true,
  motion = true,
  maskClosable = true,
  typewriter = true,
  typewriterSpeed = 100,
  showPagination,
  confirmLabel,
  cancelLabel,
  prevLabel,
  nextLabel,
  roleLabel,
  waitingText,
  onClose,
}: StarDialogProps) {
  const [rendered, setRendered] = useState(open)
  const renderedRef = useRef(open)
  const [motionState, setMotionState] = useState<DialogMotionState>(
    open && motion ? 'opening' : open ? 'open' : 'closed'
  )
  const [currentPage, setCurrentPage] = useState(0)
  const [titleKey, setTitleKey] = useState(0)
  const [contentKey, setContentKey] = useState(0)
  const [titleComplete, setTitleComplete] = useState(false)
  const [contentComplete, setContentComplete] = useState(false)
  const [titleCompleteTrigger, setTitleCompleteTrigger] = useState(0)
  const [contentCompleteTrigger, setContentCompleteTrigger] = useState(0)

  const pages = useMemo(() => (Array.isArray(content) ? content : [content]), [content])
  const totalPages = pages.length
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage >= totalPages - 1

  // Resolve built-in copy once. Prop wins, then the host app's language, then
  // the Chinese default that predates i18n — the order matters because this
  // component also runs as a standalone package with no provider mounted.
  const copy = useComponentCopy()
  const resolvedConfirm = confirmLabel ?? copy.t('ui.dialog.confirm')
  const resolvedCancel = cancelLabel ?? copy.t('ui.dialog.cancel')
  const resolvedPrev = prevLabel ?? copy.t('ui.dialog.prev')
  const resolvedNext = nextLabel ?? copy.t('ui.dialog.next')
  const resolvedRole = roleLabel ?? copy.t('ui.dialog.role')
  const resolvedWaiting = waitingText ?? copy.t('ui.dialog.waiting')

  // Restart the typewriter sequence when the dialog opens or its copy changes.
  // These resets run during render rather than in effects: an effect would commit
  // a frame showing the previous page's finished text before resetting, which
  // cascades an extra render and produces a visible flash.
  const [openSignature, setOpenSignature] = useState({ open, title, typewriter })

  if (
    openSignature.open !== open ||
    openSignature.title !== title ||
    openSignature.typewriter !== typewriter
  ) {
    setOpenSignature({ open, title, typewriter })

    if (open) {
      setCurrentPage(0)
      setTitleComplete(!title || !typewriter)
      setContentComplete(!typewriter)
      setTitleKey((key) => key + 1)
      setContentKey((key) => key + 1)
    }
  }

  const [pageSignature, setPageSignature] = useState({ currentPage, typewriter })

  if (pageSignature.currentPage !== currentPage || pageSignature.typewriter !== typewriter) {
    setPageSignature({ currentPage, typewriter })
    setContentKey((key) => key + 1)
    setContentComplete(!typewriter)

    if (!isFirstPage) {
      setTitleComplete(true)
    }
  }

  useEffect(() => {
    let frameId: number | null = null
    let transitionTimer: ReturnType<typeof setTimeout> | null = null

    if (open) {
      frameId = window.requestAnimationFrame(() => {
        renderedRef.current = true
        setRendered(true)
        setMotionState(motion ? 'opening' : 'open')

        if (motion) {
          transitionTimer = setTimeout(() => setMotionState('open'), OVERLAY_ENTER_TOTAL_MS)
        }
      })
    } else if (renderedRef.current) {
      if (!motion) {
        frameId = window.requestAnimationFrame(() => {
          renderedRef.current = false
          setMotionState('closed')
          setRendered(false)
        })
      } else {
        frameId = window.requestAnimationFrame(() => setMotionState('closing'))
        // Includes the stylesheet's close delay, so React never unmounts the
        // portal before the panel has actually left. Unmounting early is what
        // produced the old snap: the exit was still running and the whole
        // subtree disappeared on frame one.
        transitionTimer = setTimeout(() => {
          renderedRef.current = false
          setMotionState('closed')
          setRendered(false)
        }, OVERLAY_EXIT_TOTAL_MS)
      }
    }

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      if (transitionTimer !== null) clearTimeout(transitionTimer)
    }
  }, [motion, open])

  useEffect(() => {
    if (!rendered) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [rendered])

  // The dialog lives in a body portal, so this only transforms the scene behind
  // it. Count active dialogs: closing one of two story beats must not snap the
  // farm back to full size while the other is still asking for attention.
  useEffect(() => {
    if (!rendered || !focusEffect || typeof document === 'undefined') return

    const appRoot = document.querySelector('[data-star-app="true"]') as HTMLElement | null
    if (!appRoot) return

    addPageFocus(appRoot)
    return () => removePageFocus(appRoot)
  }, [focusEffect, rendered])

  const handlePrev = useCallback(() => {
    if (!isFirstPage) {
      setCurrentPage((page) => Math.max(page - 1, 0))
    }
  }, [isFirstPage])

  const handleNext = useCallback(() => {
    if (typewriter && (!titleComplete || !contentComplete)) {
      if (!titleComplete) {
        setTitleCompleteTrigger((value) => value + 1)
      }
      if (!contentComplete) {
        setContentCompleteTrigger((value) => value + 1)
      }
      return
    }

    if (!isLastPage) {
      setCurrentPage((page) => Math.min(page + 1, totalPages - 1))
    }
  }, [contentComplete, isLastPage, titleComplete, totalPages, typewriter])

  const handleOverlayClick = useCallback(() => {
    if (maskClosable) {
      onClose?.()
    }
  }, [maskClosable, onClose])

  const handleTitleComplete = useCallback(() => {
    setTitleComplete(true)
  }, [])

  const handleContentComplete = useCallback(() => {
    setContentComplete(true)
  }, [])

  const handleContentClick = useCallback(() => {
    if (!typewriter) {
      return
    }

    if (!titleComplete) {
      setTitleCompleteTrigger((value) => value + 1)
    }

    if (!contentComplete) {
      setContentCompleteTrigger((value) => value + 1)
    }
  }, [contentComplete, titleComplete, typewriter])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'Escape' && maskClosable) {
        onClose?.()
      }

      // Enter and Space are the keyboard's "activate the focused control"
      // keys. A dialog that claims them unconditionally swallows form submits
      // and button presses anywhere inside itself — a `content` prop that
      // mentions a confirmation step would page forward instead of submitting.
      // Paging on Enter stays available when the focus is not on a control,
      // which is where it is actually a convenience (the user has just read the
      // page and wants to move on).
      const target = e.target as HTMLElement | null
      const onControl =
        !!target?.closest?.('button, a[href], input, textarea, select, [role="button"], [role="link"]') ||
        target?.isContentEditable === true

      if (e.key === 'ArrowRight' || ((e.key === 'Enter' || e.key === ' ') && !onControl)) {
        handleNext()
      }

      if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, maskClosable, onClose, open])

  // Confirm and cancel deliberately share the same default button. The darker
  // `primary` treatment made the confirm action harder to read against the
  // dialog surface, and the pair reads as one group again.
  const defaultActions: DialogAction[] = [
    { label: resolvedConfirm, onClick: onClose },
    { label: resolvedCancel, onClick: onClose },
  ]

  const finalActions = actions === null ? [] : actions ?? defaultActions
  const showActions = isLastPage && finalActions.length > 0
  // 单页时默认不出分页：一个没人能点的「1 / 1」只是多余的一行
  const showPager = showPagination ?? totalPages > 1
  // 分页和动作都没有时，整条页脚（含它的上分隔线）一起收掉，免得留一条空线
  const defaultFooter = showActions || showPager
  const hasSidebar = Boolean(image || name)

  if (!rendered) return null

  const portalTarget = typeof document !== 'undefined' ? document.body : null

  if (!portalTarget) return null
  const dialogLabel = typeof title === 'string' ? title : undefined

  return createPortal(
    <div
      className={classNames(
        styles['stardew-dialog-overlay'],
        styles[`stardew-dialog-overlay--${mask}`],
        styles[`stardew-dialog-overlay--${placement}`],
        maskClosable && styles['stardew-dialog-overlay--clickable']
      )}
      data-state={motionState}
      style={overlayMotionStyle}
      onClick={handleOverlayClick}
    >
      <div
        className={classNames(styles['stardew-dialog'], styles[`stardew-dialog--${placement}`])}
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
        data-state={motionState}
        onClick={(event) => event.stopPropagation()}
      >
        <StarCard
          className={classNames(
            styles['stardew-dialog__shell'],
            hasSidebar && styles['stardew-dialog__shell--with-sidebar']
          )}
          title={
            typewriter && !titleComplete && title ? (
              <StarTypewriter
                text={title}
                speed={typewriterSpeed}
                key={`title-${titleKey}`}
                onComplete={handleTitleComplete}
                completeTrigger={titleCompleteTrigger}
              />
            ) : (
              title
            )
          }
          showTitle={Boolean(title)}
        >
          <div className={styles['stardew-dialog__inner']}>
            <div className={styles['stardew-dialog__content-panel']}>
              <div
                className={classNames(
                  styles['stardew-dialog__content'],
                  typewriter && (!titleComplete || !contentComplete) && styles['stardew-dialog__content--typing']
                )}
                onClick={handleContentClick}
              >
                {typewriter ? (
                  titleComplete ? (
                    <StarTypewriter
                      text={pages[currentPage]}
                      speed={typewriterSpeed}
                      key={`content-${contentKey}`}
                      onComplete={handleContentComplete}
                      completeTrigger={contentCompleteTrigger}
                    />
                  ) : (
                    <span className={styles['stardew-dialog__waiting']}>{resolvedWaiting}</span>
                  )
                ) : (
                  pages[currentPage]
                )}
              </div>

              {footer === undefined ? (
                defaultFooter ? (
                  <div className={styles['stardew-dialog__footer']}>
                    {showActions ? (
                      <div className={styles['stardew-dialog__actions']}>
                        {finalActions.map((action, index) => (
                          <StarNineSliceButton
                            key={index}
                            type="button"
                            size="small"
                            variant={action.variant ?? 'default'}
                            disabled={action.disabled}
                            onClick={action.onClick}
                          >
                            {action.label}
                          </StarNineSliceButton>
                        ))}
                      </div>
                    ) : (
                      <div />
                    )}

                    {showPager ? (
                      <div className={styles['stardew-dialog__pagination']}>
                        {/* 首页隐藏向上（上一页）三角，尾页隐藏向下（下一页）三角：
                            消失本身就是边界提示，比一枚灰掉的死按钮更安静 */}
                        {!isFirstPage ? (
                          <button
                            type="button"
                            className={styles['stardew-dialog__nav-tri']}
                            title={resolvedPrev}
                            aria-label={resolvedPrev}
                            onClick={handlePrev}
                          >
                            <span
                              className={classNames(styles['stardew-dialog__tri'], styles['stardew-dialog__tri--up'])}
                              aria-hidden
                            />
                          </button>
                        ) : null}
                        <span className={styles['stardew-dialog__page-indicator']}>
                          {currentPage + 1} / {totalPages}
                        </span>
                        {!isLastPage ? (
                          <button
                            type="button"
                            className={styles['stardew-dialog__nav-tri']}
                            title={resolvedNext}
                            aria-label={resolvedNext}
                            onClick={handleNext}
                          >
                            <span
                              className={classNames(styles['stardew-dialog__tri'], styles['stardew-dialog__tri--down'])}
                              aria-hidden
                            />
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null
              ) : footer === null ? null : (
                <div className={classNames(styles['stardew-dialog__footer'], styles['stardew-dialog__footer--custom'])}>
                  {footer}
                </div>
              )}
            </div>

            {hasSidebar ? (
              <div className={styles['stardew-dialog__sidebar']}>
                {image ? (
                  <div className={styles['stardew-dialog__image-panel']}>
                    <div className={styles['stardew-dialog__image-wrap']}>
                      <img src={image} alt={name || resolvedRole} className={styles['stardew-dialog__image']} />
                    </div>
                  </div>
                ) : null}
                {name ? (
                  <div className={styles['stardew-dialog__name-panel']}>
                    <div className={styles['stardew-dialog__name']}>{name}</div>
                  </div>
                ) : null}
              </div>
            ) : null}
            </div>
        </StarCard>
      </div>
    </div>,
    portalTarget
  )
}

export default StarDialog

