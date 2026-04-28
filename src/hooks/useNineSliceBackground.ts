import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { calculateNineSliceLayout, drawNineSlice, type NineSliceInsets } from '../utils/nineSliceCanvas'

type HTMLImageWithSize = HTMLImageElement & {
  naturalWidth: number
  naturalHeight: number
}

type LoadedImage = {
  element: HTMLImageWithSize
  width: number
  height: number
}

export type NineSliceBackgroundOptions = {
  enabled?: boolean
  src: string
  insets: NineSliceInsets
  className?: string
  imageSmoothingEnabled?: boolean
  imageRendering?: CSSProperties['imageRendering']
  zIndex?: number
  autoRedraw?: boolean
  backgroundColor?: string
}

const imageCache = new Map<string, Promise<LoadedImage>>()

const loadImage = (src: string) => {
  const cached = imageCache.get(src)
  if (cached) {
    return cached
  }

  const loading = new Promise<LoadedImage>((resolve, reject) => {
    const img = new Image() as HTMLImageWithSize
    img.decoding = 'async'
    img.onload = () => {
      resolve({
        element: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = () => {
      imageCache.delete(src)
      reject(new Error(`Failed to load nine-slice image: ${src}`))
    }
    img.src = src
  })

  imageCache.set(src, loading)
  return loading
}

export const clearNineSliceImageCache = () => {
  imageCache.clear()
}

export const useNineSliceBackground = ({
  enabled = true,
  src,
  insets,
  className,
  imageSmoothingEnabled = false,
  imageRendering = 'pixelated',
  zIndex = 0,
  autoRedraw = true,
  backgroundColor,
}: NineSliceBackgroundOptions) => {
  const hostRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<LoadedImage | null>(null)
  const [isReady, setIsReady] = useState(false)

  const setHostRef = useCallback((node: HTMLElement | null) => {
    hostRef.current = node
  }, [])

  const draw = useCallback(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const image = imageRef.current

    if (!host || !canvas || !image) {
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

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, targetWidth, targetHeight)
    ctx.imageSmoothingEnabled = imageSmoothingEnabled

    const scaledInsets = {
      top: insets.top * dpr,
      right: insets.right * dpr,
      bottom: insets.bottom * dpr,
      left: insets.left * dpr,
    }

    if (backgroundColor) {
      const layout = calculateNineSliceLayout({
        targetWidth,
        targetHeight,
        sourceWidth: image.width,
        sourceHeight: image.height,
        insets: scaledInsets,
      })

      if (layout.dstCenterWidth > 0 && layout.dstCenterHeight > 0) {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(layout.dstLeft, layout.dstTop, layout.dstCenterWidth, layout.dstCenterHeight)
      }
    }

    drawNineSlice(ctx, {
      image: image.element,
      sourceWidth: image.width,
      sourceHeight: image.height,
      targetWidth,
      targetHeight,
      insets: scaledInsets,
      clearBeforeDraw: false,
    })
  }, [backgroundColor, imageSmoothingEnabled, insets.bottom, insets.left, insets.right, insets.top])

  useEffect(() => {
    if (!enabled) {
      setIsReady(false)
      imageRef.current = null
      return
    }

    let cancelled = false

    setIsReady(false)
    imageRef.current = null

    loadImage(src)
      .then((loaded) => {
        if (cancelled) {
          return
        }
        imageRef.current = loaded
        setIsReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          setIsReady(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [enabled, src])

  useEffect(() => {
    if (!isReady) {
      return
    }
    draw()
  }, [draw, isReady])

  useEffect(() => {
    if (!autoRedraw) {
      return
    }

    const host = hostRef.current
    if (!host) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      draw()
    })

    resizeObserver.observe(host)

    const handleWindowResize = () => {
      draw()
    }

    window.addEventListener('resize', handleWindowResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [autoRedraw, draw])

  const canvasProps = useMemo(
    () => ({
      ref: canvasRef,
      className,
      'aria-hidden': true,
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex,
        imageRendering,
      } as CSSProperties,
    }),
    [className, imageRendering, zIndex]
  )

  return {
    hostRef: setHostRef,
    canvasProps,
    isReady,
    redraw: draw,
  }
}
