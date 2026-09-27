#!/usr/bin/env node
/**
 * Batch component auditor — 2026-09-27 P0 batch.
 *
 * Reads the internal batch marker from `componentRegistry.tsx`
 * (BATCH_2026_09_27_COMPONENTS) and, for every component in the batch:
 *
 *   1. checks the four-piece kit exists (tsx / scss / test / demo page);
 *   2. checks the registry entry and the ui-barrel export;
 *   3. extracts the props declared on `StarXxxProps` from the component source;
 *   4. extracts the props actually rendered in the demo page (a small scanner
 *      walks every `<StarXxx ...>` open tag, skipping template-literal
 *      "code" strings so only live JSX counts);
 *   5. diffs against a checklist of industry-common APIs (Ant Design /
 *      Element Plus baseline) and reports both gaps.
 *
 * Run:  bun scripts/audit-batch-components.mjs
 * Exit: 0 when the whole batch is clean, 1 when any gap remains.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

// ------------------------------------------------------------------ batch list

const registrySrc = readFileSync(join(root, 'src/router/componentRegistry.tsx'), 'utf8')
const markerMatch = registrySrc.match(/BATCH_(\d{4}_\d{2}_\d{2}):\s*([^\n*]+)/)
if (!markerMatch) {
  console.error('✗ 未在 componentRegistry.tsx 找到批次标记注释 BATCH_YYYY_MM_DD: ...')
  process.exit(1)
}
const batchLabel = `批次 ${markerMatch[1].replaceAll('_', '-')}`
const components = markerMatch[2]
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean)
if (components.length === 0) {
  console.error('✗ 批次标记为空')
  process.exit(1)
}

// ------------------------------------------------------------- checklist tables

/**
 * Industry-common props per component (Ant Design / Element Plus baseline),
 * expressed with this repo's own API names. `showIcon` / `active` / `arrow` /
 * `showTotal` / `autoSize` are on the checklist and must exist on the
 * component to pass.
 */
const COMMON_API_BY_COMPONENT = {
  Badge: ['count', 'dot', 'overflowCount', 'showZero', 'color', 'text', 'children'],
  Alert: ['type', 'title', 'children', 'closable', 'onClose', 'showIcon', 'icon'],
  Skeleton: ['loading', 'title', 'rows', 'avatar', 'avatarShape', 'active', 'children'],
  Textarea: ['value', 'defaultValue', 'onChange', 'label', 'message', 'status', 'rows', 'showCount', 'block', 'autoSize', 'allowClear', 'clearLabel', 'onPressEnter'],
  Tooltip: ['title', 'placement', 'open', 'defaultOpen', 'mouseEnterDelay', 'mouseLeaveDelay', 'onOpenChange', 'arrow', 'color'],
  Pagination: ['total', 'pageSize', 'current', 'defaultCurrent', 'defaultPageSize', 'onChange', 'showSizeChanger', 'pageSizeOptions', 'onShowSizeChange', 'hideOnSinglePage', 'showTotal'],
  Collapse: ['items', 'accordion', 'expandIconPosition', 'activeKeys', 'defaultActiveKeys', 'onChange'],
}

/** Props that never need a demo instance: pass-throughs and DOM plumbing. */
const DEMO_EXEMPT = new Set(['className', 'style', 'id', 'key', 'ref', 'role'])

const isExempt = (name) => DEMO_EXEMPT.has(name) || /^(aria|data)-/.test(name)

// ------------------------------------------------------------------- analysers

function interfaceProps(source, interfaceName) {
  const match = source.match(new RegExp(`interface ${interfaceName}[^{]*\\{([\\s\\S]*?)\\n\\}`))
  if (!match) return []
  return [...match[1].matchAll(/^\s{2}([a-zA-Z]\w*)\??:/gm)].map((m) => m[1])
}

