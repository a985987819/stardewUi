import StarComponentPage from '../components/layout/ComponentPage'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarApiTable from '../components/layout/ApiTable'
import { StarCard, StarEmptyState } from '../components/ui'

const emptyStateApiData = [
  { property: 'imageSrc', description: '空状态图片地址', type: 'string', default: "'/noData.png'" },
  { property: 'imageAlt', description: '图片替代文本', type: 'string', default: "'暂无数据'" },
  { property: 'message', description: '提示文案内容', type: 'ReactNode', default: "'没有更多数据了'" },
  { property: 'showImage', description: '是否显示背景图片', type: 'boolean', default: 'true' },
  { property: 'showMessage', description: '是否显示提示文案', type: 'boolean', default: 'true' },
  { property: 'direction', description: '排列方向', type: "'vertical' | 'horizontal'", default: "'vertical'" },
]

const tocItems = [
  { id: 'basic', title: '基础用法', level: 1 },
  { id: 'horizontal', title: '横向布局', level: 1 },
  { id: 'visibility', title: '显示控制', level: 1 },
  { id: 'custom', title: '自定义内容', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const basicCode = `<StarEmptyState />`

const horizontalCode = `<StarEmptyState
  direction="horizontal"
  message="当前筛选条件下没有找到内容"
/>`

const visibilityCode = `<StarEmptyState showImage={false} message="暂无消息通知" />

<StarEmptyState showMessage={false} />`

const customCode = `<StarEmptyState
  imageSrc="/noData.png"
  imageAlt="空购物车"
  message="购物车还是空的，去挑点喜欢的物品吧。"
/>`

function StarEmptyStateDemoPage() {
  return (
    <StarComponentPage
      title="EmptyState 空状态"
      description="用于列表、搜索结果和占位区域的空状态组件，支持默认图片、文案开关以及横向和纵向布局。"
      toc={tocItems}
    >
      <StarComponentDemo id="basic" title="基础用法" description="默认使用 public/noData.png 和提示文案。" code={basicCode}>
        <StarCard style={{ width: '100%', maxWidth: '420px' }}>
          <StarEmptyState />
        </StarCard>
      </StarComponentDemo>

      <StarComponentDemo id="horizontal" title="横向布局" description="适合表格筛选、搜索结果等更扁平的内容区域。" code={horizontalCode}>
        <StarCard style={{ width: '100%', maxWidth: '560px' }}>
          <StarEmptyState direction="horizontal" message="当前筛选条件下没有找到内容" />
        </StarCard>
      </StarComponentDemo>

      <StarComponentDemo id="visibility" title="显示控制" description="可以单独隐藏图片或提示语，适配不同业务区域。" code={visibilityCode}>
        <div style={{ display: 'grid', width: '100%', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <StarCard>
            <StarEmptyState showImage={false} message="暂无消息通知" />
          </StarCard>
          <StarCard>
            <StarEmptyState showMessage={false} />
          </StarCard>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="custom" title="自定义内容" description="可以替换图片、替代文本和文案内容。" code={customCode}>
        <StarCard style={{ width: '100%', maxWidth: '500px' }}>
          <StarEmptyState imageAlt="空购物车" message="购物车还是空的，去挑点喜欢的物品吧。" />
        </StarCard>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={emptyStateApiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarEmptyStateDemoPage
