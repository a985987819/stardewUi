import { copyFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const distDir = path.resolve('dist')
const indexHtmlPath = path.join(distDir, 'index.html')
const notFoundHtmlPath = path.join(distDir, '404.html')
const noJekyllPath = path.join(distDir, '.nojekyll')

await copyFile(indexHtmlPath, notFoundHtmlPath)
await writeFile(noJekyllPath, '')
