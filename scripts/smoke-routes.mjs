/**
 * Headless route smoke test.
 *
 * Boots a headless Chrome/Edge via CDP, visits every app route, and reports
 * runtime exceptions / console errors plus the rendered size of #root.
 *
 * Usage:
 *   node scripts/smoke-routes.mjs [baseUrl]
 * Default baseUrl: http://127.0.0.1:5199/stardewUi
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE_URL = (process.argv[2] ?? 'http://127.0.0.1:5199/stardewUi').replace(/\/$/, '')
const PORT = 9333

/**
 * Component routes are read from the catalogue instead of being listed by hand.
 * A hand-written copy silently stops covering new components: this list had
 * already missed `/components/rating` and `/components/progress`.
 */
function cataloguedRoutes() {
  const source = readFileSync(new URL('../src/router/componentRegistry.tsx', import.meta.url), 'utf8')
  const routePaths = [...source.matchAll(/routePath: '([^']+)'/g)].map(([, routePath]) => routePath)

  if (routePaths.length === 0) {
    console.error('No routePath entries found in src/router/componentRegistry.tsx')
    process.exit(2)
  }

  return routePaths.map((routePath) => `/components/${routePath}`)
}

const ROUTES = ['/', '/guide', '/components', ...cataloguedRoutes()]

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean)

const browserPath = CANDIDATES.find((p) => existsSync(p))
if (!browserPath) {
  console.error('No Chrome/Edge binary found. Set CHROME_PATH.')
  process.exit(2)
}

const profileDir = mkdtempSync(join(tmpdir(), 'smoke-profile-'))
const browser = spawn(
  browserPath,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-networking',
    '--window-size=1440,900',
    'about:blank',
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForDevtools() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (res.ok) return
    } catch {
      /* not ready yet */
    }
    await sleep(250)
  }
  throw new Error('DevTools endpoint did not become ready')
}

function createCdp(wsUrl) {
  const ws = new WebSocket(wsUrl)
  let nextId = 1
  const pending = new Map()
  const listeners = new Set()

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(new Error(JSON.stringify(msg.error)))
      else resolve(msg.result)
      return
    }
    if (msg.method) listeners.forEach((fn) => fn(msg))
  })

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve())
    ws.addEventListener('error', (err) => reject(err))
  })

  return {
    ready,
    on(fn) {
      listeners.add(fn)
    },
    send(method, params = {}) {
      const id = nextId++
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject })
        ws.send(JSON.stringify({ id, method, params }))
      })
    },
    close() {
      ws.close()
    },
  }
}

const results = []
let hardFailures = 0

try {
  await waitForDevtools()

  const targetRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
  const target = await targetRes.json()
  const cdp = createCdp(target.webSocketDebuggerUrl)
  await cdp.ready

  let bucket = []
  cdp.on((msg) => {
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails
      bucket.push({
        kind: 'exception',
        text: d.exception?.description ?? d.text ?? 'unknown exception',
      })
    } else if (msg.method === 'Runtime.consoleAPICalled' && (msg.params.type === 'error' || msg.params.type === 'warning')) {
      bucket.push({
        kind: `console.${msg.params.type}`,
        text: msg.params.args.map((a) => a.description ?? a.value ?? a.type).join(' '),
      })
    } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      bucket.push({ kind: 'log.error', text: msg.params.entry.text })
    }
  })

  await cdp.send('Runtime.enable')
  await cdp.send('Log.enable')
  await cdp.send('Page.enable')

  for (const route of ROUTES) {
    bucket = []
    await cdp.send('Page.navigate', { url: `${BASE_URL}${route}` })

    // Routed pages are code-split, so the chunk arrives after the shell paints.
    // Wait until the rendered markup stops growing instead of using a fixed
    // sleep, which was racy against cold Vite module transforms.
    let previousLength = -1
    let stableChecks = 0

    for (let attempt = 0; attempt < 40 && stableChecks < 2; attempt += 1) {
      await sleep(250)

      const probe = await cdp.send('Runtime.evaluate', {
        expression: `document.getElementById('root')?.innerHTML.length ?? -1`,
        returnByValue: true,
      })

      const length = probe.result.value
      stableChecks = length > 0 && length === previousLength ? stableChecks + 1 : 0
      previousLength = length
    }

    const probe = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const root = document.getElementById('root')
        return JSON.stringify({
          url: location.href,
          rootLength: root ? root.innerHTML.length : -1,
          textLength: root ? (root.innerText || '').trim().length : -1,
          hasError: /Something went wrong|Uncaught|Minified React error/i.test(document.body.innerText || '')
        })
      })()`,
      returnByValue: true,
    })

    const info = JSON.parse(probe.result.value)
    const realErrors = bucket.filter(
      (e) =>
        !/favicon|net::ERR_|Download the React DevTools|DevTools failed to load|\[vite\] connect/i.test(e.text)
    )

    results.push({ route, ...info, errors: realErrors })
    if (realErrors.length > 0 || info.rootLength <= 0) hardFailures += 1
  }

  cdp.close()
} finally {
  browser.kill()
  await sleep(400)
  try {
    rmSync(profileDir, { recursive: true, force: true })
  } catch {
    /* best effort */
  }
}

console.log(`\nSmoke test against ${BASE_URL}\n${'='.repeat(72)}`)
for (const r of results) {
  const ok = r.errors.length === 0 && r.rootLength > 0
  const status = ok ? 'PASS' : 'FAIL'
  console.log(
    `${status}  ${r.route.padEnd(26)} root=${String(r.rootLength).padStart(6)}  text=${String(r.textLength).padStart(5)}  errors=${r.errors.length}`
  )
  for (const e of r.errors.slice(0, 6)) {
    console.log(`        [${e.kind}] ${e.text.split('\n')[0].slice(0, 200)}`)
  }
}
console.log(`${'='.repeat(72)}\n${results.length - hardFailures}/${results.length} routes clean\n`)
process.exit(hardFailures > 0 ? 1 : 0)
