/**
 * Theme tokens for the panel drawn by `StarCanvasBubble` with `texture="wood"`.
 *
 * Split out of the canvas renderer for the same reason `defaultButtonTheme` is
 * split from `defaultButtonCanvas`: the canvas needs raw colors, while the
 * surrounding markup needs the same colors as CSS custom properties.
 *
 * The palette is *derived from the card palette* rather than hand-tuned, so the
 * popup and the card always read as the same material — one theme color in, the
 * whole light-and-shade story out.
 */
import { CARD_DEFAULT_THEME_COLOR, createCardPalette } from './cardLighting'

export interface WoodPanelTheme {
  /** Outer frame ring drawn by the canvas. */
  border: string
  /** Inner bevel ring, one step inside the frame. */
  frame: string
  /** Base surface fill. */
  surface: string
  /** Horizontal grain bands tiled across the surface. */
  grain: [string, string, string, string]
  topHighlight: string
  bottomShade: string
  /** Stripe colors for the header band, slightly stronger than the body grain. */
  headerGrain: [string, string, string, string]
  divider: string
  footerTop: string
  footerBottom: string
  footerBorder: string
  text: string
  textSecondary: string
  titleShadow: string
}

/**
 * Card theme color -> panel theme. Every entry mirrors the matching card token:
 * `border` is the card's 6px frame, `frame` its light inner line, `surface` its
 * fill, `grain`/`headerGrain` its body/header stripes.
 */
export function createWoodPanelTheme(themeColor: string = CARD_DEFAULT_THEME_COLOR): WoodPanelTheme {
  const palette = createCardPalette(themeColor)
  const [bodyStripe1, bodyStripe3, bodyStripe5, bodyStripe7] = palette.bodyStripes

  return {
    border: palette.borderDark,
    frame: palette.borderLight,
    surface: palette.background,
    grain: [bodyStripe1, bodyStripe3, bodyStripe5, bodyStripe7],
    topHighlight: palette.bodyTopGlow,
    bottomShade: palette.bodyBottomShadow,
    headerGrain: [
      palette.headerStripes[0],
      palette.headerStripes[1],
      palette.headerStripes[2],
      palette.headerStripes[3],
    ],
    divider: palette.borderInnerShadow,
    footerTop: palette.footerTop,
    footerBottom: palette.footerBottom,
    footerBorder: palette.footerBorder,
    text: palette.text,
    textSecondary: palette.textSecondary,
    titleShadow: palette.titleTextShadow,
  }
}

/** Default panel theme — the same look as the default card. */
export const WOOD_PANEL_THEME: WoodPanelTheme = createWoodPanelTheme()
