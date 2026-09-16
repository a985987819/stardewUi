import { type CSSProperties } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { I18nProvider } from './i18n'
import { createGapFrameClipPath } from './utils/pixelCorners'
import styles from './styles/global.module.scss'

/**
 * Thickness of the app chrome's gap frames (header, sidebar, page board, TOC).
 * Must match the `$doc-frame-width` used by the layout modules — they draw the
 * edges and corner blocks, this number generates the clip that cuts the gap.
 */
export const DOC_FRAME_WIDTH = 4

/**
 * The whole app chrome shares the component corner language, so the page reads
 * as one pixel-art surface instead of a flat web layout with pixel widgets
 * dropped on top. Exposed as a single CSS variable on the app root so every
 * layout module can use it without importing TS.
 */
const appStyle = {
  '--doc-gap-clip': createGapFrameClipPath(DOC_FRAME_WIDTH),
} as CSSProperties

function StarApp() {
  return (
    <div className={styles.starApp} data-star-app="true" style={appStyle}>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </div>
  )
}

export default StarApp
