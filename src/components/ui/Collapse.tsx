// Batch: 2026-09-27 P0 batch — internal marker for tooling only; no runtime effect.
import {
  useId,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { ChevronDown } from 'lucide-react'
import { resolveAriaLabel } from '../../utils/a11y'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Collapse.module.scss'

export interface CollapseItem {
  /** Stable identity used for open-state tracking. */
  key: string
  /** Header copy, or richer content. */
  label: ReactNode
  /** Panel body, revealed when the section is open. */
  content: ReactNode
  /** Locks the header so the section can never open. */
  disabled?: boolean
  /** Right-aligned header slot for counts, tags, or actions; clicks stay put. */
  extra?: ReactNode
}

export interface StarCollapseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Sections of the board, in order. */
  items: CollapseItem[]
  /** Only one section may stay open at a time. */
  accordion?: boolean
  /** Which side of the header the chevron sits on. */
  expandIconPosition?: 'start' | 'end'
  /** Controlled open keys; leave undefined to let the component own them. */
  activeKeys?: string[]
  /** Initial open keys for the uncontrolled mode. */
  defaultActiveKeys?: string[]
  /** Fires with the next open-keys set. */
  onChange?: (keys: string[]) => void
  /** Accessible name of the whole board. */
  ariaLabel?: string
}

/**
 * Corner staircase: 2 levels × 2px — the Alert scale. Each section is one
 * wooden plate, and the frame ring plus the parchment fill share the same
 * polygon so the border stays an even 2px around the stepped corners.
 */
const COLLAPSE_CLIP_PATH = createSteppedRectClipPath(2, 2)

type CollapseCssVariables = CSSProperties & {
  '--star-collapse-clip': string
}

/**
 * Collapse — foldable wooden sections that tuck notes away like a journal:
 * each item is a parchment plate with a clickable header and a pixel chevron
 * that flips open; panels pop in instantly, like a game menu unfolding.
 */
function StarCollapse({
  items,
  accordion = false,
  expandIconPosition = 'start',
  activeKeys,
  defaultActiveKeys = [],
  onChange,
  ariaLabel,
  className,
  style,
  ...rest
}: StarCollapseProps) {
  const uid = useId()
  const [innerKeys, setInnerKeys] = useState<Set<string>>(() => new Set(defaultActiveKeys))
  const openKeys = activeKeys ? new Set(activeKeys) : innerKeys
  // Accepts both `ariaLabel` and the DOM spelling, so a caller who reaches for
  // `aria-label` does not silently lose the accessible name.
  const resolvedAriaLabel = resolveAriaLabel(ariaLabel, rest)

  const toggle = (key: string, disabled?: boolean) => {
    if (disabled) return
    const isOpen = openKeys.has(key)
    const next = accordion
      ? isOpen
        ? []
        : [key]
      : isOpen
        ? [...openKeys].filter((k) => k !== key)
        : [...openKeys, key]
    if (!activeKeys) setInnerKeys(new Set(next))
    onChange?.(next)
  }

  const cssVariables: CollapseCssVariables = {
    '--star-collapse-clip': COLLAPSE_CLIP_PATH,
  }

  return (
    <div
      {...rest}
      role={accordion ? undefined : 'group'}
      aria-label={resolvedAriaLabel}
      className={classNames(styles['star-collapse'], className)}
      style={{ ...cssVariables, ...style }}
    >
      {items.map((item, index) => {
        const isOpen = openKeys.has(item.key)
        const headerId = `star-collapse-${uid}-${index}-header`
        const panelId = `star-collapse-${uid}-${index}-panel`

        return (
          <div
            key={item.key}
            className={classNames(
              styles['star-collapse__item'],
              isOpen && styles['is-open'],
              item.disabled && styles['is-disabled'],
            )}
          >
            <span className={styles['star-collapse__plate']} aria-hidden />
            <button
              type="button"
              id={headerId}
              className={classNames(
                styles['star-collapse__header'],
                expandIconPosition === 'end' && styles['star-collapse__header--icon-end'],
              )}
              aria-expanded={isOpen}
              // Points at the panel even while it is unmounted, so assistive
              // tech can announce the target the header will unfold.
              aria-controls={panelId}
              aria-disabled={item.disabled || undefined}
              onClick={() => toggle(item.key, item.disabled)}
            >
              {expandIconPosition === 'start' ? (
                <ChevronDown
                  size={14}
                  strokeWidth={3}
                  aria-hidden
                  className={styles['star-collapse__chevron']}
                />
              ) : null}
              <span className={styles['star-collapse__label']}>{item.label}</span>
              {expandIconPosition === 'end' ? (
                <ChevronDown
                  size={14}
                  strokeWidth={3}
                  aria-hidden
                  className={styles['star-collapse__chevron']}
                />
              ) : null}
              {item.extra ? (
                // Extra is a parking spot, not a toggle: keep the header's
                // click from folding the section underneath it.
                <span
                  className={styles['star-collapse__extra']}
                  onClick={(event) => event.stopPropagation()}
                >
                  {item.extra}
                </span>
              ) : null}
            </button>
            {isOpen ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className={styles['star-collapse__panel']}
              >
                <div className={styles['star-collapse__panel-inner']}>{item.content}</div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export { StarCollapse }
export default StarCollapse
