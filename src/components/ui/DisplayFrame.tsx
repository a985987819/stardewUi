import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { createInsetSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './DisplayFrame.module.scss'

/**
 * Corner geometry: one 2px step per corner, so every corner loses a single
 * 2x2 pixel block.
 *
 * The stair is applied to *every* layer, and each layer is already inset by the
 * thickness of the rings outside it. That is what keeps the corner honest: the
 * step migrates 2px inward per ring, so the colours met while walking diagonally
 * into a corner have the very same widths as the ones met walking in from an
 * edge (2px gap / 6px dark / 3px band / 3px accent / 3px light). The equation
 * holds while the step stays no wider than the narrowest band, which is why the
 * 2px corner is safe next to 3px bands.
 *
 * Steps and step size live here rather than in SCSS because `clip-path`
 * geometry must come from `src/utils/pixelCorners.ts` — the same source the
 * canvas components draw with.
 */
export const DISPLAY_FRAME_CORNER_STEPS = 1
export const DISPLAY_FRAME_CORNER_STEP = 2

export interface StarDisplayFrameProps extends HTMLAttributes<HTMLDivElement> {
  /** Data rendered on the inner surface. */
  children?: ReactNode
}

/**
 * DisplayFrame — a single-layer pixel plate for showing data.
 *
 * Four fixed bands frame the surface, outermost first:
 * `6px #562c2b` → `3px #dd7a0b` → `3px #af4f0e` → `3px #fdecb1`, with a
 * `#fed384` surface and black text inside. The colours are baked in on purpose
 * (there is no `color` prop), and the box grows with its content — it is a plain
 * container, so `className` / `...rest` land on the root and consumers can hang
 * flex or grid classes straight on it.
 */
function StarDisplayFrame({ children, className = '', style, ...rest }: StarDisplayFrameProps) {
  const cornerClipPath = createInsetSteppedRectClipPath(DISPLAY_FRAME_CORNER_STEPS, DISPLAY_FRAME_CORNER_STEP)
  const frameStyle = { ...style, '--display-frame-clip': cornerClipPath } as CSSProperties

  return (
    <div {...rest} className={classNames(styles['star-display-frame'], className)} style={frameStyle}>
      {/* Decorative fills. Each one spans the whole box and is inset by the rings
          outside it, so the band left visible is exactly its own thickness; all
          four are clipped with the shared corner stair.
          They stay *below* the surface — a full-box fill stacked above the
          content would hide it. The root's `padding` is what reserves the four
          bands, so children keep their natural flow. */}
      <span className={styles['star-display-frame__edge']} aria-hidden />
      <span className={styles['star-display-frame__band']} aria-hidden />
      <span className={styles['star-display-frame__accent']} aria-hidden />
      <span className={styles['star-display-frame__line']} aria-hidden />
      {/* A future header band slots in here, between the rings and the surface. */}
      <div className={styles['star-display-frame__surface']}>{children}</div>
    </div>
  )
}

export { StarDisplayFrame }
export default StarDisplayFrame
