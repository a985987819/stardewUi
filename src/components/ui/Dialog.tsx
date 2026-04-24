import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { classNames } from '../../utils/classNames'
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
  onClose,
}: DialogProps) {
  const [currentPage, setCurrentPage] = useState(0)

  const pages = useMemo(() => {
    if (Array.isArray(content)) return content
    return [content]
  }, [content])

  const totalPages = pages.length
  const isLastPage = currentPage >= totalPages - 1

  useEffect(() => {
    if (open) {
      setCurrentPage(0)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape' && maskClosable) {
        onClose?.()
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (!isLastPage) {
          setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isLastPage, totalPages, maskClosable, onClose])

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
          {title && <h3 className="stardew-dialog__title">{title}</h3>}

          <div className="stardew-dialog__content">
            {pages[currentPage]}
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
              <span className="stardew-dialog__page-indicator">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                className="stardew-dialog__next-btn"
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
