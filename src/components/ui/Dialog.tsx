import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import Typewriter from './Typewriter'
import './Dialog.css'

export interface DialogAction {
  label: string
  variant?: 'default' | 'primary' | 'danger'
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
  const [key, setKey] = useState(0)
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
      setKey((k) => k + 1)
    }
  }, [open, title, typewriter])

  useEffect(() => {
    setKey((k) => k + 1)
    setTitleComplete(!title || !typewriter)
  }, [currentPage, title, typewriter])

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
    { label: '确认', variant: 'primary', onClick: onClose },
    { label: '取消', variant: 'default', onClick: onClose },
  ]

  const finalActions = actions === null ? [] : actions ?? defaultActions
  const showActions = isLastPage && finalActions.length > 0

  if (!open) return null

  return (
    <div
      className={classNames(
        'stardew-dialog-overlay',
        maskClosable && 'stardew-dialog-overlay--clickable'
      )}
      onClick={handleOverlayClick}
    >
      <div className="stardew-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="stardew-dialog__left">
          {title && (
            <h3 className="stardew-dialog__title">
              {typewriter ? (
                <Typewriter
                  text={title}
                  speed={typewriterSpeed}
                  key={`title-${key}`}
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
                <Typewriter text={pages[currentPage]} speed={typewriterSpeed} key={`content-${key}`} />
              ) : (
                <span style={{ opacity: 0 }}>等待标题完成...</span>
              )
            ) : (
              pages[currentPage]
            )}
          </div>

          <div className="stardew-dialog__footer">
            {showActions && (
              <div className="stardew-dialog__actions">
                {finalActions.map((action, index) => (
                  <button
                    key={index}
                    className={classNames(
                      'stardew-dialog-btn',
                      action.variant === 'primary' && 'stardew-dialog-btn--primary',
                      action.variant === 'danger' && 'stardew-dialog-btn--danger'
                    )}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <div className="stardew-dialog__pagination">
              <button
                className="stardew-dialog__nav-btn"
                onClick={handlePrev}
                disabled={isFirstPage}
                title={isFirstPage ? '已是第一页' : '上一页'}
              >
                <ChevronUp size={18} />
              </button>
              <span className="stardew-dialog__page-indicator">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                className="stardew-dialog__nav-btn"
                onClick={handleNext}
                disabled={isLastPage}
                title={isLastPage ? '已是最后一页' : '下一页'}
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        </div>

        {(image || name) && (
          <div className="stardew-dialog__right">
            {image && (
              <div className="stardew-dialog__image-wrap">
                <img
                  src={image}
                  alt={name || '角色'}
                  className="stardew-dialog__image"
                />
              </div>
            )}
            {name && (
              <div className="stardew-dialog__name">{name}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dialog
