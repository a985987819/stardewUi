#!/usr/bin/env bun
/**
 * Scaffold a new component and wire it into every place the library publishes
 * from. Adding a component by hand means touching five files; forgetting one is
 * silent (which is how `/components/switch` stayed missing while `StarSwitch`
 * was already exported). This script writes all five and then runs the sync
 * guard so a mistake fails immediately instead of shipping.
 *
 *   bun run gen:component Switch \
 *     --zh 开关 --en Switch --icon ToggleRight \
 *     --desc-zh "像素药丸形状的开关。" \
 *     --desc-en "A pixel pill switch."
 *
 * Files written:
 *   src/components/ui/<Name>.tsx          component implementation
 *   src/components/ui/<Name>.module.scss  scoped styles
 *   src/components/ui/<Name>.test.tsx     unit test
 *   src/pages/<Name>Demo.tsx              demo page (docs + API table)
 *
 * Files patched:
 *   src/components/ui/index.ts            public barrel export
 *   src/router/lazyPages.ts               lazy route export
 *   src/router/componentRegistry.tsx      catalogue entry + lucide icon import
 *
 * The router, the gallery page and the sidebar all derive from the catalogue, so
 * a patched entry is what makes the component appear in the left navigation.
 *
 * Flags: --route <kebab> --icon <LucideName> --category <catalogue category>
 *        --no-verify --dry-run --help
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const PATHS = {
  componentDir: 'src/components/ui',
  pagesDir: 'src/pages',
  uiBarrel: 'src/components/ui/index.ts',
  lazyPages: 'src/router/lazyPages.ts',
  registry: 'src/router/componentRegistry.tsx',
  syncGuard: 'src/router/componentRegistry.sync.test.tsx',
}

const ICON_MODULE = 'lucide-react'
const DEFAULT_ICON = 'Square'
const DEFAULT_CATEGORY = 'utility'
const CATALOGUE_CATEGORIES = ['common', 'form', 'navigation', 'data-display', 'overlay', 'feedback', 'utility']

const USAGE = `用法: bun run gen:component <Name> [options]

  <Name>                 PascalCase 组件名，例如 Switch（生成 StarSwitch）
  --zh <中文名>          侧边栏与目录里的中文标题
  --en <英文名>          英文标题（默认取 <Name>）
  --icon <LucideName>    lucide-react 图标名（默认 ${DEFAULT_ICON}）
  --desc-zh <一句话>     中文描述
  --desc-en <sentence>   English description
  --route <kebab-case>   URL 片段（默认由 <Name> 转 kebab-case）
  --category <category>  目录分类：${CATALOGUE_CATEGORIES.join('、')}（默认 ${DEFAULT_CATEGORY}）
  --no-verify            生成后不运行同步守卫
  --dry-run              只打印计划，不写文件
  --help                 显示这段帮助
`

const read = (relativePath) => readFileSync(resolve(projectRoot, relativePath), 'utf8')

const write = (relativePath, contents) => {
  const absolute = resolve(projectRoot, relativePath)
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, contents, 'utf8')
}

const fail = (message) => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const options = { name: undefined, category: DEFAULT_CATEGORY, verify: true, dryRun: false, help: false }
  const aliases = {
    '--zh': 'zh',
    '--en': 'en',
    '--icon': 'icon',
    '--desc-zh': 'descZh',
    '--desc-en': 'descEn',
    '--route': 'route',
    '--category': 'category',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--no-verify') {
      options.verify = false
      continue
    }
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }
    if (aliases[arg]) {
      const value = argv[index + 1]
      if (value === undefined || value.startsWith('--')) fail(`${arg} 需要一个值`)
      options[aliases[arg]] = value
      index += 1
      continue
    }
    if (arg.startsWith('-')) fail(`未知参数 ${arg}\n\n${USAGE}`)
    if (options.name) fail(`只能指定一个组件名，收到 "${options.name}" 与 "${arg}"`)
    options.name = arg
  }

  return options
}

const kebabCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()

/** Escape a user string so it can sit inside a single-quoted TS literal. */
const quote = (value) => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

// ------------------------------------------------------------ file patchers

/**
 * Inserts `identifier` into an existing `import { … } from '<module>'` block,
 * keeping the list alphabetically sorted so diffs stay small.
 *
 * The block is located by finding the module specifier first and walking back to
 * its own `import {`. Matching forward from the first `import {` in the file
 * would swallow every import in between and merge unrelated modules into one.
 */
