import { useEffect, useMemo, useState } from 'react'
import StarLoading from '../ui/Loading'
import StarProgress from '../ui/Progress'
import { useI18n } from '../../i18n'
import { resolveAssetPath } from '../../utils/githubPages'
import styles from './StartupLoader.module.scss'

interface StartupLoaderProps {
  onComplete: () => void
}

// Eager URL imports make Vite include every local illustration, sprite, button
// skin, and font in the initial loading ledger. The page never waits on a
// decorative network request it does not know about.
const assetModules = import.meta.glob('../../assets/**/*.{png,svg,ttf}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const LOCAL_ASSET_URLS = Object.values(assetModules).filter((asset): asset is string => typeof asset === 'string')
const PUBLIC_ASSET_URLS = [resolveAssetPath('/titleBg.png'), resolveAssetPath('/icons.svg')]
const MIN_LOADING_MS = 720

const preloadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => resolve()
    image.src = src
  })

function StarStartupLoader({ onComplete }: StartupLoaderProps) {
  // The loader is the first thing a visitor sees, so its copy has to switch with
  // the app language rather than flashing Chinese before React hydrates the rest.
  const { t } = useI18n()
  const [loaded, setLoaded] = useState(0)
  const resources = useMemo(() => [...LOCAL_ASSET_URLS, ...PUBLIC_ASSET_URLS], [])
  const total = resources.length + 1
  const progress = Math.round((loaded / total) * 100)

  useEffect(() => {
    let active = true
    const startedAt = performance.now()

    const markLoaded = () => {
      if (active) setLoaded((current) => Math.min(current + 1, total))
    }

    const fontReady = typeof document.fonts?.ready?.then === 'function'
      ? document.fonts.ready.then(() => undefined, () => undefined)
      : Promise.resolve()

    Promise.all([...resources.map((src) => preloadImage(src).then(markLoaded)), fontReady.then(markLoaded)]).then(() => {
      const elapsed = performance.now() - startedAt
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed)
      window.setTimeout(() => {
        if (active) onComplete()
      }, remaining)
    })

    return () => {
      active = false
    }
  }, [onComplete, resources, total])

  return (
    <main className={styles['startup-loader']} aria-label="Loading StardewValley UI">
      <div className={styles['startup-loader__sky']} aria-hidden />
      <section className={styles['startup-loader__identity']}>
        <span className={styles['startup-loader__season']}>SPRING · YEAR 1</span>
        <h1>StardewValley UI</h1>
        <p>{t('ui.loading.startup')}</p>
      </section>
      <div className={styles['startup-loader__garden']}>
        <StarLoading active size={176} speed={260} text="" aria-hidden />
      </div>
      <section className={styles['startup-loader__progress']} aria-live="polite" aria-label={`Loading ${progress}%`}>
        <div className={styles['startup-loader__progress-heading']}>
          <span>{t('ui.loading.startupPhase')}</span>
          <span>{progress}%</span>
        </div>
        <StarProgress
          className={styles['startup-loader__progress-bar']}
          value={loaded}
          max={total}
          segmentSize={1}
          color="#71964A"
          aria-label={t('ui.loading.progress', { loaded, total })}
        />
        <p>{loaded} / {total} {t('ui.loading.startupDone')}</p>
      </section>
    </main>
  )
}

export default StarStartupLoader
