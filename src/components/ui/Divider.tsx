import { useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import { DEFAULT_DIVIDER_COLOR, deriveDividerPalette } from '../../utils/dividerPalette'
import styles from './Divider.module.scss'

/** Width of the visible `#fa9405` body between the left and right frames, in px. */
export const FENCE_POST_BODY_WIDTH = 12
/**
 * Height of the visible `#fa9405` body, in px. The bottom edge carries no
 * frame, so the wood runs all the way down to the floor of the post.
 */
export const FENCE_POST_BODY_HEIGHT = 24
/** Thickness of the `#9b440d` frame on the top, left, and right edges, in px. */
export const FENCE_POST_FRAME_WIDTH = 4
/** Empty space kept between two neighbouring fence posts, in px. */
export const FENCE_POST_GAP = 30

/** Whole post, both side frames included. */
export const FENCE_POST_WIDTH = FENCE_POST_BODY_WIDTH + FENCE_POST_FRAME_WIDTH * 2
/** Whole post. Only the top edge is framed, hence a single `+ frame`. */
export const FENCE_POST_HEIGHT = FENCE_POST_BODY_HEIGHT + FENCE_POST_FRAME_WIDTH

/**
 * Thickness of a connecting rail, in px. Two of them run out of every post, one
 * to the left and one to the right, a quarter of the way down and two thirds
 * down.
 */
export const FENCE_POST_RAIL_HEIGHT = 5.5
/** Thickness of the rail's own frame, in px — top and bottom edges only. */
export const FENCE_POST_RAIL_FRAME_WIDTH = 1.5
/** Distance from the top edge of a post down to its upper rail, in px. */
export const FENCE_POST_RAIL_OFFSET = 6
/** Vertical space between a post's two rails, in px. */
export const FENCE_POST_RAIL_GAP = 5
/**
 * How far a rail reaches out of the post on each side: exactly half a gap, so
 * the two halves contributed by neighbouring posts butt in the middle and read
 * as one continuous rail. `offset * 2 + height * 2 + gap === height` keeps the
 * two rails inside the post; with a 5.5px rail the three gaps are 6/5/6.
 */
export const FENCE_POST_RAIL_LENGTH = FENCE_POST_GAP / 2

/**
 * Thickness of the highlight band running along the inside of a post's frame,
 * in px. Half the length of the edge it sits on, and the only `#ffd9a3` accent
 * on an otherwise `#fa9405` post.
 */
export const FENCE_POST_HIGHLIGHT_THICKNESS = 3

/** Distance from the left edge of one post to the left edge of the next. */
export const FENCE_POST_PITCH = FENCE_POST_WIDTH + FENCE_POST_GAP
/** How far the lower-left drop shadow sticks out of the post, in px. */
export const FENCE_POST_SHADOW_WIDTH = 3

/**
 * Which motif the divider repeats. `fence` is the original wooden post;
 * `star` swaps every post for a pixel star that keeps the same ink, highlight,
 * and drop shadow.
 */
export type DividerIcon = 'fence' | 'star'

/** Side of one pixel cell of the star glyph, in px. */
export const STAR_DIVIDER_CELL = 3
/**
 * Empty space kept between two neighbouring stars, in px. The root paints a
 * single `gap`, so the star deliberately keeps the fence's rhythm.
 */
export const STAR_DIVIDER_GAP = FENCE_POST_GAP

/**
 * The star silhouette, one row of the grid per string. `X` is wood. Nine cells a
 * side is the smallest grid that still reads as a five-pointed star once a frame
 * and a highlight are taken out of it: a one-cell top point, a full-width bar
 * through the arms, and two legs flaring out at the bottom.
 */
const STAR_DIVIDER_ROWS = [
  '....X....',
  '...XXX...',
  '...XXX...',
  'XXXXXXXXX',
  '.XXXXXXX.',
  '..XXXXX..',
  '..XXXXX..',
  '.XX...XX.',
  'XX.....XX',
]

/** Side of the square the silhouette is authored on. */
const STAR_DIVIDER_GRID = STAR_DIVIDER_ROWS.length
/** How far the drop shadow is pushed off the silhouette, in cells. */
const STAR_DIVIDER_SHADOW_STEP_X = -1
const STAR_DIVIDER_SHADOW_STEP_Y = 1

type StarCell = readonly [number, number]

const cellKey = (x: number, y: number) => `${x}:${y}`

/**
 * Collapses grid cells into one SVG path of 1×1 squares. Neighbours on the same
 * row merge into a single run, so a solid row costs one `M…h…v1h-…z` segment
 * instead of one per pixel — which keeps four short paths per star instead of a
 * few hundred rects.
 */
function cellsToPath(cells: StarCell[]) {
  const rows = new Map<number, number[]>()

  for (const [x, y] of cells) {
    const row = rows.get(y)
    if (row) row.push(x)
    else rows.set(y, [x])
  }

  const segments: string[] = []

  for (const [y, xs] of [...rows.entries()].sort(([a], [b]) => a - b)) {
    xs.sort((a, b) => a - b)
    let start = xs[0]
    let previous = xs[0]

    for (let index = 1; index < xs.length; index += 1) {
      if (xs[index] === previous + 1) {
        previous = xs[index]
        continue
      }

      segments.push(`M${start} ${y}h${previous - start + 1}v1h-${previous - start + 1}z`)
      start = xs[index]
      previous = xs[index]
    }

    segments.push(`M${start} ${y}h${previous - start + 1}v1h-${previous - start + 1}z`)
  }

  return segments.join('')
}

const starBodyCells: StarCell[] = []
STAR_DIVIDER_ROWS.forEach((row, y) => {
  [...row].forEach((cell, x) => {
    if (cell === 'X') starBodyCells.push([x, y])
  })
})
const starBodyKeys = new Set(starBodyCells.map(([x, y]) => cellKey(x, y)))

/**
 * Outline: every empty cell touching the silhouette, diagonals included. Going
 * diagonal matters — the star is all slanted edges, and a four-way ring would
 * leave single-cell notches at every step of the point.
 */
const starFrameCells: StarCell[] = []
for (let y = -1; y <= STAR_DIVIDER_GRID; y += 1) {
  for (let x = -1; x <= STAR_DIVIDER_GRID; x += 1) {
    if (starBodyKeys.has(cellKey(x, y))) continue

    let touchesBody = false
    for (let dy = -1; dy <= 1 && !touchesBody; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue
        if (starBodyKeys.has(cellKey(x + dx, y + dy))) {
          touchesBody = true
          break
        }
      }
    }

    if (touchesBody) starFrameCells.push([x, y])
  }
}