function insertNamedImport(source, module, identifier, relativePath) {
  const marker = `} from '${module}'`
  const markerIndex = source.indexOf(marker)
  if (markerIndex === -1) fail(`在 ${relativePath} 中找不到 \`from '${module}'\` 的命名导入`)

  const head = 'import {'
  const openIndex = source.lastIndexOf(head, markerIndex)
  if (openIndex === -1) fail(`在 ${relativePath} 中 \`from '${module}'\` 之前找不到 import 列表`)

  const names = source
    .slice(openIndex + head.length, markerIndex)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

  if (names.includes(identifier)) return source

  const merged = [...names, identifier].sort((a, b) => a.localeCompare(b))
  const block = `import {\n${merged.map((name) => `  ${name},`).join('\n')}\n`

  return `${source.slice(0, openIndex)}${block}${source.slice(markerIndex)}`
}

const appendLine = (source, line) => `${source.trimEnd()}\n${line}\n`

/** Appends the new entry right before the closing bracket of COMPONENT_ROUTES. */
function appendRegistryEntry(source, entry, relativePath) {
  const closingIndex = source.lastIndexOf('\n]')
  if (closingIndex === -1) fail(`在 ${relativePath} 中找不到 COMPONENT_ROUTES 的结尾 "]"`)

  const tail = source.slice(0, closingIndex)
  const separator = tail.endsWith(',') ? '' : ','
  return `${tail}${separator}\n${entry.trimEnd()}${source.slice(closingIndex)}`
}

async function assertIconExists(icon) {
  let lucide
  try {
    lucide = await import(ICON_MODULE)
  } catch {
    console.warn(`! 无法加载 ${ICON_MODULE}，跳过图标名检查`)
    return
  }

  if (lucide[icon] === undefined) {
    fail(`lucide-react 里没有导出 "${icon}"。可以试试：Square, Star, Box, Circle, ToggleRight, SlidersHorizontal`)
  }
}

// ---------------------------------------------------------------- templates

const componentTemplate = ({ name, kebab }) => `import type { HTMLAttributes, ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './${name}.module.scss'

export interface Star${name}Props extends HTMLAttributes<HTMLDivElement> {
  /** Short label rendered inside the frame. */
  label?: string
  /** Frame content. */
  children?: ReactNode
}

/**
 * ${name} — describe how it looks and which farm scene it belongs to.
 *
 * Publishing it (sidebar, router, gallery) only requires the catalogue entry in
 * \`src/router/componentRegistry.tsx\`, which \`bun run gen:component\` writes for
 * you. \`src/router/componentRegistry.sync.test.tsx\` keeps the chain honest.
 */
function Star${name}({ label, children, className, ...rest }: Star${name}Props) {
  return (
    <div {...rest} className={classNames(styles['star-${kebab}'], className)}>
      {children}
      {label ? <span className={styles['star-${kebab}__label']}>{label}</span> : null}
    </div>
  )
}

export { Star${name} }
export default Star${name}
`

const styleTemplate = ({ kebab }) => `.star-${kebab} {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f7efc5;
  border: 4px solid #5f4322;
  color: #4a2c1a;
  font-family: inherit;
  font-size: 14px;
}

.star-${kebab}__label {
  font-size: 13px;
  opacity: 0.85;
}
`

const testTemplate = ({ name }) => `import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ${name} from './${name}'

describe('${name}', () => {
  it('renders its children and label', () => {
    render(<${name} label="Demo">tilled soil</${name}>)

    expect(screen.getByText('Demo')).toBeInTheDocument()
    expect(screen.getByText('tilled soil')).toBeInTheDocument()
  })
})
`

const demoTemplate = ({ name, zh, en, descZh, descEn }) => `import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { Star${name} } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: ${quote(`${zh} ${en}`)},
    desc: ${quote(descZh)},
    toc: ['基础用法', '自定义内容', 'API'],
    demos: [
      ['基础用法', 'TODO：说明这个组件解决的场景。'],
      ['自定义内容', 'TODO：说明 label 与 children 的用法。'],
    ],
  },
  en: {
    title: ${quote(en)},
    desc: ${quote(descEn)},
    toc: ['Basic Usage', 'Custom Content', 'API'],
    demos: [
      ['Basic Usage', 'TODO: describe the scene this component solves.'],
      ['Custom Content', 'TODO: describe label and children usage.'],
    ],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][] }>

const apiData = {
  zh: [
    { property: 'label', description: 'TODO：说明用途', type: 'string', default: '-' },
    { property: 'children', description: 'TODO：说明用途', type: 'ReactNode', default: '-' },
  ],
  en: [
    { property: 'label', description: 'TODO: describe it.', type: 'string', default: '-' },
    { property: 'children', description: 'TODO: describe it.', type: 'ReactNode', default: '-' },
  ],
}

function Star${name}DemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'custom', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={'<Star${name} label="Demo" />'}
      >
        <Star${name} label="Demo" />
      </StarComponentDemo>
      <StarComponentDemo
        id="custom"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={'<Star${name}>tilled soil</Star${name}>'}
      >
        <Star${name}>tilled soil</Star${name}>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="${name} API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default Star${name}DemoPage
`

