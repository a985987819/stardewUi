#!/usr/bin/env bun
/**
 * Remove a component from every place the library publishes from — the mirror
 * image of `gen:component`. Deleting a component by hand means touching five
 * files, and the sync guard only catches *some* drifts: a leftover
 * `pages/<Name>Demo.tsx` or a barrel export without a catalogue entry fails the
 * suite, but a stale `sidebar.*` i18n key or a README section fails nothing and
 * rots quietly. This script removes all of it and then runs the guard.
 *
 *   bun run rm:component Title
 *
 * Files deleted (any `<Name>.*` / `<Name>Demo.*` in the two folders, so extra
 * specs such as `Card.theme.test.tsx` go too):
 *   src/components/ui/<Name>.tsx | .module.scss | .test.tsx
 *   src/pages/<Name>Demo.tsx | <Name>Demo.module.scss
 *
 * Files patched, all derived from the catalogue entry:
 *   src/router/componentRegistry.tsx      entry + `Star<Name>DemoPage` + lucide icon import
 *   src/router/lazyPages.ts               `Star<Name>DemoPage` export
 *   src/components/ui/index.ts            every `from './<Name>'` export line
 *   src/i18n/dictionaries.ts              the deprecated `sidebar.*` key whose text matches `title`
 *   README.md                             the `### Star<Name> - …` section + its type names
 *
 * The lucide icon import is only dropped when no other entry still uses it, and
 * a README/i18n miss is a warning rather than an error — the files it patches
 * are hand-maintained and may already be out of sync.
 *
 * Flags: --no-verify --dry-run --help
 */
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const PATHS = {
  componentDir: 'src/components/ui',
  pagesDir: 'src/pages',
  uiBarrel: 'src/components/ui/index.ts',
  lazyPages: 'src/router/lazyPages.ts',
  registry: 'src/router/componentRegistry.tsx',
  dictionaries: 'src/i18n/dictionaries.ts',
  readme: 'README.md',
  syncGuard: 'src/router/componentRegistry.sync.test.tsx',
}

const ICON_MODULE = 'lucide-react'

const USAGE = `用法: bun run rm:component <Name> [options]

  <Name>        PascalCase 组件名，即目录条目里的 component（例如 Title → 删除 StarTitle）
  --no-verify   删除后不运行同步守卫
  --dry-run     只打印计划，不删不改
  --help        显示这段帮助
`

const read = (relativePath) => readFileSync(resolve(projectRoot, relativePath), 'utf8')

const write = (relativePath, contents) => writeFileSync(resolve(projectRoot, relativePath), contents, 'utf8')

const fail = (message) => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

const warn = (message) => console.warn(`  ! ${message}`)

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const options = { name: undefined, verify: true, dryRun: false, help: false }

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') options.help = true
    else if (arg === '--no-verify') options.verify = false
    else if (arg === '--dry-run') options.dryRun = true
    else if (arg.startsWith('-')) fail(`未知参数 ${arg}\n\n${USAGE}`)
    else if (options.name) fail(`只能指定一个组件名，收到 "${options.name}" 与 "${arg}"`)
    else options.name = arg
  }

  return options
}

// ------------------------------------------------------- registry inspection

/**
 * Locates the catalogue entry for `name` and every field the script needs to
 * clean up after it.
 *
 * The entry is found by its `component:` line and then rounded out by walking to
 * the enclosing `  {` / `  },` pair. Both the opener and the closer must be at
 * two-space indentation, which is what `gen:component` writes — the nested
 * `title: {` / `desc: {` literals are indented deeper and cannot be mistaken for
 * an entry boundary.
 */
