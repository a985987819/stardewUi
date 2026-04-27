import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import CanvasPanel from './CanvasPanel'
import NineSliceButton from './NineSliceButton'
import Typewriter from './Typewriter'
import './Dialog.css'

export interface DialogAction {
  label: string
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
  onClick?: () => void
}

export interface DialogProps {
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

const LABEL_CONFIRM = '\u786e\u8ba4'
const LABEL_CANCEL = '\u53d6\u6d88'
const LABEL_ROLE = '\u89d2\u8272'
const TITLE_PREV = '\u4e0a\u4e00\u9875'
const TITLE_NEXT = '\u4e0b\u4e00\u9875'
const TITLE_PREV_DISABLED = '\u5df2\u662f\u7b2c\u4e00\u9875'
const TITLE_NEXT_DISABLED = '\u5df2\u662f\u6700\u540e\u4e00\u9875'
const WAITING_TEXT = '\u7b49\u5f85\u6807\u9898\u5b8c\u6210...'

function Dialog({
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
}: DialogProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [titleKey, setTitleKey] = useState(0)
  const [contentKey, setContentKey] = useState(0)
  const [titleComplete, setTitleComplete] = useState(false)

  const pages = useMemo(() => {
    if (Array.isArray(content)) return content
    return [content]
  }, [content])

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
  }, [currentPage, title, typewriter, isFirstPage])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape' && maskClosable) {
        onClose?.()
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        if (!isLastPage) {
          setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
        }
      }
      if (e.key === 'ArrowLeft') {
        if (!isFirstPage) {
          setCurrentPage((p) => Math.max(p - 1, 0))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isFirstPage, isLastPage, totalPages, maskClosable, onClose])

  const handlePrev = useCallback(() => {
    if (!isFirstPage) {
      setCurrentPage((p) => Math.max(p - 1, 0))
    }
  }, [isFirstPage])

  const handleNext = useCallback(() => {
    if (!isLastPage) {
      setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
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
      className={classNames('stardew-dialog-overlay', maskClosable && 'stardew-dialog-overlay--clickable')}
      onClick={handleOverlayClick}
    >
      <div className="stardew-dialog" onClick={(e) => e.stopPropagation()}>
        <CanvasPanel
          className="stardew-dialog__left"
          fillColor="#f7edd6"
          borderColor="#9e460f"
          borderWidth={5}
          stepSize={8}
          contentPadding={14}
        >
          {title && (
            <h3 className="stardew-dialog__title">
              {typewriter && !titleComplete ? (
                <Typewriter
                  text={title}
                  speed={typewriterSpeed}
                  key={`title-${titleKey}`}
                  onComplete={handleTitleComplete}
                />
              ) : (
                title
              )}
            </h3>
          )}

          <div className="stardew-dialog__content">
            {typewriter ? (
              titleComplete ? (
                <Typewriter
                  text={pages[currentPage]}
                  speed={typewriterSpeed}
                  key={`content-${contentKey}`}
                />
              ) : (
                <span style={{ opacity: 0 }}>{WAITING_TEXT}</span>
              )
            ) : (
              pages[currentPage]
            )}
          </div>

          <div className="stardew-dialog__footer">
            {showActions && (
              <div className="stardew-dialog__actions">
                {finalActions.map((action, index) => (
                  <NineSliceButton
                    key={index}
                    type="button"
                    size="small"
                    variant={action.variant ?? 'default'}
                    disabled={action.disabled}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </NineSliceButton>
                ))}
              </div>
            )}

            <div className="stardew-dialog__pagination">
              <NineSliceButton
                type="button"
                size="small"
                className="stardew-dialog__nav-btn"
                onClick={handlePrev}
                disabled={isFirstPage}
                title={isFirstPage ? TITLE_PREV_DISABLED : TITLE_PREV}
              >
                <ChevronUp size={18} />
              </NineSliceButton>
              <span className="stardew-dialog__page-indicator">
                {currentPage + 1} / {totalPages}
              </span>
              <NineSliceButton
                type="button"
                size="small"
                className="stardew-dialog__nav-btn"
                onClick={handleNext}
                disabled={isLastPage}
                title={isLastPage ? TITLE_NEXT_DISABLED : TITLE_NEXT}
              >
                <ChevronDown size={18} />
              </NineSliceButton>
            </div>
          </div>
        </CanvasPanel>

        {(image || name) && (
          <div className="stardew-dialog__right">
            {image && (
              <CanvasPanel
                className="stardew-dialog__image-wrap"
                fillColor="#f7edd6"
                borderColor="#9e460f"
                borderWidth={5}
                stepSize={8}
                contentPadding={10}
              >
                <img src={image} alt={name || LABEL_ROLE} className="stardew-dialog__image" />
              </CanvasPanel>
            )}
            {name && (
              <CanvasPanel
                className="stardew-dialog__name"
                fillColor="#fdd284"
                borderColor="#9e460f"
                borderWidth={5}
                stepSize={8}
                contentPadding={8}
              >
                {name}
              </CanvasPanel>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dialog
