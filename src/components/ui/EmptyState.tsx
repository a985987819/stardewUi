import { type HTMLAttributes, type ReactNode } from 'react'
import defaultEmptyStateImage from '../../assets/noData.png'
import { classNames } from '../../utils/classNames'
import { useComponentCopy } from './useComponentCopy'
import styles from './EmptyState.module.scss'

export type EmptyStateDirection = 'horizontal' | 'vertical'

export interface StarEmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  imageSrc?: string
  imageAlt?: string
  message?: ReactNode
  showImage?: boolean
  showMessage?: boolean
  direction?: EmptyStateDirection
}

const DEFAULT_IMAGE_SRC = defaultEmptyStateImage
const DEFAULT_MESSAGE = '没有更多数据了'

function StarEmptyState({
  imageSrc = DEFAULT_IMAGE_SRC,
  imageAlt,
  message,
  showImage = true,
  showMessage = true,
  direction = 'vertical',
  className,
  ...rest
}: StarEmptyStateProps) {
  // Defaults come from the host app's language when it provides one. The
  // constants above stay exported as the documented Chinese fallbacks so a
  // consumer reading `EMPTY_STATE_DEFAULT_MESSAGE` gets a stable value.
  const copy = useComponentCopy()
  const resolvedAlt = imageAlt ?? copy.t('ui.emptyState.imageAlt')
  const resolvedMessage = message ?? copy.t('ui.emptyState.message')

  return (
    <div
      {...rest}
      className={classNames(styles['stardew-empty-state'], styles[`stardew-empty-state--${direction}`], className)}
    >
      {showImage ? (
        <div className={styles['stardew-empty-state__image-wrap']}>
          <img src={imageSrc} alt={resolvedAlt} className={styles['stardew-empty-state__image']} />
        </div>
      ) : null}
      {showMessage ? <div className={styles['stardew-empty-state__message']}>{resolvedMessage}</div> : null}
    </div>
  )
}

export { DEFAULT_IMAGE_SRC as EMPTY_STATE_DEFAULT_IMAGE_SRC }
export { DEFAULT_MESSAGE as EMPTY_STATE_DEFAULT_MESSAGE }
export default StarEmptyState
