export interface CardLighting {
  rightEdgeShadow: string
  topHighlight: string
  dividerShadow: string
  titleTextShadow: string
  headerStripes: [string, string, string, string]
}

export interface CardPalette extends CardLighting {
  background: string
  backgroundLight: string
  backgroundDark: string
  borderDark: string
  borderLight: string
  innerBorder: string
  text: string
  textSecondary: string
  sectionBackground: string
  footerTop: string
  footerBottom: string
  footerBorder: string
  imageDivider: string
  bodyTopGlow: string
  bodyBottomShadow: string
  bodyRightShadow: string
  bodyLeftGlow: string
  bodyStripes: [string, string, string, string, string, string, string, string]
}

interface Rgb {
  r: number
  g: number
  b: number
}

interface Hsl {
  h: number
  s: number
  l: number
}

const HEADER_STRIPE_SHIFTS = [
  [-0.2, 1.035, 0.23],
  [-2.39, 1.017, 0.213],
  [-1.81, 0.918, 0.18],
  [-5.98, 0.918, 0.18],
] as const

const BODY_STRIPE_SHIFTS = [
  [-0.1, 1.035, 0.255],
  [-0.4, 1.03, 0.245],
  [-0.8, 1.02, 0.235],
  [-1.4, 1, 0.225],
  [-2.1, 0.975, 0.215],
  [-3, 0.95, 0.2],
  [-4.3, 0.93, 0.19],
  [-5.98, 0.918, 0.18],
] as const

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function normalizeHex(hex: string) {
  const clean = hex.trim().replace(/^#/, '')

  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return clean
      .split('')
      .map((char) => char + char)
      .join('')
      .toLowerCase()
  }

  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return clean.toLowerCase()
  }

  throw new Error(`Invalid hex color: ${hex}`)
}

function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex)
  const value = Number.parseInt(normalized, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b]
    .map((value) => Math.round(value).toString(16).padStart(2, '0'))
    .join('')}`
}

function toRgba({ r, g, b }: Rgb, alpha: number) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`
}

function mixColors(base: string, target: string, weight: number) {
  const baseRgb = hexToRgb(base)
  const targetRgb = hexToRgb(target)

  return rgbToHex({
    r: baseRgb.r + (targetRgb.r - baseRgb.r) * weight,
    g: baseRgb.g + (targetRgb.g - baseRgb.g) * weight,
    b: baseRgb.b + (targetRgb.b - baseRgb.b) * weight,
  })
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: lightness }
  }

  const delta = max - min
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let hue = 0

  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0)
  } else if (max === green) {
    hue = (blue - red) / delta + 2
  } else {
    hue = (red - green) / delta + 4
  }

  return { h: hue * 60, s: saturation, l: lightness }
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hue = ((h % 360) + 360) % 360
  const chroma = (1 - Math.abs(2 * l - 1)) * s
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1))
  const m = l - chroma / 2
  let red = 0
  let green = 0
  let blue = 0

  if (hue < 60) {
    red = chroma
    green = x
  } else if (hue < 120) {
    red = x
    green = chroma
  } else if (hue < 180) {
    green = chroma
    blue = x
  } else if (hue < 240) {
    green = x
    blue = chroma
  } else if (hue < 300) {
    red = x
    blue = chroma
  } else {
    red = chroma
    blue = x
  }

  return {
    r: (red + m) * 255,
    g: (green + m) * 255,
    b: (blue + m) * 255,
  }
}

function shiftColor(hex: string, hueShift: number, saturationScale: number, lightnessShift: number) {
  const hsl = rgbToHsl(hexToRgb(hex))

  return rgbToHex(
    hslToRgb({
      h: hsl.h + hueShift,
      s: clamp(hsl.s * saturationScale),
      l: clamp(hsl.l + lightnessShift),
    })
  )
}

function getRelativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const toLinear = (channel: number) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function getContrastRatio(foreground: string, background: string) {
  const fg = getRelativeLuminance(foreground)
  const bg = getRelativeLuminance(background)
  const lighter = Math.max(fg, bg)
  const darker = Math.min(fg, bg)

  return (lighter + 0.05) / (darker + 0.05)
}

function createContrastColor(
  seed: string,
  background: string,
  minimumContrast: number,
  mode: 'darken' | 'lighten'
) {
  const target = mode === 'darken' ? '#000000' : '#fff8ef'
  let best = rgbToHex(hexToRgb(seed))
  let bestContrast = getContrastRatio(best, background)

  for (let weight = 0.08; weight <= 1; weight += 0.08) {
    const candidate = mixColors(seed, target, weight)
    const contrast = getContrastRatio(candidate, background)

    if (contrast > bestContrast) {
      best = candidate
      bestContrast = contrast
    }

    if (contrast >= minimumContrast) {
      return candidate
    }
  }

  return best
}

