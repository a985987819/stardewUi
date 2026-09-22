import { describe, expect, it } from 'vitest'
import {
  BACK_TO_TOP_ART,
  BACK_TO_TOP_ART_INK,
  BACK_TO_TOP_ART_PATHS,
  BACK_TO_TOP_ART_PIXEL,
  BACK_TO_TOP_ART_SIZE,
  BACK_TO_TOP_VIEW_SIZE,
  type BackToTopInk,
} from './backToTopArt'

const INKS = Object.keys(BACK_TO_TOP_ART_INK) as BackToTopInk[]

/** Reads a generated `d` back into the runs it claims to paint. */
const readRuns = (d: string) =>
  [...d.matchAll(/M(\d+) (\d+)h(\d+)v1H(\d+)z/g)].map(([, x, y, width, closeX]) => ({
    x: Number(x),
    y: Number(y),
    width: Number(width),
    closeX: Number(closeX),
  }))

const opaqueColumns = (row: string) =>
  [...row].reduce<number[]>((columns, cell, index) => (cell === '.' ? columns : [...columns, index]), [])

describe('backToTopArt', () => {
  it('is a square pixel map drawn with the documented alphabet', () => {
    expect(BACK_TO_TOP_ART).toHaveLength(BACK_TO_TOP_ART_SIZE)

    for (const row of BACK_TO_TOP_ART) {
      expect(row).toHaveLength(BACK_TO_TOP_ART_SIZE)
      expect(row).toMatch(/^[SFM.]+$/)
    }
  })

  it('mirrors left and right, because both wings are the same triangle', () => {
    for (const row of BACK_TO_TOP_ART) {
      expect([...row].reverse().join('')).toBe(row)
    }
  })

  it('runs the centre ridge from the nose down to the notch between the wing tips', () => {
    const centre = BACK_TO_TOP_ART.map((row) => row[Math.floor(BACK_TO_TOP_ART_SIZE / 2)])

    // The nose: a single art pixel is already the whole silhouette, so the outline
    // closes over the tip there and the two rows below it are pure stroke.
    expect(centre.slice(0, 3).join('')).toBe('SSS')
    // The ridge welding the two wings together, then the outline that closes the
    // wings off, then the V-shaped notch the wing tips leave between them.
    expect(centre.slice(3, 16).join('')).toBe('MMMMMMMMMMMMM')
    expect(centre.slice(16).join('')).toBe('S....')
  })

  it('flies nose up: one pixel at the top, the widest row down at the wing tips', () => {
    const widths = BACK_TO_TOP_ART.map((row) => opaqueColumns(row).length)
    const widest = Math.max(...widths)

    expect(widths[0]).toBe(1)
    // The wing tips are the widest part, and they sit in the bottom half — that is
    // what makes the drawing read as heading up the page rather than down it.
    expect(widths.indexOf(widest)).toBeGreaterThan(BACK_TO_TOP_ART_SIZE / 2)
  })

  it('wraps the silhouette in the outline ink', () => {
    for (const row of BACK_TO_TOP_ART) {
      const columns = opaqueColumns(row)

      expect(columns.length).toBeGreaterThan(0)
      expect(row[columns[0]]).toBe('S')
      expect(row[columns[columns.length - 1]]).toBe('S')
    }

    // The tail edge is one solid outline bar — that is what makes the stroke read
    // as a 3px stroke instead of a rim light.
    expect(BACK_TO_TOP_ART[BACK_TO_TOP_ART_SIZE - 1]).toBe('SSSSSSSS.....SSSSSSSS')
  })

  it('spends exactly one art pixel on the outline, so the stroke lands at 3 CSS px', () => {
    expect(BACK_TO_TOP_ART_PIXEL).toBe(3)
    expect(BACK_TO_TOP_VIEW_SIZE).toBe(BACK_TO_TOP_ART_SIZE * BACK_TO_TOP_ART_PIXEL)
    expect(BACK_TO_TOP_VIEW_SIZE).toBe(63)
  })

  it('paints every ink, and the three paths reproduce the map exactly', () => {
    const expected = new Map<string, BackToTopInk>()

    BACK_TO_TOP_ART.forEach((row, y) => {
      ;[...row].forEach((cell, x) => {
        if (cell !== '.') expected.set(`${x},${y}`, cell as BackToTopInk)
      })
    })

    const painted = new Map<string, BackToTopInk>()

    for (const ink of INKS) {
      const cells = new Set<string>()

      for (const run of readRuns(BACK_TO_TOP_ART_PATHS[ink])) {
        // The trailing `H` must land back where the run started, otherwise the
        // subpath is a wedge instead of a one-cell-tall bar.
        expect(run.closeX).toBe(run.x)

        for (let offset = 0; offset < run.width; offset += 1) {
          cells.add(`${run.x + offset},${run.y}`)
        }
      }

      expect(cells.size).toBeGreaterThan(0)

      for (const key of cells) {
        // No ink may paint over another: the layers tile the drawing.
        expect(painted.has(key)).toBe(false)
        painted.set(key, ink)
      }
    }

    expect(painted).toEqual(expected)
  })
})
