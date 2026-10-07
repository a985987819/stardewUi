import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Bug, ClipboardList, MessageSquarePlus, Palette, Sparkles, X } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { useI18n } from '../../i18n'
import { ISSUE_TEMPLATES, newIssueUrl } from '../../utils/githubIssues'
import styles from './IssueLauncher.module.scss'

/**
 * Per-entry icon, kept beside the template list rather than inside it: the list
 * is data about *GitHub* (file names, labels), and a JSX icon is not.
 */
const TEMPLATE_ICONS = {
  bug: Bug,
  error: ClipboardList,
  style: Palette,
  request: Sparkles,
} as const

/**
 * The floating "file an issue" button.
 *
 * Every reader who finds something wrong has to leave the site to say so, and the
 * only way out was the header's GitHub icon — which opens the repository, where
 * the actual "new issue" form is several clicks away and, more importantly, blank.
 * Blank is the problem: a form with no questions collects a one-line title and
 * nothing else, and the report that comes back is missing the reproduction steps
 * that would have made it fixable in one pass.
 *
 * So this routes by intent instead. The four templates in
 * `.github/ISSUE_TEMPLATE/` each ask for the details that kind of report needs,
 * and the menu picks one before leaving the site.
 *
 * **Positioning.** It sits above the back-to-top plane rather than beside it, on
 * the same right edge: two controls fighting for one corner at the same offset
 * means whichever renders last wins and the other becomes unreachable. Stacking
 * vertically keeps both reachable and reads as one control pair.
 */
export function IssueLauncher() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  const close = useCallback(() => setOpen(false), [])

  // Dismiss on Escape, and return focus to the trigger so the keyboard does not
  // strand the reader at the top of the document after dismissing a menu they
  // had just tabbed into.
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, close])

  // Dismiss on a click elsewhere. `pointerdown` rather than `click`: a menu that
  // only closes after the click has already landed somewhere else swallows that
  // click, which on a docs site means a reader loses the link they aimed at.
  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open, close])

  return (
    <div className={styles['issue-launcher']} ref={containerRef}>
      <div
        className={classNames(styles['issue-launcher-menu'], open && styles['is-open'])}
        id={menuId}
        hidden={!open}
      >
        <p className={styles['issue-launcher-menu-title']} aria-hidden="true">
          {t('issue.launcher.menuTitle')}
        </p>
        <ul className={styles['issue-launcher-list']}>
          {ISSUE_TEMPLATES.map(({ key, template, copyKey, hintKey }) => {
            const Icon = TEMPLATE_ICONS[key]

            return (
              <li key={key}>
                <a
                  className={styles['issue-launcher-item']}
                  // Prefilled with the page the reader is on: for a bug report the
                  // URL is usually the single most useful piece of context, and it
                  // is the one thing they cannot be expected to copy out by hand.
                  href={newIssueUrl(template, window.location.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className={styles['issue-launcher-item-label']}>{t(copyKey)}</span>
                  <span className={styles['issue-launcher-item-hint']}>{t(hintKey)}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      <button
        ref={triggerRef}
        type="button"
        className={classNames(styles['issue-launcher-trigger'], open && styles['is-open'])}
        // `aria-expanded` + `aria-controls` is what tells a screen reader the menu
        // is a disclosure rather than decoration that appeared.
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? t('issue.launcher.close') : t('issue.launcher.open')}
        title={open ? t('issue.launcher.close') : t('issue.launcher.open')}
        onClick={() => setOpen((previous) => !previous)}
      >
        {open ? <X size={24} aria-hidden="true" /> : <MessageSquarePlus size={24} aria-hidden="true" />}
      </button>
    </div>
  )
}

export default IssueLauncher