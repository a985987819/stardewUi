import type { CSSProperties, HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import { CARD_DEFAULT_SURFACE_COLOR, deriveCardLightingFromSurface, resolveCardSurfaceColor } from '../../utils/cardLighting'
import styles from './Divider.module.scss'

export type DividerOrientation = 'horizontal' | 'vertical'

export interface StarDividerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Horizontal fence rail by default; use vertical for a standing divider. */
  orientation?: DividerOrientation
  /** Visible Card-style wood surface used to derive every light and shadow layer. */
  color?: string
}

/**
 * A Card-lighting divider condensed into an open wooden fence rail. It has no
 * panel surface: only the illuminated rail, its dark caps, the right/bottom
 * occlusion and small pixel posts remain.
 */
function StarDivider({
  orientation = 'horizontal',
  color = CARD_DEFAULT_SURFACE_COLOR,
  className,
  style,
  ...rest
}: StarDividerProps) {
  const surfaceColor = resolveCardSurfaceColor(color)
  const palette = deriveCardLightingFromSurface(surfaceColor)
  const dividerStyle = {
    '--divider-border-dark': palette.borderDark,
    '--divider-border-light': palette.borderLight,
    '--divider-inner-border': palette.innerBorder,
    '--divider-top-highlight': palette.topHighlight,
    '--divider-right-shadow': palette.rightEdgeShadow,
    '--divider-divider-shadow': palette.dividerShadow,
    '--divider-stripe-1': palette.headerStripes[0],
    '--divider-stripe-2': palette.headerStripes[1],
    '--divider-stripe-3': palette.headerStripes[2],
    '--divider-stripe-4': palette.headerStripes[3],
    ...style,
  } as CSSProperties

  return (
    <div
      {...rest}
      role="separator"
      aria-orientation={orientation}
      className={classNames(styles['star-divider'], styles[`star-divider--${orientation}`], className)}
      style={dividerStyle}
    >
      <span className={styles['star-divider__rail']} aria-hidden />
      <span className={styles['star-divider__post']} aria-hidden />
      <span className={styles['star-divider__post']} aria-hidden />
    </div>
  )
}

export { StarDivider }
export default StarDivider
