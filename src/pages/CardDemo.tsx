import ComponentPage from '../components/layout/ComponentPage'
import ComponentDemo from '../components/layout/ComponentDemo'
import ApiTable from '../components/layout/ApiTable'
import { Card } from '../components/ui/Card'

const cardApiData = [
  {
    property: 'title',
    description: '卡片标题',
    type: 'string',
    default: '-',
  },
  {
    property: 'variant',
    description: '卡片变体类型',
    type: "'default' | 'outlined' | 'elevated'",
    default: "'default'",
  },
  {
    property: 'size',
    description: '卡片尺寸',
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
  },
  {
    property: 'hoverable',
    description: '是否显示悬停效果',
    type: 'boolean',
    default: 'false',
  },
  {
    property: 'headerExtra',
    description: '标题栏额外内容',
    type: 'ReactNode',
    default: '-',
  },
  {
    property: 'footer',
    description: '卡片底部内容',
    type: 'ReactNode',
    default: '-',
  },
  {
    property: 'onClick',
    description: '点击事件回调',
    type: '() => void',
    default: '-',
  },
  {
    property: 'children',
    description: '卡片内容',
    type: 'ReactNode',
    default: '-',
    required: true,
  },
]

const basicCode = `<Card title="基础卡片">
  这是一个基础的星露谷风格卡片组件。
</Card>`

const variantCode = `<Card variant="default" title="默认卡片">
  带有像素阴影效果的默认卡片
</Card>

<Card variant="outlined" title="描边卡片">
  只有边框，没有阴影的卡片
</Card>

<Card variant="elevated" title="悬浮卡片">
  带有更大阴影的悬浮效果卡片
</Card>`

const hoverableCode = `<Card hoverable title="可悬停卡片">
  鼠标悬停时会有动画效果
</Card>`

const withFooterCode = `<Card 
  title="带底部卡片" 
  footer={
    <div style={{ display: 'flex', gap: '8px' }}>
      <button className="stardew-btn">取消</button>
      <button className="stardew-btn stardew-btn--primary">确认</button>
    </div>
  }
>
  这是一个带有底部操作区域的卡片
</Card>`

const sizeCode = `<Card size="small" title="小卡片">
  小尺寸卡片
</Card>

<Card size="medium" title="中等卡片">
  中等尺寸卡片
</Card>

<Card size="large" title="大卡片">
  大尺寸卡片
</Card>`

const metaCode = `<Card>
  <Card.Meta 
    title="卡片元信息" 
    description="这是卡片的描述内容，可以包含更多详细信息。"
  />
</Card>`

function CardDemo() {
  return (
    <ComponentPage
      title="Card 卡片"
      description="星露谷风格的卡片组件，用于展示信息和内容分组。"
    >
      <ComponentDemo title="基础用法" description="最简单的卡片用法" code={basicCode}>
        <Card title="基础卡片">
          这是一个基础的星露谷风格卡片组件。
        </Card>
      </ComponentDemo>

      <ComponentDemo title="卡片变体" description="提供三种不同风格的卡片" code={variantCode}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Card variant="default" title="默认卡片" style={{ flex: 1, minWidth: '200px' }}>
            带有像素阴影效果的默认卡片
          </Card>
          <Card variant="outlined" title="描边卡片" style={{ flex: 1, minWidth: '200px' }}>
            只有边框，没有阴影的卡片
          </Card>
          <Card variant="elevated" title="悬浮卡片" style={{ flex: 1, minWidth: '200px' }}>
            带有更大阴影的悬浮效果卡片
          </Card>
        </div>
      </ComponentDemo>

      <ComponentDemo title="悬停效果" description="鼠标悬停时的动画效果" code={hoverableCode}>
        <Card hoverable title="可悬停卡片">
          鼠标悬停时会有动画效果，点击时会有按压效果。
        </Card>
      </ComponentDemo>

      <ComponentDemo title="卡片尺寸" description="不同尺寸的卡片" code={sizeCode}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Card size="small" title="小卡片" style={{ flex: 1, minWidth: '150px' }}>
            小尺寸卡片
          </Card>
          <Card size="medium" title="中等卡片" style={{ flex: 1, minWidth: '150px' }}>
            中等尺寸卡片
          </Card>
          <Card size="large" title="大卡片" style={{ flex: 1, minWidth: '150px' }}>
            大尺寸卡片
          </Card>
        </div>
      </ComponentDemo>

      <ComponentDemo title="带底部操作" description="卡片可以包含底部操作区域" code={withFooterCode}>
        <Card 
          title="带底部卡片" 
          footer={
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="stardew-btn">取消</button>
              <button className="stardew-btn stardew-btn--primary">确认</button>
            </div>
          }
        >
          这是一个带有底部操作区域的卡片，可以放置按钮等操作元素。
        </Card>
      </ComponentDemo>

      <ComponentDemo title="元信息" description="使用 Card.Meta 显示结构化信息" code={metaCode}>
        <Card>
          <Card.Meta 
            title="卡片元信息" 
            description="这是卡片的描述内容，可以包含更多详细信息。"
          />
        </Card>
      </ComponentDemo>

      <div className="component-page-api">
        <ApiTable data={cardApiData} />
      </div>
    </ComponentPage>
  )
}

export default CardDemo
