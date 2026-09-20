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

/** Distance from the left edge of one post to the left edge of the next. */
const POST_PITCH = FENCE_POST_WIDTH + FENCE_POST_GAP
/** How far the lower-left drop shadow sticks out of the post, in px. */
export const FENCE_POST_SHADOW_WIDTH = 3

export interface StarDividerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Pin the number of fence posts. Leave it out and the divider fills its
   * container instead: it measures itself and lays out as many posts as fit,
   * keeping every gap at exactly 30px.
   */
  count?: number
}

/** `n` posts take `n * 20 + (n - 1) * 30` px, so solve that for the largest `n`. */
function fitPostCount(availableWidth: number) {
  return Math.max(1, Math.floor((availableWidth + FENCE_POST_GAP) / POST_PITCH))
}

/**
 * A wooden fence divider. Each post is a lifted 20×28 block: a `#fa9405` body
 * behind a solid 4px `#9b440d` frame that wraps the top, left, and right edges
 * only — the bottom is open — with 5px rounded top corners. The inner top and
 * right edges carry a 3px `#ffd9a3` highlight, each half the length of its own
 * edge, and a `#999` block is dropped 3px down-left behind the post. Posts are
 * 30px apart; the connecting rails are not implemented yet.
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
          <span className={styles['star-divider__frame']} />
        </span>
      ))}
    </div>
  )
}

export { StarDivider }
export default StarDivider
