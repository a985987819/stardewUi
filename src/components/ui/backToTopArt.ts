/**
 * Pixel map of the paper plane that `StarBackToTop` flies back up the page.
 *
 * One character per art pixel on a `21 x 21` grid. The plane is drawn with
 * staircase edges only — no curves anywhere — so the whole artwork is defined by
 * this table and nothing else; shrinking or enlarging it is a matter of the
 * single `BACK_TO_TOP_ART_PIXEL` factor, never of re-drawing the outline.
 *
 * The three inks are *layers* of one drawing rather than a palette:
 *
 * | ink | colour    | role                                                  |
 * | --- | --------- | ----------------------------------------------------- |
 * | `S` | `#5899f1` | outline of both wings, exactly one art pixel thick     |
 * | `F` | `#b2ccfa` | wing fill                                              |
 * | `M` | `#308be2` | centre ridge welding the two wings together            |
 *
 * Both halves are right triangles drawn as a staircase: a vertical inner edge
 * against the centre ridge, a horizontal tail edge, and a stepped hypotenuse
 * running from the outer tail corner up to the nose. The plane points **up** —
 * it is on its way back to the top of the page, so the single-pixel nose sits on
 * the first row and the widest row is the tail. The V-shaped notch there is where
 * the two wings meet, and it is left transparent so the button has no plate
 * behind it: the plane is the content.
 */
export const BACK_TO_TOP_ART_INK = {
  S: '#5899f1',
  F: '#b2ccfa',
  M: '#308be2',
} as const

export type BackToTopInk = keyof typeof BACK_TO_TOP_ART_INK

/**
 * `21 x 21` art pixels. `.` is transparent; every row reads the same both ways.
 *
 * Read top to bottom: the nose starts as a single pixel, the silhouette widens
 * one step per row down to the tail, and the ridge runs from just below the nose
 * to the notch the wings leave between them.
 */
export const BACK_TO_TOP_ART: readonly string[] = [
  '..........S..........',
  '.........SSS.........',
  '.........SSS.........',
  '........SSMSS........',
  '.......SFSMSFS.......',
  '.......SFSMSFS.......',
  '......SFFSMSFFS......',
  '......SFFSMSFFS......',
  '.....SFFFSMSFFFS.....',
  '.....SFFFSMSFFFS.....',
  '....SFFFFSMSFFFFS....',
  '....SFFFFSMSFFFFS....',
  '...SFFFFFSMSFFFFFS...',
  '...SFFFFFSMSFFFFFS...',
  '..SFFFFFFSMSFFFFFFS..',
  '..SFFFFFFSMSFFFFFFS..',
  '..SFFFFFFSSSFFFFFFS..',
  '.SFFFFFFFS.SFFFFFFFS.',
  'SFFFFFFFFS.SFFFFFFFFS',
  'SFFFFFFFS...SFFFFFFFS',
  'SSSSSSSS.....SSSSSSSS',
]

/** Art pixels per side of the map. */
export const BACK_TO_TOP_ART_SIZE = 21

/**
 * CSS pixels per art pixel. Three is not a free choice: it is exactly what turns
 * the one-art-pixel outline into the 3px stroke the design calls for, so the
 * artwork renders at `63 x 63` and **no prop scales it** — scaling would resize
 * the stroke along with the fill and break that promise.
 */
export const BACK_TO_TOP_ART_PIXEL = 3

/** Rendered edge length of the artwork in CSS px (`21 * 3`). */
export const BACK_TO_TOP_VIEW_SIZE = BACK_TO_TOP_ART_SIZE * BACK_TO_TOP_ART_PIXEL

/**
 * SVG `d` for one ink. Horizontal runs are merged into a single `h<n>` subpath
 * instead of emitting one square per cell: shorter paths, and no hairline seams
 * between cells that happen to touch.
 */
const buildInkPath = (rows: readonly string[], ink: BackToTopInk): string => {
  const subpaths: string[] = []

  rows.forEach((row, y) => {
    let x = 0

    while (x < row.length) {
      if (row[x] !== ink) {
        x += 1
        continue
      }

      let end = x
      while (end + 1 < row.length && row[end + 1] === ink) {
        end += 1
      }

      subpaths.push(`M${x} ${y}h${end - x + 1}v1H${x}z`)
      x = end + 1
    }
  })

  return subpaths.join('')
}

/** One `d` per ink, computed once at module load. */
export const BACK_TO_TOP_ART_PATHS: Record<BackToTopInk, string> = {
  S: buildInkPath(BACK_TO_TOP_ART, 'S'),
  F: buildInkPath(BACK_TO_TOP_ART, 'F'),
  M: buildInkPath(BACK_TO_TOP_ART, 'M'),
}
