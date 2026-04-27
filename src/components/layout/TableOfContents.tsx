import { useState, useEffect } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './TableOfContents.module.scss'

interface TocItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
}

function StarTableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -80% 0px' }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (items.length === 0) return null

  return (
    <nav className={styles['table-of-contents']}>
      <h3 className={styles['toc-title']}>目录</h3>
      <ul className={styles['toc-list']}>
        {items.map((item) => (
          <li
            key={item.id}
            className={classNames(
              styles['toc-item'],
              item.level > 1 && styles[`toc-item--level-${item.level}`],
              activeId === item.id && styles['is-active']
            )}
          >
            <button className={styles['toc-link']} onClick={() => handleClick(item.id)}>
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default StarTableOfContents
