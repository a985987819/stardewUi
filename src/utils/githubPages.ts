export const GITHUB_PAGES_REPOSITORY = 'stardewUi'

export const GITHUB_PAGES_BASE_PATH = `/${GITHUB_PAGES_REPOSITORY}/`

export const GITHUB_PAGES_BASENAME = `/${GITHUB_PAGES_REPOSITORY}`

export function resolveAssetPath(path: string): string {
  if (path.startsWith('http')) {
    return path
  }
  const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  return `${cleanBase}${cleanPath}`
}
