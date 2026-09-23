import StarApiTable from '../components/layout/ApiTable'
import { useState } from 'react'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarTitle } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './TitleDemo.module.scss'

const colorPresets = [
  { label: { zh: '麦穗金', en: 'Wheat gold' }, value: '#ce9f00' },
  { label: { zh: '蒲公英黄', en: 'Dandelion' }, value: '#d4a72c' },
  { label: { zh: '南瓜橙', en: 'Pumpkin' }, value: '#c97832' },
  { label: { zh: '莓果红', en: 'Berry red' }, value: '#b4584b' },
  { label: { zh: '覆盆子紫', en: 'Raspberry' }, value: '#b45b78' },
  { label: { zh: '春草绿', en: 'Spring grass' }, value: '#6c9b5a' },
  { label: { zh: '松林绿', en: 'Pine forest' }, value: '#5f8f7a' },
  { label: { zh: '湖水蓝', en: 'Lake blue' }, value: '#4b78a9' },
  { label: { zh: '铱矿靛', en: 'Iridium' }, value: '#6667a4' },
  { label: { zh: '野李紫', en: 'Wild plum' }, value: '#95649a' },
] as const

const copy = {
  zh: {
    title: '标题 Title',
    desc: '由 Canvas 分层绘制的像素标题：金色字面带稳定斑驳纹理，右上受光高光、碎裂锯齿描边和下落阴影清晰分层。',
    toc: ['基础用法', '中文示例', '主色与高光', '尺寸与字距', '阴影开关', '自定义层级', 'API'],
    demos: [
      ['基础用法', '用于页面章节、任务标题和面板抬头。默认使用 50px 粗体字，每个字符间隔约 4px；金色文字带低密度斑驳色点、45 度内高光、碎裂的 3px 锯齿描边，以及从字面下方 5px 开始、向下延展 4px、60% 透明度的投影。'],
      ['中文示例', 'Canvas 会按文本重新测量字形，并为每个字加入约 4px 间隔；中文标题“太中了”也会获得同一套像素高光、描边和长投影。'],
      ['主色与高光', '用取色器、十六进制输入或 10 个色块预设实时改变 color。Canvas 会立即重绘字面，并据此推导同色系的右上高光与斑驳明暗点。'],
      ['尺寸与字距', 'fontSize 与 letterSpacing 均使用像素值：较小的标题可放进工具栏，更宽的字距适合任务章标题。'],
      ['阴影开关', 'showShadow={false} 会移除下方的 60% 硬像素投影，保留高光、描边与字面斑驳层次。'],
      ['自定义层级', '通过 level 选择语义化的 h1–h6；其余原生标题属性和 className 会透传到根节点。'],
    ],
  },
  en: {
    title: 'Title',
    desc: 'A canvas-rendered pixel title with a subtly mottled gold fill, upper-right light, fractured jagged outline, and drop shadow.',
    toc: ['Basic Usage', 'Chinese Example', 'Main Color & Highlight', 'Size & Spacing', 'Shadow Toggle', 'Semantic Level', 'API'],
    demos: [
      ['Basic Usage', 'Use it for chapter headings, quest titles, and panel headers. Its bold 50px default treatment leaves about 4px between glyphs and combines sparse gold flecks, a 45° inner glint, a fractured 3px jagged outline, and a 60% opaque 4px cast shadow that starts 5px below the lettering.'],
      ['Chinese Example', 'Canvas measures and spaces each glyph by about 4px; the Chinese title “太中了” receives the same pixel lighting, outline, and cast shadow.'],
      ['Main Color & Highlight', 'Use the picker, hex input, or one of ten color swatches to change color live. Canvas redraws immediately with a matching upper-right highlight plus lighter and darker flecks.'],
      ['Size & Spacing', 'fontSize and letterSpacing use pixels: a smaller title fits a toolbar, while wider glyph spacing suits a quest chapter heading.'],
      ['Shadow Toggle', 'showShadow={false} removes the 60% opaque hard-pixel cast shadow while keeping the highlight, outline, and mottled fill.'],
      ['Semantic Level', 'Choose a semantic h1–h6 with level; native heading attributes and className are forwarded to the root element.'],
    ],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][] }>

