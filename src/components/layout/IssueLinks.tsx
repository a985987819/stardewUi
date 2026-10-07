import { Bug, ClipboardList, ExternalLink, Palette, Sparkles } from 'lucide-react'
import { useI18n } from '../../i18n'
import { GITHUB_REPO_URL, ISSUE_TEMPLATES, newIssueUrl } from '../../utils/githubIssues'
import styles from './IssueLinks.module.scss'

/** Per-entry icon, keyed alongside the shared template list. */
const TEMPLATE_ICONS = {
  bug: Bug,
  error: ClipboardList,
  style: Palette,
  request: Sparkles,
} as const

/**
 * The footer half of the "file an issue" affordance.
 *
 * The floating button is the fast path — visible from anywhere, routes by
 * intent in two clicks. This is the deliberate counterpart: someone who has read
 * to the end of a page and is now deciding what to do gets the same four routes
 * as plain links, in order, with no menu to discover.
 *
 * Both read `ISSUE_TEMPLATES`, so a template renamed for GitHub's sake changes
 * here too. What they deliberately do not share is the styling or the placement:
 * one is a corner control, the other is inline content, and forcing one set of
 * styles onto both is how a footer ends up looking like a second header.
 */
export function IssueLinks() {
  const { t } = useI18n()

  return (
    <div className={styles['issue-links']}>
      <p className={styles['issue-links-title']}>{t('issue.footer.title')}</p>

      <ul className={styles['issue-links-list']}>
        {ISSUE_TEMPLATES.map(({ key, template, copyKey }) => {
          const Icon = TEMPLATE_ICONS[key]

          return (
            <li key={key}>
              <a
                className={styles['issue-links-item']}
                href={newIssueUrl(template, window.location.href)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon size={18} aria-hidden="true" />
                <span>{t(copyKey)}</span>
              </a>
            </li>
          )
        })}
      </ul>

      <a
        className={styles['issue-links-repo']}
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('issue.footer.repo')}
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>
  )
}

export default IssueLinks