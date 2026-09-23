import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarTitle } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '标题 Title',
    desc: '由 Canvas 分层绘制的像素标题：金色字面带稳定斑驳纹理，右上受光高光、碎裂锯齿描边和下落阴影清晰分层。',
    toc: ['基础用法', '中文示例', '自定义层级', 'API'],
    demos: [
      ['基础用法', '用于页面章节、任务标题和面板抬头。默认使用 50px 粗体字，每个字符间隔约 8px；金色文字带低密度斑驳色点、45 度内高光、碎裂的 3px 锯齿描边，以及从字面下方 5px 开始、向下延展 4px 的投影。'],
      ['中文示例', 'Canvas 会按文本重新测量字形，并为每个字加入约 8px 间隔；中文标题“太中了”也会获得同一套像素高光、描边和长投影。'],
      ['自定义层级', '通过 level 选择语义化的 h1–h6；其余原生标题属性和 className 会透传到根节点。'],
    ],
  },
  en: {
    title: 'Title',
    desc: 'A canvas-rendered pixel title with a subtly mottled gold fill, upper-right light, fractured jagged outline, and drop shadow.',
    toc: ['Basic Usage', 'Chinese Example', 'Semantic Level', 'API'],
    demos: [
      ['Basic Usage', 'Use it for chapter headings, quest titles, and panel headers. Its bold 50px default treatment leaves about 8px between glyphs and combines sparse gold flecks, a 45° inner glint, a fractured 3px jagged outline, and a 4px cast shadow that starts 5px below the lettering.'],
      ['Chinese Example', 'Canvas measures and spaces each glyph by about 8px; the Chinese title “太中了” receives the same pixel lighting, outline, and cast shadow.'],
      ['Semantic Level', 'Choose a semantic h1–h6 with level; native heading attributes and className are forwarded to the root element.'],
    ],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][] }>

const apiData = {
  zh: [
    { property: 'level', description: '语义化标题层级', type: '1 | 2 | 3 | 4 | 5 | 6', default: '2' },
    { property: 'children', description: 'Canvas 绘制的标题文本', type: 'string | number', default: '-' },
  ],
  en: [
    { property: 'level', description: 'Semantic heading level.', type: '1 | 2 | 3 | 4 | 5 | 6', default: '2' },
    { property: 'children', description: 'Heading text rendered by Canvas.', type: 'string | number', default: '-' },
  ],
}

function StarTitleDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'chinese', 'custom', 'api'][index], title, level: 1 }))

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
        id="custom"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
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
