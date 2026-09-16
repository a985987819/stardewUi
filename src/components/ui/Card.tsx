import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { CARD_DEFAULT_THEME_COLOR, createCardPalette } from '../../utils/cardLighting'
import { createGapFrameClipPath } from '../../utils/pixelCorners'
import styles from './Card.module.scss'

/**
 * Thickness of the card's outer gap frame. Must stay in sync with the
 * `$card-frame-width` token in `Card.module.scss` — the CSS draws the edges and
 * corner blocks, this number generates the clip that cuts the matching corner
 * gap out of the fill layer.
 */
const CARD_FRAME_WIDTH = 6

const CARD_EDGE_COLORS = {
  'night-village': '#2f1e27',
  'forest-farm': '#48652c',
  'wooden-cabin': '#6f3a18',
  'lake-night': '#274d70',
  'flower-festival': '#82445f',
  'mine-starry': '#34458a',
  farmland: '#7a4824',
  'orchard-grass': '#355123',
  'workshop-ore': '#39434c',
  'night-celebration': '#202f76',
} as const

export type CardColor = keyof typeof CARD_EDGE_COLORS
export type CardThemeColor = CardColor | string

export interface StarCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  children: ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  size?: 'small' | 'medium' | 'large'
  color?: CardThemeColor
  headerExtra?: ReactNode
  footer?: ReactNode
  hoverable?: boolean
  showTitle?: boolean
}

function isPresetCardColor(color?: CardThemeColor): color is CardColor {
  return Boolean(color && color in CARD_EDGE_COLORS)
}

