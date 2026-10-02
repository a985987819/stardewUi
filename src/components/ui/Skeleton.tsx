// Batch: 2026-09-27 P0 batch — internal marker for tooling only; no runtime effect.
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { classNames } from '../../utils/classNames'
import { createSteppedRectClipPath } from '../../utils/pixelCorners'
import styles from './Skeleton.module.scss'

export interface StarSkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Renders children instead of the placeholder when false. */
  loading?: boolean
  /** Number of paragraph placeholder rows. */
  rows?: number
  /** Shows the bold heading row above the paragraphs. */
  title?: boolean
  /** Shows a square avatar block on the left. */
  avatar?: boolean
  /** Shape of the avatar block when `avatar` is on. */
  avatarShape?: 'circle' | 'square'
  /** Plays the stripe-marching animation; turn off for a calm placeholder. */
  active?: boolean
  /** Real content swapped in when loading turns false. */
  children?: ReactNode
}

/**
 * Corner staircase: the avatar block gets the standard 2px steps; the thin
 * rows use 2 levels × 1px so the chamfer stays readable at 10px height.
 */
const SKELETON_CLIP_AVATAR = createSteppedRectClipPath(2, 2)
const SKELETON_CLIP_ROW = createSteppedRectClipPath(2, 1)

/** Row widths cycle through this rhythm; the last row always shortens. */
const ROW_WIDTH_CYCLE = [100, 92, 96, 78]

type SkeletonCssVariables = CSSProperties & {
  '--star-skeleton-clip-avatar': string
  '--star-skeleton-clip-row': string
  '--star-skeleton-base'?: string
  '--star-skeleton-stripe'?: string
  '--star-skeleton-edge-dark'?: string
  '--star-skeleton-edge-light'?: string
}

interface SkeletonPalette {
  base: string
  stripe: string
  edgeDark: string
  edgeLight: string
}

/** Extracts the `rgb()/rgba()` colour channels (alpha defaults to 1), or null. */
const parseRGB = (value: string): [number, number, number, number] | null => {
  const match = value.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\)/)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])]
}

const rgbToHsl = ([r, g, b]: [number, number, number, number]): [number, number, number] => {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2

  if (max === min) return [0, 0, lightness]

  const range = max - min
  const saturation = lightness > 0.5 ? range / (2 - max - min) : range / (max + min)

  let hue: number
  if (max === red) hue = ((green - blue) / range) % 6
  else if (max === green) hue = (blue - red) / range + 2
  else hue = (red - green) / range + 4
  hue = (hue * 60 + 360) % 360

  return [hue, saturation, lightness]
}

const hslCss = (hue: number, saturation: number, lightness: number): string =>
  `hsl(${hue.toFixed(1)} ${(saturation * 100).toFixed(1)}% ${(lightness * 100).toFixed(1)}%)`

/**
 * Derives a low-key placeholder palette from the surface the skeleton sits on:
 * the background's hue is kept but its saturation is heavily toned down (×0.35,
 * capped at 25%), and the lightness nudges away from the background by a hair
 * so the placeholder reads without shouting. Falls back to null when the
 * surroundings are transparent, leaving the stylesheet's parchment defaults.
 */
const deriveSkeletonPalette = (backgroundColor: string): SkeletonPalette | null => {
  const channels = parseRGB(backgroundColor)
  if (!channels) return null

  const [hue, saturation, lightness] = rgbToHsl(channels)
  const calmSaturation = Math.min(saturation * 0.35, 0.25)

  // On light surfaces sit slightly darker; on dark ones, slightly lighter.
  const baseLightness =
    lightness >= 0.5
      ? Math.max(0.25, Math.min(lightness - 0.06, 0.86))
      : Math.min(0.86, Math.max(lightness + 0.08, 0.25))
  const stripeLightness = Math.min(baseLightness + 0.07, 0.92)

  return {
    base: hslCss(hue, calmSaturation, baseLightness),
    stripe: hslCss(hue, calmSaturation, stripeLightness),
    edgeDark: hslCss(hue, calmSaturation, Math.max(baseLightness - 0.09, 0.12)),
    edgeLight: hslCss(hue, calmSaturation, Math.min(baseLightness + 0.13, 0.95)),
  }
}

/**
 * Walks up from the skeleton to the first ancestor with a non-transparent
 * background and derives the placeholder palette from it. Runs in a layout
 * effect so the recalculated colours land before the first paint.
 */
const useAmbientSkeletonPalette = () => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [palette, setPalette] = useState<SkeletonPalette | null>(null)

  useLayoutEffect(() => {
    const element = rootRef.current
    if (!element || typeof getComputedStyle !== 'function') return

    let node: HTMLElement | null = element.parentElement
    while (node) {
      const background = getComputedStyle(node).backgroundColor
      const channels = parseRGB(background)
      // `transparent` and `rgba(..., 0)` both let the page behind show, so
      // neither counts as the surface the skeleton lives on.
      if (channels && channels[3] > 0.05) {
        const derived = deriveSkeletonPalette(background)
        if (derived) setPalette(derived)
        return
      }
      node = node.parentElement
    }
  }, [])

  return { rootRef, palette }
}

/**
 * Skeleton — pixel-striped placeholders that prop the page up like mine
 * supports before content arrives: an optional avatar block, an optional
 * bold title row, and a few paragraph rows whose marching stripes step
 * forward in pixel jumps until loading turns false and children take over.
 *
 * By default the stripe material is derived from the surrounding background
 * colour (hue kept, saturation toned down hard), so the placeholder melts
 * into whatever surface it is laid on instead of fighting it.
 */
function StarSkeleton({
  loading = true,
  rows = 3,
  title = true,
  avatar = false,
  avatarShape = 'square',
  active = true,
  children,
  className,
  style,
  ...rest
}: StarSkeletonProps) {
  const { rootRef, palette } = useAmbientSkeletonPalette()

  if (!loading) return <>{children}</>

  const rowWidths = Array.from({ length: rows }, (_, index) =>
    index === rows - 1 ? 60 : ROW_WIDTH_CYCLE[index % ROW_WIDTH_CYCLE.length],
  )

  const cssVariables: SkeletonCssVariables = {
    '--star-skeleton-clip-avatar': SKELETON_CLIP_AVATAR,
    '--star-skeleton-clip-row': SKELETON_CLIP_ROW,
    ...(palette
      ? {
          '--star-skeleton-base': palette.base,
          '--star-skeleton-stripe': palette.stripe,
          '--star-skeleton-edge-dark': palette.edgeDark,
          '--star-skeleton-edge-light': palette.edgeLight,
        }
      : null),
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      aria-busy="true"
      className={classNames(
        styles['star-skeleton'],
        !active && styles['star-skeleton--static'],
        className,
      )}
      style={{ ...cssVariables, ...style }}
    >
      {avatar ? (
        <span
          className={classNames(
            styles['star-skeleton__avatar'],
            avatarShape === 'circle' && styles['star-skeleton__avatar--circle'],
          )}
          aria-hidden
        />
      ) : null}
      <div className={styles['star-skeleton__body']}>
        {title ? (
          <span
            className={classNames(styles['star-skeleton__row'], styles['star-skeleton__row--title'])}
            style={{ width: '40%' }}
            aria-hidden
          />
        ) : null}
        {rowWidths.map((width, index) => (
          <span
            key={index}
            className={styles['star-skeleton__row']}
            style={{ width: `${width}%` }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  )
}

export { StarSkeleton }
export default StarSkeleton
