import { type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { resolveAssetPath } from '../../utils/githubPages'
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

const DEFAULT_IMAGE_SRC = resolveAssetPath('/noData.png')
const DEFAULT_IMAGE_ALT = '暂无数据'
const DEFAULT_MESSAGE = '没有更多数据了'

function StarEmptyState({
  imageSrc = DEFAULT_IMAGE_SRC,
  imageAlt = DEFAULT_IMAGE_ALT,
  message = DEFAULT_MESSAGE,
  showImage = true,
  showMessage = true,
  direction = 'vertical',
  className,
  ...rest
}: StarEmptyStateProps) {
  return (
    <div
      {...rest}
      className={classNames(
        styles['stardew-empty-state'],
        styles[`stardew-empty-state--${direction}`],
        className
      )}
    >
      {showImage ? (
        <div className={styles['stardew-empty-state__image-wrap']}>
          <img src={imageSrc} alt={imageAlt} className={styles['stardew-empty-state__image']} />
        </div>
      ) : null}
      {showMessage ? <div className={styles['stardew-empty-state__message']}>{message}</div> : null}
    </div>
  )
}

export { DEFAULT_IMAGE_SRC as EMPTY_STATE_DEFAULT_IMAGE_SRC }
export { DEFAULT_MESSAGE as EMPTY_STATE_DEFAULT_MESSAGE }
export default StarEmptyState
