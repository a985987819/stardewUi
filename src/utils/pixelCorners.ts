/**
 * Shared pixel-corner geometry for the whole kit.
 *
 * The house style is the **`cornerLevel = 1`** gap border — the staircase-corner
 * frame that `createGapBorderCorners` generates (see `utils/gapBorderCorners`;
 * the `StarGapBorder` component that used to render it has been removed): the
 * border is *broken* at each corner. Concretely, with a border thickness `t`:
 *
 * ```text
 *        ┌────────────┊      the four edges stop 2t short of each corner
 *        ┊            ┊      a t x t block sits at (t, t) bridging the break
 *   ─────┘            ┊      the 2t x 2t corner square stays empty (the "gap")
 *                     ┊
 * ```
 *
 * So a gap frame is described by one number — the thickness `t` — and every
 * derived measurement comes from it:
 *
 * | measurement              | value |
 * | ------------------------ | ----- |
 * | corner gap / block size  | `t`   |
 * | edge shortening per end  | `2t`  |
 * | fill corner notch        | `t`   |
 * | frame clip (incl. gap)   | `2t`  |
 *
 * The canvas renderers and the CSS `clip-path` values both read these helpers,
 * so a drawn button and a DOM card can never drift apart.
 */

export interface PixelPoint {
  x: number
  y: number
}

export interface PixelRect {
  x: number
  y: number
  width: number
  height: number
}

/** Corner level of the house-style gap border: exactly one step. */
export const GAP_CORNER_LEVEL = 1

/**
 * Staircase that climbs from the left edge up to the top edge, clockwise.
 * The first point sits on the left edge, the last one on the top edge, so four
 * of these concatenate into one clockwise rectangle polygon.
 */
export const buildStairCornerPoints = (steps: number, step: number): PixelPoint[] => {
  const levels = Math.max(1, Math.round(steps))
  const rise = Math.max(1, step)
  const span = levels * rise
  const points: PixelPoint[] = []

  for (let index = 0; index < levels; index += 1) {
    points.push({ x: index * rise, y: span - index * rise })
    points.push({ x: (index + 1) * rise, y: span - index * rise })
  }

  points.push({ x: span, y: 0 })

  return points
}

/** Reads the stair as a corner of the rectangle, keeping the walk clockwise. */
export const mapStairToCorner = (
  stair: PixelPoint[],
  corner: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left',
  width: number,
  height: number
): PixelPoint[] =>
  corner === 'top-left'
    ? stair.map(({ x, y }) => ({ x, y }))
    : corner === 'top-right'
      ? [...stair].reverse().map(({ x, y }) => ({ x: width - x, y }))
      : corner === 'bottom-right'
        ? stair.map(({ x, y }) => ({ x: width - x, y: height - y }))
        : [...stair].reverse().map(({ x, y }) => ({ x, y: height - y }))

/** Full clockwise polygon of a rectangle whose four corners are stepped. */
export const buildSteppedRectPoints = (
  width: number,
  height: number,
  steps: number,
  step: number
): PixelPoint[] => {
  const stair = buildStairCornerPoints(steps, step)

  return [
    ...mapStairToCorner(stair, 'top-left', width, height),
    ...mapStairToCorner(stair, 'top-right', width, height),
    ...mapStairToCorner(stair, 'bottom-right', width, height),
    ...mapStairToCorner(stair, 'bottom-left', width, height),
  ]
}

/**
 * Continuous gap frame in canvas/local coordinates: four edges that stop one
 * thickness short of each corner, plus the four `2t x 2t` blocks that close the
 * ring. Order: top, bottom, left, right, then the corner blocks clockwise from
 * the top-left.
 */
export const buildGapFrameRects = (width: number, height: number, thickness: number): PixelRect[] => {
  const t = Math.max(1, thickness)
  const edgeWidth = Math.max(0, width - t * 2)
  const edgeHeight = Math.max(0, height - t * 2)
  const blockSize = Math.min(t * 2, Math.min(width, height))

  return [
    { x: t, y: 0, width: edgeWidth, height: t },
    { x: t, y: Math.max(0, height - t), width: edgeWidth, height: t },
    { x: 0, y: t, width: t, height: edgeHeight },
    { x: Math.max(0, width - t), y: t, width: t, height: edgeHeight },
    { x: 0, y: 0, width: blockSize, height: blockSize },
    { x: Math.max(0, width - blockSize), y: 0, width: blockSize, height: blockSize },
    { x: 0, y: Math.max(0, height - blockSize), width: blockSize, height: blockSize },
    {
      x: Math.max(0, width - blockSize),
      y: Math.max(0, height - blockSize),
      width: blockSize,
      height: blockSize,
    },
  ]
}

/**
 * The lit inner band of a continuous gap frame — the bevel that makes a drawn
 * frame read as raised. Mirrors how the DOM frame paints a light `box-shadow`
 * inside its own clipped fill: each edge keeps its outer band dark and its
 * inner band lit, and every corner block lights the quarter that faces the
 * content.
 *
 * `bevelWidth` defaults to half the thickness, so a slim drawn frame splits
 * evenly; thicker frames (the popup's 6px border + 4px bevel) pass their own.
 */