/**
 * Highlight: the star's top and right rim — silhouette cells with no silhouette
 * above or to the right — trimmed back to the half the light actually reaches,
 * the top-right side of the glyph's main diagonal (`x >= y`). That trim matters:
 * a star is almost all contour, so an untrimmed rim wraps the whole upper
 * outline and the glyph reads as an outlined blob. Trimmed, the light sits in one
 * corner, exactly like the `#ffd9a3` Γ band inside the fence's top and right frame.
 */
const starHighlightCells = starBodyCells.filter(
  ([x, y]) => (!starBodyKeys.has(cellKey(x, y - 1)) || !starBodyKeys.has(cellKey(x + 1, y))) && x >= y
)

/**
 * Drop shadow: the whole inked silhouette — outline included — pushed one cell
 * down-left. The frame covers most of it, so only the lower-left lip shows, just
 * like the `#492b18` block behind a post.
 */
const starShadowCells: StarCell[] = [...starBodyCells, ...starFrameCells].map(([x, y]) => [
  x + STAR_DIVIDER_SHADOW_STEP_X,
  y + STAR_DIVIDER_SHADOW_STEP_Y,
])

const starAllCells = [...starBodyCells, ...starFrameCells, ...starShadowCells]
const starMinX = Math.min(...starAllCells.map(([x]) => x))
const starMinY = Math.min(...starAllCells.map(([, y]) => y))
const starMaxX = Math.max(...starAllCells.map(([x]) => x))
const starMaxY = Math.max(...starAllCells.map(([, y]) => y))

