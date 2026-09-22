/// <reference types="node" />
import { cleanup, render, screen } from '@testing-library/react'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../i18n'
import StarSidebar from '../components/layout/Sidebar'
import { COMPONENT_CATALOGUE_CATEGORIES, COMPONENT_ROUTES, HIDDEN_COMPONENTS } from './componentRegistry'

/**
 * The component library publishes one component through five files. This suite
 * is the reason a new component cannot silently go missing from the sidebar,
 * the router, or the gallery: every link in the chain is asserted against
 * `COMPONENT_ROUTES`.
 *
 *   componentRegistry.tsx  ->  lazyPages.ts  ->  pages/<C>Demo.tsx
 *          |
 *          +-------------->  components/ui/<C>.tsx  ->  components/ui/index.ts
 *
 * Add a component with `bun run gen:component <Name>`; run just this guard with
 * `bun run check:components`.
 */

const projectRoot = process.cwd()
const read = (path: string) => readFileSync(resolve(projectRoot, path), 'utf8')

const uiBarrel = read('src/components/ui/index.ts')
const lazyPages = read('src/router/lazyPages.ts')
const sidebar = read('src/components/layout/Sidebar.tsx')
const routerIndex = read('src/router/index.tsx')
const gallery = read('src/pages/Components.tsx')

/** Every `Star<X>DemoPage` export plus the page module it resolves to. */
const lazyDemoPages = [...lazyPages.matchAll(/export const (Star\w+DemoPage) = lazy\(\(\) => import\('\.\.\/pages\/([\w-]+)'\)\)/g)].map(
  ([, exportName, pageModule]) => ({ exportName, pageModule })
)

/** Every `Demo.tsx` page sitting in `src/pages` (`*.test.tsx` excluded). */
const demoPageModules = readdirSync(resolve(projectRoot, 'src/pages'))
  .filter((file) => /^[A-Z]\w*Demo\.tsx$/.test(file))
  .map((file) => file.replace(/\.tsx$/, ''))

/** Modules re-exported from `src/components/ui/index.ts` via a relative path. */
const barrelModules = [...new Set([...uiBarrel.matchAll(/from '\.\/([\w-]+)'/g)].map(([, module]) => module))]

/**
 * Modules that deliberately share a route with another module instead of owning
 * one. Currently empty: every module the ui barrel exports owns its own entry.
 * Keep this list short — a module that needs an entry of its own should get one.
 */
const SHARED_ROUTE_MODULES: Record<string, string> = {}

const cataloguedComponents = COMPONENT_ROUTES.map((entry) => entry.component)
const cataloguedRoutePaths = COMPONENT_ROUTES.map((entry) => entry.routePath)
const hiddenComponents: string[] = [...HIDDEN_COMPONENTS]
const publicDemoPageModules = demoPageModules.filter((module) => !hiddenComponents.includes(module.replace(/Demo$/, '')))

afterEach(cleanup)

