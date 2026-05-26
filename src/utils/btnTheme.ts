export type BtnSeason = 'spring' | 'summer' | 'autumn' | 'winter'

export interface BtnPalette {
  fill: string
  fillHover: string
  fillActive: string
  border: string
  text: string
  textHover: string
  textActive: string
  textShadow: string
  highlight: string
  disabledFill: string
  disabledBorder: string
  disabledText: string
}

type Rgb = { r: number; g: number; b: number }

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))

function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }: Rgb): string {
  return '#' + [r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')
}

function mix(base: string, target: string, weight: number): string {
  const b = hexToRgb(base)
  const t = hexToRgb(target)
  return rgbToHex({
    r: b.r + (t.r - b.r) * weight,
    g: b.g + (t.g - b.g) * weight,
    b: b.b + (t.b - b.b) * weight,
  })
}

function lighten(color: string, amount: number): string {
  return mix(color, '#FFFFFF', amount)
}

function darken(color: string, amount: number): string {
  return mix(color, '#000000', amount)
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const toLinear = (c: number) => {
    const n = c / 255
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg)
  const l2 = luminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function readableText(against: string, preferLight: boolean): string {
  if (preferLight) {
    if (contrastRatio('#FFF8E1', against) >= 4.5) return '#FFF8E1'
    for (let w = 0.1; w <= 0.6; w += 0.1) {
      const c = mix('#FFF8E1', '#FFFFFF', w)
      if (contrastRatio(c, against) >= 4.5) return c
    }
    return '#FFFFFF'
  }
  if (contrastRatio('#3E2723', against) >= 4.5) return '#3E2723'
  for (let w = 0.1; w <= 0.8; w += 0.1) {
    const c = darken('#5D4037', w)
    if (contrastRatio(c, against) >= 4.5) return c
  }
  return '#000000'
}

function isLightColor(hex: string): boolean {
  return luminance(hex) > 0.4
}

export function createBtnPalette(color?: string): BtnPalette {
  const base = color ?? '#7A5C3A'
  const isLight = isLightColor(base)

  const fill = isLight ? base : lighten(base, 0.15)
  const fillHover = lighten(fill, 0.12)
  const fillActive = darken(fill, 0.15)
  const border = darken(base, 0.25)

  const preferLightText = !isLight
  const text = readableText(fill, preferLightText)
  const textHover = preferLightText ? lighten(text, 0.1) : darken(text, 0.12)
  const textActive = preferLightText ? lighten(text, 0.2) : darken(text, 0.22)
  const textShadow = preferLightText ? darken(base, 0.4) : 'rgba(255,255,255,0.18)'
  const highlight = preferLightText ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.22)'

  return {
    fill,
    fillHover,
    fillActive,
    border,
    text,
    textHover,
    textActive,
    textShadow,
    highlight,
    disabledFill: '#A09888',
    disabledBorder: '#8A8278',
    disabledText: '#D8D0C4',
  }
}

export const SEASON_PALETTES: Record<BtnSeason, BtnPalette> = {
  spring: {
    fill: '#F8BBD0',
    fillHover: '#FCE4EC',
    fillActive: '#E91E63',
    border: '#880E4F',
    text: '#FFFFFF',
    textHover: '#FFFFFF',
    textActive: '#FFF8E1',
    textShadow: 'rgba(136,14,79,0.5)',
    highlight: 'rgba(255,255,255,0.25)',
    disabledFill: '#C8B8B8',
    disabledBorder: '#A89898',
    disabledText: '#E8E0E0',
  },
  summer: {
    fill: '#81C784',
    fillHover: '#A5D6A7',
    fillActive: '#2E7D32',
    border: '#1B5E20',
    text: '#FFFFFF',
    textHover: '#FFFFFF',
    textActive: '#E8F5E9',
    textShadow: 'rgba(27,94,32,0.5)',
    highlight: 'rgba(255,255,255,0.2)',
    disabledFill: '#A8B8A8',
    disabledBorder: '#88A888',
    disabledText: '#D8E0D8',
  },
  autumn: {
    fill: '#FFB74D',
    fillHover: '#FFCC80',
    fillActive: '#E65100',
    border: '#BF360C',
    text: '#FFFFFF',
    textHover: '#FFFFFF',
    textActive: '#FFF3E0',
    textShadow: 'rgba(191,54,12,0.5)',
    highlight: 'rgba(255,255,255,0.18)',
    disabledFill: '#B8A898',
    disabledBorder: '#988878',
    disabledText: '#E0D8D0',
  },
  winter: {
    fill: '#90CAF9',
    fillHover: '#BBDEFB',
    fillActive: '#1565C0',
    border: '#0D47A1',
    text: '#FFFFFF',
    textHover: '#FFFFFF',
    textActive: '#E3F2FD',
    textShadow: 'rgba(13,71,161,0.5)',
    highlight: 'rgba(255,255,255,0.22)',
    disabledFill: '#98A8B8',
    disabledBorder: '#7888A0',
    disabledText: '#D0D8E0',
  },
}
