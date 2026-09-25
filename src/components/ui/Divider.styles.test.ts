/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const dividerStyles = readFileSync(resolve(process.cwd(), 'src/components/ui/Divider.module.scss'), 'utf8')

describe('Divider theming', () => {
  // 四层颜色必须走 --star-divider-* 变量（兜底才是默认木色）。写死 hex 的话，改 color 只会换主体，
  // 外框/高光/投影会停在旧颜色上 —— 那正是这次要避免的。
  it('paints every layer from the shared theme variables', () => {
    expect(dividerStyles).toContain('$post-body: var(--star-divider-body, var(--star-raw-hex-fa9405))')
    expect(dividerStyles).toContain('$post-frame: var(--star-divider-frame, var(--star-raw-hex-9b440d))')
    expect(dividerStyles).toContain('$post-highlight: var(--star-divider-highlight, var(--star-raw-hex-ffd9a3))')
    expect(dividerStyles).toContain('$post-shadow: var(--star-divider-shadow, var(--star-raw-hex-492b18))')
  })

  // 栅栏的三层和星星的四层都只能从这四个角色取色，不能再出现写死的颜色。
  it('keeps both motifs on those four roles', () => {
    expect(dividerStyles).not.toMatch(/fill:\s*#/)
    expect(dividerStyles).not.toMatch(/background:\s*var\(--star-raw-hex/)
    expect(dividerStyles).toContain('fill: $post-shadow')
    expect(dividerStyles).toContain('fill: $post-frame')
    expect(dividerStyles).toContain('fill: $post-body')
    expect(dividerStyles).toContain('fill: $post-highlight')
  })
})
