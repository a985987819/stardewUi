import { useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import {
  applyBiteMasks,
  BITE_JOLT_DECAY_DURATION,
  BITE_JOLT_LEVELS,
  drawLoadingFallback,
  getBunJoltOffset,
  getBunRadius,
  loadLoadingImage,
  LOADING_DEFAULT_TEXT,
  LOADING_FRAME_COUNT,
  LOADING_FRAME_DURATION,
} from './loadingCanvas'
import styles from './Loading.module.scss'

export interface StarLoadingProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean
  text?: string
  size?: number
  gap?: number
  center?: boolean
  block?: boolean
  fill?: boolean
}

const RESTING_JOLT_INDEX = BITE_JOLT_LEVELS.length - 1

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
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [hiddenSlices, setHiddenSlices] = useState(0)
  const [joltIndex, setJoltIndex] = useState(RESTING_JOLT_INDEX)

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

  // Resetting animation state when `active` flips used to happen inside an
  // effect, which schedules an extra render pass and can visibly flicker. The
  // React-recommended approach is to adjust state during render instead; React
  // re-runs the component immediately without committing the intermediate tree.
  const [previousActive, setPreviousActive] = useState(active)

  if (previousActive !== active) {
    setPreviousActive(active)

    if (active) {
      setHiddenSlices(0)
      setJoltIndex(RESTING_JOLT_INDEX)
    }
  }

  const [previousHiddenSlices, setPreviousHiddenSlices] = useState(hiddenSlices)

  if (previousHiddenSlices !== hiddenSlices) {
    setPreviousHiddenSlices(hiddenSlices)
    const isMidAnimation = hiddenSlices > 0 && hiddenSlices < LOADING_FRAME_COUNT
    setJoltIndex(isMidAnimation ? 0 : RESTING_JOLT_INDEX)
  }

  useEffect(() => {
    if (!active) {
      return
    }

    const timer = window.setTimeout(() => {
      setHiddenSlices((current) => (current >= LOADING_FRAME_COUNT ? 0 : current + 1))
    }, LOADING_FRAME_DURATION)

    return () => window.clearTimeout(timer)
  }, [active, hiddenSlices])

  useEffect(() => {
    if (joltIndex >= RESTING_JOLT_INDEX) {
      return
    }

    const timer = window.setTimeout(() => {
      setJoltIndex((current) => Math.min(current + 1, RESTING_JOLT_INDEX))
    }, BITE_JOLT_DECAY_DURATION)

    return () => window.clearTimeout(timer)
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
    if (hiddenSlices >= LOADING_FRAME_COUNT) {
      return
    }

    ctx.save()
    ctx.beginPath()
    ctx.arc(targetSize / 2, targetSize / 2, getBunRadius(targetSize), 0, Math.PI * 2)
    ctx.clip()

    if (image) {
      ctx.drawImage(image, 0, 0, targetSize, targetSize)
    } else {
      drawLoadingFallback(ctx, targetSize)
    }

    ctx.restore()

    applyBiteMasks(ctx, targetSize, hiddenSlices)
  }, [hiddenSlices, image, size])

  const resolvedText = text === undefined ? LOADING_DEFAULT_TEXT : text
  const isAriaHidden = rest['aria-hidden'] === true || rest['aria-hidden'] === 'true'
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
      role={isAriaHidden ? undefined : role ?? 'status'}
      aria-label={isAriaHidden ? undefined : resolvedText || LOADING_DEFAULT_TEXT}
    >
      <canvas ref={canvasRef} className={styles['loading__canvas']} aria-hidden />
      {resolvedText ? <span className={styles['loading__text']}>{resolvedText}</span> : null}
    </div>
  )
}

export default StarLoading
