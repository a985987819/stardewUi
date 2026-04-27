import StarComponentPage from '../components/layout/ComponentPage'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarApiTable from '../components/layout/ApiTable'
import { StarTitle } from '../components/ui'
import styles from './TitleDemo.module.scss'

const titleApiData = [
  { property: 'children', description: '标题内容，支持通过 \\n 强制换行', type: 'string', default: '-', required: true },
  { property: 'size', description: '标题尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
  { property: 'align', description: '标题对齐方式', type: "'left' | 'center'", default: "'center'" },
  { property: 'as', description: '语义标签', type: "'div' | 'h1' | 'h2' | 'h3' | 'p'", default: "'h2'" },
  { property: 'backgroundSrc', description: '背景板图片地址', type: 'string', default: "'/titleBg.png'" },
]

const tocItems = [
  { id: 'basic', title: '基础用法', level: 1 },
  { id: 'multiline', title: '多行标题', level: 1 },
  { id: 'size', title: '尺寸', level: 1 },
  { id: 'align', title: '对齐方式', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const basicCode = `<StarTitle>农场任务</StarTitle>`
const multilineCode = `<StarTitle size="large">{'Stardew\\nValley'}</StarTitle>\n<StarTitle>{'春季\\n市集公告'}</StarTitle>`
const sizeCode = `<StarTitle size="small">春季市集</StarTitle>\n<StarTitle size="medium">夏季庆典</StarTitle>\n<StarTitle size="large">秋日收获</StarTitle>`
const alignCode = `<StarTitle align="left">工坊公告</StarTitle>`

function StarTitleDemoPage() {
  return (
    <StarComponentPage
      title="Title 标题"
      description="基于 canvas 绘制木质标题牌背景，并叠加带木纹质感的像素标题文字。"
      toc={tocItems}
    >
      <StarComponentDemo id="basic" title="基础用法" description="默认尺寸和居中排版的标题组件" code={basicCode}>
        <StarTitle>农场任务</StarTitle>
      </StarComponentDemo>

      <StarComponentDemo id="multiline" title="多行标题" description="通过换行符控制分行，接近游戏内招牌排版" code={multilineCode}>
        <div className={styles['title-demo-stack']}>
          <StarTitle size="large">{'Stardew\nValley'}</StarTitle>
          <StarTitle>{'春季\n市集公告'}</StarTitle>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="size" title="尺寸" description="提供三种稳定的标题尺寸，保持一致的边距和留白" code={sizeCode}>
        <div className={styles['title-demo-stack']}>
          <StarTitle size="small">春季市集</StarTitle>
          <StarTitle size="medium">夏季庆典</StarTitle>
          <StarTitle size="large">秋日收获</StarTitle>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="align" title="对齐方式" description="内容区支持左对齐，适合公告类标题" code={alignCode}>
        <StarTitle align="left">工坊公告</StarTitle>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={titleApiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarTitleDemoPage
