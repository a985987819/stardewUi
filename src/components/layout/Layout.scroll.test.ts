/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('documentation navigation scrolling', () => {
  it('keeps the route navigation sticky in its own viewport-height scroller', () => {
    const scss = readFileSync(resolve(process.cwd(), 'src/components/layout/Sidebar.module.scss'), 'utf8')

    expect(scss).toMatch(/sticky\s+top-0/)
    expect(scss).toContain('margin-top: 60px')
    expect(scss).toContain('height: calc(100dvh - 60px)')
    expect(scss).toContain('overflow-y-auto')
    expect(scss).toContain('overscroll-behavior: contain')
    expect(scss).toContain('align-self: start')
  })

  it('uses a sticky table of contents that aligns with the board’s right edge on wide screens', () => {
    const tocScss = readFileSync(resolve(process.cwd(), 'src/components/layout/TableOfContents.module.scss'), 'utf8')
    const layoutScss = readFileSync(resolve(process.cwd(), 'src/components/layout/Layout.module.scss'), 'utf8')

    expect(tocScss).toContain('position: sticky')
    expect(tocScss).toContain('top: 84px')
    expect(tocScss).not.toContain('position: fixed')
    expect(tocScss).toContain('margin-left: auto')
    expect(layoutScss).toContain('width: min(960px, 100%)')
    expect(layoutScss).toContain('&-primary')
  })

  it('mounts the table of contents at the doc-content layer instead of inside a routed page', () => {
    const layoutTsx = readFileSync(resolve(process.cwd(), 'src/components/layout/Layout.tsx'), 'utf8')
    const pageTsx = readFileSync(resolve(process.cwd(), 'src/components/layout/ComponentPage.tsx'), 'utf8')

    expect(layoutTsx).toContain("<div className={styles['doc-content']}>")
    expect(layoutTsx).toContain('<StarTableOfContents')
    expect(layoutTsx).toContain('items={tableOfContents}')
    expect(pageTsx).not.toContain('<StarTableOfContents')
  })

  it('centres the complete documentation content region in the main page', () => {
    const layoutScss = readFileSync(resolve(process.cwd(), 'src/components/layout/Layout.module.scss'), 'utf8')
    const contentBlock = layoutScss.match(/\.doc-content\s*\{[\s\S]*?\n\}/)

    expect(contentBlock?.[0]).toContain('@apply max-w-[1200px] mx-auto')
    expect(contentBlock?.[0]).toContain('justify-self: center')
    expect(contentBlock?.[0]).toContain('justify-self: end')
  })

  it('uses a two-column shell so sticky navigation stays beside the document', () => {
    const layoutScss = readFileSync(resolve(process.cwd(), 'src/components/layout/Layout.module.scss'), 'utf8')

    expect(layoutScss).toContain('grid-template-columns: 260px minmax(0, 1fr)')
    expect(layoutScss).not.toContain('margin-left: 260px')
    expect(layoutScss).toContain('grid-column: 2')
  })
})
