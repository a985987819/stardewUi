/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards the donation page's load-bearing claims.
 *
 * The page's whole job is to say three things that are easy to "tidy up" later
 * without noticing what was lost:
 *
 *   - using the library is free
 *   - support does not change the licence
 *   - money goes to maintenance, not to unlocking features
 *
 * All three are the kind of sentence that survives a rewrite aimed at making a
 * page shorter or friendlier. Losing "does not change the licence" turns a
 * donation page into a paywall, which is both untrue and a licensing problem.
 *
 * Reading the source rather than rendering keeps this fast and independent of
 * the component tree.
 */

const source = readFileSync(resolve(process.cwd(), 'src/pages/Support.tsx'), 'utf8')

/** The copy object, which is where any of these claims would live. */
function textOf(lang: 'zh' | 'en'): string {
  const start = source.indexOf(`${lang}: {`)
  const end = source.indexOf('\n  } satisfies', start)
  return source.slice(start, end === -1 ? source.length : end)
}

describe('donation page states the boundaries', () => {
  it.each(['zh', 'en'] as const)('%s says the library itself is free', (lang) => {
    const text = textOf(lang)
    const free = lang === 'zh' ? '使用本身不收取任何费用' : 'free, always'

    expect(
      text,
      `${lang}: the page must say using the library costs nothing — otherwise it reads as a paywall.`,
    ).toContain(free)
  })

  it.each(['zh', 'en'] as const)('%s says support does not change the licence', (lang) => {
    const text = textOf(lang)

    expect(text).toMatch(lang === 'zh' ? /不会改变许可证|保持非商业许可/ : /does not change the licence/)
  })

  it.each(['zh', 'en'] as const)('%s says money goes to maintenance', (lang) => {
    const text = textOf(lang)

    expect(text).toMatch(
      lang === 'zh' ? /费用仅用于项目维护/ : /goes only to maintenance/,
    )
    // The named uses are the concrete half of that promise.
    for (const item of lang === 'zh'
      ? ['组件开发', '缺陷修复', '文档完善', '素材制作']
      : ['Component development', 'bug fixes', 'documentation', 'artwork']) {
      expect(text, `${lang}: missing declared use "${item}"`).toContain(item)
    }
  })

  it('declares both payment methods', () => {
    expect(source).toContain('donate/wechat-qr.png')
    expect(source).toContain('donate/alipay-qr.png')
  })

  it('renders the codes as images with descriptive alt text', () => {
    // A payment QR with no alt text is unreadable to a screen reader; with a
    // generic one it reads as "image", which tells a blind user nothing about
    // where the money goes.
    expect(source).toMatch(/alt=\{lang === 'zh'/)
  })

  it('keeps the free-use notice above the QR codes', () => {
    // Order matters more than wording: a reader who sees a QR code before being
    // told the library is free has already drawn the wrong conclusion.
    const notice = source.indexOf('<StarAlert')
    const codes = source.indexOf('support-method-grid')

    expect(
      notice,
      'the free-use notice should come before the QR codes in the JSX',
    ).toBeGreaterThan(-1)
    expect(notice).toBeLessThan(codes)
  })
})

describe('donation page is reachable', () => {
  it('has a route outside the component tree', () => {
    const router = readFileSync(resolve(process.cwd(), 'src/router/index.tsx'), 'utf8')

    expect(router).toContain("path: 'support'")
    // Registering it under `guide/*` would file a page about money under
    // "how to use the library".
    expect(router).not.toContain("path: 'guide/support'")
  })

  it('is listed in the sidebar so it is not a hidden URL', () => {
    const sidebar = readFileSync(resolve(process.cwd(), 'src/components/layout/Sidebar.tsx'), 'utf8')

    expect(sidebar).toContain("path: '/support'")
    // Both languages must appear; the sidebar renders one label per language.
    expect(sidebar).toMatch(/labelZh: '请我喝咖啡'/)
    expect(sidebar).toMatch(/labelEn: 'Buy me a coffee'/)
  })

  it('ships a placeholder image for each code', () => {
    // The page references two images; without files on disk the layout shows
    // broken-image boxes on the demo site.
    for (const asset of ['wechat-qr.png', 'alipay-qr.png']) {
      expect(
        () => readFileSync(resolve(process.cwd(), 'public/donate', asset), 'utf8'),
        `public/donate/${asset} is missing`,
      ).not.toThrow()
    }
  })

  it('ships real PNGs of a sane size', () => {
    // Both codes arrived as JPEGs renamed to `.png`, and at ~150KB each. The
    // extension lying is the smaller problem: `docs/sponsoring.md` tells the
    // maintainer to use PNG because scanners are less reliable with JPEG, so a
    // JPEG here quietly contradicts the project's own instructions. The size
    // cap matters too — the two load side by side on first paint.
    for (const asset of ['wechat-qr.png', 'alipay-qr.png']) {
      const path = resolve(process.cwd(), 'public/donate', asset)
      const bytes = readFileSync(path)

      expect(
        bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
        `public/donate/${asset} is not a PNG despite its extension`,
      ).toBe(true)

      // IHDR width/height live at bytes 16..24, big-endian, after the 8-byte
      // signature and the 8-byte PNG+IHDR chunk header.
      expect(bytes.readUInt32BE(16), `${asset} is narrower than 400px; it will look blurry on retina`).toBeGreaterThanOrEqual(400)
      expect(bytes.readUInt32BE(20), `${asset} is shorter than 400px; it will look blurry on retina`).toBeGreaterThanOrEqual(400)

      expect(
        bytes.byteLength,
        `public/donate/${asset} is ${Math.round(bytes.byteLength / 1024)}KB; the two codes load together on first paint`,
      ).toBeLessThan(102_400)
    }
  })
})