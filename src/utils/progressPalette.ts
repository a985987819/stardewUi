export interface ProgressPalette {
  fill: string
  border: string
  shadow: string
  highlight: string
  empty: string
}

export const DEFAULT_PROGRESS_COLOR = '#ce053c'
export const DEFAULT_PROGRESS_BORDER = '#7f2110'
export const DEFAULT_PROGRESS_SHADOW = '#ba7f53'
export const DEFAULT_PROGRESS_HIGHLIGHT = '#f9606c'

interface Rgb { r: number; g: number; b: number }

function clampChannel(value: number) { return Math.max(0, Math.min(255, Math.round(value))) }

function normalizeHex(color?: string) {
  const value = color?.trim().replace(/^#/, '') ?? ''
  if (/^[0-9a-fA-F]{3}$/.test(value)) return `#${value.split('').map((channel) => channel.repeat(2)).join('').toLowerCase()}`
  return /^[0-9a-fA-F]{6}$/.test(value) ? `#${value.toLowerCase()}` : DEFAULT_PROGRESS_COLOR
}

function hexToRgb(color: string): Rgb {
  const hex = normalizeHex(color)
  return { r: Number.parseInt(hex.slice(1, 3), 16), g: Number.parseInt(hex.slice(3, 5), 16), b: Number.parseInt(hex.slice(5, 7), 16) }
}

function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b].map((channel) => clampChannel(channel).toString(16).padStart(2, '0')).join('')}`
}

function mix(base: string, target: string, amount: number) {
  const from = hexToRgb(base)
  const to = hexToRgb(target)
  return rgbToHex({ r: from.r + (to.r - from.r) * amount, g: from.g + (to.g - from.g) * amount, b: from.b + (to.b - from.b) * amount })
}

/**
 * Derive the per-cell bevel from its visible fill colour. The default returns
 * the hand-tuned health palette exactly; custom colours preserve their own
 * family while borrowing a small amount of warm wood for the lower-left shade.
 */
export function deriveProgressPalette(color?: string): ProgressPalette {
  const fill = normalizeHex(color)
  if (fill === DEFAULT_PROGRESS_COLOR) return { fill, border: DEFAULT_PROGRESS_BORDER, shadow: DEFAULT_PROGRESS_SHADOW, highlight: DEFAULT_PROGRESS_HIGHLIGHT, empty: '#e8a7ac' }

  return {
    fill,
    border: mix(fill, '#24070b', 0.56),
    shadow: mix(mix(fill, '#73411f', 0.3), '#d8bb8b', 0.42),
    highlight: mix(fill, '#fff1ec', 0.43),
    empty: mix(fill, '#fff3ec', 0.68),
  }
}
