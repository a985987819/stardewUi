/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const scss = readFileSync(resolve(process.cwd(), 'src/components/ui/Dialog.module.scss'), 'utf8')

describe('Dialog motion placement styling', () => {
  it('scales from the center for centered dialogs and from the lower edge for bottom dialogs', () => {
    expect(scss).toMatch(/\.stardew-dialog\s*\{[\s\S]*?transform-origin:\s*center center;/)
    expect(scss).toMatch(/&--bottom\s*\{[\s\S]*?transform-origin:\s*center bottom;/)
  })
})
