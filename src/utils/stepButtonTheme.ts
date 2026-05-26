export type StepButtonPalette = {
  fill: string
  fillHover: string
  fillActive: string
  border: string
  text: string
  textShadow: string
}

type Rgb = { r: number; g: number; b: number }

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))

const hexToRgb = (hex: string): Rgb => {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

const rgbToHex = ({ r, g, b }: Rgb) =>
  `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`

const mix = (base: string, target: string, w: number) => {
  const b = hexToRgb(base)
  const t = hexToRgb(target)
  return rgbToHex({
    r: b.r + (t.r - b.r) * w,
    g: b.g + (t.g - b.g) * w,
    b: b.b + (t.b - b.b) * w,
  })
}

const luminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  const toLinear = (c: number) => {
    const n = c / 255
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

const contrastRatio = (fg: string, bg: string) => {
  const l1 = luminance(fg)
  const l2 = luminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const darkenUntilContrast = (color: string, bg: string, minContrast: number) => {
  let best = color
  let bestRatio = contrastRatio(best, bg)
  for (let w = 0.08; w <= 1; w += 0.08) {
    const candidate = mix(color, '#000000', w)
    const ratio = contrastRatio(candidate, bg)
    if (ratio > bestRatio) { best = candidate; bestRatio = ratio }
    if (ratio >= minContrast) return candidate
  }
  return best
}

const SEASON_PALETTES: Record<string, StepButtonPalette> = {
  spring: {
    fill: '#8BC34A',
    fillHover: '#9CCC65',
    fillActive: '#689F38',
    border: '#33691E',
    text: '#FFFFFF',
    textShadow: '#33691E',
  },
  summer: {
    fill: '#039BE5',
    fillHover: '#29B6F6',
    fillActive: '#0277BD',
    border: '#01579B',
    text: '#FFFFFF',
    textShadow: '#01579B',
  },
  autumn: {
    fill: '#E65100',
    fillHover: '#F4511E',
    fillActive: '#BF360C',
    border: '#4E342E',
    text: '#FFF3E0',
    textShadow: '#4E342E',
  },
  winter: {
    fill: '#546E7A',
    fillHover: '#78909C',
    fillActive: '#37474F',
    border: '#263238',
    text: '#ECEFF1',
    textShadow: '#263238',
  },
}

const DEFAULT_PALETTE: StepButtonPalette = {
  fill: '#7A5C3A',
  fillHover: '#8E7050',
  fillActive: '#5D4528',
  border: '#3E2723',
  text: '#FFE8C6',
  textShadow: '#3E2723',
}

export function createStepButtonPalette(color?: string, theme?: string): StepButtonPalette {
  if (theme && SEASON_PALETTES[theme]) {
    return SEASON_PALETTES[theme]
  }

  if (!color) return DEFAULT_PALETTE

  const border = mix(color, '#000000', 0.45)
  const fillHover = mix(color, '#FFFFFF', 0.18)
  const fillActive = mix(color, '#000000', 0.2)

  const lightText = mix(color, '#FFFFFF', 0.75)
  const darkText = darkenUntilContrast(color, '#FDF4E6', 4.5)

  const lightContrast = contrastRatio(lightText, color)
  const darkContrast = contrastRatio(darkText, color)

  const text = lightContrast >= darkContrast ? lightText : darkText
  const textShadow = border

  return {
    fill: color,
    fillHover,
    fillActive,
    border,
    text,
    textShadow,
  }
}