function findEntry(source, name, relativePath) {
  const marker = `component: '${name}'`
  const markerIndex = source.indexOf(marker)
  if (markerIndex === -1) {
    fail(
      `${relativePath} 里没有 \`component: '${name}'\` 目录条目。\n` +
        (source.includes(`from './${name}'`)
          ? `它似乎只是桶导出（无路由）的共享模块，请按 SHARED_ROUTE_MODULES 的约定人工处理。`
          : `请确认组件名拼写，或先用 bun run gen:component 建条目。`)
    )
  }

  const openIndex = source.lastIndexOf('\n  {', markerIndex)
  const closeMarker = '\n  },'
  const closeIndex = source.indexOf(closeMarker, markerIndex)
  if (openIndex === -1 || closeIndex === -1) {
    fail(
      `无法解析 ${relativePath} 里 ${name} 的条目边界。\n` +
        `条目必须是多行 \`  { … },\` 形式（bun run gen:component 的格式），请人工删除。`
    )
  }

  const block = source.slice(openIndex, closeIndex + closeMarker.length)
  const pick = (pattern, label) => {
    const match = block.match(pattern)
    if (!match) fail(`${relativePath} 里 ${name} 的条目缺少 ${label}，请人工删除该条目。`)
    return match[1]
  }

  return {
    // Removal range: the newline before `  {` through the end of `  },\n`. Taking
    // the entry's own trailing newline with it is what keeps the *next* entry (or
    // the closing `]`) on its own line — one extra character here and a
    // middle-of-list removal glues two entries onto one line without failing any
    // test, because `},  {` is still valid TypeScript.
    start: openIndex,
    end: closeIndex + closeMarker.length,
    block,
    routePath: pick(/routePath: '([^']+)'/, 'routePath'),
    zh: pick(/title: \{ zh: '([^']*)'/, 'title.zh'),
    en: pick(/title: \{ zh: '[^']*', en: '([^']*)'/, 'title.en'),
    icon: pick(/icon: <(\w+) size=/, 'icon'),
  }
}

/** Drops `identifier` from the named import block that ends with `from '<module>'`. */
function removeNamedImport(source, module, identifier, relativePath) {
  const marker = `} from '${module}'`
  const markerIndex = source.indexOf(marker)
  if (markerIndex === -1) return source

  const head = 'import {'
  const openIndex = source.lastIndexOf(head, markerIndex)
  if (openIndex === -1) fail(`在 ${relativePath} 中 \`from '${module}'\` 之前找不到 import 列表`)

  const names = source
    .slice(openIndex + head.length, markerIndex)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

  if (!names.includes(identifier)) return source

  const kept = names.filter((name) => name !== identifier)

  // Last name gone: drop the whole statement rather than leaving `import  from`.
  if (kept.length === 0) {
    const lineStart = source.lastIndexOf('\n', openIndex) + 1
    const lineEnd = source.indexOf('\n', markerIndex)
    return source.slice(0, lineStart) + source.slice(lineEnd + 1)
  }

  const block = `import {\n${kept.map((name) => `  ${name},`).join('\n')}\n`

  // `markerIndex` sits on the closing `}` — keep it, so the block stays balanced.
  return `${source.slice(0, openIndex)}${block}${source.slice(markerIndex)}`
}

const dropLines = (source, predicate) =>
  source
    .split('\n')
    .filter((line) => !predicate(line))
    .join('\n')

// ------------------------------------------------------------- markdown / i18n

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Text of a `#### heading` line, e.g. `StarTitle - 标题` becomes `StarTitle`. */
function headingLead(line) {
  const match = line.match(/^#{2,4}\s+(.+?)(?:\s+[-—–]\s+.*)?$/)
  return match ? match[1].trim() : undefined
}

/**
 * Removes one `###` section from the README, up to the next `###`/`##` heading.
 *
 * The section's own trailing `---` and the blank lines around it go too, then a
 * single blank line is re-inserted before the next heading. That reproduces the
 * file's `…table… \n\n---\n\n### Next` rhythm exactly, which matters because the
 * README is hand-maintained: an off-by-one here leaves a stray separator or a
 * double blank line that no test would ever catch.
 *
 * Handles the headings that do not follow the `Star<Name>` convention
 * (`### message - 消息提示`, `### PixelButton - 像素按钮`).
 */
function removeReadmeSection(source, name) {
  const candidates = [`Star${name}`, name].map((value) => value.toLowerCase())
  const lines = source.split('\n')
  const start = lines.findIndex((line) => {
    if (!line.startsWith('### ')) return false
    const lead = headingLead(line)
    return lead !== undefined && candidates.includes(lead.toLowerCase())
  })

  if (start === -1) return { source, heading: undefined }

  const heading = lines[start].trim()

  let next = lines.length
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^#{2,3}\s/.test(lines[index])) {
      next = index
      break
    }
  }

  // Walk to the section's last non-blank line — its own `---` sits inside that
  // range — then absorb the blank lines that precede the next heading.
  let contentEnd = next
  while (contentEnd > start && lines[contentEnd - 1].trim() === '') contentEnd -= 1
  while (contentEnd < lines.length && lines[contentEnd].trim() === '') contentEnd += 1

  const head = lines.slice(0, start)
  while (head.length > 0 && head[head.length - 1].trim() === '') head.pop()

  const tail = lines.slice(contentEnd)
  const merged = [...head, '', ...tail]

  return { source: merged.join('\n'), heading }
}

