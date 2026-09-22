import './styles/global.module.scss'
import './styles/motion.scss'

export { BUTTON_VARIANT_COLORS, STAR_COLORS } from './styles/colorTokens'
export * from './components/ui'
export * from './hooks'
export * from './types'
export { classNames } from './utils/classNames'
export {
  isFunction,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isNil,
  isBrowser,
  noop,
  identity,
  omit,
  pick,
  debounce,
  throttle,
  copyToClipboard,
} from './utils/helpers'
export {
  createPixelCircleClip,
  createPixelRoundedRectClip,
  createPixelPillClip,
  createPixelCornerClip,
  type PixelClipPath,
  type PixelCornerSize,
} from './utils/pixelShape'
export {
  calculateNineSliceLayout,
  drawNineSlice,
  type NineSliceInsets,
  type NineSliceDrawOptions,
  type NineSliceLayout,
} from './utils/nineSliceCanvas'
export {
  resolveAssetPath,
} from './utils/githubPages'
export {
  deriveCardLightingFromSurface,
  createCardPalette,
  getCardLighting,
  type CardLighting,
  type CardPalette,
  type CardSurfaceLighting,
} from './utils/cardLighting'
export {
  deriveProgressPalette,
  DEFAULT_PROGRESS_COLOR,
  DEFAULT_PROGRESS_BORDER,
  DEFAULT_PROGRESS_SHADOW,
  DEFAULT_PROGRESS_HIGHLIGHT,
  type ProgressPalette,
} from './utils/progressPalette'
// The `StarGapBorder` component is gone, but its corner generator is kept: it is
// the reference implementation of the stepped "gap border" corner, and
// `pixelCorners` / the canvas painters still describe the house style in its terms.
export {
  createGapBorderCorners,
  type GapBorderCornerData,
  type CreateGapBorderCornersOptions,
} from './utils/gapBorderCorners'
