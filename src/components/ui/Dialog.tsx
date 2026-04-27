import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import StarCanvasPanel from './CanvasPanel'
import StarNineSliceButton from './NineSliceButton'
import StarTypewriter from './Typewriter'
import styles from './Dialog.module.css'

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
  const [currentPage, setCurrentPage] = useState(0)
  const [titleKey, setTitleKey] = useState(0)
  const [contentKey, setContentKey] = useState(0)
  const [titleComplete, setTitleComplete] = useState(false)

  const pages = useMemo(() => (Array.isArray(content) ? content : [content]), [content])
  const totalPages = pages.length
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage >= totalPages - 1

  useEffect(() => {
    if (open) {
      setCurrentPage(0)
      setTitleComplete(!title || !typewriter)
      setTitleKey((k) => k + 1)
      setContentKey((k) => k + 1)
    }
  }, [open, title, typewriter])

  useEffect(() => {
    setContentKey((k) => k + 1)
    if (!isFirstPage) {
      setTitleComplete(true)
    }
  }, [currentPage, isFirstPage])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'Escape' && maskClosable) {
        onClose?.()
      }

      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        if (!isLastPage) {
          setCurrentPage((page) => Math.min(page + 1, totalPages - 1))
        }
      }

      if (e.key === 'ArrowLeft') {
        if (!isFirstPage) {
          setCurrentPage((page) => Math.max(page - 1, 0))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFirstPage, isLastPage, maskClosable, onClose, open, totalPages])

  const handlePrev = useCallback(() => {
    if (!isFirstPage) {
      setCurrentPage((page) => Math.max(page - 1, 0))
    }
  }, [isFirstPage])

  const handleNext = useCallback(() => {
    if (!isLastPage) {
      setCurrentPage((page) => Math.min(page + 1, totalPages - 1))
    }
  }, [isLastPage, totalPages])

  const handleOverlayClick = useCallback(() => {
    if (maskClosable) {
      onClose?.()
    }
  }, [maskClosable, onClose])

  const handleTitleComplete = useCallback(() => {
    setTitleComplete(true)
  }, [])

  const defaultActions: DialogAction[] = [
    { label: LABEL_CONFIRM, variant: 'primary', onClick: onClose },
    { label: LABEL_CANCEL, variant: 'default', onClick: onClose },
  ]

  const finalActions = actions === null ? [] : actions ?? defaultActions
  const showActions = isLastPage && finalActions.length > 0

  if (!open) return null

  return (
    <div
      className={classNames(styles['stardew-dialog-overlay'], maskClosable && styles['stardew-dialog-overlay--clickable'])}
      onClick={handleOverlayClick}
    >
      <div className={styles['stardew-dialog']} onClick={(event) => event.stopPropagation()}>
        <StarCanvasPanel
          className={styles['stardew-dialog__left']}
          contentClassName={styles['stardew-dialog__left-content']}
          fillColor="#f7edd6"
          borderColor="#9e460f"
          borderWidth={5}
          stepSize={8}
          contentPadding={14}
        >
          {title ? (
            <h3 className={styles['stardew-dialog__title']}>
              {typewriter && !titleComplete ? (
                <StarTypewriter
                  text={title}
                  speed={typewriterSpeed}
                  key={`title-${titleKey}`}
                  onComplete={handleTitleComplete}
                />
              ) : (
                title
              )}
            </h3>
          ) : null}

          <div className={styles['stardew-dialog__content']}>
            {typewriter ? (
              titleComplete ? (
                <StarTypewriter text={pages[currentPage]} speed={typewriterSpeed} key={`content-${contentKey}`} />
              ) : (
                <span style={{ opacity: 0 }}>{WAITING_TEXT}</span>
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
            ) : null}

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
        </StarCanvasPanel>

        {image || name ? (
          <div className={styles['stardew-dialog__right']}>
            {image ? (
              <StarCanvasPanel
                className={styles['stardew-dialog__image-wrap']}
                fillColor="#f7edd6"
                borderColor="#9e460f"
                borderWidth={5}
                stepSize={8}
                contentPadding={10}
              >
                <img src={image} alt={name || LABEL_ROLE} className={styles['stardew-dialog__image']} />
              </StarCanvasPanel>
            ) : null}
            {name ? (
              <StarCanvasPanel
                className={styles['stardew-dialog__name']}
                fillColor="#fdd284"
                borderColor="#9e460f"
                borderWidth={5}
                stepSize={8}
                contentPadding={8}
              >
                {name}
              </StarCanvasPanel>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default StarDialog