/** Drops the standalone `<TypeName>,` lines of the README type index. */
function removeReadmeTypeLines(source, typeNames) {
  if (typeNames.length === 0) return { source, removed: [] }

  const removed = []
  const next = dropLines(source, (line) => {
    const trimmed = line.trim()
    if (!trimmed.endsWith(',')) return false
    const identifier = trimmed.slice(0, -1).trim()
    if (!typeNames.includes(identifier)) return false
    removed.push(identifier)
    return true
  })

  return { source: next, removed }
}

/**
 * Removes the deprecated `sidebar.*` keys whose text matches the entry's own
 * `title` — the only reliable link left, since the key name drifted from the
 * component name (`sidebar.datePicker` vs `DatePicker`).
 */
function removeSidebarKeys(source, { zh, en }) {
  const removed = []
  const next = dropLines(source, (line) => {
    const match = line.match(/^\s*'sidebar\.([\w.]+)':\s*'(.*)',\s*$/)
    if (!match) return false
    if (match[2] !== zh && match[2] !== en) return false
    removed.push(`sidebar.${match[1]}`)
    return true
  })

  return { source: next, removed }
}

/** Collects the type names a module exports, for the README type index. */
function exportedTypeNames(componentPath) {
  if (!existsSync(resolve(projectRoot, componentPath))) return []
  const source = read(componentPath)
  return [...source.matchAll(/export (?:interface|type) (\w+)/g)].map((match) => match[1])
}

/** Files that belong to this component: `<Name>.*` and `<Name>Demo.*`. */
function collectTargetFiles(name) {
  const scan = (folder, prefix) =>
    readdirSync(resolve(projectRoot, folder))
      .filter((file) => file.startsWith(`${prefix}.`))
      .map((file) => `${folder}/${file}`)

  return [...scan(PATHS.componentDir, name), ...scan(PATHS.pagesDir, `${name}Demo`)].sort()
}

// --------------------------------------------------------------------- main

