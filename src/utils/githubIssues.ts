/**
 * Where "file an issue" links point, and the templates they select.
 *
 * These live apart from the components on purpose. The floating button, the
 * footer, the READMEs and the test suite all have to agree on the template file
 * names, because GitHub's `?template=` parameter silently falls back to a blank
 * issue when it does not match a file in `.github/ISSUE_TEMPLATE/`. There is no
 * type or runtime check for that: the link stays green and the user lands on an
 * empty form with none of the questions they were routed there to answer.
 *
 * `issueTemplates.test.ts` cross-checks every name against the templates actually
 * on disk, so a rename cannot land in one place and miss the other.
 */

/** Owner and repository, single-sourced so no link drifts from another. */
export const GITHUB_REPOSITORY = 'a985987819/stardewUi'

export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPOSITORY}`

/**
 * The issue templates a reader can be routed to.
 *
 * `template` is the file name inside `.github/ISSUE_TEMPLATE/`, which is what
 * GitHub matches `?template=` against — it must include the extension.
 *
 * `copyKey` is spelled out rather than derived from `key` on purpose. A
 * `` `issue.template.${key}` `` lookup is indistinguishable, to both a reader and
 * to the dead-key test that scans sources for literal dictionary keys, from a key
 * that nobody reads. Writing the full name means the dictionary guard can prove
 * every one of these strings is actually rendered — which is the only thing
 * standing between a renamed template and a menu item that silently renders its
 * own key.
 *
 * The order is the menu order. "Something is broken" is placed before the softer
 * asks because a visitor who hit a bug has already decided they want to say
 * something, and making them scan past three other categories first reads as
 * being sent to the wrong desk.
 */
export const ISSUE_TEMPLATES = [
  {
    key: 'bug',
    template: 'bug_report.yml',
    copyKey: 'issue.template.bug',
    hintKey: 'issue.template.bugHint',
  },
  {
    key: 'error',
    template: 'error_report.yml',
    copyKey: 'issue.template.error',
    hintKey: 'issue.template.errorHint',
  },
  {
    key: 'style',
    template: 'style_improvement.yml',
    copyKey: 'issue.template.style',
    hintKey: 'issue.template.styleHint',
  },
  {
    key: 'request',
    template: 'feature_request.yml',
    copyKey: 'issue.template.request',
    hintKey: 'issue.template.requestHint',
  },
] as const

export type IssueTemplateKey = (typeof ISSUE_TEMPLATES)[number]['key']

/**
 * Build the "new issue" URL for a template.
 *
 * `search` prefills the title with the page the reader is on. For a bug report the
 * URL is usually the most useful single piece of context, and it is the one thing
 * the user cannot be expected to copy out by hand.
 */
export function newIssueUrl(template?: string, search?: string): string {
  const params = new URLSearchParams()
  if (template) params.set('template', template)
  if (search) params.set('q', search)

  const query = params.toString()
  return `${GITHUB_REPO_URL}/issues/new${query ? `?${query}` : ''}`
}