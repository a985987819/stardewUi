import { classNames } from '../../utils/classNames'
import './Card.css'

interface CardProps {
  title?: string
  children: React.ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  size?: 'small' | 'medium' | 'large'
  className?: string
  headerExtra?: React.ReactNode
  footer?: React.ReactNode
  onClick?: () => void
  hoverable?: boolean
}

function Card({
  title,
  children,
  variant = 'default',
  size = 'medium',
  className = '',
  headerExtra,
  footer,
  onClick,
  hoverable = false,
}: CardProps) {
  const cardClass = classNames(
    'stardew-card',
    `stardew-card--${variant}`,
    `stardew-card--${size}`,
    hoverable && 'stardew-card--hoverable',
    onClick && 'stardew-card--clickable',
    className
  )

  return (
    <div className={cardClass} onClick={onClick}>
      {title && (
        <div className="stardew-card__header">
          <h3 className="stardew-card__title">{title}</h3>
          {headerExtra && <div className="stardew-card__extra">{headerExtra}</div>}
        </div>
      )}
      <div className="stardew-card__body">{children}</div>
      {footer && <div className="stardew-card__footer">{footer}</div>}
    </div>
  )
}

interface CardImageProps {
  src: string
  alt: string
  className?: string
}

function CardImage({ src, alt, className = '' }: CardImageProps) {
  return (
    <div className={`stardew-card__image ${className}`}>
      <img src={src} alt={alt} />
    </div>
  )
}

interface CardMetaProps {
  title?: string
  description?: string
  className?: string
}

function CardMeta({ title, description, className = '' }: CardMetaProps) {
  return (
    <div className={`stardew-card__meta ${className}`}>
      {title && <h4 className="stardew-card__meta-title">{title}</h4>}
      {description && <p className="stardew-card__meta-desc">{description}</p>}
    </div>
  )
}

Card.Image = CardImage
Card.Meta = CardMeta

export { Card, CardImage, CardMeta }
export default Card