/** Removes template-literal contents so pseudo-code strings never count. */
function stripTemplateLiterals(source) {
  return source.replace(/`[^`]*`/gs, '``')
}

/**
 * Demo pages pass their copy-paste snippet through a `code={...}` prop; those
 * blobs are documentation, not rendered examples, so their contents are
 * cleared before scanning (values in this repo are always simple identifiers
 * or plain strings — no nested braces).
 */
function stripCodeProp(source) {
  return source.replace(/\bcode=\{(?:[^{}]|\{[^{}]*\})*\}/g, 'code={}')
}

/**
 * Walks every `<StarXxx` open tag with a tiny brace-depth scanner and returns
 * [{ props: Set, hasChildren: boolean }].
 */
function jsxInstances(source, tagName) {
  const stripped = stripCodeProp(stripTemplateLiterals(source))
  const instances = []
  const openTag = `<${tagName}`
  let idx = stripped.indexOf(openTag)

  while (idx !== -1) {
    const afterTag = stripped[idx + openTag.length]
    if (!/[a-zA-Z]/.test(afterTag ?? '')) {
      let i = idx + openTag.length
      let depth = 0
      let attrs = ''
      let closed = false
      let selfClosing = false

      while (i < stripped.length && !closed) {
        const ch = stripped[i]
        if (depth === 0) {
          if (ch === '{') depth += 1
          else if (ch === '/' && stripped[i + 1] === '>') {
            selfClosing = true
            closed = true
            continue
          } else if (ch === '>') {
            closed = true
            continue
          }
        } else if (ch === '{') depth += 1
        else if (ch === '}') depth -= 1
        attrs += ch
        i += 1
      }

      if (closed) {
        const props = new Set()
        for (const m of attrs.matchAll(/([a-zA-Z][\w-]*)\s*=\s*(?:"|'|\{)/g)) props.add(m[1])
        // Boolean props survive as bare tokens once {...} blobs are removed.
        const withoutExpressions = attrs.replace(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, ' ')
        for (const token of withoutExpressions.split(/\s+/)) {
          if (/^[a-zA-Z][\w-]*$/.test(token)) props.add(token)
        }
        let hasChildren = false
        if (!selfClosing) {
          const closing = `</${tagName}>`
          const closeIdx = stripped.indexOf(closing, i)
          if (closeIdx !== -1 && stripped.slice(i, closeIdx).trim() !== '') hasChildren = true
        }
        instances.push({ props, hasChildren })
      }
    }
    idx = stripped.indexOf(openTag, idx + openTag.length)
  }
  return instances
}

// ----------------------------------------------------------------------- audit

let demoGaps = 0
let apiGaps = 0
const report = []

for (const name of components) {
  const compPath = join(root, `src/components/ui/${name}.tsx`)
  const compSrc = existsSync(compPath) ? readFileSync(compPath, 'utf8') : ''
  const kit = {
    tsx: existsSync(compPath),
    scss: existsSync(join(root, `src/components/ui/${name}.module.scss`)),
    test: existsSync(join(root, `src/components/ui/${name}.test.tsx`)),
    demo: existsSync(join(root, `src/pages/${name}Demo.tsx`)),
  }
  const inRegistry = new RegExp(`component: '${name}'`).test(registrySrc)
  const barrelSrc = existsSync(join(root, 'src/components/ui/index.ts'))
    ? readFileSync(join(root, 'src/components/ui/index.ts'), 'utf8')
    : ''
  const inBarrel = new RegExp(`\\bStar${name}\\b`).test(barrelSrc)

  const declared = interfaceProps(compSrc, `Star${name}Props`)
  const demoSrc = kit.demo ? readFileSync(join(root, `src/pages/${name}Demo.tsx`), 'utf8') : ''
  const instances = jsxInstances(demoSrc, `Star${name}`)
  const demoed = new Set()
  for (const inst of instances) {
    for (const prop of inst.props) if (!isExempt(prop)) demoed.add(prop)
    if (inst.hasChildren) demoed.add('children')
  }

  const missingKit = Object.entries(kit).filter(([, ok]) => !ok).map(([part]) => part)
  const missingWiring = [!inRegistry && 'registry', !inBarrel && 'barrel'].filter(Boolean)
  const demoMissing = declared.filter((prop) => !isExempt(prop) && !demoed.has(prop))
  const checklist = COMMON_API_BY_COMPONENT[name] ?? []
  const apiMissing = checklist.filter((prop) => !declared.includes(prop))

  const lines = [`[${name}]`]
  if (missingKit.length) lines.push(`  ✗ 四件套缺失: ${missingKit.join(', ')}`)
  if (missingWiring.length) lines.push(`  ✗ 接入缺失: ${missingWiring.join(', ')}`)
  lines.push(`  Props (${declared.length}): ${declared.join(', ') || '-'}`)
  lines.push(`  Demo 演示 (${demoed.size}): ${[...demoed].sort().join(', ') || '-'}`)
  if (demoMissing.length) {
    demoGaps += demoMissing.length
    lines.push(`  ✗ Demo 未演示: ${demoMissing.join(', ')}`)
  }
  if (apiMissing.length) {
    apiGaps += apiMissing.length
    lines.push(`  ✗ 对标缺口 (常用 API): ${apiMissing.join(', ')}`)
  }
  if (!missingKit.length && !missingWiring.length && !demoMissing.length && !apiMissing.length) {
    lines.push('  ✓ 全部通过')
  }
  report.push(lines.join('\n'))
}

console.log(`\n${batchLabel} — ${components.length} 个组件审计\n`)
console.log(report.join('\n\n'))
console.log(`\n汇总: Demo 缺口 ${demoGaps} 项, 对标缺口 ${apiGaps} 项\n`)
process.exit(demoGaps + apiGaps === 0 ? 0 : 1)
