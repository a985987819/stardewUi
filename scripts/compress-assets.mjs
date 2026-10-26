// One-off asset diet: the shipped pixel-art PNGs were exported at full colour
// depth and weigh ~3.2 MB combined, which used to land base64-inlined in the
// npm bundle and preloaded on every doc-site visit. Pixel art only needs a
// 256-colour palette, so quantize every PNG in place and keep whichever file
// is smaller. Run: node scripts/compress-assets.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const directories = ['src/assets', 'public']

for (const directory of directories) {
  for (const name of readdirSync(directory)) {
    if (!name.toLowerCase().endsWith('.png')) continue

    const file = join(directory, name)
    const before = statSync(file).size
    const input = sharp(readFileSync(file))

    // `palette: true` is the quantization switch; pixel art keeps its hard
    // edges under a 256-colour palette, and compressionLevel 9 squeezes the
    // rest. `quality` only steers the palette search, not the pixels.
    const { data, info } = await input
      .png({ palette: true, colors: 256, quality: 90, compressionLevel: 9 })
      .toBuffer({ resolveWithObject: true })

    if (data.length < before) {
      writeFileSync(file, data)
      console.log(
        `${file}: ${(before / 1024).toFixed(0)}KB -> ${(data.length / 1024).toFixed(0)}KB` +
        ` (-${Math.round((1 - data.length / before) * 100)}%, ${info.channels}ch)`,
      )
    } else {
      console.log(`${file}: already optimal (${(before / 1024).toFixed(0)}KB)`)
    }
  }
}
