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
import { drawPixelPanel } from '../../utils/pixelPanelCanvas'
import styles from './CanvasPanel.module.scss'

export interface StarCanvasPanelProps extends HTMLAttributes<HTMLDivElement> {
  fillColor?: string
  borderColor?: string
  borderWidth?: number
  stepSize?: number
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

const StarCanvasPanel = forwardRef<HTMLDivElement, StarCanvasPanelProps>(
  (
    {
      fillColor = '#f8f0dc',
      borderColor = '#9e460f',
      borderWidth = 4,
      stepSize = 6,
      contentPadding = 12,
      contentClassName,
      className,
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

      drawPixelPanel(ctx, {
        width: targetWidth,
        height: targetHeight,
        fillColor,
        borderColor,
        borderWidth: borderWidth * dpr,
        stepSize: stepSize * dpr,
      })
    }, [borderColor, borderWidth, fillColor, stepSize])

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

    const contentStyle = useMemo(
      () =>
        ({
          padding: contentPadding + borderWidth,
        }) satisfies CSSProperties,
      [borderWidth, contentPadding]
    )

    return (
      <div {...rest} ref={setHostRef} className={classNames(styles['canvas-panel'], className)} style={style}>
        <canvas ref={canvasRef} className={styles['canvas-panel__canvas']} aria-hidden />
        <div className={classNames(styles['canvas-panel__content'], contentClassName)} style={contentStyle}>
          {children}
        </div>
      </div>
    )
  }
)

StarCanvasPanel.displayName = 'StarCanvasPanel'

export default StarCanvasPanel
