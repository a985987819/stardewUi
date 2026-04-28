import { describe, expect, it } from 'vitest'
import {
  GITHUB_PAGES_BASE_PATH,
  GITHUB_PAGES_BASENAME,
  GITHUB_PAGES_REPOSITORY,
} from './githubPages'

describe('githubPages config', () => {
  it('uses the repository name as the GitHub Pages path segment', () => {
    expect(GITHUB_PAGES_REPOSITORY).toBe('stardewUi')
  })

  it('exposes a trailing-slash base path for Vite assets', () => {
    expect(GITHUB_PAGES_BASE_PATH).toBe('/stardewUi/')
  })

  it('exposes a basename without a trailing slash for React Router', () => {
    expect(GITHUB_PAGES_BASENAME).toBe('/stardewUi')
  })
})
