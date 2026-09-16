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
import {
  drawPixelBubble,
  drawWoodPanel,
  drawWoodPanelFrame,
  resolveBubblePlacement,
  type BubblePlacement,
} from '../../utils'
import styles from './CanvasBubble.module.scss'

/**
 * `pixel` keeps the classic rounded bubble. `wood` swaps in the angular
 * wood-grain dialog used by the popup: a single frame with staircase corners
 * instead of two nested outlines.
 */
export type CanvasBubbleTexture = 'pixel' | 'wood'

export interface StarCanvasBubbleProps extends HTMLAttributes<HTMLDivElement> {
  bubblePlacement?: BubblePlacement
  texture?: CanvasBubbleTexture
  fillColor?: string
  borderColor?: string
  borderWidth?: number
  cornerSize?: number
  /** Wood texture only: thickness of the inner bevel ring. */
  frameWidth?: number
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
      texture = 'pixel',
      fillColor = '#f8f7f3',
      borderColor = '#2f3440',
      borderWidth = 4,
      cornerSize = 10,
      frameWidth = 4,
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
    const frameCanvasRef = useRef<HTMLCanvasElement | null>(null)

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

      const sizeCanvas = (target: HTMLCanvasElement) => {
        if (target.width !== targetWidth || target.height !== targetHeight) {
          target.width = targetWidth
          target.height = targetHeight
          target.style.width = `${width}px`
          target.style.height = `${height}px`
        }

        const context = target.getContext('2d')
        if (!context) {
          return null
        }

        context.clearRect(0, 0, targetWidth, targetHeight)
        return context
      }

      const ctx = sizeCanvas(canvas)
      const frameCtx = frameCanvasRef.current ? sizeCanvas(frameCanvasRef.current) : null

      if (!ctx) {
        return
      }

      if (texture === 'wood') {
        const woodOptions = {
          width: targetWidth,
          height: targetHeight,
          placement: bubblePlacement,
          borderWidth: borderWidth * dpr,
          frameWidth: frameWidth * dpr,
          arrowWidth: arrowWidth * dpr,
          arrowDepth: arrowDepth * dpr,
        }

        drawWoodPanel(ctx, woodOptions)

        // Second pass on the overlay canvas, above the DOM content.
        if (frameCtx) {
          drawWoodPanelFrame(frameCtx, woodOptions)
        }

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
    }, [
      arrowDepth,
      arrowWidth,
      borderColor,
      borderWidth,
      bubblePlacement,
      cornerSize,
      fillColor,
      frameWidth,
      texture,
    ])

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

    // The wood texture adds an inner bevel ring, so content has to clear
    // `borderWidth + frameWidth` instead of just the outer frame.
    const edgeInset = texture === 'wood' ? borderWidth + frameWidth : borderWidth

    const contentStyle = useMemo(
      () =>
        ({
          paddingTop: contentPadding + edgeInset + (resolvedPlacement.side === 'top' ? arrowDepth : 0),
          paddingRight: contentPadding + edgeInset + (resolvedPlacement.side === 'right' ? arrowDepth : 0),
          paddingBottom: contentPadding + edgeInset + (resolvedPlacement.side === 'bottom' ? arrowDepth : 0),
          paddingLeft: contentPadding + edgeInset + (resolvedPlacement.side === 'left' ? arrowDepth : 0),
        }) satisfies CSSProperties,
      [arrowDepth, contentPadding, edgeInset, resolvedPlacement.side]
    )

    return (
      <div {...rest} ref={setHostRef} className={classNames(styles['canvas-bubble'], className)} style={style}>
        <canvas ref={canvasRef} className={styles['canvas-bubble__canvas']} aria-hidden />
        <div className={classNames(styles['canvas-bubble__content'], contentClassName)} style={contentStyle}>
          {children}
        </div>
        {texture === 'wood' ? (
          <canvas
            ref={frameCanvasRef}
            className={classNames(styles['canvas-bubble__canvas'], styles['canvas-bubble__canvas--frame'])}
            aria-hidden
          />
        ) : null}
      </div>
    )
  }
)

StarCanvasBubble.displayName = 'StarCanvasBubble'

export default StarCanvasBubble
