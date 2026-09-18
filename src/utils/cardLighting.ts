/**
 * The complete light-and-shade story of a card, all derived from one theme
 * color by walking the HSL wheel:
 *
 * | role                | how it is derived                                   | where it lands |
 * | ------------------- | --------------------------------------------------- | -------------- |
 * | `border`            | the theme color itself                              | 6px outer frame |
 * | `borderHighlight`   | hue pulled in, saturation dropped, lightness down   | top/upper bevel |
 * | `borderInnerShadow` | hue pulled in, saturation kept, lightness down      | lower divider  |
 * | `borderOuterGlow`   | hue pulled in, saturation halved, lightness up      | right edge gleam |
 * | `outerShadow`       | theme color crushed dark + desaturated, then alpha  | drop shadow    |
 * | `innerGlow`         | theme hue lifted to a pale tint, then alpha         | inner top light |
 *
 * Light tints and dark shades are always computed from the *same* hue as the
 * input, so a blue theme produces a cold shadow and a pale blue inner light
 * instead of a neutral grey one.
 */
export interface CardLighting {
  /** 边框：主题色本体，卡片最外层 6px 描边。 */
  border: string
  /** 边框高光：受光侧（上沿与内框上边）的提亮色。 */
  borderHighlight: string
  /** 边框内阴影：背光侧（下沿与内框下边）的压暗色。 */
  borderInnerShadow: string
  /** 边框外高光：右侧受光边缘的亮边。 */
  borderOuterGlow: string
  /** 外阴影：卡片投在页面上的投影色（已含 alpha）。 */
  outerShadow: string
  /** 外阴影（悬停抬升时使用）。 */
  outerShadowHover: string
  /** 外阴影（按下沉时使用）。 */
  outerShadowActive: string
  /** 内高光：卡片内部表面的顶部提亮（已含 alpha）。 */
  innerGlow: string
  /** 标题文字的像素投影色（已含 alpha）。 */
  titleTextShadow: string
  /** 顶部标题区木纹的 4 段条纹。 */
  headerStripes: [string, string, string, string]
  /** @deprecated 旧命名，等价于 `borderOuterGlow`。 */
  rightEdgeShadow: string
  /** @deprecated 旧命名，等价于 `borderHighlight`。 */
  topHighlight: string
  /** @deprecated 旧命名，等价于 `borderInnerShadow`。 */
  dividerShadow: string
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

/**
 * A complete pixel-card lighting model derived from the visible body surface.
 * `background` is the supplied subject colour; every other property maps to a
 * specific rendered layer in `Card.module.scss` (frame, stripe, inset light,
 * right-edge occlusion, footer, and typography).
 */
export type CardSurfaceLighting = CardPalette

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
  let hue: number

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

const SURFACE_FROM_EDGE_SHIFT = {
  hue: 0.18,
  saturation: 1.039,
  lightness: 0.23,
} as const

/**
 * Reconstructs the darker framing seed that sits beneath a body surface.
 * The inverse is intentional: it preserves the existing Card hierarchy while
 * making the public API start from the colour users actually see most.
 */
function deriveFrameSeedFromSurface(surfaceColor: string) {
  const surface = rgbToHsl(hexToRgb(surfaceColor))
  // Bright card surfaces can use the original fixed 0.23 lightness gap.
  // Applying that gap to a naturally dark custom swatch would clamp its frame
  // to pure black and erase its hue, so preserve at least 55% of its lightness.
  const frameLightness = Math.max(
    surface.l - SURFACE_FROM_EDGE_SHIFT.lightness,
    surface.l * 0.55
  )

  return rgbToHex(
    hslToRgb({
      h: surface.h - SURFACE_FROM_EDGE_SHIFT.hue,
      s: clamp(surface.s / SURFACE_FROM_EDGE_SHIFT.saturation),
      l: clamp(frameLightness),
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

/** Fallback theme color, matching the classic Stardew wood/gold card. */
export const CARD_DEFAULT_THEME_COLOR = '#fa9305'

/**
 * Accepts `#rgb`, `#rrggbb` or the same without the leading `#`, and falls back
 * to the default theme color instead of throwing — a bad value typed into a
 * theme input should never blank out the page.
 */
export function resolveCardThemeColor(themeColor?: string): string {
  if (!themeColor) {
    return CARD_DEFAULT_THEME_COLOR
  }

  try {
    return rgbToHex(hexToRgb(themeColor))
  } catch {
    return CARD_DEFAULT_THEME_COLOR
  }
}

/**
 * Default *body* colour of `<StarCard>`. It is the surface that
 * `SURFACE_FROM_EDGE_SHIFT` derives from `CARD_DEFAULT_THEME_COLOR`, so the
 * edge-first and surface-first entry points agree on the default card.
 */
export const CARD_DEFAULT_SURFACE_COLOR = '#ffc675'

/**
 * Accepts `#rgb`, `#rrggbb` or the same without the leading `#`, and falls back
 * to the default card surface instead of throwing — a bad value typed into a
 * theme input should never blank out the page.
 */
export function resolveCardSurfaceColor(surfaceColor?: string): string {
  if (!surfaceColor || !/^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(surfaceColor.trim())) {
    return CARD_DEFAULT_SURFACE_COLOR
  }

  try {
    return rgbToHex(hexToRgb(surfaceColor))
  } catch {
    return CARD_DEFAULT_SURFACE_COLOR
  }
}

/**
 * Theme color -> lighting helper. Everything the card needs to fake a light
 * source is computed here from the theme color's HSL triplet, so callers only
 * ever pass one color in.
 */
export function getCardLighting(themeColor: string): CardLighting {
  const border = resolveCardThemeColor(themeColor)
  const titleShadowColor = shiftColor(border, -5, 0.92, -0.18)

  const borderHighlight = shiftColor(border, -6, 0.75, -0.15)
  const borderInnerShadow = shiftColor(border, -6, 0.9, -0.08)
  const borderOuterGlow = shiftColor(border, -9, 0.58, 0.118)

  // The shadow keeps the theme hue but is dimmed and drained of saturation, so
  // it reads as "this card's own shadow" rather than a generic grey smudge. The
  // inner glow does the mirror trick: same hue, lifted to a pale tint.
  // Lightness is shifted rather than mixed towards pure black, so dark themes
  // keep a trace of their hue instead of collapsing to #000.
  const shadowSeed = shiftColor(border, -6, 0.72, -0.16)
  const glowSeed = shiftColor(border, 4, 0.34, 0.42)

  return {
    border,
    borderHighlight,
    borderInnerShadow,
    borderOuterGlow,
    outerShadow: toRgba(hexToRgb(shadowSeed), 0.3),
    outerShadowHover: toRgba(hexToRgb(shadowSeed), 0.26),
    outerShadowActive: toRgba(hexToRgb(shadowSeed), 0.2),
    innerGlow: toRgba(hexToRgb(glowSeed), 0.22),
    titleTextShadow: toRgba(hexToRgb(titleShadowColor), 0.28),
    headerStripes: generateHeaderStripes(border),
    rightEdgeShadow: borderOuterGlow,
    topHighlight: borderHighlight,
    dividerShadow: borderInnerShadow,
  }
}

/**
 * Edge colour -> full palette.
 *
 * Internal, and deliberately the **only** derivation path: `createCardPalette`
 * (edge colours) and `deriveCardLightingFromSurface` (body colours) both funnel
 * through here, so the two public entry points cannot drift apart.
 */
function deriveCardPaletteFromFrameSeed(edgeColor: string): CardPalette {
  // `resolveCardThemeColor` keeps a bad swatch on the default wood theme rather
  // than throwing, which is what the public palette has always promised.
  const borderDark = resolveCardThemeColor(edgeColor)
  const lighting = getCardLighting(borderDark)
  const background = shiftColor(
    borderDark,
    SURFACE_FROM_EDGE_SHIFT.hue,
    SURFACE_FROM_EDGE_SHIFT.saturation,
    SURFACE_FROM_EDGE_SHIFT.lightness
  )
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
  // The inner frame is the occluding edge of the card, rather than another
  // highlight. Keep it on the source hue and move it decisively toward shade:
  // light/pastel themes otherwise end up with two pale frames and lose the
  // top-left-light / bottom-right-shadow reading.
  const innerBorder = mixColors(borderDark, '#000000', 0.3)
  const textSecondary = mixColors(text, background, isLightSurface ? 0.18 : 0.22)
  const footerTop = toRgba(hexToRgb(isLightSurface ? '#ffffff' : '#fff8ef'), isLightSurface ? 0.1 : 0.08)
  const footerBottom = toRgba(hexToRgb(borderLight), isLightSurface ? 0.08 : 0.14)
  const footerBorder = toRgba(hexToRgb(borderLight), isLightSurface ? 0.26 : 0.32)
  const imageDivider = toRgba(hexToRgb(borderLight), isLightSurface ? 0.35 : 0.28)
  const sectionBackground = toRgba(hexToRgb(isLightSurface ? '#ffffff' : '#fff7ef'), isLightSurface ? 0.12 : 0.1)
  const bodyTopGlow = toRgba(hexToRgb(backgroundLight), isLightSurface ? 0.34 : 0.22)
  const bodyBottomShadow = toRgba(hexToRgb(borderDark), isLightSurface ? 0.16 : 0.28)
  const bodyRightShadow = toRgba(hexToRgb(lighting.borderOuterGlow), isLightSurface ? 0.9 : 0.72)
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

/**
 * Derive all Card lighting from its main visible surface colour.
 *
 * This is the public, reusable API for any UI that needs the same Stardew-like
 * light direction: top and left receive warm light, the right and bottom are
 * occluded, and text/frame values retain readable contrast. The result can be
 * consumed as CSS custom properties or by a Canvas renderer.
 */
export function deriveCardLightingFromSurface(surfaceColor: string): CardSurfaceLighting {
  const background = resolveCardSurfaceColor(surfaceColor)
  const palette = deriveCardPaletteFromFrameSeed(deriveFrameSeedFromSurface(background))

  // Preserve the caller's exact body swatch. It is the semantic anchor for
  // all derived layers, so rounding through HSL must never visibly drift it.
  return {
    ...palette,
    background,
  }
}

/**
 * Full CSS-variable palette for `<StarCard color={theme}>`: the lighting map
 * above plus every surface, text and stripe the card paints.
 *
 * Here `color` is the card's *edge/frame* colour (see `resolveCardThemeColor`
 * for the accepted shapes). Reach for `deriveCardLightingFromSurface` when you
 * are starting from the body swatch the user actually sees.
 */
export function createCardPalette(themeColor?: string): CardPalette {
  return deriveCardPaletteFromFrameSeed(resolveCardThemeColor(themeColor))
}
