type RgbColor = {
  r: number
  g: number
  b: number
}

type CardSectionPalette = {
  borderBase: string
  borderInner: string
  borderOuter: string
  highlightTop: string
  shadowRight: string
}

export type CardPalette = {
  frame: CardSectionPalette
  header: CardSectionPalette & {
    stripes: [string, string, string, string]
  }
  body: CardSectionPalette & {
    stripes: [string, string, string, string, string, string, string, string]
  }
  text: {
    primary: string
    secondary: string
    shadow: string
  }
}

const DEFAULT_CARD_BASE = '#dc7b05'

const DEFAULT_CARD_PALETTE: CardPalette = {
  frame: {
    borderBase: '#dc7b05',
    borderInner: '#b14e05',
    borderOuter: '#853605',
    highlightTop: '#d79f6f',
    shadowRight: '#6d2605',
  },
  header: {
    borderBase: '#e28a1e',
    borderInner: '#b66112',
    borderOuter: '#8f4309',
    highlightTop: '#efb06b',
    shadowRight: '#743208',
    stripes: ['#ffc576', '#fdbc6e', '#f5b56f', '#f4ab65'],
  },
  body: {
    borderBase: '#c86a04',
    borderInner: '#9d4205',
    borderOuter: '#723005',
    highlightTop: '#d3915f',
    shadowRight: '#5f2205',
    stripes: ['#f0b66b', '#e8ab63', '#dfa15c', '#d79655', '#cf8c4f', '#c68148', '#bd7642', '#b46b3c'],
  },
  text: {
    primary: '#40210a',
    secondary: '#6d3a10',
    shadow: 'rgba(56, 26, 5, 0.35)',
  },
}

const cloneCardPalette = (palette: CardPalette): CardPalette => ({
  frame: { ...palette.frame },
  header: {
    ...palette.header,
    stripes: [...palette.header.stripes] as [string, string, string, string],
  },
  body: {
    ...palette.body,
    stripes: [...palette.body.stripes] as [string, string, string, string, string, string, string, string],
  },
  text: { ...palette.text },
})

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

const normalizeHexColor = (value: string) => {
  const trimmed = value.trim()
  const raw = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed

  if (/^[\da-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split('')
      .map((channel) => channel.repeat(2))
      .join('')}`.toLowerCase()
  }

  if (/^[\da-fA-F]{6}$/.test(raw)) {
    return `#${raw}`.toLowerCase()
  }

  return DEFAULT_CARD_BASE
}

const hexToRgb = (value: string): RgbColor => {
  const normalized = normalizeHexColor(value)

  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  }
}

const rgbToHex = ({ r, g, b }: RgbColor) =>
  `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, '0'))
    .join('')}`.toLowerCase()

const mixColors = (base: string, target: string, weight: number) => {
  const baseRgb = hexToRgb(base)
  const targetRgb = hexToRgb(target)

  return rgbToHex({
    r: baseRgb.r + (targetRgb.r - baseRgb.r) * weight,
    g: baseRgb.g + (targetRgb.g - baseRgb.g) * weight,
    b: baseRgb.b + (targetRgb.b - baseRgb.b) * weight,
  })
}

const shiftChannels = (
  base: string,
  shifts: Partial<RgbColor>,
  multipliers: Partial<RgbColor> = {}
) => {
  const rgb = hexToRgb(base)

  return rgbToHex({
    r: rgb.r * (multipliers.r ?? 1) + (shifts.r ?? 0),
    g: rgb.g * (multipliers.g ?? 1) + (shifts.g ?? 0),
    b: rgb.b * (multipliers.b ?? 1) + (shifts.b ?? 0),
  })
}

const createSectionPalette = (
  borderBase: string,
  recipe: {
    innerShift: Partial<RgbColor>
    innerMultiplier?: Partial<RgbColor>
    outerShift: Partial<RgbColor>
    outerMultiplier?: Partial<RgbColor>
    highlight: string
    shadow: string
  }
): CardSectionPalette => ({
  borderBase,
  borderInner: shiftChannels(borderBase, recipe.innerShift, recipe.innerMultiplier),
  borderOuter: shiftChannels(borderBase, recipe.outerShift, recipe.outerMultiplier),
  highlightTop: mixColors(borderBase, recipe.highlight, 0.42),
  shadowRight: mixColors(borderBase, recipe.shadow, 0.5),
})

const createTextShadow = (base: string) => {
  const { r, g, b } = hexToRgb(mixColors(base, '#1A120A', 0.72))
  return `rgba(${r}, ${g}, ${b}, 0.35)`
}

const createStripeRamp = <T extends 4 | 8>(base: string, count: T, startWeight: number, step: number, target: string) =>
  Array.from({ length: count }, (_, index) => mixColors(base, target, startWeight + step * index)) as T extends 4
    ? [string, string, string, string]
    : [string, string, string, string, string, string, string, string]

export const createCardPalette = (color: string): CardPalette => {
  const normalized = normalizeHexColor(color)

  if (normalized === DEFAULT_CARD_BASE) {
    return cloneCardPalette(DEFAULT_CARD_PALETTE)
  }

  const frame = createSectionPalette(normalized, {
    innerShift: { r: 10, g: 4, b: 2 },
    innerMultiplier: { r: 0.76, g: 0.6, b: 0.55 },
    outerShift: { r: -21, g: -22, b: 2.5 },
    outerMultiplier: { r: 0.48, g: 0.46, b: 0.5 },
    highlight: '#F6C89A',
    shadow: '#2A1508',
  })

  const headerBase = mixColors(normalized, '#FFD19A', 0.14)
  const bodyBase = mixColors(normalized, '#6A340A', 0.08)

  return {
    frame,
    header: {
      ...createSectionPalette(headerBase, {
        innerShift: { r: 8, g: 6, b: 3 },
        innerMultiplier: { r: 0.78, g: 0.65, b: 0.6 },
        outerShift: { r: -16, g: -18, b: 1 },
        outerMultiplier: { r: 0.56, g: 0.5, b: 0.52 },
        highlight: '#FFE1AE',
        shadow: '#3A1908',
      }),
      stripes: createStripeRamp(headerBase, 4, 0.42, 0.06, '#FFF0B8'),
    },
    body: {
      ...createSectionPalette(bodyBase, {
        innerShift: { r: 7, g: 3, b: 2 },
        innerMultiplier: { r: 0.74, g: 0.58, b: 0.55 },
        outerShift: { r: -19, g: -20, b: 1 },
        outerMultiplier: { r: 0.46, g: 0.44, b: 0.5 },
        highlight: '#E7B077',
        shadow: '#241209',
      }),
      stripes: createStripeRamp(bodyBase, 8, 0.18, 0.055, '#F3D3A5'),
    },
    text: {
      primary: mixColors(normalized, '#1B120C', 0.78),
      secondary: mixColors(normalized, '#3A2410', 0.66),
      shadow: createTextShadow(normalized),
    },
  }
}
