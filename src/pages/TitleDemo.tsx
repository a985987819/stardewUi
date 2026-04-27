import ComponentPage from '../components/layout/ComponentPage'
import ComponentDemo from '../components/layout/ComponentDemo'
import ApiTable from '../components/layout/ApiTable'
import { Title } from '../components/ui'
import styles from './TitleDemo.module.scss'

const titleApiData = [
  { property: 'children', description: '标题内容，支持通过 \\n 强制换行', type: 'string', default: '-', required: true },
  { property: 'size', description: '标题尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
  { property: 'align', description: '标题对齐方式', type: "'left' | 'center'", default: "'center'" },
  { property: 'as', description: '语义标签', type: "'div' | 'h1' | 'h2' | 'h3' | 'p'", default: "'h2'" },
  { property: 'backgroundSrc', description: '背景板图片地址', type: 'string', default: "'/titleBg.png'" },
]

const basicCode = `<Title>农场任务</Title>`
const multilineCode = `<Title size="large">{'Stardew\\nValley'}</Title>\n<Title>{'春季\\n市集公告'}</Title>`
const sizeCode = `<Title size="small">春季市集</Title>\n<Title size="medium">夏季庆典</Title>\n<Title size="large">秋日收获</Title>`
const alignCode = `<Title align="left">工坊公告</Title>`

function StarTitleDemoPage() {
  return (
    <ComponentPage
      title="Title 标题"
      description="基于 canvas 绘制木质标题牌背景，并叠加带木纹质感的像素标题文字。"
    >
      <ComponentDemo title="基础用法" description="默认尺寸和居中排版的标题组件" code={basicCode}>
        <Title>农场任务</Title>
      </ComponentDemo>

      <ComponentDemo title="多行标题" description="通过换行符控制分行，接近游戏内招牌排版" code={multilineCode}>
        <div className={styles['title-demo-stack']}>
          <Title size="large">{'Stardew\nValley'}</Title>
          <Title>{'春季\n市集公告'}</Title>
        </div>
      </ComponentDemo>

      <ComponentDemo title="尺寸" description="提供三种稳定的标题尺寸，保持一致的边距和留白" code={sizeCode}>
        <div className={styles['title-demo-stack']}>
          <Title size="small">春季市集</Title>
          <Title size="medium">夏季庆典</Title>
          <Title size="large">秋日收获</Title>
        </div>
      </ComponentDemo>

      <ComponentDemo title="对齐方式" description="内容区支持左对齐，适合公告类标题" code={alignCode}>
        <Title align="left">工坊公告</Title>
      </ComponentDemo>

      <div className="component-page-api">
        <ApiTable data={titleApiData} />
      </div>
    </ComponentPage>
  )
}

export default StarTitleDemoPage