const apiData = {
  zh: [
    { property: 'level', description: '语义化标题层级', type: '1 | 2 | 3 | 4 | 5 | 6', default: '2' },
    { property: 'children', description: 'Canvas 绘制的标题文本', type: 'string | number', default: '-' },
    { property: 'color', description: '文字主色；右上高光与斑驳明暗点由此推导', type: 'string', default: "'#ce9f00'" },
    { property: 'fontSize', description: 'Canvas 字体大小（px）', type: 'number', default: '50' },
    { property: 'letterSpacing', description: '字符间距（px，不小于 0）', type: 'number', default: '4' },
    { property: 'showShadow', description: '是否显示 60% 透明度的硬像素投影', type: 'boolean', default: 'true' },
  ],
  en: [
    { property: 'level', description: 'Semantic heading level.', type: '1 | 2 | 3 | 4 | 5 | 6', default: '2' },
    { property: 'children', description: 'Heading text rendered by Canvas.', type: 'string | number', default: '-' },
    { property: 'color', description: 'Visible fill; the upper-right highlight and flecks are derived from it.', type: 'string', default: "'#ce9f00'" },
    { property: 'fontSize', description: 'Canvas font size in pixels.', type: 'number', default: '50' },
    { property: 'letterSpacing', description: 'Space between glyphs in pixels (minimum 0).', type: 'number', default: '4' },
    { property: 'showShadow', description: 'Shows the 60% opaque hard-pixel cast shadow.', type: 'boolean', default: 'true' },
  ],
}

function StarTitleDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [titleColor, setTitleColor] = useState('#5f8f7a')
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'chinese', 'color', 'metrics', 'shadow', 'custom', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={'<StarTitle>Harvest board</StarTitle>'}
      >
        <StarTitle>Harvest board</StarTitle>
      </StarComponentDemo>
      <StarComponentDemo
        id="chinese"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={'<StarTitle>太中了！！</StarTitle>'}
      >
        <StarTitle>太中了！！</StarTitle>
      </StarComponentDemo>
      <StarComponentDemo
        id="color"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={`<StarTitle color="${titleColor}">Forest ledger</StarTitle>`}
        data={[{ label: 'color', value: titleColor }]}
      >
        <div className={styles['title-color-demo']}>
          <div className={styles['title-color-demo-controls']}>
            <label className={styles['title-color-demo-picker']}>
              <span>{lang === 'zh' ? '主色' : 'Main color'}</span>
              <input
                type="color"
                value={titleColor}
                aria-label={lang === 'zh' ? '选择标题主色' : 'Choose title main color'}
                onChange={(event) => setTitleColor(event.target.value)}
              />
            </label>
            <input
              className={styles['title-color-demo-hex']}
              value={titleColor}
              aria-label={lang === 'zh' ? '标题主色十六进制值' : 'Title main color hex value'}
              spellCheck={false}
              onChange={(event) => setTitleColor(event.target.value)}
            />
            <span className={styles['title-color-demo-hint']}>
              {lang === 'zh' ? '输入或取色后立即重绘高光与斑驳。' : 'Pick or type to redraw the highlight and flecks immediately.'}
            </span>
            <div className={styles['title-color-demo-presets']} aria-label={lang === 'zh' ? '标题颜色预设' : 'Title color presets'}>
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={styles['title-color-demo-preset']}
                  style={{ backgroundColor: preset.value }}
                  aria-label={`${preset.label[lang]} (${preset.value})`}
                  aria-pressed={titleColor.toLowerCase() === preset.value}
                  title={`${preset.label[lang]} · ${preset.value}`}
                  onClick={() => setTitleColor(preset.value)}
                />
              ))}
            </div>
          </div>
          <div className={styles['title-color-demo-preview']}>
            <StarTitle color={titleColor}>Forest ledger</StarTitle>
            <output>{titleColor}</output>
          </div>
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="metrics"
        title={t.demos[3][0]}
        description={t.demos[3][1]}
        code={'<StarTitle fontSize={34} letterSpacing={10}>Quest chapter</StarTitle>'}
      >
        <StarTitle fontSize={34} letterSpacing={10}>Quest chapter</StarTitle>
      </StarComponentDemo>
      <StarComponentDemo
        id="shadow"
        title={t.demos[4][0]}
        description={t.demos[4][1]}
        code={'<StarTitle showShadow={false}>No shadow</StarTitle>'}
      >
        <StarTitle showShadow={false}>No shadow</StarTitle>
      </StarComponentDemo>
      <StarComponentDemo
        id="custom"
        title={t.demos[5][0]}
        description={t.demos[5][1]}
        code={'<StarTitle level={1}>Spring festival</StarTitle>'}
      >
        <StarTitle level={1}>Spring festival</StarTitle>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Title API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarTitleDemoPage
