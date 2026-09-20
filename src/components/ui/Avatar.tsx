import { useMemo, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { deriveCardLightingFromSurface, resolveCardSurfaceColor } from '../../utils/cardLighting'
import styles from './Avatar.module.scss'

export type AvatarShape = 'square' | 'circle'
export type AvatarSize = 'small' | 'medium' | 'large' | number

export interface StarAvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color' | 'children'> {
  /** Image URL for the portrait. A failed URL falls back to initials or children. */
  src?: string
  /** Image alternative text and the source used to derive fallback initials. */
  alt?: string
  /** Explicit fallback name; it takes precedence over `alt` when generating initials. */
  name?: string
  /** Square uses Card-like rounded corners; circle is a fully round portrait frame. */
  shape?: AvatarShape
  /** Preset size or an exact pixel size. */
  size?: AvatarSize
  /** Visible wood-frame surface colour; its lighting layers are derived like Card. */
  color?: string
  /** Custom fallback content, displayed when the image is absent or fails to load. */
  children?: ReactNode
}

const AVATAR_SIZES = {
  small: { size: 48, frame: 4, inset: 2, contentInset: 8 },
  medium: { size: 72, frame: 6, inset: 3, contentInset: 12 },
  large: { size: 104, frame: 7, inset: 4, contentInset: 16 },
} as const

function getAvatarMetrics(size: AvatarSize) {
  if (typeof size !== 'number') return AVATAR_SIZES[size]

  const normalizedSize = Math.max(24, Math.round(size))
  return {
    size: normalizedSize,
    frame: Math.max(3, Math.round(normalizedSize / 14)),
    inset: Math.max(2, Math.round(normalizedSize / 24)),
    contentInset: Math.max(6, Math.round(normalizedSize / 6)),
  }
}

function getInitials(name?: string) {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? []
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

function StarAvatar({
  src,
  alt,
  name,
  shape = 'square',
  size = 'medium',
  color,
  children,
  className = '',
  style,
  ...rest
}: StarAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const metrics = getAvatarMetrics(size)
  const surfaceColor = resolveCardSurfaceColor(color)
  const palette = deriveCardLightingFromSurface(surfaceColor)
  const fallbackName = name || alt
  const showImage = Boolean(src) && failedSrc !== src

  const avatarStyle = useMemo(
    () =>
      ({
        '--avatar-size': `${metrics.size}px`,
        '--avatar-frame-width': `${metrics.frame}px`,
        '--avatar-inner-width': `${metrics.inset}px`,
        '--avatar-content-inset': `${metrics.contentInset}px`,
        '--avatar-bg': palette.background,
        '--avatar-border-dark': palette.borderDark,
        '--avatar-border-light': palette.borderLight,
        '--avatar-inner-border': palette.innerBorder,
        '--avatar-top-highlight': palette.topHighlight,
        '--avatar-right-shadow': palette.rightEdgeShadow,
        '--avatar-divider-shadow': palette.dividerShadow,
        '--avatar-shadow': palette.outerShadow,
        '--avatar-stripe-1': palette.headerStripes[0],
        '--avatar-stripe-2': palette.headerStripes[1],
        '--avatar-stripe-3': palette.headerStripes[2],
        '--avatar-stripe-4': palette.headerStripes[3],
        ...style,
      }) as CSSProperties,
    [metrics, palette, style]
  )

  return (
    <span
      {...rest}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : rest['aria-label'] ?? fallbackName ?? 'Avatar'}
      className={classNames(styles['star-avatar'], styles[`star-avatar--${shape}`], className)}
      style={avatarStyle}
    >
      <span className={styles['star-avatar__grain']} aria-hidden />
      {showImage ? (
        <img className={styles['star-avatar__image']} src={src} alt={alt ?? name ?? ''} onError={() => setFailedSrc(src)} />
      ) : (
        <span className={styles['star-avatar__fallback']} aria-hidden>
          {children ?? getInitials(fallbackName)}
        </span>
      )}
      <span className={styles['star-avatar__frame']} aria-hidden />
      <span className={styles['star-avatar__gloss']} aria-hidden />
    </span>
  )
}

export { StarAvatar }
export default StarAvatar
