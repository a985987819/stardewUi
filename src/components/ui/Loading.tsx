import { useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import { getBunJoltOffset } from './loadingMath'
import styles from './Loading.module.scss'

const FRAME_COUNT = 12
const FRAME_DURATION = 240
const DEFAULT_TEXT = '正在加载...'
const LOADING_IMAGE_SRC = `${import.meta.env.BASE_URL}loadingBaozi.png`
const FULL_CIRCLE = Math.PI * 2
const START_ANGLE = -Math.PI / 2
const BUN_EDGE_RATIO = 0
const BITE_CENTER_DISTANCE_RATIO = 0.97
const BITE_DEPTH_RATIO = 0.39
const BITE_JOLT_LEVELS = [1, 0.55, 0] as const
const BITE_JOLT_DECAY_DURATION = 60

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
  radiusX: number
  radiusY: number
  rotation: number
  arcStart: number
  arcEnd: number
}

function createBiteMasks(canvasSize: number, biteCount: number): BiteMask[] {
  const centerPoint = canvasSize / 2
  const bunRadius = getBunRadius(canvasSize)
  const stepAngle = FULL_CIRCLE / FRAME_COUNT
  const halfStep = stepAngle / 2
  const centerDistance = bunRadius * BITE_CENTER_DISTANCE_RATIO
  const radiusY = bunRadius * BITE_DEPTH_RATIO
  const radiusX = Math.tan(halfStep) * Math.sqrt(Math.max(centerDistance * centerDistance - radiusY * radiusY, 0))
  const arcStart = Math.atan2(radiusY * Math.sin(halfStep), radiusX * Math.cos(halfStep))
  const arcEnd = Math.PI - arcStart

  return Array.from({ length: biteCount }, (_, index) => {
    const angle = START_ANGLE + index * stepAngle

    return {
      x: centerPoint + Math.cos(angle) * centerDistance,
      y: centerPoint + Math.sin(angle) * centerDistance,
      radiusX,
      radiusY,
      rotation: angle + Math.PI / 2,
      arcStart,
      arcEnd,
    }
  })
}

function applyBiteMasks(ctx: CanvasRenderingContext2D, canvasSize: number, biteCount: number) {
  if (biteCount <= 0) {
    return
  }

  const centerPoint = canvasSize / 2
  const bunRadius = getBunRadius(canvasSize)
  const strokeWidth = Math.max(1.1, canvasSize * 0.03)
  const bites = createBiteMasks(canvasSize, biteCount)

  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  bites.forEach(({ x, y, radiusX, radiusY, rotation }) => {
    ctx.beginPath()
    ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, FULL_CIRCLE)
    ctx.fill()
  })
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.arc(centerPoint, centerPoint, bunRadius, 0, FULL_CIRCLE)
  ctx.clip()

  ctx.strokeStyle = 'rgb(105, 69, 51,0.3)'
  ctx.lineWidth = strokeWidth
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  bites.forEach(({ x, y, radiusX, radiusY, rotation, arcStart, arcEnd }) => {
    ctx.beginPath()
    ctx.ellipse(x, y, radiusX, radiusY, rotation, arcStart, arcEnd)
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
  const resolvedText = text === undefined ? DEFAULT_TEXT : text
  const isAriaHidden = rest['aria-hidden'] === true || rest['aria-hidden'] === 'true'

  return (
    <LoadingSession
      key={`${active ? 'active' : 'inactive'}-${size}-${resolvedText}`}
      {...rest}
      active={active}
      text={resolvedText}
      size={size}
      gap={gap}
      center={center}
      block={block}
      fill={fill}
      className={className}
      style={style}
      role={isAriaHidden ? undefined : role ?? 'status'}
      ariaLabel={isAriaHidden ? undefined : resolvedText || DEFAULT_TEXT}
    />
  )
}

function LoadingSession({
  active,
  text,
  size = 28,
  gap = 8,
  center,
  block,
  fill,
  className,
  style,
  role,
  ariaLabel,
  ...rest
}: Omit<StarLoadingProps, 'text' | 'role'> & {
  text: string
  role?: string
  ariaLabel?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const timerRef = useRef<number | null>(null)
  const joltTimerRef = useRef<number | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [hiddenSlices, setHiddenSlices] = useState(0)
  const [joltIndex, setJoltIndex] = useState(2)

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
      if (joltTimerRef.current !== null) {
        window.clearTimeout(joltTimerRef.current)
        joltTimerRef.current = null
      }
      return
    }

    timerRef.current = window.setTimeout(() => {
      setHiddenSlices((current) => {
        const nextHiddenSlices = current >= FRAME_COUNT ? 0 : current + 1
        setJoltIndex(nextHiddenSlices <= 0 || nextHiddenSlices >= FRAME_COUNT ? 2 : 0)
        return nextHiddenSlices
      })
    }, FRAME_DURATION)

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [active, hiddenSlices])

  useEffect(() => {
    if (joltIndex >= BITE_JOLT_LEVELS.length - 1) {
      return
    }

    joltTimerRef.current = window.setTimeout(() => {
      setJoltIndex((current) => Math.min(current + 1, BITE_JOLT_LEVELS.length - 1))
    }, BITE_JOLT_DECAY_DURATION)

    return () => {
      if (joltTimerRef.current !== null) {
        window.clearTimeout(joltTimerRef.current)
        joltTimerRef.current = null
      }
    }
  }, [joltIndex])

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

  const joltOffset = getBunJoltOffset(size, hiddenSlices, BITE_JOLT_LEVELS[joltIndex])
  const rootStyle = useMemo(
    () =>
      ({
        ...style,
        '--star-loading-size': `${size}px`,
        '--star-loading-gap': `${gap}px`,
        '--star-loading-jolt-x': `${joltOffset.x}px`,
        '--star-loading-jolt-y': `${joltOffset.y}px`,
      }) as CSSProperties,
    [gap, joltOffset.x, joltOffset.y, size, style]
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
      role={role}
      aria-label={ariaLabel}
    >
      <canvas ref={canvasRef} className={styles['loading__canvas']} aria-hidden />
      {text ? <span className={styles['loading__text']}>{text}</span> : null}
    </div>
  )
}

export default StarLoading


