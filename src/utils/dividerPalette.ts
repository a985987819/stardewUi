/**
 * The four opaque layers of a divider motif, all derived from the one colour a
 * caller actually sees — the wood of the fence post or the star:
 *
 * | role        | where it lands                                   |
 * | ----------- | ------------------------------------------------ |
 * | `body`      | the visible wood — the colour the caller passes  |
 * | `frame`     | the dark ink outline around it                   |
 * | `highlight` | the pale band along the lit top-right edges      |
 * | `shadow`    | the block dropped behind the lower-left edge     |
 *
 * Light and shade are always mixed from the *same* input, so a green divider
 * gets a cold dark outline and a pale green rim instead of a brown one.
 */
export interface DividerPalette {
  body: string
  frame: string
  highlight: string
  shadow: string
}

/** Body colour of the classic wooden fence post and star. */
export const DEFAULT_DIVIDER_COLOR = '#fa9405'
export const DEFAULT_DIVIDER_FRAME = '#9b440d'
export const DEFAULT_DIVIDER_HIGHLIGHT = '#ffd9a3'
export const DEFAULT_DIVIDER_SHADOW = '#492b18'

interface Rgb { r: number; g: number; b: number }

function clampChannel(value: number) { return Math.max(0, Math.min(255, Math.round(value))) }

function normalizeHex(color?: string) {
  const value = color?.trim().replace(/^#/, '') ?? ''
  if (/^[0-9a-fA-F]{3}$/.test(value)) return `#${value.split('').map((channel) => channel.repeat(2)).join('').toLowerCase()}`
  return /^[0-9a-fA-F]{6}$/.test(value) ? `#${value.toLowerCase()}` : DEFAULT_DIVIDER_COLOR
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
 * Derive the frame, highlight, and drop shadow from the visible wood colour.
 *
 * The default wood returns the hand-tuned palette exactly — those four hexes are
 * a product decision and must not drift. Any other colour keeps its own family:
 * the outline mixes most of the way to a warm near-black, the highlight is a
 * pale tint of the input, and the shadow is the input pushed far darker, so the
 * three derived layers always bracket the body in lightness (frame and shadow
 * below it, highlight above) whatever hue comes in.
 */
export function deriveDividerPalette(color?: string): DividerPalette {
  const body = normalizeHex(color)
  if (body === DEFAULT_DIVIDER_COLOR) {
    return { body, frame: DEFAULT_DIVIDER_FRAME, highlight: DEFAULT_DIVIDER_HIGHLIGHT, shadow: DEFAULT_DIVIDER_SHADOW }
  }

  return {
    body,
    frame: mix(body, '#2a1206', 0.55),
    highlight: mix(body, '#fff6e6', 0.72),
    shadow: mix(body, '#1a0f14', 0.8),
  }
}
