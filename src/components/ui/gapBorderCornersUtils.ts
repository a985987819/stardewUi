import type { CSSProperties } from 'react'

export interface GapBorderCornerData {
  cornerSteps: { key: string; style: CSSProperties }[]
  surfaceClipPath: string
  cssVariables: CSSProperties
}

export interface CreateGapBorderCornersOptions {
  level?: number
  borderColor?: string
  backgroundColor?: string
  borderThickness?: number
  cornerGap?: number
}

type CornerName = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'

interface CornerStep {
  key: string
  style: CSSProperties
}

function createCornerSteps(level: number, stepSize: number, horizontalInset: number, stepStartOffset: number): CornerStep[] {
  if (level <= 0) {
    return []
  }

  const stepCount = level * 2 - 1
  const corners: CornerName[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left']

  return corners.flatMap((corner) =>
    Array.from({ length: stepCount }, (_, index) => {
      const offsetX = horizontalInset - stepSize * (index + 1)
      const offsetY = stepStartOffset + stepSize * index

      const style =
        corner === 'top-left'
          ? { left: offsetX, top: offsetY }
          : corner === 'top-right'
            ? { right: offsetX, top: offsetY }
            : corner === 'bottom-right'
              ? { right: offsetX, bottom: offsetY }
              : { left: offsetX, bottom: offsetY }

      return {
        key: `${corner}-${index}`,
        style,
      } satisfies CornerStep
    })
  )
}

function createSurfaceClipPath(
  level: number,
  stepSize: number,
  horizontalInset: number,
  sideEdgeInset: number,
  cornerGap: number
): string {
  if (level <= 0) {
    return `polygon(${cornerGap}px 0, calc(100% - ${cornerGap}px) 0, 100% ${cornerGap}px, 100% calc(100% - ${cornerGap}px), calc(100% - ${cornerGap}px) 100%, ${cornerGap}px 100%, 0 calc(100% - ${cornerGap}px), 0 ${cornerGap}px)`
  }

  const stepCount = level * 2 - 1
  const cutInset = Math.min(horizontalInset - stepSize, sideEdgeInset - stepSize)
  const points: string[] = []

  points.push(`${cutInset}px 0`)
  points.push(`calc(100% - ${cutInset}px) 0`)

  for (let index = 0; index < stepCount; index += 1) {
    const x = cutInset - stepSize * index
    const nextX = cutInset - stepSize * (index + 1)
    const y = stepSize * (index + 1)
    points.push(`calc(100% - ${x}px) ${y}px`)
    points.push(`calc(100% - ${nextX}px) ${y}px`)
  }

  points.push(`100% calc(100% - ${cutInset}px)`)

  for (let index = 0; index < stepCount; index += 1) {
    const x = stepSize * (index + 1)
    const y = cutInset - stepSize * index
    const nextY = cutInset - stepSize * (index + 1)
    points.push(`calc(100% - ${x}px) calc(100% - ${y}px)`)
    points.push(`calc(100% - ${x}px) calc(100% - ${nextY}px)`)
  }

  points.push(`${cutInset}px 100%`)

  for (let index = 0; index < stepCount; index += 1) {
    const x = cutInset - stepSize * index
    const nextX = cutInset - stepSize * (index + 1)
    const y = stepSize * (index + 1)
    points.push(`${x}px calc(100% - ${y}px)`)
    points.push(`${nextX}px calc(100% - ${y}px)`)
  }

  points.push(`0 ${cutInset}px`)

  for (let index = 0; index < stepCount; index += 1) {
    const x = stepSize * (index + 1)
    const y = cutInset - stepSize * index
    const nextY = cutInset - stepSize * (index + 1)
    points.push(`${x}px ${y}px`)
    points.push(`${x}px ${nextY}px`)
  }

  return `polygon(${points.join(', ')})`
}

export function createGapBorderCorners({
  level = 1,
  borderColor = '#5f4322',
  backgroundColor = '#f7efc5',
  borderThickness = 8,
  cornerGap = 8,
}: CreateGapBorderCornersOptions = {}): GapBorderCornerData {
  const stepCount = level * 2 - 1
  const horizontalInset = cornerGap + stepCount * borderThickness
  const sideEdgeInset = cornerGap + stepCount * borderThickness

  const cornerSteps = createCornerSteps(level, borderThickness, horizontalInset, cornerGap)
  const surfaceClipPath = createSurfaceClipPath(level, borderThickness, horizontalInset, sideEdgeInset, cornerGap)

  const cssVariables = {
    '--gap-border-color': borderColor,
    '--gap-border-background': backgroundColor,
    '--gap-border-thickness': `${borderThickness}px`,
    '--gap-border-horizontal-inset': `${horizontalInset}px`,
    '--gap-border-vertical-inset': `${sideEdgeInset}px`,
    '--gap-border-surface-clip-path': surfaceClipPath,
  } as CSSProperties

  return { cornerSteps, surfaceClipPath, cssVariables }
}
