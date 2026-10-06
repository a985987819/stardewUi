// Runs on `npm publish`, before the tarball is packed.
//
// Two failure modes this exists to make impossible:
//
//   1. Publishing a stale `dist/`. `dist/` is shared between the library build
//      and the demo-site build (`build:app` / `build` overwrite it), so it is
//      entirely possible to have a populated `dist/` that is actually the demo
//      site. `npm publish` would then ship `index.html` as the package contents.
//   2. Publishing a version number that npm has already seen. That surfaces as
//      `E403 ... cannot publish over the previously published versions`, after
//      the whole build has already run.
//
// Both are checked here rather than in `docs/publishing.md`, because a rule that
// only exists in a document is a rule that gets skipped under deadline.
//
// The registry is read from `npm_config_registry`, which npm populates from
// `--registry`, `publishConfig.registry`, or `~/.npmrc` — in that order. A
// mirror cannot serve a publish, so a mirror-valued registry is reported as an
// error rather than left to fail confusingly mid-upload.

import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const projectRoot = path.resolve(import.meta.dirname, '..')
const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'))

const fail = (message) => {
  console.error(`\n[prepublish] ${message}\n`)
  process.exit(1)
}

// `prepublishOnly` is a *publish-time* hook; running the whole Vite build from
// inside it would nest `npm publish` inside `npm publish` on some npm versions.
// The contract is therefore "dist must already be built and verified" — which
// `verify-package.mjs` checks properly — rather than "build it for me".
const exists = async (relativePath) =>
  stat(path.join(projectRoot, relativePath)).then(() => true, () => false)

const entry = packageJson.exports?.['.']?.import
if (!entry || !(await exists(entry))) {
  fail(
    `${entry ?? 'the ESM entry'} is missing.\n` +
      '            dist/ holds no library build. Run "bun run build:lib" first, then "bun run verify:package".',
  )
}

// The demo build writes index.html into the same dist/. Its presence alongside a
// library entry means the last build was `build:app`, not `build:lib`.
if (await exists('dist/index.html')) {
  fail(
    'dist/index.html exists, so dist/ holds the demo-site build, not the library build.\n' +
      '            Publishing now would ship the demo site. Run "bun run build:lib" to overwrite it.',
  )
}

const version = packageJson.version
const registry = process.env.npm_config_registry ?? ''

// Any mirror cannot accept a publish. npmjs is the only registry that can.
//
// The registry URL can carry a path (`https://registry.npmjs.org/npm/`) and an
// auth token (`//registry.npmjs.org/:_authToken` style keys never reach here,
// but a scoped registry like `@scope:registry` does). Match on the host only,
// and compare against a normalised trailing slash — an earlier revision used
// `/(^|\.)registry\.npmjs\.org\/?$/`, which rejected the real npmjs URL because
// `^` and `$` cannot both match around the scheme.
const registryHost = (() => {
  try {
    return registry ? new URL(registry).hostname.toLowerCase() : ''
  } catch {
    return ''
  }
})()
const isPublishable = registryHost === 'registry.npmjs.org'

if (registry && !isPublishable) {
  fail(
    `the effective registry is "${registry}", which is not registry.npmjs.org and cannot accept a publish.\n` +
      '            Mirrors are read-only. Publish with --registry=https://registry.npmjs.org/.',
  )
}

let latest = null
try {
  // Plain `application/json`, NOT `application/vnd.npm.install-v1+json`: the
  // abbreviated corgi format is only served from the document endpoint, and
  // asking for it on `/latest` returns 406. That made an earlier revision treat
  // every lookup as "not published yet" and wave a duplicate version straight
  // through — the exact case this check exists to catch.
  const res = await fetch(`https://registry.npmjs.org/${packageJson.name}/latest`, {
    headers: { accept: 'application/json' },
  })
  if (res.ok) {
    latest = (await res.json())?.version ?? null
  } else {
    // 404 simply means the package has never been published, which is normal on
    // a first release. Anything else is worth surfacing rather than hiding.
    console.log(`[prepublish] note: registry lookup returned ${res.status}; skipping the version check.`)
  }
} catch {
  // Offline or registry unreachable: skip rather than block a publish that may
  // be perfectly fine. npm will still reject a duplicate version.
  console.log('[prepublish] note: registry unreachable; skipping the version check.')
}

if (latest && latest === version) {
  fail(
    `${packageJson.name}@${version} is already published.\n` +
      '            Bump the version (npm version minor --no-git-tag-version) before publishing again.',
  )
}

console.log(
  `[prepublish] OK — ${packageJson.name}@${version}${latest ? ` (published latest: ${latest})` : ''}, dist/ looks like a library build.`,
)