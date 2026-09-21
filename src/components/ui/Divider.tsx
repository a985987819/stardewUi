import { useLayoutEffect, useRef, useState, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
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

export interface StarDividerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Pin the number of fence posts. Leave it out and the divider fills its
   * container instead: it measures itself and lays out enough posts to reach the
   * far edge, keeping every gap at exactly 30px. The last post is clipped by the
   * root's `overflow` when the width is not a whole number of pitches — a
   * truncated post beats a gap at the end of the fence.
   */
  count?: number
}

/**
 * How many posts are needed to span `availableWidth` (the content box, i.e. the
 * root's width minus the two half-gap paddings). A post reaches half a gap out
 * of both sides, so the fence covers `n * pitch` and the smallest covering `n`
 * is `ceil(width / pitch)`. That deliberately rounds **up**: the extra post is
 * clipped by the root's `overflow`, which is what makes the fence fill the full
 * width instead of stopping short with a gap on the right. Kept module-private
 * on purpose — exporting a function from a component file would break Fast
 * Refresh, so the rule is asserted through the rendered DOM instead.
 */
function fitPostCount(availableWidth: number) {
  return Math.max(1, Math.ceil((availableWidth + FENCE_POST_RAIL_LENGTH * 2) / FENCE_POST_PITCH))
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
 */
function StarDivider({ count, className, ...rest }: StarDividerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [fitted, setFitted] = useState(1)
  const auto = count === undefined

  useLayoutEffect(() => {
    const node = rootRef.current
    if (!auto || !node) return undefined

    const sync = () => {
      const computed = getComputedStyle(node)
      const inset = Number.parseFloat(computed.paddingLeft) + Number.parseFloat(computed.paddingRight)
      setFitted(fitPostCount(Number.isFinite(inset) ? node.clientWidth - inset : node.clientWidth))
    }

    sync()

    const observer = new ResizeObserver(sync)
    observer.observe(node)
    return () => observer.disconnect()
  }, [auto])

  const posts = Math.max(1, count ?? fitted)

  return (
    <div
      {...rest}
      ref={rootRef}
      role="separator"
      aria-orientation="horizontal"
      className={classNames(styles['star-divider'], className)}
    >
      {Array.from({ length: posts }, (_, index) => (
        <span key={index} className={styles['star-divider__post']} aria-hidden>
          <span className={styles['star-divider__rail']} />
          <span className={classNames(styles['star-divider__rail'], styles['star-divider__rail--lower'])} />
          <span className={styles['star-divider__frame']} />
        </span>
      ))}
    </div>
  )
}

export { StarDivider }
export default StarDivider