function generateHeaderStripes(baseColor: string): [string, string, string, string] {
  return [
    shiftColor(baseColor, 0, 1, 0.06),
    shiftColor(baseColor, 0, 1, 0.02),
    shiftColor(baseColor, 0, 1, -0.02),
    shiftColor(baseColor, 0, 1, -0.06),
  ]
}

function generateComputedHeaderStripes(baseColor: string): [string, string, string, string] {
  return HEADER_STRIPE_SHIFTS.map(([hueShift, saturationScale, lightnessShift]) =>
    shiftColor(baseColor, hueShift, saturationScale, lightnessShift)
  ) as [string, string, string, string]
}

function generateBodyStripes(baseColor: string): [string, string, string, string, string, string, string, string] {
  return BODY_STRIPE_SHIFTS.map(([hueShift, saturationScale, lightnessShift]) =>
    shiftColor(baseColor, hueShift, saturationScale, lightnessShift)
  ) as [string, string, string, string, string, string, string, string]
}

export function getCardLighting(edgeColor: string): CardLighting {
  const textShadowColor = shiftColor(edgeColor, -5, 0.92, -0.18)

  return {
    rightEdgeShadow: shiftColor(edgeColor, -9, 0.58, 0.118),
    topHighlight: shiftColor(edgeColor, -6, 0.75, -0.15),
    dividerShadow: shiftColor(edgeColor, -6, 0.9, -0.08),
    titleTextShadow: toRgba(hexToRgb(textShadowColor), 0.28),
    headerStripes: generateHeaderStripes(edgeColor),
  }
}

export function createCardPalette(edgeColor: string): CardPalette {
  const borderDark = rgbToHex(hexToRgb(edgeColor))
  const lighting = getCardLighting(borderDark)
  const background = shiftColor(borderDark, 0.18, 1.039, 0.23)
  const backgroundLight = shiftColor(borderDark, -0.1, 1.035, 0.255)
  const backgroundDark = shiftColor(borderDark, -4.3, 0.93, 0.19)
  const headerStripes = generateComputedHeaderStripes(borderDark)
  const bodyStripes = generateBodyStripes(borderDark)
  const isLightSurface = getRelativeLuminance(background) > 0.3

  const borderLightSeed = isLightSurface
    ? shiftColor(borderDark, -12, 0.88, -0.14)
    : mixColors(backgroundLight, '#fff5e3', 0.44)
  const textSeed = isLightSurface
    ? shiftColor(borderDark, -14, 0.72, -0.24)
    : mixColors(backgroundLight, '#fff7eb', 0.48)
  const text = createContrastColor(textSeed, background, isLightSurface ? 5.2 : 4.8, isLightSurface ? 'darken' : 'lighten')
  const borderLight = createContrastColor(
    borderLightSeed,
    background,
    isLightSurface ? 2.6 : 2.2,
    isLightSurface ? 'darken' : 'lighten'
  )
  const innerBorder = mixColors(borderDark, '#8b4513', 0.35)
  const textSecondary = mixColors(text, background, isLightSurface ? 0.18 : 0.22)
  const footerTop = toRgba(hexToRgb(isLightSurface ? '#ffffff' : '#fff8ef'), isLightSurface ? 0.1 : 0.08)
  const footerBottom = toRgba(hexToRgb(borderLight), isLightSurface ? 0.08 : 0.14)
  const footerBorder = toRgba(hexToRgb(borderLight), isLightSurface ? 0.26 : 0.32)
  const imageDivider = toRgba(hexToRgb(borderLight), isLightSurface ? 0.35 : 0.28)
  const sectionBackground = toRgba(hexToRgb(isLightSurface ? '#ffffff' : '#fff7ef'), isLightSurface ? 0.12 : 0.1)
  const bodyTopGlow = toRgba(hexToRgb(backgroundLight), isLightSurface ? 0.34 : 0.22)
  const bodyBottomShadow = toRgba(hexToRgb(borderDark), isLightSurface ? 0.16 : 0.28)
  const bodyRightShadow = toRgba(hexToRgb(lighting.rightEdgeShadow), isLightSurface ? 0.9 : 0.72)
  const bodyLeftGlow = toRgba(hexToRgb(backgroundLight), isLightSurface ? 0.5 : 0.34)

  return {
    ...lighting,
    background,
    backgroundLight,
    backgroundDark,
    borderDark,
    borderLight,
    innerBorder,
    text,
    textSecondary,
    sectionBackground,
    headerStripes,
    bodyStripes,
    footerTop,
    footerBottom,
    footerBorder,
    imageDivider,
    bodyTopGlow,
    bodyBottomShadow,
    bodyRightShadow,
    bodyLeftGlow,
  }
}
