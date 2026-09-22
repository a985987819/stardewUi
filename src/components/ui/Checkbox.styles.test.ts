/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const checkboxStyles = readFileSync(resolve(process.cwd(), 'src/components/ui/Checkbox.module.scss'), 'utf8')

describe('Checkbox visual proportions', () => {
  it('uses an 80% control without the former bottom pseudo-element and offsets the check left by 3px', () => {
    expect(checkboxStyles).toContain('--checkbox-control-size: calc(var(--checkbox-check-size) * 0.8)')
    expect(checkboxStyles).not.toMatch(/&__control\s*\{[\s\S]*?&::after\s*\{/)
    expect(checkboxStyles).toContain('calc(var(--checkbox-check-size) * -0.48 + 3px)')
    expect(checkboxStyles).toContain('calc(var(--checkbox-check-size) * -0.14 - 3px)')
  })
})
