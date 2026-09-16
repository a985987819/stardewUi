/**
 * Theme tokens for the wood panel used by `StarPopup`.
 *
 * Split out of the canvas renderer for the same reason `defaultButtonTheme` is
 * split from `defaultButtonCanvas`: the canvas needs raw colors, while the
 * surrounding markup needs the same colors as CSS custom properties.
 */
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

export const WOOD_PANEL_THEME: WoodPanelTheme = {
  border: '#6b4423',
  frame: '#c19a63',
  surface: '#e3c491',
  grain: ['#dfbe88', '#dbc089', '#d7b880', '#d2b177'],
  topHighlight: 'rgba(255, 250, 232, 0.42)',
  bottomShade: 'rgba(107, 68, 35, 0.16)',
  headerGrain: ['#d9b276', '#d2a96c', '#c9a063', '#c0995d'],
  divider: 'rgba(107, 68, 35, 0.22)',
  footerTop: 'rgba(255, 250, 232, 0.16)',
  footerBottom: 'rgba(107, 68, 35, 0.08)',
  footerBorder: 'rgba(107, 68, 35, 0.2)',
  text: '#3f2510',
  textSecondary: '#5a3a1c',
  titleShadow: 'rgba(107, 68, 35, 0.28)',
}
