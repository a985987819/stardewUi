import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarPixelText } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './PixelTextDemo.module.scss'

const EMOJI_SAMPLES = ['😀', '😄', '😆', '😅', '🤣'] as const

const copy = {
  zh: {
    title: '像素化文本 Pixel Text',
    desc: '把任意短文本先画进 Canvas，再缩小采样并关闭平滑放大，得到可控的粗颗粒锯齿字形。特别适合把彩色 emoji 变成复古 UI 里的像素素材。',
    toc: ['常用表情', '实时转换与拖动对比', '包裹文本', 'API'],
    demos: [
      ['常用表情', '五个常用笑脸以同一套 8px 像素格绘制。文本原本的颜色会被保留，但轮廓会变成清晰的方格锯齿。'],
      ['实时转换与拖动对比', '在同一张工作台里输入表情、符号或短文本，并调整颗粒尺寸；预览会立即重绘。拖动中央竖线可在同一份内容的原始 Canvas 字形和像素化结果之间无缝对比。'],
      ['包裹文本', '不用额外传 text；把纯文本放进组件 children，便能直接绘制为像素化文本。'],
    ],
    inputLabel: '输入要像素化的内容',
    pixelLabel: '颗粒尺寸',
    pixelUnit: 'px / 格',
    original: '原始内容',
    pixelated: '像素化结果',
    divider: '拖动对比线',
  },
  en: {
    title: 'Pixel Text',
    desc: 'Draw short text into Canvas, reduce it to a small sample grid, then enlarge it without smoothing for deliberate chunky, jagged glyphs. It is especially useful for turning color emoji into retro UI assets.',
    toc: ['Common Emoji', 'Live Conversion & Compare', 'Wrapped Text', 'API'],
    demos: [
      ['Common Emoji', 'Five familiar faces use the same 8px grid. Their source colors remain, while their edges resolve into crisp square pixels.'],
      ['Live Conversion & Compare', 'Use one workbench to enter an emoji, symbol, or short label and adjust the pixel size. The preview redraws immediately; drag its central divider to compare the source Canvas glyph and the pixel result seamlessly.'],
      ['Wrapped Text', 'No separate text prop is required: place plain text in children and the component draws it as pixel text.'],
    ],
    inputLabel: 'Text to pixelate',
    pixelLabel: 'Pixel size',
    pixelUnit: 'px / cell',
    original: 'Original content',
    pixelated: 'Pixelated result',
    divider: 'Drag comparison divider',
  },
} satisfies Record<Lang, {
  title: string; desc: string; toc: string[]; demos: string[][]; inputLabel: string; pixelLabel: string; pixelUnit: string
  original: string; pixelated: string; divider: string
}>

const apiData = {
  zh: [
    { property: 'text', description: '优先级最高的待栅格化文本。', type: 'string | number', default: '-' },
    { property: 'children', description: '未传 text 时要栅格化的纯文本。', type: 'string | number', default: '-' },
    { property: 'pixelSize', description: '每一个可见方格像素的边长（px）。', type: 'number', default: '8' },
    { property: 'fontSize', description: '缩小采样前源 Canvas 的字体大小（px）。', type: 'number', default: '120' },
    { property: 'fontFamily', description: '源 Canvas 的字体族；默认使用彩色 emoji 兼容字体栈。', type: 'string', default: 'emoji-safe stack' },
    { property: 'padding', description: '字形周围保留的空白（px）。', type: 'number', default: '12' },
    { property: 'renderMode', description: '绘制像素化结果，或保留同尺寸 Canvas 源字形以做无缝对比。', type: "'pixelated' | 'source'", default: "'pixelated'" },
    { property: 'aria-label', description: '覆盖 Canvas 图像的无障碍名称。', type: 'string', default: 'text / children' },
  ],
  en: [
    { property: 'text', description: 'Text to rasterize; takes priority over children.', type: 'string | number', default: '-' },
    { property: 'children', description: 'Plain text to rasterize when text is omitted.', type: 'string | number', default: '-' },
    { property: 'pixelSize', description: 'Side length of one visible square pixel in CSS pixels.', type: 'number', default: '8' },
    { property: 'fontSize', description: 'Source Canvas font size before downsampling, in pixels.', type: 'number', default: '120' },
    { property: 'fontFamily', description: 'Source font stack; defaults to color-emoji-safe fonts.', type: 'string', default: 'emoji-safe stack' },
    { property: 'padding', description: 'Empty space retained around the glyph, in pixels.', type: 'number', default: '12' },
    { property: 'renderMode', description: 'Draws the pixel result or the same-size source Canvas glyph for seamless comparison.', type: "'pixelated' | 'source'", default: "'pixelated'" },
    { property: 'aria-label', description: 'Overrides the Canvas image accessible name.', type: 'string', default: 'text / children' },
  ],
}

function StarPixelTextDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [input, setInput] = useState('😆')
  const [pixelSize, setPixelSize] = useState(9)
  const [comparison, setComparison] = useState(52)
  const previewText = input || ' '
  const comparisonFontSize = Math.max(64, Math.round(142 / Math.sqrt(Array.from(previewText).length)))
  const toc = t.toc.map((title, index) => ({ id: ['emoji', 'live', 'wrapped', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="emoji" title={t.demos[0][0]} description={t.demos[0][1]} code={'<StarPixelText pixelSize={8}>😀</StarPixelText>'}>
        <div className={styles['emoji-samples']} aria-label={t.demos[0][0]}>
          {EMOJI_SAMPLES.map((emoji) => <StarPixelText key={emoji} pixelSize={8} fontSize={108}>{emoji}</StarPixelText>)}
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="live" title={t.demos[1][0]} description={t.demos[1][1]} code={'<StarPixelText text={text} pixelSize={10} />'} data={[{ label: 'text', value: previewText }, { label: 'pixelSize', value: `${pixelSize}px` }, { label: 'split', value: `${comparison}%` }]}>
        <div className={styles['converter']}>
          <div className={styles['converter-controls']}>
            <label>
              <span>{t.inputLabel}</span>
              <input value={input} maxLength={16} onChange={(event) => setInput(event.target.value)} placeholder="😀" aria-label={t.inputLabel} />
            </label>
            <label>
              <span>{t.pixelLabel}<output>{pixelSize} {t.pixelUnit}</output></span>
              <input type="range" min="4" max="16" step="1" value={pixelSize} onChange={(event) => setPixelSize(Number(event.target.value))} aria-label={t.pixelLabel} />
            </label>
          </div>
          <div className={styles['comparison']}>
            <div className={styles['comparison-labels']}><span>{t.original}</span><span>{t.pixelated}</span></div>
            <div className={styles['comparison-stage']}>
              <div className={styles['source-layer']} aria-hidden="true">
                <StarPixelText text={previewText} pixelSize={pixelSize} fontSize={comparisonFontSize} renderMode="source" aria-label="" />
              </div>
              <div className={styles['pixel-reveal']} style={{ clipPath: `inset(0 0 0 ${comparison}%)` }} aria-hidden="true">
                <StarPixelText text={previewText} pixelSize={pixelSize} fontSize={comparisonFontSize} aria-label="" />
              </div>
              <div className={styles['comparison-divider']} style={{ left: `${comparison}%` }} aria-hidden="true"><span>↕</span></div>
              <input className={styles['comparison-range']} type="range" min="0" max="100" value={comparison} onChange={(event) => setComparison(Number(event.target.value))} aria-label={t.divider} />
            </div>
          </div>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="wrapped" title={t.demos[2][0]} description={t.demos[2][1]} code={'<StarPixelText pixelSize={7}>Farm!</StarPixelText>'}>
        <div className={styles['wrapped']}><StarPixelText pixelSize={7} fontSize={72}>Farm!</StarPixelText></div>
      </StarComponentDemo>

      <div id="api" className="component-page-api"><StarApiTable title="PixelText API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarPixelTextDemoPage
