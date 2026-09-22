/**
 * The palette used by canvas-rendered components and React inline styles.
 *
 * CSS components consume the matching custom properties in
 * `global.module.scss`. Keep new named colours here instead of introducing
 * one-off hex values in a component, so the visual system has one clear home.
 */
export const STAR_COLORS = {
  ink: {
    strongest: '#35251E',
    strong: '#4A3728',
    muted: '#705C49',
    onColor: '#FFF9ED',
  },
  button: {
    default: {
      fill: '#F8E6B0',
      hoverFill: '#FFF1C9',
      outerBorder: '#796046',
      innerBorder: '#E8CD8D',
      disabledText: '#9D9688',
      disabledOverlay: 'rgba(255, 249, 237, 0.58)',
    },
    primary: { fill: '#5E9C7A', border: '#315E4B', text: '#FFF9ED' },
    secondary: { fill: '#E8B95B', border: '#93652F', text: '#3F2B1A' },
    info: { fill: '#67B8C8', border: '#2F7380', text: '#163F48' },
    success: { fill: '#7EAD51', border: '#466D32', text: '#FFF9ED' },
    warning: { fill: '#E59D48', border: '#8A5922', text: '#3F2B1A' },
    danger: { fill: '#D96B57', border: '#893C34', text: '#FFF7F0' },
    disabled: { fill: '#CEC9BC', text: '#817B70' },
  },
  season: {
    spring: { fill: '#E68DA4', pressedFill: '#B95E76', disabledFill: '#CDB2B8', border: '#754657', text: '#FFF8EE' },
    summer: { fill: '#78AD55', pressedFill: '#4E7B3A', disabledFill: '#B4C0A6', border: '#4A5C32', text: '#FFF9E8' },
    autumn: { fill: '#D77B50', pressedFill: '#A94F38', disabledFill: '#C8B1A2', border: '#71402B', text: '#FFF7E7' },
    winter: { fill: '#78AFC4', pressedFill: '#527A96', disabledFill: '#B4C7CD', border: '#405E70', text: '#F7FBFA' },
  },
  canvas: {
    buttonInnerShadow: 'rgba(53, 37, 30, 0.24)',
    buttonTopHighlight: 'rgba(255, 255, 255, 0.32)',
    seasonalHoverOverlay: 'rgba(255, 255, 255, 0.08)',
    seasonalDisabledOverlay: 'rgba(255, 249, 237, 0.38)',
  },
} as const

export const BUTTON_VARIANT_COLORS = {
  default: { bg: STAR_COLORS.button.default.fill, text: STAR_COLORS.ink.strongest },
  primary: { bg: STAR_COLORS.button.primary.fill, text: STAR_COLORS.button.primary.text },
  secondary: { bg: STAR_COLORS.button.secondary.fill, text: STAR_COLORS.button.secondary.text },
  info: { bg: STAR_COLORS.button.info.fill, text: STAR_COLORS.button.info.text },
  success: { bg: STAR_COLORS.button.success.fill, text: STAR_COLORS.button.success.text },
  warning: { bg: STAR_COLORS.button.warning.fill, text: STAR_COLORS.button.warning.text },
  danger: { bg: STAR_COLORS.button.danger.fill, text: STAR_COLORS.button.danger.text },
  disabled: { bg: STAR_COLORS.button.disabled.fill, text: STAR_COLORS.button.disabled.text },
  concise: { bg: STAR_COLORS.button.default.fill, text: STAR_COLORS.ink.strongest },
} as const
