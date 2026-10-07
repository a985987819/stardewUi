import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LANG_PARAM } from './langParam'
import { useI18n } from './context'

/**
 * Keep `?lang=` on the address bar across in-app navigation.
 *
 * `<Link to="/components">` navigates by pathname and drops the query string,
 * so a reader who arrived on `?lang=en`, browsed three pages and copied the URL
 * would hand over a link with no language in it — and the recipient falls back
 * to whatever their own browser remembers. That is the same "every visit looks
 * the same" problem the parameter was added to solve, one navigation later.
 *
 * Keyed on `pathname` rather than on the search params: this is meant to repair
 * the URL after a *navigation*, and re-running whenever an unrelated param
 * changed would fight any other feature that owns the query string.
 *
 * `replace` so the repair does not become a history entry the back button has to
 * walk through.
 */
export function useLangQueryParam(): void {
  const { lang } = useI18n()
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.get(LANG_PARAM) === lang) return

    const next = new URLSearchParams(searchParams)
    next.set(LANG_PARAM, lang)
    // `pathname` is passed explicitly: `setSearchParams` alone would resolve
    // against the current location, which is what we want, but stating it keeps
    // the intent readable next to the dependency that triggers this.
    navigate({ pathname, search: next.toString() }, { replace: true })
  }, [lang, pathname, searchParams, navigate, setSearchParams])
}