describe('component catalogue sync', () => {
  it('keeps routePath and component unique, with kebab-case URLs', () => {
    expect(new Set(cataloguedRoutePaths).size).toBe(COMPONENT_ROUTES.length)
    expect(new Set(cataloguedComponents).size).toBe(COMPONENT_ROUTES.length)

    for (const entry of COMPONENT_ROUTES) {
      expect(entry.routePath, `routePath of ${entry.component}`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(entry.component, `component of ${entry.routePath}`).toMatch(/^[A-Z]\w*$/)
      expect(COMPONENT_CATALOGUE_CATEGORIES, `${entry.component}.category`).toContain(entry.category)
    }
  })

  it('orders common components before specialised catalogue categories', () => {
    const categoryIndexes = COMPONENT_ROUTES.map((entry) => COMPONENT_CATALOGUE_CATEGORIES.indexOf(entry.category))

    expect(categoryIndexes).toEqual(categoryIndexes.toSorted((left, right) => left - right))
    expect(COMPONENT_ROUTES.slice(0, 5).map(({ routePath }) => routePath)).toEqual([
      'button',
      'card',
      'dialog',
      'drawer',
      'input',
    ])
  })

  it('describes every entry in both languages', () => {
    for (const { component, title, desc, icon } of COMPONENT_ROUTES) {
      for (const lang of ['zh', 'en'] as const) {
        expect(title[lang]?.trim(), `${component}.title.${lang}`).toBeTruthy()
        expect(desc[lang]?.trim(), `${component}.desc.${lang}`).toBeTruthy()
      }
      // The sidebar and the gallery both render this node, so it must be real.
      expect(icon, `${component}.icon`).toBeTruthy()
    }
  })

  it('resolves every entry to the lazy demo page declared in lazyPages.ts', () => {
    for (const { component, element } of COMPONENT_ROUTES) {
      const expectedExport = `Star${component}DemoPage`
      const declaration = lazyDemoPages.find((page) => page.exportName === expectedExport)

      expect(declaration, `lazyPages.ts must export ${expectedExport}`).toBeDefined()
      expect(declaration?.pageModule, `${expectedExport} must point at ../pages/${component}Demo`).toBe(
        `${component}Demo`
      )
      expect(element, `${component}.element must be ${expectedExport}`).toBeTruthy()
    }
  })

  it('has one demo page per entry and no orphan pages', () => {
    expect([...publicDemoPageModules].sort()).toEqual([...cataloguedComponents.map((name) => `${name}Demo`)].sort())

    for (const { component } of COMPONENT_ROUTES) {
      expect(existsSync(resolve(projectRoot, `src/pages/${component}Demo.tsx`)), `pages/${component}Demo.tsx`).toBe(
        true
      )
      expect(
        existsSync(resolve(projectRoot, `src/components/ui/${component}.tsx`)),
        `components/ui/${component}.tsx`
      ).toBe(true)
    }
  })

  it('exports every catalogued component from the public ui barrel', () => {
    for (const component of cataloguedComponents) {
      expect(uiBarrel, `components/ui/index.ts must export './${component}'`).toContain(`from './${component}'`)
    }
  })

  it('routes every module the ui barrel exports to a catalogue entry', () => {
    for (const module of barrelModules) {
      const sharedRoute = SHARED_ROUTE_MODULES[module]
      if (sharedRoute) {
        // The mapping itself can rot, so the borrowed route must still exist.
        expect(cataloguedRoutePaths, `${module} borrows route "${sharedRoute}"`).toContain(sharedRoute)
        continue
      }

      if (hiddenComponents.includes(module)) continue

      expect(cataloguedComponents, `components/ui/index.ts exports './${module}' with no catalogue entry`).toContain(module)
    }
  })

  it('keeps intentionally hidden components out of the public catalogue', () => {
    for (const component of hiddenComponents) {
      expect(cataloguedComponents, `${component} should remain hidden`).not.toContain(component)
      expect(cataloguedRoutePaths, `${component} route should remain hidden`).not.toContain(component.toLowerCase())
    }
  })

  it('renders every catalogued route as a sidebar link', () => {
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={['/components']}>
          <StarSidebar />
        </MemoryRouter>
      </I18nProvider>
    )

    const sidebarLinks = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href): href is string => Boolean(href?.startsWith('/components/')))

    expect(sidebarLinks).toEqual(cataloguedRoutePaths.map((routePath) => `/components/${routePath}`))
  })

  it('keeps the router, gallery and sidebar derived from the catalogue', () => {
    // Guards against the sidebar or the gallery growing a hand-maintained copy
    // of the component list (which is how `/components/switch` went missing).
    expect(routerIndex, 'router must map COMPONENT_ROUTES').toContain('COMPONENT_ROUTES.map')
    expect(gallery, 'gallery must map COMPONENT_ROUTES').toContain('COMPONENT_ROUTES.map')
    expect(sidebar, 'sidebar must map COMPONENT_ROUTES').toContain('COMPONENT_ROUTES.map')
    expect(sidebar, 'sidebar labels must come from the catalogue, not i18n keys').not.toContain("t('sidebar.")
  })
})