function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    console.log(USAGE)
    return
  }
  if (!options.name) fail(`缺少组件名\n\n${USAGE}`)
  if (!/^[A-Z][A-Za-z0-9]*$/.test(options.name)) {
    fail(`组件名必须是 PascalCase（例如 Title、GapBorder），收到 "${options.name}"`)
  }

  const name = options.name
  const registrySource = read(PATHS.registry)
  const entry = findEntry(registrySource, name, PATHS.registry)

  const targetFiles = collectTargetFiles(name)
  const missing = [`${PATHS.componentDir}/${name}.tsx`, `${PATHS.pagesDir}/${name}Demo.tsx`].filter(
    (path) => !targetFiles.includes(path)
  )
  if (!targetFiles.includes(`${PATHS.componentDir}/${name}.tsx`)) {
    warn(`${PATHS.componentDir}/${name}.tsx 不存在 —— 组件文件可能已经被删过`)
  }

  const typeNames = exportedTypeNames(`${PATHS.componentDir}/${name}.tsx`)

  // --- registry ---------------------------------------------------------
  const registryAfterEntry = registrySource.slice(0, entry.start) + registrySource.slice(entry.end)
  const iconStillUsed = new RegExp(`icon: <${escapeRegExp(entry.icon)}\\b`).test(registryAfterEntry)
  let nextRegistry = removeNamedImport(registryAfterEntry, './lazyPages', `Star${name}DemoPage`, PATHS.registry)
  if (!iconStillUsed) nextRegistry = removeNamedImport(nextRegistry, ICON_MODULE, entry.icon, PATHS.registry)

  // --- lazy pages -------------------------------------------------------
  const lazyPattern = new RegExp(`^export const Star${name}DemoPage = .*$\\n?`, 'm')
  const lazySource = read(PATHS.lazyPages)
  if (!lazyPattern.test(lazySource)) warn(`${PATHS.lazyPages} 里没有 Star${name}DemoPage 的声明`)
  const nextLazyPages = lazySource.replace(lazyPattern, '')

  // --- ui barrel --------------------------------------------------------
  const barrelSource = read(PATHS.uiBarrel)
  const barrelPattern = new RegExp(`^export .*from '\\./${escapeRegExp(name)}'$`)
  const barrelLines = barrelSource.split('\n')
  const barrelRemoved = barrelLines.filter((line) => barrelPattern.test(line))
  if (barrelRemoved.length === 0) warn(`${PATHS.uiBarrel} 里没有 from './${name}' 的导出`)
  const nextBarrel = barrelLines.filter((line) => !barrelPattern.test(line)).join('\n')

  // --- i18n + README ----------------------------------------------------
  const dictionariesSource = read(PATHS.dictionaries)
  const sidebar = removeSidebarKeys(dictionariesSource, entry)
  if (sidebar.removed.length === 0) warn(`${PATHS.dictionaries} 里没有匹配 "${entry.zh}/${entry.en}" 的废弃 sidebar.* 键`)

  const readmeSource = read(PATHS.readme)
  const readmeSection = removeReadmeSection(readmeSource, name)
  if (!readmeSection.heading) warn(`${PATHS.readme} 里没找到 ${name} 的 "### " 章节`)
  const readmeTypes = removeReadmeTypeLines(readmeSection.source, typeNames)

  const plan = [
    ...targetFiles.map((path) => `删除文件   ${path}`),
    `删除条目   ${PATHS.registry}  ->  /components/${entry.routePath}`,
    `删除导入   ${PATHS.registry}  ->  Star${name}DemoPage${iconStillUsed ? '' : `, ${entry.icon}`}`,
    `删除导出   ${PATHS.uiBarrel}  ->  ${barrelRemoved.length} 行`,
    `删除懒加载 ${PATHS.lazyPages}  ->  Star${name}DemoPage`,
    `删除文案   ${PATHS.dictionaries}  ->  ${[...new Set(sidebar.removed)].join(', ') || '（无）'}`,
    `删除文档   ${PATHS.readme}  ->  ${readmeSection.heading ?? '（无）'}`,
    `删除类型   ${PATHS.readme}  ->  ${readmeTypes.removed.join(', ') || '（无）'}`,
  ]

  if (options.dryRun) {
    console.log(`\n[ dry-run ] ${name} -> 移除 /components/${entry.routePath}\n\n  ${plan.join('\n  ')}\n`)
    if (missing.length) console.log(`  注意：${missing.join('、')} 本来就不存在\n`)
    return
  }

  // Deleted through `node:fs` rather than a shell call: it is cross-platform and
  // it is the one path the PowerShell safe-delete guard cannot silently no-op.
  for (const path of targetFiles) unlinkSync(resolve(projectRoot, path))

  write(PATHS.registry, nextRegistry)
  write(PATHS.lazyPages, nextLazyPages)
  write(PATHS.uiBarrel, nextBarrel)
  write(PATHS.dictionaries, sidebar.source)
  write(PATHS.readme, readmeTypes.source)

  console.log(`\n✓ ${name} 已从组件目录移除（先前路由 /components/${entry.routePath}）\n\n  ${plan.join('\n  ')}\n`)
  console.log(`  目录条目已删除，左侧导航 / 组件总览 / 路由表会随之少掉这一条。`)

  if (!options.verify) {
    console.log(`\n  （已跳过同步守卫，可稍后运行 bun run check:components）\n`)
    return
  }

  console.log(`\n→ 运行同步守卫 ...\n`)
  const result = spawnSync('bunx', ['vitest', 'run', PATHS.syncGuard], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  })

  if (result.status !== 0) {
    fail('同步守卫没有通过 —— 大概率还有一个入口引用了被删的组件，按上面的报错补齐')
  }
}

main()
