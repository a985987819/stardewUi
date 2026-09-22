import { access, readdir, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const projectRoot = path.resolve(import.meta.dirname, '..')
const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'))
const distDir = path.join(projectRoot, 'dist')

const fail = (message) => {
  throw new Error(`Package verification failed: ${message}`)
}

const ensureFile = async (relativePath) => {
  try {
    await access(path.join(projectRoot, relativePath), constants.R_OK)
  } catch {
    fail(`missing ${relativePath}; run \"bun run build:lib\" first.`)
  }
}

const getFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? getFiles(entryPath) : [entryPath]
  }))
  return files.flat()
}

const autoExport = packageJson.exports?.['./auto']

const requiredOutputs = [
  packageJson.main,
  packageJson.module,
  packageJson.types,
  packageJson.exports?.['./style.css'],
  autoExport?.types,
  autoExport?.import,
  autoExport?.require,
]

if (requiredOutputs.some((output) => typeof output !== 'string')) {
  fail('main, module, types, ./style.css and ./auto exports must all be declared.')
}

await Promise.all(requiredOutputs.map(ensureFile))

const require = createRequire(import.meta.url)
for (const subpath of ['style.css', 'auto']) {
  try {
    require.resolve(`${packageJson.name}/${subpath}`)
  } catch {
    fail(`the ./${subpath} package subpath cannot be resolved.`)
  }
}

const bundle = await readFile(path.join(projectRoot, packageJson.module), 'utf8')
if (bundle.includes('/stardewUi/assets/')) {
  fail('the library bundle still contains a GitHub Pages-only built-in asset path.')
}

const assetFiles = await getFiles(path.join(distDir, 'assets')).catch(() => [])
// Vite's library mode may inline image imports. In either representation, the
// final JS must carry the built-in visuals rather than refer to the demo's
// public directory. The compressed module is much larger than code-only output
// when these images are embedded.
if (assetFiles.length === 0 && bundle.length < 1_000_000) {
  fail('the library bundle has neither emitted nor embedded built-in visuals.')
}

// The `/auto` entry is what lets consumers skip the explicit `style.css`
// import, so verify it really re-exports the root bundle AND carries the
// aggregated stylesheet (plus the sentinel that keeps both paths from doubling
// the payload when a project imports them side by side).
const autoBundlePath = autoExport.import
const autoCjsPath = autoExport.require
const stylesheetPath = packageJson.exports['./style.css']
const [autoBundle, autoCjs, stylesheet] = await Promise.all([
  readFile(path.join(projectRoot, autoBundlePath), 'utf8'),
  readFile(path.join(projectRoot, autoCjsPath), 'utf8'),
  readFile(path.join(projectRoot, stylesheetPath), 'utf8'),
])

const styleId = 'stardew-valley-ui-styles'
const sentinel = '--stardew-valley-ui-styles'

if (!autoBundle.includes(`'./${path.basename(packageJson.module)}'`)) {
  fail(`the ./auto entry must re-export ${path.basename(packageJson.module)}.`)
}
if (!autoCjs.includes(`'./${path.basename(packageJson.main)}'`)) {
  fail(`the ./auto CommonJS entry must re-export ${path.basename(packageJson.main)}.`)
}
if (!autoBundle.includes(styleId) || !autoBundle.includes(sentinel)) {
  fail('the ./auto entry does not inject the stylesheet (style id / sentinel probe missing).')
}
if (!stylesheet.includes(`${sentinel}:1`)) {
  fail(`the shipped stylesheet is missing the ${sentinel} sentinel; run "bun run build:lib".`)
}
if (autoBundle.length < stylesheet.length) {
  fail('the ./auto entry is smaller than the stylesheet it is supposed to embed.')
}

const assetSummary = assetFiles.length > 0 ? `${assetFiles.length} emitted assets` : 'embedded library assets'
console.log(
  `Package verification passed: ${assetSummary}, all public entry points are present, ` +
  `and ./auto embeds ${(stylesheet.length / 1024).toFixed(1)} KB of CSS.`,
)
