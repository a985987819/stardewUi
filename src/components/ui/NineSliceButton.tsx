import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { useNineSliceBackground } from '../../hooks/useNineSliceBackground'
import './NineSliceButton.css'

type NineSliceButtonVariant = 'default' | 'primary' | 'dashed' | 'text' | 'link'
type NineSliceButtonSize = 'small' | 'medium' | 'large'

export type NineSliceButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: NineSliceButtonVariant
  size?: NineSliceButtonSize
  block?: boolean
  backgroundSrc?: string
  backgroundInsets?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

const cls = (...classNames: Array<string | false | undefined>) => classNames.filter(Boolean).join(' ')

const DEFAULT_INSETS = { top: 8, right: 8, bottom: 8, left: 8 }

const NineSliceButton = forwardRef<HTMLButtonElement, NineSliceButtonProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      block = false,
      backgroundSrc = '/btnImg.png',
      backgroundInsets = DEFAULT_INSETS,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const useCanvasBackground = variant === 'default' || variant === 'primary' || variant === 'dashed'

    const { hostRef, canvasProps } = useNineSliceBackground({
      src: backgroundSrc,
      insets: backgroundInsets,
      className: 'nine-slice-button__canvas',
      zIndex: 0,
      imageSmoothingEnabled: false,
    })

    return (
      <button
        {...rest}
        ref={ref}
        className={cls(
          'nine-slice-button',
          `nine-slice-button--${variant}`,
          `nine-slice-button--${size}`,
          block && 'nine-slice-button--block',
          className
        )}
      >
        {useCanvasBackground ? (
          <span className="nine-slice-button__bg" ref={hostRef as (node: HTMLSpanElement | null) => void}>
            <canvas {...canvasProps} />
          </span>
        ) : null}
        <span className="nine-slice-button__content">{children}</span>
      </button>
    )
  }
)

NineSliceButton.displayName = 'NineSliceButton'

export default NineSliceButton
