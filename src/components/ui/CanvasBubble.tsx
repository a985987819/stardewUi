import {
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { classNames } from '../../utils/classNames'
import { drawPixelBubble, resolveBubblePlacement, type BubblePlacement } from '../../utils'
import styles from './CanvasBubble.module.css'

export interface StarCanvasBubbleProps extends HTMLAttributes<HTMLDivElement> {
  bubblePlacement?: BubblePlacement
  fillColor?: string
  borderColor?: string
  borderWidth?: number
  cornerSize?: number
  arrowWidth?: number
  arrowDepth?: number
  contentPadding?: number
  contentClassName?: string
}

const setRefValue = <T,>(ref: ForwardedRef<T>, value: T) => {
  if (typeof ref === 'function') {
    ref(value)
    return
  }

  if (ref) {
    ref.current = value
  }
}

const StarCanvasBubble = forwardRef<HTMLDivElement, StarCanvasBubbleProps>(
  (
    {
      bubblePlacement = 'none',
      fillColor = '#f8f7f3',
      borderColor = '#2f3440',
      borderWidth = 4,
      cornerSize = 10,
      arrowWidth = 20,
      arrowDepth = 12,
      contentPadding = 14,
      className,
      contentClassName,
      children,
      style,
      ...rest
    },
    forwardedRef
  ) => {
    const hostRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const setHostRef = useCallback(
      (node: HTMLDivElement | null) => {
        hostRef.current = node
        setRefValue(forwardedRef, node)
      },
      [forwardedRef]
    )

    const draw = useCallback(() => {
      const host = hostRef.current
      const canvas = canvasRef.current

      if (!host || !canvas) {
        return
      }

      const width = Math.round(host.clientWidth)
      const height = Math.round(host.clientHeight)

      if (width <= 0 || height <= 0) {
        return
      }

      const dpr = window.devicePixelRatio || 1
      const targetWidth = Math.max(1, Math.round(width * dpr))
      const targetHeight = Math.max(1, Math.round(height * dpr))

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth
        canvas.height = targetHeight
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return
      }

      drawPixelBubble(ctx, {
        width: targetWidth,
        height: targetHeight,
        placement: bubblePlacement,
        fillColor,
        borderColor,
        borderWidth: borderWidth * dpr,
        cornerSize: cornerSize * dpr,
        arrowWidth: arrowWidth * dpr,
        arrowDepth: arrowDepth * dpr,
      })
    }, [arrowDepth, arrowWidth, borderColor, borderWidth, bubblePlacement, cornerSize, fillColor])

    useEffect(() => {
      draw()
    }, [draw])

    useEffect(() => {
      const host = hostRef.current
      if (!host) {
        return
      }

      const resizeObserver = new ResizeObserver(() => {
        draw()
      })

      resizeObserver.observe(host)
      window.addEventListener('resize', draw)

      return () => {
        resizeObserver.disconnect()
        window.removeEventListener('resize', draw)
      }
    }, [draw])

    const resolvedPlacement = useMemo(() => resolveBubblePlacement(bubblePlacement), [bubblePlacement])

    const contentStyle = useMemo(
      () =>
        ({
          paddingTop: contentPadding + borderWidth + (resolvedPlacement.side === 'top' ? arrowDepth : 0),
          paddingRight: contentPadding + borderWidth + (resolvedPlacement.side === 'right' ? arrowDepth : 0),
          paddingBottom: contentPadding + borderWidth + (resolvedPlacement.side === 'bottom' ? arrowDepth : 0),
          paddingLeft: contentPadding + borderWidth + (resolvedPlacement.side === 'left' ? arrowDepth : 0),
        }) satisfies CSSProperties,
      [arrowDepth, borderWidth, contentPadding, resolvedPlacement.side]
    )

    return (
      <div {...rest} ref={setHostRef} className={classNames(styles['canvas-bubble'], className)} style={style}>
        <canvas ref={canvasRef} className={styles['canvas-bubble__canvas']} aria-hidden />
        <div className={classNames(styles['canvas-bubble__content'], contentClassName)} style={contentStyle}>
          {children}
        </div>
      </div>
    )
  }
)

StarCanvasBubble.displayName = 'StarCanvasBubble'

export default StarCanvasBubble
