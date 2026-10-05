/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `color` means one thing library-wide: a CSS colour.
 *
 * It used to mean two. `<Tag color="green">` resolved a named preset to a
 * class, while `<Card color="green">` handed the same word to a canvas colour
 * parser — and `green` is not a CSS colour, so one prop name produced two
 * different results depending on which component received it. A user copying a
 * line from the Tag docs into a Card got a silently wrong card rather than an
 * error.
 *
 * The split is now explicit, and the naming says which is which:
 *   - `color`  → a CSS colour, everywhere. It is what 12 of 14 components
 *     already took, and it is what "set this colour" means everywhere else.
 *   - `tone`   → Tag's six named inks (`default`…`purple`).
 *   - `surface`→ Card's ten named body palettes (`night-village`…`workshop-ore`).
 *
 * `tone` and `surface` were chosen over the obvious `variant` because both
 * components already use `variant` for something else — Card's is the visual
 * treatment (`default | outlined | elevated`), and reusing it would have
 * created a prop that changes the card's shape *and* its colour.
 */

const UI_DIR = resolve(process.cwd(), 'src/components/ui')

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

/** Strip comments so prose about a prop does not read as a declaration. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const componentFiles = readdirSync(UI_DIR).filter(
  (name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'),
)

describe('color prop semantics', () => {
  it('finds the components to check', () => {
    expect(componentFiles.length).toBeGreaterThan(30)
  })

  it('types color as a plain CSS colour string in every component that has it', () => {
    const offenders: string[] = []

    for (const file of componentFiles) {
      const source = stripComments(read(`src/components/ui/${file}`))
      // A prop declaration line: `  color?: Something`. Anything wider than
      // `string` means the prop is doing more than "a colour".
      for (const match of source.matchAll(/^\s{2}color\?:\s*(.+)$/gm)) {
        const type = match[1].trim()
        if (type !== 'string') offenders.push(`${file}: color?: ${type}`)
      }
    }

    expect(
      offenders,
      `color 必须是纯 CSS 颜色字符串；预设名请另起 prop（tone / surface）：\n${offenders.join('\n')}`,
    ).toEqual([])
  })

  it('keeps the named palettes on props that say they are named', () => {
    // The palettes themselves are fine — they are the reason the split exists.
    // What must not come back is a union that puts a preset name and a CSS
    // colour in the same slot, because that is the ambiguity being removed.
    const expectations: Record<string, { prop: string; named: string[] }> = {
      'Tag.tsx': { prop: 'tone', named: ['default', 'green', 'red', 'yellow', 'blue', 'purple'] },
    }

    for (const [file, { prop, named }] of Object.entries(expectations)) {
      const source = stripComments(read(`src/components/ui/${file}`))
      const declaration = new RegExp(`export type \\w+ =([^\\n]*)`).exec(source)
      expect(declaration, `${file} should declare its ${prop} union`).not.toBeNull()

      const union = declaration?.[1] ?? ''
      for (const value of named) {
        expect(union, `${file} 的 ${prop} 联合类型应包含 '${value}'`).toContain(`'${value}'`)
      }
    }
  })

  it('documents both sides of the split on Tag and Card', () => {
    // A rename that is not in the docs is a breaking change nobody can find.
    for (const file of ['Tag.tsx', 'Card.tsx']) {
      const source = read(`src/components/ui/${file}`)
      expect(source, `${file} 应说明 color 现在只收 CSS 颜色`).toMatch(/color prop|CSS colour|CSS 颜色/)
    }
  })

  it('keeps Card variant about shape, not colour', () => {
    // The reason `surface` exists rather than reusing `variant`.
    const source = stripComments(read('src/components/ui/Card.tsx'))
    expect(source).toMatch(/variant\?:\s*'default'\s*\|\s*'outlined'\s*\|\s*'elevated'/)
  })
})

describe('size prop scale', () => {
  it('gives every size prop the same three presets, or a preset-or-pixel escape hatch', () => {
    // `number` on its own was the odd one out: `size={144}` reads as a stray
    // measurement, and Loading's three real diameters (96/144/192) were
    // unnamed. Avatar already had the right shape — presets plus an exact
    // pixel escape hatch — and Loading now matches it.
    //
    // Most components declare `size?: InputSize` rather than spelling the union
    // out, so this follows the alias: an inline union is checked directly, and
    // a named type is resolved by looking for `export type <Name> =` in the same
    // file. Both spellings end up as text to assert on.
    const bareNumber: string[] = []
    const presetProps: string[] = []

    for (const file of componentFiles) {
      const source = stripComments(read(`src/components/ui/${file}`))

      for (const match of source.matchAll(/^\s{2}size\?:\s*(.+)$/gm)) {
        const declared = match[1].trim().replace(/\s*$/, '')

        if (declared === 'number') {
          bareNumber.push(`${file}: size?: number`)
          continue
        }

        // A named alias: resolve it against this file's own type exports. The
        // declaration may union the alias with `number` (Loading's escape
        // hatch), so test each piece separately.
        const parts = declared.split('|').map((part) => part.trim())
        const aliasName = parts.find((part) => /^\w+$/.test(part) && !part.startsWith("'"))
        const alias = aliasName
          ? new RegExp(`export type ${aliasName} =([^\\n]*)`).exec(source)?.[1] ?? ''
          : ''
        const resolved = parts.map((part) =>
          /^\w+$/.test(part) && !part.startsWith("'") && aliasName === part ? alias : part,
        )

        if (resolved.some((part) => part.includes("'small'"))) presetProps.push(`${file}: size?: ${declared}`)
      }
    }

    expect(
      bareNumber,
      `size 要么是三档预设（可再并 number 逃生口），不能只收 number：\n${bareNumber.join('\n')}`,
    ).toEqual([])

    expect(presetProps.length).toBeGreaterThan(8)
  })
})
