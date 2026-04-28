import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  type ReactNode,
  type CSSProperties,
  type HTMLAttributes,
} from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Tab.module.scss'

export type TabPosition = 'top' | 'bottom'

export interface StarTabItem {
  key: string
  label: string
  icon?: ReactNode
  content: ReactNode
  activeStyle?: CSSProperties
  activeClassName?: string
  /** 选中时全局样式 - 应用于整个选项卡容器 */
  activeGlobalStyle?: CSSProperties
  /** 选中时全局类名 - 应用于整个选项卡容器 */
  activeGlobalClassName?: string
  disabled?: boolean
}

export interface StarTabProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: StarTabItem[]
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (key: string) => void
  position?: TabPosition
}

function StarTab({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  position = 'top',
  className,
  ...rest
}: StarTabProps) {
  const [internalKey, setInternalKey] = useState(defaultActiveKey ?? items[0]?.key)
  const currentKey = activeKey ?? internalKey

  const navRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({})

  const updateIndicator = useCallback(() => {
    const nav = navRef.current
    if (!nav) return

    const activeTab = nav.querySelector<HTMLElement>(`[data-tab-key="${currentKey}"]`)
    if (!activeTab) return

    const navRect = nav.getBoundingClientRect()
    const tabRect = activeTab.getBoundingClientRect()

    const offsetLeft = tabRect.left - navRect.left + nav.scrollLeft
    const width = tabRect.width

    setIndicatorStyle({
      transform: `translateX(${offsetLeft}px)`,
      width: `${width}px`,
    })
  }, [currentKey])

  useLayoutEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const observer = new ResizeObserver(() => {
      updateIndicator()
    })
    observer.observe(nav)
    return () => observer.disconnect()
  }, [updateIndicator])

  const handleSelect = (key: string, disabled?: boolean) => {
    if (disabled) return
    if (activeKey === undefined) {
      setInternalKey(key)
    }
    onChange?.(key)
  }

  const activeItem = items.find((item) => item.key === currentKey)

  const isBottom = position === 'bottom'

  // 获取当前选中项的全局样式和类名
  const activeGlobalStyle = activeItem?.activeGlobalStyle
  const activeGlobalClassName = activeItem?.activeGlobalClassName

  return (
    <div
      {...rest}
      className={classNames(
        styles['star-tab'],
        isBottom && styles['star-tab--bottom'],
        activeGlobalClassName,
        className,
      )}
      style={activeGlobalStyle}
    >
      {!isBottom && (
        <div className={styles['star-tab__nav-wrapper']}>
          <div ref={navRef} className={styles['star-tab__nav']}>
            {items.map((item) => {
              const isActive = item.key === currentKey
              return (
                <button
                  key={item.key}
                  data-tab-key={item.key}
                  className={classNames(
                    styles['star-tab__item'],
                    isActive && styles['star-tab__item--active'],
                    item.disabled && styles['star-tab__item--disabled'],
                    isActive && item.activeClassName,
                  )}
                  style={isActive ? item.activeStyle : undefined}
                  onClick={() => handleSelect(item.key, item.disabled)}
                  disabled={item.disabled}
                >
                  {item.icon ? (
                    <span className={styles['star-tab__icon']}>{item.icon}</span>
                  ) : null}
                  <span className={styles['star-tab__label']}>{item.label}</span>
                </button>
              )
            })}
            <span
              className={classNames(
                styles['star-tab__indicator'],
                isBottom && styles['star-tab__indicator--bottom'],
              )}
              style={indicatorStyle}
            />
          </div>
        </div>
      )}

      <div className={styles['star-tab__content']}>
        {activeItem ? activeItem.content : null}
      </div>

      {isBottom && (
        <div className={styles['star-tab__nav-wrapper']}>
          <div ref={navRef} className={styles['star-tab__nav']}>
            {items.map((item) => {
              const isActive = item.key === currentKey
              return (
                <button
                  key={item.key}
                  data-tab-key={item.key}
                  className={classNames(
                    styles['star-tab__item'],
                    isActive && styles['star-tab__item--active'],
                    item.disabled && styles['star-tab__item--disabled'],
                    isActive && item.activeClassName,
                  )}
                  style={isActive ? item.activeStyle : undefined}
                  onClick={() => handleSelect(item.key, item.disabled)}
                  disabled={item.disabled}
                >
                  {item.icon ? (
                    <span className={styles['star-tab__icon']}>{item.icon}</span>
                  ) : null}
                  <span className={styles['star-tab__label']}>{item.label}</span>
                </button>
              )
            })}
            <span
              className={classNames(
                styles['star-tab__indicator'],
                isBottom && styles['star-tab__indicator--bottom'],
              )}
              style={indicatorStyle}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default StarTab
