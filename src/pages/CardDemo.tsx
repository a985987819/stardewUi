import StarComponentPage from '../components/layout/ComponentPage'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarApiTable from '../components/layout/ApiTable'
import { StarNineSliceButton } from '../components/ui'
import { StarCard, type CardColor } from '../components/ui/Card'

const cardApiData = [
  { property: 'title', description: '卡片标题内容', type: 'ReactNode', default: '-' },
  { property: 'showTitle', description: '是否显示标题区', type: 'boolean', default: 'false' },
  { property: 'variant', description: '卡片变体类型', type: "'default' | 'outlined' | 'elevated'", default: "'default'" },
  { property: 'size', description: '卡片尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
  { property: 'color', description: '卡片配色主题', type: 'CardColor', default: '-' },
  { property: 'headerExtra', description: '标题区右侧扩展内容', type: 'ReactNode', default: '-' },
  { property: 'footer', description: '底部操作区', type: 'ReactNode', default: '-' },
  { property: 'hoverable', description: '是否启用悬停效果', type: 'boolean', default: 'false' },
  { property: 'children', description: '卡片内容', type: 'ReactNode', default: '-', required: true },
]

const colorOptions: Array<{ value: CardColor; label: string; desc: string }> = [
  { value: 'night-village', label: '夜晚村庄', desc: '深紫灰 + 米黄' },
  { value: 'forest-farm', label: '森林农田', desc: '森林绿 + 浅米白' },
  { value: 'wooden-cabin', label: '木屋农舍', desc: '棕橙 + 浅杏色' },
  { value: 'lake-night', label: '湖畔夜色', desc: '湖蓝 + 浅青白' },
  { value: 'flower-festival', label: '花田节日', desc: '粉紫 + 浅粉白' },
  { value: 'mine-starry', label: '矿洞星夜', desc: '靛蓝 + 冷白' },
  { value: 'farmland', label: '耕地收获', desc: '泥棕 + 奶油白' },
  { value: 'orchard-grass', label: '果园草地', desc: '草绿 + 浅青绿' },
  { value: 'workshop-ore', label: '工坊矿石', desc: '铁蓝 + 亮黄' },
  { value: 'night-celebration', label: '节庆夜空', desc: '宝蓝 + 淡紫白' },
]

const tocItems = [
  { id: 'basic', title: '基础用法', level: 1 },
  { id: 'title', title: '可选标题', level: 1 },
  { id: 'variant', title: '卡片变体', level: 1 },
  { id: 'color', title: '配色主题', level: 1 },
  { id: 'hoverable', title: '悬停效果', level: 1 },
  { id: 'size', title: '卡片尺寸', level: 1 },
  { id: 'footer', title: '底部操作', level: 1 },
  { id: 'meta', title: '元信息', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const basicCode = `<StarCard>
  默认是不带标题区的纯内容卡片
</StarCard>`

const titleCode = `<StarCard title="默认卡片" showTitle>
  标题会显示在卡片左上角的标签区域。
</StarCard>`

const variantCode = `<StarCard variant="default" title="默认卡片" showTitle>
  带有阴影效果的默认卡片
</StarCard>

<StarCard variant="outlined" title="描边卡片" showTitle>
  只有边框，没有明显阴影的卡片
</StarCard>

<StarCard variant="elevated" title="悬浮卡片" showTitle>
  带有更强浮起感的卡片
</StarCard>`

const hoverableCode = `<StarCard hoverable title="可悬停卡片" showTitle>
  鼠标悬停时会出现轻微抬起效果。
</StarCard>`

const withFooterCode = `<StarCard
  title="底部操作"
  showTitle
  footer={
    <div style={{ display: 'flex', gap: '8px' }}>
      <StarNineSliceButton>取消</StarNineSliceButton>
      <StarNineSliceButton variant="primary">确认</StarNineSliceButton>
    </div>
  }
>
  卡片可以同时承载操作区和内容区。
</StarCard>`

const sizeCode = `<StarCard size="small" title="小卡片" showTitle>
  小尺寸卡片
</StarCard>

<StarCard size="medium" title="中卡片" showTitle>
  中尺寸卡片
</StarCard>

<StarCard size="large" title="大卡片" showTitle>
  大尺寸卡片
</StarCard>`

const colorCode = `<StarCard color="night-village" title="夜晚村庄" showTitle>
  深紫灰色调卡片
</StarCard>

<StarCard color="forest-farm" title="森林农田" showTitle>
  森林绿配色卡片
</StarCard>`

const metaCode = `<StarCard>
  <StarCard.Meta
    title="元信息标题"
    description="用于展示结构化说明内容。"
  />
</StarCard>`

function StarCardDemoPage() {
  return (
    <StarComponentPage
      title="Card 卡片"
      description="星露谷风格卡片组件，支持标题区、交互状态和多种配色方案。"
      toc={tocItems}
    >
      <StarComponentDemo id="basic" title="基础用法" description="默认卡片不带标题区，只展示内容区域。" code={basicCode}>
        <StarCard>默认是不带标题区的纯内容卡片。</StarCard>
      </StarComponentDemo>

      <StarComponentDemo id="title" title="可选标题" description="通过 showTitle 打开标题区，标题显示在卡片左上角标签位。" code={titleCode}>
        <StarCard title="默认卡片" showTitle>
          标题会显示在卡片左上角的标签区域。
        </StarCard>
      </StarComponentDemo>

      <StarComponentDemo id="variant" title="卡片变体" description="默认、描边和悬浮三种卡片风格。" code={variantCode}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <StarCard variant="default" title="默认卡片" showTitle style={{ flex: 1, minWidth: '220px' }}>
            带有像素阴影效果的默认卡片。
          </StarCard>
          <StarCard variant="outlined" title="描边卡片" showTitle style={{ flex: 1, minWidth: '220px' }}>
            只有边框，没有明显阴影的卡片。
          </StarCard>
          <StarCard variant="elevated" title="悬浮卡片" showTitle style={{ flex: 1, minWidth: '220px' }}>
            带有更强浮起感的卡片。
          </StarCard>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="color" title="配色主题" description="不同主题颜色会同步影响卡片背景、边框和标题标签。" code={colorCode}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {colorOptions.map((option) => (
            <StarCard key={option.value} color={option.value} size="small" showTitle title={option.label}>
              <div style={{ textAlign: 'center', padding: '6px 0' }}>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>{option.desc}</div>
              </div>
            </StarCard>
          ))}
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="hoverable" title="悬停效果" description="hoverable 会让卡片在鼠标悬停时轻微抬起。" code={hoverableCode}>
        <StarCard hoverable title="可悬停卡片" showTitle>
          鼠标悬停时会有轻微的抬起动画效果，点击时会有按压反馈。
        </StarCard>
      </StarComponentDemo>

      <StarComponentDemo id="size" title="卡片尺寸" description="提供 small、medium、large 三种字号尺寸。" code={sizeCode}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <StarCard size="small" title="小卡片" showTitle style={{ flex: 1, minWidth: '160px' }}>
            小尺寸卡片。
          </StarCard>
          <StarCard size="medium" title="中卡片" showTitle style={{ flex: 1, minWidth: '180px' }}>
            中尺寸卡片。
          </StarCard>
          <StarCard size="large" title="大卡片" showTitle style={{ flex: 1, minWidth: '220px' }}>
            大尺寸卡片。
          </StarCard>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="footer" title="底部操作" description="卡片可承载底部操作区域。" code={withFooterCode}>
        <StarCard
          title="底部操作"
          showTitle
          footer={
            <div style={{ display: 'flex', gap: '8px' }}>
              <StarNineSliceButton>取消</StarNineSliceButton>
              <StarNineSliceButton variant="primary">确认</StarNineSliceButton>
            </div>
          }
        >
          卡片可以同时承载说明内容和操作按钮。
        </StarCard>
      </StarComponentDemo>

      <StarComponentDemo id="meta" title="元信息" description="使用 StarCard.Meta 展示结构化信息块。" code={metaCode}>
        <StarCard>
          <StarCard.Meta title="元信息标题" description="用于展示结构化说明内容。" />
        </StarCard>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={cardApiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarCardDemoPage
