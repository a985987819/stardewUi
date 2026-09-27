// Batch: 2026-09-27 P0 batch — internal marker for tooling only; no runtime effect.
import {
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Pagination.module.scss'

export interface StarPaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Total item count; the pager derives the page count from it. */
  total: number
  /** Items per page. */
  pageSize?: number
  /** Controlled active page (1-based); leave undefined to own the state. */
  current?: number
  /** Initial page for the uncontrolled mode. */
  defaultCurrent?: number
  /** Fires with the next page and the current page size. */
  onChange?: (page: number, pageSize: number) => void
  /** Renders nothing when everything fits on one page. */
  hideOnSinglePage?: boolean
  /** Custom total copy, e.g. `(total, range) => \`共 ${total} 条\``. */
  showTotal?: (total: number, range: [number, number]) => ReactNode
  /** Accessible name of the pager. */
  ariaLabel?: string
}

/**
 * Corner staircase: 2 levels × 2px — the small-control scale shared with Tag
 * and Alert. Each page chip is a tiny plate whose ring and fill layers use
 * this one polygon, so the border stays an even 2px around the corners.
 */
const PAGINATION_CLIP_PATH = createSteppedRectClipPath(2, 2)

type PaginationCssVariables = CSSProperties & {
  '--star-pagination-clip': string
}

type PageChunk = { kind: 'page'; page: number } | { kind: 'ellipsis'; key: string }

/** Always shows 1 and the last page; ellipses bridge long jumps. */
function buildChunks(current: number, totalPages: number): PageChunk[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => ({
      kind: 'page' as const,
      page: index + 1,
    }))
  }

  const left = Math.max(2, current - 1)
  const right = Math.min(totalPages - 1, current + 1)
  const chunks: PageChunk[] = [{ kind: 'page', page: 1 }]

  if (left > 2) chunks.push({ kind: 'ellipsis', key: 'ellipsis-left' })
  for (let page = left; page <= right; page += 1) {
    chunks.push({ kind: 'page', page })
  }
  if (right < totalPages - 1) chunks.push({ kind: 'ellipsis', key: 'ellipsis-right' })

  chunks.push({ kind: 'page', page: totalPages })
  return chunks
}

/**
 * Pagination — a pixel pager for flipping through notice-board quests one
 * page at a time: square parchment chips joined like fence posts, the active
 * page darkened like an ink stamp, and ellipsis bridges for long stretches.
 */
function StarPagination({
  total,
  pageSize = 10,
  current,
  defaultCurrent = 1,
  onChange,
  hideOnSinglePage = false,
  showTotal,
  ariaLabel,
  className,
  style,
  ...rest
}: StarPaginationProps) {
  // Board counts are finite and non-negative: NaN or negative totals collapse
  // to an empty board instead of leaking NaN into the page chips.
  const safeTotal = Number.isFinite(total) ? Math.max(0, total) : 0
  const totalPages = Math.max(1, Math.ceil(safeTotal / Math.max(1, pageSize)))
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent)
  const activePage = current ?? innerCurrent

  const goTo = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages)
    if (next === activePage) return
    if (current === undefined) setInnerCurrent(next)
    onChange?.(next, pageSize)
  }

  const cssVariables: PaginationCssVariables = {
    '--star-pagination-clip': PAGINATION_CLIP_PATH,
  }

  if (hideOnSinglePage && totalPages <= 1) return null

  return (
    <nav
      {...rest}
      aria-label={ariaLabel ?? 'Pagination'}
      className={classNames(styles['star-pagination'], className)}
      style={{ ...cssVariables, ...style }}
    >
      <button
        type="button"
        className={styles['star-pagination__step']}
        aria-label="Previous page"
        disabled={activePage <= 1}
        onClick={() => goTo(activePage - 1)}
      >
        <ChevronLeft size={14} strokeWidth={3} aria-hidden />
      </button>

      {buildChunks(activePage, totalPages).map((chunk) =>
        chunk.kind === 'page' ? (
          <button
            key={chunk.page}
            type="button"
            className={classNames(
              styles['star-pagination__page'],
              chunk.page === activePage && styles['is-active'],
            )}
            aria-current={chunk.page === activePage ? 'page' : undefined}
            aria-label={`Page ${chunk.page}`}
            onClick={() => goTo(chunk.page)}
          >
            {chunk.page}
          </button>
        ) : (
          <span key={chunk.key} className={styles['star-pagination__ellipsis']} aria-hidden>
            …
          </span>
        ),
      )}

      <button
        type="button"
        className={styles['star-pagination__step']}
        aria-label="Next page"
        disabled={activePage >= totalPages}
        onClick={() => goTo(activePage + 1)}
      >
        <ChevronRight size={14} strokeWidth={3} aria-hidden />
      </button>

      {showTotal ? (
        <span className={styles['star-pagination__total']}>
          {showTotal(safeTotal, [
            (activePage - 1) * pageSize + 1,
            Math.min(activePage * pageSize, safeTotal),
          ])}
        </span>
      ) : null}
    </nav>
  )
}

export { StarPagination }
export default StarPagination
