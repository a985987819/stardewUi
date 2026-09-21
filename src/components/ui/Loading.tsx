import { useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import {
  applyBiteMasks,
  BITE_SETTLE_DURATION,
  BITE_STRIKE_DURATION,
  drawLoadingFallback,
  getBiteImpulse,
  getBunRadius,
  loadLoadingImage,
  LOADING_DEFAULT_TEXT,
  LOADING_EMPTY_HOLD_DURATION,
  LOADING_FRAME_COUNT,
  LOADING_FRAME_DURATION,
  LOADING_VANISH_DURATION,
  RESTING_IMPULSE,
  VANISHING_IMPULSE,
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

/** `strike` = a bite just landed (or the bun just reappeared), `rest` = settled. */
type BiteStage = 'strike' | 'rest'
/** `eating` -> bites around the circle, `vanishing` -> the crumb shrinks away, `gone` -> a beat of nothing. */
type CycleStage = 'eating' | 'vanishing' | 'gone'

const STRIKE_EASING = 'cubic-bezier(0.2, 0.9, 0.25, 1)'
const SETTLE_EASING = 'cubic-bezier(0.34, 1.46, 0.64, 1)'
const VANISH_EASING = 'cubic-bezier(0.55, 0, 0.75, 0.2)'

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
  const [biteStage, setBiteStage] = useState<BiteStage>('rest')
  const [cycleStage, setCycleStage] = useState<CycleStage>('eating')

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
      setBiteStage('strike')
      setCycleStage('eating')
    }
  }

  const [previousHiddenSlices, setPreviousHiddenSlices] = useState(hiddenSlices)

  if (previousHiddenSlices !== hiddenSlices) {
    setPreviousHiddenSlices(hiddenSlices)
    // Each new bite is its own little impulse, so the chew is a sequence of
    // easing-out reactions rather than one long shake.
    setBiteStage('strike')
  }

  if (cycleStage === 'eating' && hiddenSlices >= LOADING_FRAME_COUNT) {
    setCycleStage('vanishing')
  }

  // Bite cadence. Kept independent of the strike/settle stage so a settling
  // transition can never stretch the time between two bites.
  useEffect(() => {
    if (!active) {
      return
    }

    if (cycleStage === 'vanishing') {
      const timer = window.setTimeout(() => setCycleStage('gone'), LOADING_VANISH_DURATION)
      return () => window.clearTimeout(timer)
    }

    if (cycleStage === 'gone') {
      const timer = window.setTimeout(() => {
        setHiddenSlices(0)
        setCycleStage('eating')
      }, LOADING_EMPTY_HOLD_DURATION)
      return () => window.clearTimeout(timer)
    }

    const timer = window.setTimeout(() => {
      setHiddenSlices((current) => Math.min(current + 1, LOADING_FRAME_COUNT))
    }, LOADING_FRAME_DURATION)

    return () => window.clearTimeout(timer)
  }, [active, cycleStage, hiddenSlices])

  // One impulse at a time: settle shortly after it lands.
  useEffect(() => {
    if (biteStage !== 'strike' || cycleStage !== 'eating') {
      return
    }

    const timer = window.setTimeout(() => setBiteStage('rest'), BITE_STRIKE_DURATION)

    return () => window.clearTimeout(timer)
  }, [biteStage, cycleStage])

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
    // A beat of empty space between one bun vanishing and the next appearing,
    // so the eating reads as "finished" instead of resetting mid-chew.
    if (cycleStage === 'gone') {
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
  }, [cycleStage, hiddenSlices, image, size])

  const resolvedText = text === undefined ? LOADING_DEFAULT_TEXT : text
  const isAriaHidden = rest['aria-hidden'] === true || rest['aria-hidden'] === 'true'
  const impulse = useMemo(() => {
    if (cycleStage !== 'eating') {
      return VANISHING_IMPULSE
    }

    return biteStage === 'strike' ? getBiteImpulse(size, hiddenSlices) : RESTING_IMPULSE
  }, [biteStage, cycleStage, hiddenSlices, size])

  const joltDuration =
    cycleStage !== 'eating'
      ? LOADING_VANISH_DURATION
      : biteStage === 'strike'
        ? BITE_STRIKE_DURATION
        : BITE_SETTLE_DURATION
  const joltEasing =
    cycleStage !== 'eating' ? VANISH_EASING : biteStage === 'strike' ? STRIKE_EASING : SETTLE_EASING

  const rootStyle = useMemo(
    () =>
      ({
        ...style,
        '--star-loading-size': `${size}px`,
        '--star-loading-gap': `${gap}px`,
        '--star-loading-jolt-x': `${impulse.x}px`,
        '--star-loading-jolt-y': `${impulse.y}px`,
        '--star-loading-jolt-rotate': `${impulse.rotate}deg`,
        '--star-loading-jolt-scale': `${impulse.scale}`,
        '--star-loading-jolt-duration': `${joltDuration}ms`,
        '--star-loading-jolt-easing': joltEasing,
      }) as CSSProperties,
    [gap, impulse, joltDuration, joltEasing, size, style]
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
