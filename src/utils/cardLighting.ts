export interface CardLighting {
  rightEdgeShadow: string
  topHighlight: string
  dividerShadow: string
  titleTextShadow: string
  headerStripes: [string, string, string, string]
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

function generateHeaderStripes(baseColor: string): [string, string, string, string] {
  return [
    shiftColor(baseColor, 0, 1, 0.06),
    shiftColor(baseColor, 0, 1, 0.02),
    shiftColor(baseColor, 0, 1, -0.02),
    shiftColor(baseColor, 0, 1, -0.06),
  ]
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
