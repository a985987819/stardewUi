import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const distDirectory = resolve('dist')
const css = readdirSync(distDirectory, { recursive: true })
  .filter((file) => file.endsWith('.css'))
  .map((file) => readFileSync(resolve(distDirectory, file), 'utf8'))
  .join('\n')

const motionNames = [...new Set(
  [...css.matchAll(/--star-motion-[a-z-]+-name:\s*([^;\s]+)/g)].map(([, name]) => name),
)]

if (motionNames.length !== 4) {
  throw new Error(`Expected four shared motion names in the built CSS, found ${motionNames.length}.`)
}

const missingKeyframes = motionNames.filter((name) => !new RegExp(`@keyframes\\s+${name}(?=\\s*\\{)`).test(css))

if (missingKeyframes.length > 0) {
  throw new Error(
    `Shared motion variables must reference unscoped keyframes. Missing: ${missingKeyframes.join(', ')}`,
  )
}
