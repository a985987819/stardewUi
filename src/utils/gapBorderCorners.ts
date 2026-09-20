import type { CSSProperties } from 'react'

/**
 * 缺口边框（gap border）的生成方法。
 *
 * 原来由 `StarGapBorder` / `StarGapBorderCorners` 两个组件渲染，组件已移除，但生成方法保留在这里，
 * 因为 `pixelCorners` 和各 canvas 绘制器描述 house style 时都以它为准。算法：
 *
 * 1. `stepCount = level * 2 - 1`：每角台阶数（level 1/2/3 → 1/3/5 级）。
 * 2. `horizontalInset = cornerGap + stepCount * borderThickness`：四条直边各自从角上缩进这么多，
 *    于是**四个角是空的**（这就是「缺口」）；直边本身由 CSS 的 `__edge--*` 画。
 * 3. `createCornerSteps`：每个角补 `stepCount` 个 `borderThickness` 见方的小块，
 *    `offsetX = horizontalInset - stepSize * (index + 1)`、`offsetY = cornerGap + stepSize * index`，
 *    即从角的最外一格开始向内、逐级挪一格，走成 45° 阶梯。
 * 4. `createSurfaceClipPath`：面板 surface 用一条同样的阶梯折线裁出来，所以边框内缘也是阶梯状、
 *    内缩正好等于边框粗细（`cutInset = min(horizontalInset - stepSize, sideEdgeInset - stepSize)`）；
 *    `level = 0` 时退化成 `cornerGap` 的普通八边形切角。
 * 5. 输出一棵「CSS 变量 + 绝对定位块」的配方：`cornerSteps` 给每个台阶定位，
 *    `cssVariables` 提供 `--gap-border-*`（颜色、背景、粗细、两个 inset、surface 的 clip-path）。
 *    渲染时台阶/直边在 z-index 3、内容 2、surface 1，surface 用 `inset: thickness`、
 *    内容用 `margin: thickness` 把边框厚度预留出来。
 */
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
