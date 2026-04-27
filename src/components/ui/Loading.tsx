import { useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Loading.module.scss'

const FRAME_COUNT = 12
const FRAME_DURATION = 300
const DEFAULT_TEXT = '请稍候'
const LOADING_IMAGE_SRC = `${import.meta.env.BASE_URL}loadingBaozi.png`
const FULL_CIRCLE = Math.PI * 2
const START_ANGLE = -Math.PI / 2
const BUN_EDGE_RATIO = 0
const BITE_WIDTH_RATIO = 0.3
const BITE_DEPTH_RATIO = 0.25
const BITE_OUTLINE_START = Math.PI * 0.45
const BITE_OUTLINE_END = Math.PI * 0.6

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

function getBunRadius(canvasSize: number) {
  return canvasSize / 2 - canvasSize * BUN_EDGE_RATIO
}

function drawFallback(ctx: CanvasRenderingContext2D, size: number) {
  const center = size / 2
  const radius = getBunRadius(size)

  ctx.fillStyle = '#f5d7a1'
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, FULL_CIRCLE)
  ctx.fill()

  ctx.strokeStyle = '#8b4c22'
  ctx.lineWidth = Math.max(2, size * 0.08)
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, FULL_CIRCLE)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'
  ctx.beginPath()
  ctx.arc(center - size * 0.12, center - size * 0.14, size * 0.17, 0, FULL_CIRCLE)
  ctx.fill()
}

type BiteMask = {
  x: number
  y: number
  rotation: number
}

function createBiteMasks(canvasSize: number, biteCount: number): BiteMask[] {
  const centerPoint = canvasSize / 2
  const bunRadius = getBunRadius(canvasSize)
  const biteRadiusY = canvasSize * BITE_DEPTH_RATIO
  const biteDistance = bunRadius + biteRadiusY * 0.12
  const stepAngle = FULL_CIRCLE / FRAME_COUNT

  return Array.from({ length: biteCount }, (_, index) => {
    const angle = START_ANGLE + index * stepAngle

    return {
      x: centerPoint + Math.cos(angle) * biteDistance,
      y: centerPoint + Math.sin(angle) * biteDistance,
      rotation: angle + Math.PI / 2,
    }
  })
}

function applyBiteMasks(ctx: CanvasRenderingContext2D, canvasSize: number, biteCount: number) {
  if (biteCount <= 0) {
    return
  }

  const centerPoint = canvasSize / 2
  const bunRadius = getBunRadius(canvasSize)
  const biteRadiusX = canvasSize * BITE_WIDTH_RATIO
  const biteRadiusY = canvasSize * BITE_DEPTH_RATIO
  const strokeWidth = Math.max(1.1, canvasSize * 0.03)
  const bites = createBiteMasks(canvasSize, biteCount)

  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  bites.forEach(({ x, y, rotation }) => {
    ctx.beginPath()
    ctx.ellipse(x, y, biteRadiusX, biteRadiusY, rotation, 0, FULL_CIRCLE)
    ctx.fill()
  })
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.arc(centerPoint, centerPoint, bunRadius, 0, FULL_CIRCLE)
  ctx.clip()

  ctx.strokeStyle = '#6c4836'
  ctx.lineWidth = strokeWidth
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  bites.forEach(({ x, y, rotation }) => {
    // Only draw the inward-facing bite arc, so neighboring bites do not expose stray interior lines.
    ctx.beginPath()
    ctx.ellipse(x, y, biteRadiusX, biteRadiusY, rotation, BITE_OUTLINE_START, BITE_OUTLINE_END)
    ctx.stroke()
  })
  ctx.restore()
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

    ctx.save()
    ctx.beginPath()
    ctx.arc(targetSize / 2, targetSize / 2, getBunRadius(targetSize), 0, FULL_CIRCLE)
    ctx.clip()

    if (image) {
      ctx.drawImage(image, 0, 0, targetSize, targetSize)
    } else {
      drawFallback(ctx, targetSize)
    }

    ctx.restore()

    applyBiteMasks(ctx, targetSize, hiddenSlices)
  }, [hiddenSlices, image, size])

  const resolvedText = text === undefined ? DEFAULT_TEXT : text
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
      {resolvedText ? <span className={styles['loading__text']}>{resolvedText}</span> : null}
    </div>
  )
}

export default StarLoading
