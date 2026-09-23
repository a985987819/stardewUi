/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const tab = read('src/components/ui/Tab.module.scss')
const rawTokens = read('src/styles/_rawColorTokens.scss')

describe('tab external navigation styles', () => {
  it('frames every external tab item instead of the whole navigation strip', () => {
    expect(tab).toMatch(/\.star-tab__nav-wrapper\s*\{[^}]*border:\s*none/s)
    expect(tab).toMatch(/\.star-tab__item\s*\{[^}]*border:\s*6px solid \$tab-strip-border/s)
    expect(tab).toMatch(/\.star-tab__nav\s*\{[^}]*justify-content:\s*center;[^}]*gap:\s*2px;[^}]*padding:\s*0/s)
    expect(tab).toMatch(/\.star-tab__item\s*\{[^}]*border-bottom-width:\s*0;[^}]*border-radius:\s*12px 12px 0 0;[^}]*padding:\s*5px;[^}]*background:\s*#ffcb78/s)
    expect(tab).toMatch(/&--external\.star-tab--bottom\s*\{[\s\S]*?\.star-tab__item\s*\{[^}]*border-top-width:\s*0;[^}]*border-radius:\s*0 0 12px 12px/s)
  })

  it('resolves the strip border colour from the shared raw palette', () => {
    expect(tab).toContain('$tab-strip-border: var(--star-raw-hex-ca6f1c)')
    expect(rawTokens).toContain('--star-raw-hex-ca6f1c: #ca6f1c;')
  })

  it('moves the active external tab into the matching content-frame edge', () => {
    expect(tab).toContain('$tab-border-dark: var(--star-raw-hex-9d4100)')
    expect(tab).toMatch(/\.star-tab__panel\s*\{[^}]*border:\s*4px solid \$tab-border-dark/s)
    expect(tab).toMatch(/\.star-tab__panel\s*\{[^}]*z-index:\s*2;[^}]*border:\s*4px solid \$tab-border-dark/s)
    expect(tab).toMatch(/\.star-tab__nav-wrapper\s*\{[^}]*z-index:\s*1/s)
    expect(tab).toMatch(/\.star-tab__item--active\s*\{[^}]*background:\s*#ffcb78;[^}]*transform:\s*translateY\(4px\)/s)
    expect(tab).toMatch(/&--external\.star-tab--bottom\s*\{[\s\S]*?\.star-tab__item--active\s*\{[^}]*transform:\s*translateY\(-4px\)/)
  })

  it('animates external tab travel and lets bottom tabs paint over their panel seam', () => {
    expect(tab).toMatch(/\.star-tab__item\s*\{[\s\S]*?transform 0\.18s steps\(3, jump-start\)/)
    expect(tab).toMatch(/&--external\.star-tab--bottom\s*\{[\s\S]*?\.star-tab__nav-wrapper\s*\{[^}]*z-index:\s*3/s)
    expect(tab).toMatch(/&--external\.star-tab--bottom\s*\{[\s\S]*?\.star-tab__nav\s*\{[^}]*padding-bottom:\s*4px/s)
  })
})
