const FRAME_COUNT = 12
const FULL_CIRCLE = Math.PI * 2
const START_ANGLE = -Math.PI / 2

export function getBunJoltOffset(size: number, biteCount: number, joltLevel: number) {
  if (biteCount <= 0 || joltLevel <= 0) {
    return { x: 0, y: 0 }
  }

  const baseOffset = Math.max(0.45, size * 0.035)
  const angle = START_ANGLE + (biteCount - 1) * (FULL_CIRCLE / FRAME_COUNT)
  const direction = biteCount % 2 === 0 ? -1 : 1

  return {
    x: Number((Math.sin(angle) * baseOffset * joltLevel * direction).toFixed(3)),
    y: Number((-Math.cos(angle) * baseOffset * joltLevel).toFixed(3)),
  }
}
