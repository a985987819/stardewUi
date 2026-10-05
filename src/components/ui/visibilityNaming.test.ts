/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * One name for "is this thing showing", across the whole library.
 *
 * The library used to carry three: `open` (Dialog, Drawer, Popup),
 * `visible` (Alert, BackToTop, Tag), and nothing at all (DatePicker, which owns
 * its own). Two spellings for one concept means a caller who learns `open` from
 * Dialog has to check again at Tag, and a typo silently lands in `...rest` and
 * reaches the DOM as a stray attribute.
 *
 * `open` won on two grounds:
 *   - It is already the majority, and the three components using it are the
 *     ones with the most surface area, so the convention was formed by the
 *     components most likely to set it.
 *   - `open` / `onOpenChange` is what Radix UI and Headless UI use, so the
 *     instinct transfers from other libraries. `visible` also collides with the
 *     CSS `visibility` property, which means something narrower — an element
 *     that occupies space but paints nothing. None of these components has that
 *     intermediate state.
 *
 * Read as a text check over the prop declarations, which is where the
 * convention lives; behaviour is covered by each component's own tests.
 */

const UI_DIR = resolve(process.cwd(), 'src/components/ui')

/**
 * Props that mean "is this on screen" and must therefore share one name.
 * `container` and friends are excluded on purpose — they are not booleans.
 */
const VISIBILITY_PROPS = ['visible', 'defaultVisible', 'onVisibleChange', 'isVisible', 'show', 'defaultShow'] as const

/** The name each of those is expected to have been renamed to. */
const RENAMES: Record<(typeof VISIBILITY_PROPS)[number], string> = {
  visible: 'open',
  defaultVisible: 'defaultOpen',
  onVisibleChange: 'onOpenChange',
  isVisible: 'open',
  show: 'open',
  defaultShow: 'defaultOpen',
}

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

/** Strip comments so a prop merely named in prose does not count as declared. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

describe('visibility prop naming', () => {
  const componentFiles = readdirSync(UI_DIR).filter(
    (name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'),
  )

  it('finds the components to check', () => {
    expect(componentFiles.length).toBeGreaterThan(30)
  })

  it.each(componentFiles)('%s declares no second name for visibility', (file) => {
    const source = stripComments(read(`src/components/ui/${file}`))
    const declared = new Set<string>()

    // Prop declarations only: a line that starts with two spaces and names the
    // prop. This deliberately does not match `styles['--visible']` or any other
    // occurrence in JSX or SCSS references.
    for (const match of source.matchAll(/^\s{2}(\w+)\??:/gm)) declared.add(match[1])

    const offenders = [...declared].filter((name) =>
      (VISIBILITY_PROPS as readonly string[]).includes(name),
    )

    expect(
      offenders,
      `${file} 仍声明 ${offenders.join(', ')}：可见性 prop 全库统一为 ${offenders
        .map((name) => `${name} → ${RENAMES[name as keyof typeof RENAMES]}`)
        .join(', ')}`,
    ).toEqual([])
  })

  it('uses the same name in every component that has the prop', () => {
    const users: Record<string, string[]> = {}

    for (const file of componentFiles) {
      const source = stripComments(read(`src/components/ui/${file}`))
      for (const match of source.matchAll(/^\s{2}(open|visible)\??:/gm)) {
        users[match[1]] ??= []
        users[match[1]].push(file)
      }
    }

    // If both spellings are ever reintroduced, this is the test that says so —
    // it reads as a single fact rather than as a list of banned names.
    expect(
      Object.keys(users).sort(),
      `可见性 prop 出现了多种拼法：${JSON.stringify(users)}`,
    ).toEqual(['open'])
  })

  it('keeps the SCSS visibility class name untouched', () => {
    // `--visible` in the stylesheet is a *state* class, not a prop, and it
    // describes the painted result. Renaming the prop must not drag it along.
    // Named here so the next person does not "finish the job" by renaming it.
    const backToTop = read('src/components/ui/BackToTop.module.scss')
    expect(backToTop).toContain('visible')
  })
})
