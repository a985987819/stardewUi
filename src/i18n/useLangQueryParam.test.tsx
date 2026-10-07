/// <reference types="node" />
import { render } from '@testing-library/react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider } from './I18nProvider'
import { useLangQueryParam } from './useLangQueryParam'

/**
 * Where the router ended up after the repair.
 *
 * Written from an effect rather than during render: the value is read by the
 * assertions, never by this component, so recording it in render would be a side
 * effect that happens to work — and React's compiler-enabled lint rules are right
 * to reject it. A ref keeps it out of the render path entirely.
 */
let route = ''

function Probe() {
  const location = useLocation()

  useLangQueryParam()

  useEffect(() => {
    route = `${location.pathname}${location.search}`
  }, [location.pathname, location.search])

  return null
}

/**
 * `BrowserRouter` on purpose, not `MemoryRouter`.
 *
 * The hook repairs the URL with `replace`, and that choice is invisible to a
 * memory router — it keeps its own stack and never touches `window.history`, so
 * "did this push an entry?" would have no answer. This is also the router the
 * app actually mounts.
 */
function renderAt(url: string) {
  window.history.replaceState(null, '', `/stardewUi${url}`)
  route = url

  return render(
    <I18nProvider>
      <BrowserRouter basename="/stardewUi">
        <Probe />
      </BrowserRouter>
    </I18nProvider>,
  )
}

describe('useLangQueryParam', () => {
  beforeEach(() => {
    window.localStorage.clear()
    route = ''
  })

  afterEach(() => {
    window.localStorage.clear()
    window.history.replaceState(null, '', '/stardewUi/')
  })

  it('leaves an already-correct parameter alone', () => {
    window.localStorage.setItem('star-ui-lang', JSON.stringify('zh'))
    renderAt('/components?lang=zh')

    expect(route).toBe('/components?lang=zh')
  })

  it('adds the parameter when the URL arrived without one', () => {
    // The common case: the reader typed the URL, or followed a link from
    // somewhere that knows nothing about languages. Pinning the resolved
    // language means the next URL they copy carries it.
    window.localStorage.setItem('star-ui-lang', JSON.stringify('en'))
    renderAt('/components')

    expect(route).toBe('/components?lang=en')
  })

  it('keeps other query parameters intact', () => {
    // The repair rewrites the whole query string, so it has to carry everything
    // it did not write. Dropping a neighbour would break whichever feature owns
    // it, and nothing here would fail.
    window.localStorage.setItem('star-ui-lang', JSON.stringify('en'))
    renderAt('/components?tab=api')

    expect(route).toBe('/components?tab=api&lang=en')
  })

  it('does not push a history entry when it repairs the URL', () => {
    // A repair is not a navigation. An entry per repair would make the back
    // button walk through no-op URLs instead of leaving the site.
    window.localStorage.setItem('star-ui-lang', JSON.stringify('en'))
    window.history.replaceState(null, '', '/stardewUi/components')
    const before = window.history.length

    render(
      <I18nProvider>
        <BrowserRouter basename="/stardewUi">
          <Probe />
        </BrowserRouter>
      </I18nProvider>,
    )

    expect(window.history.length).toBe(before)
  })

  it('leaves the address bar in step with what the router resolved', () => {
    // The repair happens through the router, so both views of the URL have to
    // agree. A router-only update would leave a copied address bar stale, and
    // that address bar is the thing a reader actually shares.
    window.localStorage.setItem('star-ui-lang', JSON.stringify('en'))
    renderAt('/components')

    expect(window.location.search).toBe('?lang=en')
  })
})