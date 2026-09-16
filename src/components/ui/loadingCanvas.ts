/**
 * Canvas maths and asset loading for the Steam-bun loading indicator.
 *
 * Kept out of `Loading.tsx` so that file only exports a component, which is what
 * Vite's Fast Refresh requires. When a module mixes component and non-component
 * exports, React Refresh falls back to a full page reload on every edit.
 */

export const LOADING_FRAME_COUNT = 12
export const LOADING_FRAME_DURATION = 240
export const LOADING_DEFAULT_TEXT = '正在加载...'
export const BITE_JOLT_LEVELS = [1, 0.55, 0] as const
export const BITE_JOLT_DECAY_DURATION = 60

const LOADING_IMAGE_SRC = `${import.meta.env.BASE_URL}loadingBaozi.png`
const FULL_CIRCLE = Math.PI * 2
const START_ANGLE = -Math.PI / 2
const BUN_EDGE_RATIO = 0
const BITE_CENTER_DISTANCE_RATIO = 0.97
const BITE_DEPTH_RATIO = 0.39

let loadingImagePromise: Promise<HTMLImageElement> | null = null

export function loadLoadingImage() {
  if (!loadingImagePromise) {
    loadingImagePromise = new Promise((resolve, reject) => {
      const image = new Image()
      image.decoding = 'async'
      image.onload = () => resolve(image)
      image.onerror = () => {
        loadingImagePromise = null
        reject(new Error(`Failed to load loading image: ${LOADING_IMAGE_SRC}`))
      }
      image.src = LOADING_IMAGE_SRC
    })
  }

  return loadingImagePromise
}

export function getBunRadius(canvasSize: number) {
  return canvasSize / 2 - canvasSize * BUN_EDGE_RATIO
}

export function drawLoadingFallback(ctx: CanvasRenderingContext2D, size: number) {
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
  const stepAngle = FULL_CIRCLE / LOADING_FRAME_COUNT
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

export function applyBiteMasks(ctx: CanvasRenderingContext2D, canvasSize: number, biteCount: number) {
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
    // Draw only the inward bite edge between the two tangency points.
    ctx.beginPath()
    ctx.ellipse(x, y, radiusX, radiusY, rotation, arcStart, arcEnd)
    ctx.stroke()
  })
  ctx.restore()
}

export function getBunJoltOffset(size: number, biteCount: number, joltLevel: number) {
  if (biteCount <= 0 || joltLevel <= 0) {
    return { x: 0, y: 0 }
  }

  const baseOffset = Math.max(0.45, size * 0.035)
  const angle = START_ANGLE + (biteCount - 1) * (FULL_CIRCLE / LOADING_FRAME_COUNT)
  const direction = biteCount % 2 === 0 ? -1 : 1

  return {
    x: Number((Math.sin(angle) * baseOffset * joltLevel * direction).toFixed(3)),
    y: Number((-Math.cos(angle) * baseOffset * joltLevel).toFixed(3)),
  }
}