/** Grid width of one star, shadow included, in cells. */
const STAR_DIVIDER_GRID_WIDTH = starMaxX - starMinX + 1
/** Grid height of one star, shadow included, in cells. */
const STAR_DIVIDER_GRID_HEIGHT = starMaxY - starMinY + 1

/** Rendered width of one star, shadow included, in px. */
export const STAR_DIVIDER_WIDTH = STAR_DIVIDER_GRID_WIDTH * STAR_DIVIDER_CELL
/** Rendered height of one star, shadow included, in px. */
export const STAR_DIVIDER_HEIGHT = STAR_DIVIDER_GRID_HEIGHT * STAR_DIVIDER_CELL
/** Distance from the left edge of one star to the left edge of the next. */
export const STAR_DIVIDER_PITCH = STAR_DIVIDER_WIDTH + STAR_DIVIDER_GAP

/** Moves the authored grid into the SVG's positive quadrant. */
const normalizeStarCell = ([x, y]: StarCell): StarCell => [x - starMinX, y - starMinY]

/**
 * The four paint layers of one star, in back-to-front order. Computed once at
 * module scope: the glyph never changes, so every rendered star shares one path.
 */
const STAR_DIVIDER_PATHS = {
  shadow: cellsToPath(starShadowCells.map(normalizeStarCell)),
  frame: cellsToPath(starFrameCells.map(normalizeStarCell)),
  body: cellsToPath(starBodyCells.map(normalizeStarCell)),
  highlight: cellsToPath(starHighlightCells.map(normalizeStarCell)),
}

/** The `viewBox` the four star paths are authored against. */
const STAR_DIVIDER_VIEW_BOX = `0 0 ${STAR_DIVIDER_GRID_WIDTH} ${STAR_DIVIDER_GRID_HEIGHT}`

/**
 * How one motif occupies the row: its own width, the gap after it, and the
 * padding the root keeps on each side. `pitch` is what the fit maths needs, and
 * `inset` is added back to the measured content box because a fence post's rails
 * reach out into that padding.
 */
interface DividerLayout {
  width: number
  gap: number
  pitch: number
  inset: number
}

const DIVIDER_LAYOUT: Record<DividerIcon, DividerLayout> = {
  fence: {
    width: FENCE_POST_WIDTH,
    gap: FENCE_POST_GAP,
    pitch: FENCE_POST_PITCH,
    inset: FENCE_POST_RAIL_LENGTH,
  },
  star: {
    width: STAR_DIVIDER_WIDTH,
    gap: STAR_DIVIDER_GAP,
    pitch: STAR_DIVIDER_PITCH,
    inset: FENCE_POST_RAIL_LENGTH,
  },
}

/**
 * How many motifs are needed to span `availableWidth` (the content box, i.e. the
 * root's width minus the two side paddings). A fence post reaches half a gap out
 * of both sides and the star shadow sits inside its own box, so in both cases a
 * motif effectively covers one `pitch`; adding the padding back turns the content
 * box into the width the motifs actually paint. The result deliberately rounds
 * **up**: the extra motif is clipped by the root's `overflow`, which is what
 * makes the divider fill the full width instead of stopping short with a gap on
 * the right. Kept module-private on purpose — exporting a function from a
 * component file would break Fast Refresh, so the rule is asserted through the
 * rendered DOM instead.
 */
function fitMotifCount(availableWidth: number, layout: DividerLayout) {
  return Math.max(1, Math.ceil((availableWidth + layout.inset * 2) / layout.pitch))
}

export interface StarDividerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /**
   * Pin the number of motifs. Leave it out and the divider fills its container
   * instead: it measures itself and lays out enough motifs to reach the far
   * edge, keeping every gap at exactly 30px. The last motif is clipped by the
   * root's `overflow` when the width is not a whole number of pitches — a
   * truncated motif beats a gap at the end of the fence.
   */
  count?: number
  /**
   * Which motif to repeat. `fence` (the default) draws the wooden posts; `star`
   * swaps each post for a pixel star that carries the very same ink, top-right
   * highlight, and lower-left drop shadow.
   */
  icon?: DividerIcon
  /**
   * Visible wood colour. The dark outline, the pale top-right highlight, and the
   * lower-left drop shadow are derived from it, so recolouring a divider moves
   * its whole light-and-shade set in one go rather than leaving stale browns
   * behind. Accepts `#rgb`, `#rrggbb`, or either without the `#`; anything
   * unparseable falls back to the default wood instead of blanking the divider.
   */
  color?: string
}

