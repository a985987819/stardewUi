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

const requiredOutputs = [
  packageJson.main,
  packageJson.module,
  packageJson.types,
  packageJson.exports?.['./style.css'],
]

if (requiredOutputs.some((output) => typeof output !== 'string')) {
  fail('main, module, types, and ./style.css exports must all be declared.')
}

await Promise.all(requiredOutputs.map(ensureFile))

const require = createRequire(import.meta.url)
if (!require.resolve(`${packageJson.name}/style.css`)) {
  fail('the ./style.css package subpath cannot be resolved.')
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

const assetSummary = assetFiles.length > 0 ? `${assetFiles.length} emitted assets` : 'embedded library assets'
console.log(`Package verification passed: ${assetSummary} and all public entry points are present.`)