export const buildGapFrameInnerRects = (
  width: number,
  height: number,
  thickness: number,
  bevelWidth: number = Math.max(1, thickness / 2)
): PixelRect[] => {
  const t = Math.max(1, thickness)
  const bevel = Math.max(1, Math.min(bevelWidth, t))
  const edgeWidth = Math.max(0, width - t * 2)
  const edgeHeight = Math.max(0, height - t * 2)
  const edgeOffset = t - bevel

  return [
    { x: t, y: edgeOffset, width: edgeWidth, height: bevel },
    { x: t, y: Math.max(0, height - t), width: edgeWidth, height: bevel },
    { x: edgeOffset, y: t, width: bevel, height: edgeHeight },
    { x: Math.max(0, width - t), y: t, width: bevel, height: edgeHeight },
    { x: t * 2 - bevel, y: t * 2 - bevel, width: bevel, height: bevel },
    { x: Math.max(0, width - t * 2), y: t * 2 - bevel, width: bevel, height: bevel },
    { x: t * 2 - bevel, y: Math.max(0, height - t * 2), width: bevel, height: bevel },
    {
      x: Math.max(0, width - t * 2),
      y: Math.max(0, height - t * 2),
      width: bevel,
      height: bevel,
    },
  ]
}

/** Per-side offset of the real surface inside the element that carries the clip. */
export interface PixelCornerInsets {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

/**
 * CSS `clip-path` for a series of staircase steps, optionally offset inside the
 * element's own box.
 *
 * Canvas panels clip their DOM content on a wrapper that is `border + bevel`
 * larger than the surface the canvas actually painted. Clipping that wrapper
 * with the *un-inset* polygon is a silent 10px mistake: the content keeps its
 * square corners right up against the frame and paints over the bevel ring.
 * Passing the insets lines the clip up with the painted surface.
 */
export const createInsetSteppedRectClipPath = (
  steps: number,
  step: number,
  insets: PixelCornerInsets = {}
): string => {
  const { top = 0, right = 0, bottom = 0, left = 0 } = insets
  const stair = buildStairCornerPoints(steps, step)

  const fromStartX = (value: number) => (left + value === 0 ? '0' : `${left + value}px`)
  const fromStartY = (value: number) => (top + value === 0 ? '0' : `${top + value}px`)
  const fromEndX = (value: number) => (right + value === 0 ? '100%' : `calc(100% - ${right + value}px)`)
  const fromEndY = (value: number) => (bottom + value === 0 ? '100%' : `calc(100% - ${bottom + value}px)`)

  const corners = [
    ...stair.map(({ x, y }) => [fromStartX(x), fromStartY(y)] as const),
    ...[...stair].reverse().map(({ x, y }) => [fromEndX(x), fromStartY(y)] as const),
    ...stair.map(({ x, y }) => [fromEndX(x), fromEndY(y)] as const),
    ...[...stair].reverse().map(({ x, y }) => [fromStartX(x), fromEndY(y)] as const),
  ]

  return `polygon(${corners.map(([x, y]) => `${x} ${y}`).join(', ')})`
}

/**
 * CSS `clip-path` for a plain rectangle, optionally offset inside the element's
 * own box. The continuous frame's fill runs edge to edge underneath the ring,
 * so its clip is just the ring's inner boundary — no steps anywhere.
 */
export const createInsetRectClipPath = (insets: PixelCornerInsets = {}): string => {
  const { top = 0, right = 0, bottom = 0, left = 0 } = insets
  const fromStartX = (value: number) => (value === 0 ? '0' : `${value}px`)
  const fromStartY = (value: number) => (value === 0 ? '0' : `${value}px`)
  const fromEndX = (value: number) => (value === 0 ? '100%' : `calc(100% - ${value}px)`)
  const fromEndY = (value: number) => (value === 0 ? '100%' : `calc(100% - ${value}px)`)

  return `polygon(${fromStartX(left)} ${fromStartY(top)}, ${fromEndX(right)} ${fromStartY(top)}, ${fromEndX(right)} ${fromEndY(bottom)}, ${fromStartX(left)} ${fromEndY(bottom)})`
}

/** CSS `clip-path` value matching the same stepped rectangle. */
export const createSteppedRectClipPath = (steps: number, step: number): string =>
  createInsetSteppedRectClipPath(steps, step)

/**
 * Clip for a gap border's **fill**: the rectangle inset by the thickness, so
 * the fill tucks exactly under the frame ring. The corner blocks sit on top of
 * it, which is what gives the corners their chunky, stepped read.
 */
export const createGapFillClipPath = (thickness: number): string =>
  createInsetRectClipPath({ top: thickness, right: thickness, bottom: thickness, left: thickness })

/**
 * Clip for a **frame that also paints its own fill** (the single-layer trick):
 * same rectangle — the frame layers paint the ring on top, so the composite is
 * a continuous frame with chunky corner blocks and no open corners.
 */
export const createGapFrameClipPath = (thickness: number): string => createGapFillClipPath(thickness)