/**
 * A wooden fence divider. Each post is a lifted 20×28 block: a `#fa9405` body
 * behind a solid 4px `#9b440d` frame that wraps the top, left, and right edges
 * only — the bottom is open — with 5px rounded top corners. A 3px `#ffd9a3`
 * highlight runs along the inside of that frame, half way along the top and
 * half way down the right, meeting in a rounded corner; a `#492b18` block is
 * dropped 3px down-left behind the post. Two 5.5px connecting rails — a 1.5px
 * `#9b440d` frame over a 2.5px `#fa9405` core, with no vertical edge — run out of
 * every post to the left and right, reaching half a gap each, so neighbouring
 * posts butt in the middle of the gap and read as one fence. Posts are 30px apart.
 * Left to itself the divider always spans its container edge to edge; the last
 * post is clipped whenever the width is not a whole number of pitches.
 *
 * With `icon="star"` the posts are replaced by pixel stars drawn on the same
 * 3px grid: a 9×9 `#fa9405` silhouette, a one-cell `#9b440d` outline, the
 * `#ffd9a3` highlight along the top-right half of its rim, and a `#492b18`
 * shadow pushed one cell down-left. Same colours, same light direction, same
 * rhythm — the star is simply wider, so it lays itself out on its own pitch.
 *
 * Both motifs paint from four custom properties rather than fixed hexes, so
 * `color` recolours the outline, highlight, and shadow along with the body.
 */
function StarDivider({ count, icon = 'fence', color = DEFAULT_DIVIDER_COLOR, className, style, ...rest }: StarDividerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [fitted, setFitted] = useState(1)
  const auto = count === undefined
  const layout = DIVIDER_LAYOUT[icon]
  const palette = deriveDividerPalette(color)

  useLayoutEffect(() => {
    const node = rootRef.current
    if (!auto || !node) return undefined

    const sync = () => {
      const computed = getComputedStyle(node)
      const inset = Number.parseFloat(computed.paddingLeft) + Number.parseFloat(computed.paddingRight)
      setFitted(fitMotifCount(Number.isFinite(inset) ? node.clientWidth - inset : node.clientWidth, layout))
    }

    sync()

    const observer = new ResizeObserver(sync)
    observer.observe(node)
    return () => observer.disconnect()
  }, [auto, layout])

  const motifs = Math.max(1, count ?? fitted)

  return (
    <div
      {...rest}
      ref={rootRef}
      role="separator"
      aria-orientation="horizontal"
      data-icon={icon}
      className={classNames(styles['star-divider'], className)}
      style={{
        '--star-divider-body': palette.body,
        '--star-divider-frame': palette.frame,
        '--star-divider-highlight': palette.highlight,
        '--star-divider-shadow': palette.shadow,
        ...style,
      } as CSSProperties}
    >
      {Array.from({ length: motifs }, (_, index) =>
        icon === 'star' ? (
          <span key={index} className={styles['star-divider__star']} aria-hidden>
            <svg viewBox={STAR_DIVIDER_VIEW_BOX} focusable="false">
              <path className={styles['star-divider__star-shadow']} d={STAR_DIVIDER_PATHS.shadow} />
              <path className={styles['star-divider__star-frame']} d={STAR_DIVIDER_PATHS.frame} />
              <path className={styles['star-divider__star-body']} d={STAR_DIVIDER_PATHS.body} />
              <path className={styles['star-divider__star-highlight']} d={STAR_DIVIDER_PATHS.highlight} />
            </svg>
          </span>
        ) : (
          <span key={index} className={styles['star-divider__post']} aria-hidden>
            <span className={styles['star-divider__rail']} />
            <span className={classNames(styles['star-divider__rail'], styles['star-divider__rail--lower'])} />
            <span className={styles['star-divider__frame']} />
          </span>
        )
      )}
    </div>
  )
}

export { StarDivider }
export default StarDivider
