import { useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Loading.module.scss'

const FRAME_COUNT = 12
const FRAME_DURATION = 200
const DEFAULT_TEXT = '请稍候'
const LOADING_IMAGE_SRC = `${import.meta.env.BASE_URL}loadingBaozi.png`

let loadingImagePromise: Promise<HTMLImageElement> | null = null

function loadLoadingImage() {
  if (!loadingImagePromise) {
    loadingImagePromise = new Promise((resolve, reject) => {
      const image = new Image()
      image.decoding = 'async'
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error(`Failed to load loading image: ${LOADING_IMAGE_SRC}`))
      image.src = LOADING_IMAGE_SRC
    })
  }

  return loadingImagePromise
}

function drawFallback(ctx: CanvasRenderingContext2D, size: number) {
  const center = size / 2
  const radius = center - size * 0.06

  ctx.fillStyle = '#f5d7a1'
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#8b4c22'
  ctx.lineWidth = Math.max(2, size * 0.08)
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'
  ctx.beginPath()
  ctx.arc(center - size * 0.12, center - size * 0.14, size * 0.17, 0, Math.PI * 2)
  ctx.fill()
}

export interface StarLoadingProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean
  text?: string
  size?: number
  gap?: number
  center?: boolean
  block?: boolean
  fill?: boolean
}

function StarLoading({
  active = true,
  text,
  size = 28,
  gap = 8,
  center = false,
  block = false,
  fill = false,
  className,
  style,
  role,
  ...rest
}: StarLoadingProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const timerRef = useRef<number | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [hiddenSlices, setHiddenSlices] = useState(0)

  useEffect(() => {
    let cancelled = false

    loadLoadingImage()
      .then((loadedImage) => {
        if (!cancelled) {
          setImage(loadedImage)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setImage(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!active) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    setHiddenSlices(0)
  }, [active])

  useEffect(() => {
    if (!active) {
      return
    }

    timerRef.current = window.setTimeout(() => {
      setHiddenSlices((current) => (current >= FRAME_COUNT ? 0 : current + 1))
    }, FRAME_DURATION)

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [active, hiddenSlices])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const dpr = window.devicePixelRatio || 1
    const targetSize = Math.max(1, Math.round(size * dpr))
    if (canvas.width !== targetSize || canvas.height !== targetSize) {
      canvas.width = targetSize
      canvas.height = targetSize
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    ctx.clearRect(0, 0, targetSize, targetSize)
    if (hiddenSlices >= FRAME_COUNT) {
      return
    }

    const visibleRatio = 1 - hiddenSlices / FRAME_COUNT
    const centerPoint = targetSize / 2

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(centerPoint, centerPoint)
    ctx.arc(centerPoint, centerPoint, centerPoint, -Math.PI / 2, -Math.PI / 2 + visibleRatio * Math.PI * 2, false)
    ctx.closePath()
    ctx.clip()

    if (image) {
      ctx.drawImage(image, 0, 0, targetSize, targetSize)
    } else {
      drawFallback(ctx, targetSize)
    }

    ctx.restore()
  }, [hiddenSlices, image, size])

  const resolvedText = text === undefined ? `${DEFAULT_TEXT}` : text
  const isAriaHidden = rest['aria-hidden'] === true || rest['aria-hidden'] === 'true'
  const rootStyle = useMemo(
    () =>
      ({
        ...style,
        '--star-loading-size': `${size}px`,
        '--star-loading-gap': `${gap}px`,
      }) as CSSProperties,
    [gap, size, style]
  )

  return (
    <div
      {...rest}
      className={classNames(
        styles.loading,
        center && styles['loading--center'],
        block && styles['loading--block'],
        fill && styles['loading--fill'],
        className
      )}
      style={rootStyle}
      role={isAriaHidden ? undefined : role ?? 'status'}
      aria-label={isAriaHidden ? undefined : resolvedText || DEFAULT_TEXT}
    >
      <canvas ref={canvasRef} className={styles['loading__canvas']} aria-hidden />

      <span className={styles['loading__text']}>{resolvedText || null}</span>
    </div>
  )
}

export default StarLoading
