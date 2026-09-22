/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const motion = read('src/styles/motion.scss')
const checkbox = read('src/components/ui/Checkbox.module.scss')
const progress = read('src/components/ui/Progress.module.scss')
const rating = read('src/components/ui/Rating.module.scss')
const appEntry = read('src/main.tsx')
const libraryEntry = read('src/index.ts')

describe('shared component motion', () => {
  it('defines the four reusable state-change motions and the faster shared exit duration once', () => {
    expect(motion).toContain('@keyframes star-motion-mask-reveal')
    expect(motion).toContain('@keyframes star-motion-pop-in')
    expect(motion).toContain('@keyframes star-motion-loss-shake')
    expect(motion).toContain('@keyframes star-motion-loss-shrink')
    expect(motion).toContain('--star-motion-loss-duration: 270ms')
  })

  it('makes Checkbox, Progress, and Rating consume shared animation names', () => {
    expect(checkbox).toContain('var(--star-motion-mask-reveal-name)')
    expect(checkbox).toContain('var(--star-motion-loss-shake-name)')
    expect(progress).toContain('var(--star-motion-pop-in-name)')
    expect(rating).toContain('var(--star-motion-pop-in-name)')
    expect(rating).toContain('var(--star-motion-loss-shrink-name)')
  })

  it('keeps the former local keyframe definitions out of component modules', () => {
    expect(checkbox).not.toContain('@keyframes star-checkbox-check')
    expect(progress).not.toContain('@keyframes star-progress-cell-in')
    expect(rating).not.toContain('@keyframes star-rating-pop-in')
    expect(rating).not.toContain('@keyframes star-rating-shake')
    expect(rating).not.toContain('@keyframes star-rating-fill-out')
  })

  it('loads the shared motion stylesheet from both application and library entries', () => {
    expect(appEntry).toContain("import './styles/motion.scss'")
    expect(libraryEntry).toContain("import './styles/motion.scss'")
  })
})
