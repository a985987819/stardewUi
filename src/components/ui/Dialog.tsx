import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { StarCard } from './Card'
import StarNineSliceButton from './NineSliceButton'
import StarTypewriter from './Typewriter'
import styles from './Dialog.module.scss'

export interface DialogAction {
  label: string
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
  onClick?: () => void
}

export interface StarDialogProps {
  open: boolean
  title?: string
  content: string | string[]
  image?: string
  name?: string
  actions?: DialogAction[] | null
  maskClosable?: boolean
  typewriter?: boolean
  typewriterSpeed?: number
  onClose?: () => void
}

const LABEL_CONFIRM = '确认'
const LABEL_CANCEL = '取消'
const LABEL_ROLE = '角色'
const TITLE_PREV = '上一页'
const TITLE_NEXT = '下一页'
const TITLE_PREV_DISABLED = '已是第一页'
const TITLE_NEXT_DISABLED = '已是最后一页'
const WAITING_TEXT = '等待标题完成...'
function StarDialog({
  open,
  title,
  content,
  image,
  name,
  actions,
  maskClosable = true,
  typewriter = true,
  typewriterSpeed = 100,
  onClose,
}: StarDialogProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  const portalTarget = document.querySelector('[data-star-app="true"]') ?? document.body
  const dialogLabel = typeof title === 'string' ? title : undefined

  return createPortal(
    <DialogSession
      title={title}
      content={content}
      image={image}
      name={name}
      actions={actions}
      maskClosable={maskClosable}
      typewriter={typewriter}
      typewriterSpeed={typewriterSpeed}
      onClose={onClose}
      dialogLabel={dialogLabel}
    />,
    portalTarget
  )
}

function DialogSession({
  title,
  content,
  image,
  name,
  actions,
  maskClosable,
  typewriter,
  typewriterSpeed,
  onClose,
  dialogLabel,
}: Omit<StarDialogProps, 'open'> & { dialogLabel?: string }) {
  const [currentPage, setCurrentPage] = useState(0)
  const [contentKey, setContentKey] = useState(0)
  const [titleComplete, setTitleComplete] = useState(!title || !typewriter)
  const [contentComplete, setContentComplete] = useState(!typewriter)
  const [titleCompleteTrigger, setTitleCompleteTrigger] = useState(0)
  const [contentCompleteTrigger, setContentCompleteTrigger] = useState(0)

  const pages = useMemo(() => (Array.isArray(content) ? content : [content]), [content])
  const totalPages = pages.length
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage >= totalPages - 1
  const hasSidebar = Boolean(image || name)

  const resetTypingState = useCallback(
    (page: number) => {
      setContentKey((k) => k + 1)
      setContentComplete(!typewriter)
      if (page > 0) {
        setTitleComplete(true)
      }
    },
    [typewriter]
  )

  const handlePrev = useCallback(() => {
    if (!isFirstPage) {
      setCurrentPage((page) => {
        const nextPage = Math.max(page - 1, 0)
        resetTypingState(nextPage)
        return nextPage
      })
    }
  }, [isFirstPage, resetTypingState])

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
      setCurrentPage((page) => {
        const nextPage = Math.min(page + 1, totalPages - 1)
        resetTypingState(nextPage)
        return nextPage
      })
    }
  }, [contentComplete, isLastPage, resetTypingState, titleComplete, totalPages, typewriter])

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
      if (e.key === 'Escape' && maskClosable) {
        onClose?.()
      }

      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        handleNext()
      }

      if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, maskClosable, onClose])

  const defaultActions: DialogAction[] = [
    { label: LABEL_CONFIRM, variant: 'primary', onClick: onClose },
    { label: LABEL_CANCEL, variant: 'default', onClick: onClose },
  ]

  const finalActions = actions === null ? [] : actions ?? defaultActions
  const showActions = isLastPage && finalActions.length > 0

  return (
    <div
      className={classNames(styles['stardew-dialog-overlay'], maskClosable && styles['stardew-dialog-overlay--clickable'])}
      onClick={handleOverlayClick}
    >
      <div
        className={styles['stardew-dialog']}
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
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
                    <span className={styles['stardew-dialog__waiting']}>{WAITING_TEXT}</span>
                  )
                ) : (
                  pages[currentPage]
                )}
              </div>

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

                <div className={styles['stardew-dialog__pagination']}>
                  <StarNineSliceButton
                    type="button"
                    size="small"
                    className={styles['stardew-dialog__nav-btn']}
                    onClick={handlePrev}
                    disabled={isFirstPage}
                    title={isFirstPage ? TITLE_PREV_DISABLED : TITLE_PREV}
                  >
                    <ChevronUp size={18} />
                  </StarNineSliceButton>
                  <span className={styles['stardew-dialog__page-indicator']}>
                    {currentPage + 1} / {totalPages}
                  </span>
                  <StarNineSliceButton
                    type="button"
                    size="small"
                    className={styles['stardew-dialog__nav-btn']}
                    onClick={handleNext}
                    disabled={isLastPage}
                    title={isLastPage ? TITLE_NEXT_DISABLED : TITLE_NEXT}
                  >
                    <ChevronDown size={18} />
                  </StarNineSliceButton>
                </div>
              </div>
            </div>

            {hasSidebar ? (
              <div className={styles['stardew-dialog__sidebar']}>
                {image ? (
                  <div className={styles['stardew-dialog__image-panel']}>
                    <div className={styles['stardew-dialog__image-wrap']}>
                      <img src={image} alt={name || LABEL_ROLE} className={styles['stardew-dialog__image']} />
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
    </div>
  )
}

export default StarDialog

