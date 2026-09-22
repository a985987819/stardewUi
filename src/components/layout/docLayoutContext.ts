import type { TocItem } from './TableOfContents'

/** Data a routed documentation page contributes to the shell-level outline. */
export type DocLayoutOutletContext = {
  setTableOfContents: (items: TocItem[]) => void
}
