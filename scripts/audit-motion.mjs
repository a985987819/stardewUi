import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const files = []
for (const dir of ['src/components/ui', 'src/components/layout', 'src/pages']) {
  for (const f of readdirSync(resolve(dir))) {
    if (f.endsWith('.module.scss')) files.push(resolve(dir, f))
  }
}

const rows = []
for (const path of files) {
  const css = readFileSync(path, 'utf8')
  css.split('\n').forEach((line, i) => {
    if (!/transition:|animation:/.test(line)) return
    const body = line.replace(/^\s+/, '')
    if (/transition:\s*none|animation:\s*none/.test(body)) return
    const dur = line.match(/(\d*\.?\d+)(ms|s)\b/g) || []
    const curves =
      line.match(/(cubic-bezier\([^)]*\)|steps\([^)]*\)|linear|ease-in-out|ease-out|ease-in|\bease\b)/g) || []
    rows.push({
      file: path.split(/[\\/]/).pop().replace('.module.scss', ''),
      line: i + 1,
      kind: /^animation:/.test(body) ? 'animation' : 'transition',
      durs: [...new Set(dur)],
      curves: [...new Set(curves)],
      token: /var\(--star-motion|var\(--stardew-overlay/.test(line) ? 'token' : 'LITERAL',
      text: body.replace(/\s+/g, ' ').slice(0, 86),
    })
  })
}

const lit = rows.filter((r) => r.token === 'LITERAL')
const tok = rows.filter((r) => r.token === 'token')
console.log('总动效声明:', rows.length, '| 用 token:', tok.length, '| 硬编码字面量:', lit.length)

console.log('\n=== 硬编码逐条 ===')
for (const r of lit) {
  console.log(
    '  ' + r.file.padEnd(24) + ' L' + String(r.line).padStart(4) + ' ' +
    r.kind.padEnd(10) + ' dur=' + (r.durs.join(',') || '-').padEnd(14) +
    ' curve=' + (r.curves.join(',') || '-').padEnd(26),
  )
}

console.log('\n=== steps 家族：同一交互的参数离散度 ===')
const press = rows.filter((r) => /steps\(/.test(r.text))
const byCurve = new Map()
for (const r of press) {
  const k = r.curves.find((c) => c.startsWith('steps')) || '?'
  if (!byCurve.has(k)) byCurve.set(k, [])
  byCurve.get(k).push(r.durs.join(',') + '@' + r.file)
}
for (const [k, v] of byCurve) console.log('  ' + k.padEnd(30) + '-> ' + v.join(' | '))

console.log('\n=== 硬编码时长字面量的离散度 ===')
const durset = new Map()
for (const r of lit) {
  for (const d of r.durs) {
    if (!durset.has(d)) durset.set(d, [])
    durset.get(d).push(r.file)
  }
}
for (const [d, v] of [...durset].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))) {
  const u = [...new Set(v)]
  console.log('  ' + d.padEnd(9) + 'used by ' + String(u.length).padStart(2) + ' components: ' + u.join(', '))
}