const registryEntryTemplate = ({ name, routePath, category, zh, en, descZh, descEn, icon }) => `  {
    routePath: '${routePath}',
    component: '${name}',
    category: '${category}',
    title: { zh: ${quote(zh)}, en: ${quote(en)} },
    desc: {
      zh: ${quote(descZh)},
      en: ${quote(descEn)},
    },
    icon: <${icon} size={20} />,
    element: Star${name}DemoPage,
  },
`

// --------------------------------------------------------------------- main

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    console.log(USAGE)
    return
  }
  if (!options.name) fail(`缺少组件名\n\n${USAGE}`)
  if (!/^[A-Z][A-Za-z0-9]*$/.test(options.name)) {
    fail(`组件名必须是 PascalCase（例如 Switch、NineSliceButton），收到 "${options.name}"`)
  }

  const name = options.name
  const kebab = kebabCase(name)
  const routePath = options.route ?? kebab
  const en = options.en ?? name
  const zh = options.zh ?? en
  const descZh = options.descZh ?? `${zh}组件的说明（TODO）。`
  const descEn = options.descEn ?? `Description of the ${en} component (TODO).`
  const icon = options.icon ?? DEFAULT_ICON

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(routePath)) {
    fail(`--route 必须是 kebab-case（例如 nine-slice-button），收到 "${routePath}"`)
  }
  if (!CATALOGUE_CATEGORIES.includes(options.category)) {
    fail(`--category 必须是以下之一：${CATALOGUE_CATEGORIES.join('、')}，收到 "${options.category}"`)
  }

  const targets = {
    component: `${PATHS.componentDir}/${name}.tsx`,
    style: `${PATHS.componentDir}/${name}.module.scss`,
    test: `${PATHS.componentDir}/${name}.test.tsx`,
    demo: `${PATHS.pagesDir}/${name}Demo.tsx`,
  }

  const collisions = Object.values(targets).filter((path) => existsSync(resolve(projectRoot, path)))
  if (collisions.length > 0) {
    fail(`以下文件已存在，先改名或删除：\n  ${collisions.join('\n  ')}`)
  }

  const registry = read(PATHS.registry)
  if (new RegExp(`component: '${name}'`).test(registry)) fail(`componentRegistry.tsx 里已经有 component: '${name}'`)
  if (new RegExp(`routePath: '${routePath}'`).test(registry)) fail(`componentRegistry.tsx 里已经有 routePath: '${routePath}'`)

  await assertIconExists(icon)

  const files = {
    [targets.component]: componentTemplate({ name, kebab }),
    [targets.style]: styleTemplate({ kebab }),
    [targets.test]: testTemplate({ name }),
    [targets.demo]: demoTemplate({ name, zh, en, descZh, descEn }),
  }

  const nextRegistry = appendRegistryEntry(
    insertNamedImport(
      insertNamedImport(registry, ICON_MODULE, icon, PATHS.registry),
      './lazyPages',
      `Star${name}DemoPage`,
      PATHS.registry
    ),
    registryEntryTemplate({ name, routePath, category: options.category, zh, en, descZh, descEn, icon }),
    PATHS.registry
  )

  const nextBarrel = appendLine(
    read(PATHS.uiBarrel),
    `export { default as Star${name} } from './${name}'\nexport type { Star${name}Props } from './${name}'`
  )

  const nextLazyPages = appendLine(
    read(PATHS.lazyPages),
    `export const Star${name}DemoPage = lazy(() => import('../pages/${name}Demo'))`
  )

  const plan = [
    `写文件   ${targets.component}`,
    `写文件   ${targets.style}`,
    `写文件   ${targets.test}`,
    `写文件   ${targets.demo}`,
    `追加导出 ${PATHS.uiBarrel}  ->  Star${name}`,
    `追加导出 ${PATHS.lazyPages}   ->  Star${name}DemoPage`,
    `追加条目 ${PATHS.registry}  ->  /components/${routePath}（${options.category}）`,
  ]

  if (options.dryRun) {
    console.log(`\n[ dry-run ] ${name} -> /components/${routePath}\n\n  ${plan.join('\n  ')}\n`)
    return
  }

  for (const [path, contents] of Object.entries(files)) write(path, contents)
  write(PATHS.uiBarrel, nextBarrel)
  write(PATHS.lazyPages, nextLazyPages)
  write(PATHS.registry, nextRegistry)

  console.log(`\n✓ ${name} 已生成并接入组件目录 -> /components/${routePath}\n\n  ${plan.join('\n  ')}\n`)
  console.log(`  左侧路由 / 组件总览 / 路由表都已随 catalogue 自动同步。`)
  console.log(`  下一步：实现 ${targets.component}，把 demo 文案里的 TODO 换成真实说明。`)

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
    fail('同步守卫没有通过，请按上面的报错补齐缺失的文件或字段')
  }
}

main().catch((error) => fail(error instanceof Error ? error.stack ?? error.message : String(error)))
