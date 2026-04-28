export const DEFAULT_BUTTON_FILL = '#FDF4E6'
export const DEFAULT_BUTTON_OUTER_BORDER = '#8B4513'
export const DEFAULT_BUTTON_INNER_BORDER = '#D2B48C'
export const DEFAULT_BUTTON_DISABLED_TEXT = '#B0BEC5'
export const DEFAULT_BUTTON_DISABLED_OVERLAY = 'rgba(240, 230, 210, 0.6)'

type RgbColor = {
  r: number
  g: number
  b: number
}

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

const normalizeHexColor = (value: string) => {
  const trimmed = value.trim()
  const expanded = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed

  if (/^[\da-fA-F]{3}$/.test(expanded)) {
    return `#${expanded
      .split('')
      .map((channel) => channel.repeat(2))
      .join('')
      .toUpperCase()}`
  }

  if (/^[\da-fA-F]{6}$/.test(expanded)) {
    return `#${expanded.toUpperCase()}`
  }

  return DEFAULT_BUTTON_OUTER_BORDER
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
    .join('')
    .toUpperCase()}`

const mixColors = (base: string, target: string, weight: number) => {
  const baseRgb = hexToRgb(base)
  const targetRgb = hexToRgb(target)

  return rgbToHex({
    r: baseRgb.r + (targetRgb.r - baseRgb.r) * weight,
    g: baseRgb.g + (targetRgb.g - baseRgb.g) * weight,
    b: baseRgb.b + (targetRgb.b - baseRgb.b) * weight,
  })
}

const channelToLinear = (channel: number) => {
  const normalized = channel / 255
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

export const getContrastRatio = (foreground: string, background: string) => {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)

  const fgLuminance = 0.2126 * channelToLinear(fg.r) + 0.7152 * channelToLinear(fg.g) + 0.0722 * channelToLinear(fg.b)
  const bgLuminance = 0.2126 * channelToLinear(bg.r) + 0.7152 * channelToLinear(bg.g) + 0.0722 * channelToLinear(bg.b)
  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

const darkenUntilContrast = (color: string, background: string, minimumContrast: number) => {
  let best = normalizeHexColor(color)
  let bestContrast = getContrastRatio(best, background)

  for (let weight = 0.08; weight <= 1; weight += 0.08) {
    const candidate = mixColors(color, '#000000', weight)
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

export const deriveInnerBorderColor = (
  outerBorderColor: string,
  fillColor: string = DEFAULT_BUTTON_FILL
) => mixColors(outerBorderColor, fillColor, 0.62)

export const getReadableButtonTextColor = (
  outerBorderColor: string,
  fillColor: string = DEFAULT_BUTTON_FILL
) => darkenUntilContrast(outerBorderColor, fillColor, 4.5)

export const createDefaultButtonPalette = (outerBorderColor?: string) => {
  if (!outerBorderColor) {
    return {
      fill: DEFAULT_BUTTON_FILL,
      outerBorder: DEFAULT_BUTTON_OUTER_BORDER,
      innerBorder: DEFAULT_BUTTON_INNER_BORDER,
      text: {
        normal: '#5D4037',
        hover: '#3E2723',
        active: '#2E1B15',
        disabled: DEFAULT_BUTTON_DISABLED_TEXT,
      },
      disabledOverlay: DEFAULT_BUTTON_DISABLED_OVERLAY,
    }
  }

  const outerBorder = normalizeHexColor(outerBorderColor)
  const normalText = getReadableButtonTextColor(outerBorder, DEFAULT_BUTTON_FILL)
  const hoverText = darkenUntilContrast(mixColors(normalText, '#000000', 0.16), DEFAULT_BUTTON_FILL, 4.5)
  const activeText = darkenUntilContrast(mixColors(normalText, '#000000', 0.3), DEFAULT_BUTTON_FILL, 4.5)

  return {
    fill: DEFAULT_BUTTON_FILL,
    outerBorder,
    innerBorder: deriveInnerBorderColor(outerBorder, DEFAULT_BUTTON_FILL),
    text: {
      normal: normalText,
      hover: hoverText,
      active: activeText,
      disabled: DEFAULT_BUTTON_DISABLED_TEXT,
    },
    disabledOverlay: DEFAULT_BUTTON_DISABLED_OVERLAY,
  }
}