function StarCard({
  title,
  children,
  variant = 'default',
  size = 'medium',
  color,
  className = '',
  headerExtra,
  footer,
  hoverable = false,
  showTitle = false,
  onClick,
  style,
  ...rest
}: StarCardProps) {
  const hasTitle = showTitle && Boolean(title)
  const baseColor = isPresetCardColor(color) ? CARD_EDGE_COLORS[color] : color ?? CARD_DEFAULT_THEME_COLOR
  const palette = createCardPalette(baseColor)
  // Continuous gap-border corner (`cornerLevel = 1`): the fill is clipped to
  // the ring's inner edge, and the frame's 2× thickness corner blocks close the
  // ring on top — no corner is ever left open to the page.
  const gapClipPath = createGapFrameClipPath(CARD_FRAME_WIDTH)
  const cardStyle = {
    ...style,
    '--card-bg': palette.background,
    '--card-bg-light': palette.backgroundLight,
    '--card-bg-dark': palette.backgroundDark,
    '--card-border': palette.border,
    '--card-border-dark': palette.borderDark,
    '--card-border-light': palette.borderLight,
    '--card-inner-border': palette.innerBorder,
    '--card-border-highlight': palette.borderHighlight,
    '--card-border-inner-shadow': palette.borderInnerShadow,
    '--card-border-outer-glow': palette.borderOuterGlow,
    '--card-outer-shadow': palette.outerShadow,
    '--card-outer-shadow-hover': palette.outerShadowHover,
    '--card-outer-shadow-active': palette.outerShadowActive,
    '--card-inner-glow': palette.innerGlow,
    '--card-gap-clip': gapClipPath,
    '--card-text': palette.text,
    '--card-text-secondary': palette.textSecondary,
    '--card-section-bg': palette.sectionBackground,
    // Legacy aliases, kept so inline styles written against the old variable
    // names keep working.
    '--card-top-highlight': palette.topHighlight,
    '--card-right-edge-shadow': palette.rightEdgeShadow,
    '--card-divider-shadow': palette.dividerShadow,
    '--card-title-text-shadow': palette.titleTextShadow,
    '--card-header-stripe-1': palette.headerStripes[0],
    '--card-header-stripe-2': palette.headerStripes[1],
    '--card-header-stripe-3': palette.headerStripes[2],
    '--card-header-stripe-4': palette.headerStripes[3],
    '--card-body-stripe-1': palette.bodyStripes[0],
    '--card-body-stripe-2': palette.bodyStripes[1],
    '--card-body-stripe-3': palette.bodyStripes[2],
    '--card-body-stripe-4': palette.bodyStripes[3],
    '--card-body-stripe-5': palette.bodyStripes[4],
    '--card-body-stripe-6': palette.bodyStripes[5],
    '--card-body-stripe-7': palette.bodyStripes[6],
    '--card-body-stripe-8': palette.bodyStripes[7],
    '--card-footer-top': palette.footerTop,
    '--card-footer-bottom': palette.footerBottom,
    '--card-footer-border': palette.footerBorder,
    '--card-image-divider': palette.imageDivider,
    '--card-body-top-glow': palette.bodyTopGlow,
    '--card-body-bottom-shadow': palette.bodyBottomShadow,
    '--card-body-right-shadow': palette.bodyRightShadow,
    '--card-body-left-glow': palette.bodyLeftGlow,
  } as CSSProperties

  const cardClass = classNames(
    styles['stardew-card'],
    styles[`stardew-card--${variant}`],
    styles[`stardew-card--${size}`],
    isPresetCardColor(color) && styles[`stardew-card--color-${color}`],
    hasTitle && styles['stardew-card--with-title'],
    hoverable && styles['stardew-card--hoverable'],
    onClick && styles['stardew-card--clickable'],
    className
  )

  return (
    <div {...rest} className={cardClass} style={cardStyle} onClick={onClick}>
      {/* Decorative layers, all absolutely positioned so they never take part in
          the card's layout (`consumer` classes like `display: flex` on the card
          root must keep reaching the real children).
          - `__plate` = the fill, clipped so each corner loses the gap square
          - `__frame` = the inner light line, deliberately square
          - `__border` = the gap frame (edges + corner blocks), stacked above the
            content so anything running into the frame is covered, not drawn over */}
      <span className={styles['stardew-card__plate']} aria-hidden />
      <span className={styles['stardew-card__frame']} aria-hidden />
      {hasTitle ? (
        <div data-slot="card-header" className={styles['stardew-card__header']} style={{ justifyContent: 'flex-start' }}>
          {/* <CardSurfaceCanvas stripes={palette.headerStripes} slot="card-header-surface" /> */}
          <h3 className={styles['stardew-card__title']}>{title}</h3>
          {headerExtra ? <div className={styles['stardew-card__extra']}>{headerExtra}</div> : null}
        </div>
      ) : null}
      <div className={styles['stardew-card__body']}>
        {/* <CardSurfaceCanvas stripes={palette.bodyStripes} slot="card-body-surface" /> */}
        <span
          data-slot="card-body-overlay"
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: `inset 0 1px 0 var(--card-body-top-glow), inset 2px 0 0 var(--card-body-left-glow), inset -4px 0 0 var(--card-body-right-shadow), inset 0 -3px 0 var(--card-body-bottom-shadow)`,
          }}
        />
        <div className={styles['stardew-card__body-content']}>{children}</div>
      </div>
      {footer ? <div className={styles['stardew-card__footer']}>{footer}</div> : null}
      <span className={styles['stardew-card__border']} aria-hidden />
    </div>
  )
}

interface StarCardImageProps {
  src: string
  alt: string
  className?: string
}

function StarCardImage({ src, alt, className = '' }: StarCardImageProps) {
  return (
    <div className={classNames(styles['stardew-card__image'], className)}>
      <img src={src} alt={alt} />
    </div>
  )
}

interface StarCardMetaProps {
  title?: string
  description?: string
  className?: string
}

function StarCardMeta({ title, description, className = '' }: StarCardMetaProps) {
  return (
    <div className={classNames(styles['stardew-card__meta'], className)}>
      {title ? <h4 className={styles['stardew-card__meta-title']}>{title}</h4> : null}
      {description ? <p className={styles['stardew-card__meta-desc']}>{description}</p> : null}
    </div>
  )
}

StarCard.Image = StarCardImage
StarCard.Meta = StarCardMeta

export { StarCard, StarCardImage, StarCardMeta }
export default StarCard
