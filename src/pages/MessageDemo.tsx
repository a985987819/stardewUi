import StarComponentPage from '../components/layout/ComponentPage'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarApiTable from '../components/layout/ApiTable'
import { StarNineSliceButton } from '../components/ui'
import { message } from '../components/ui/Message'

const messageApiData = [
  { property: 'content', description: '提示内容', type: 'string', default: '-', required: true },
  { property: 'type', description: '提示类型', type: "'normal' | 'info' | 'success' | 'warning' | 'error'", default: "'normal'" },
  { property: 'position', description: '消息显示位置', type: "'top' | 'bottom-left' | 'bottom-right'", default: "'top'" },
  { property: 'bottom', description: '旧版底部定位别名，兼容保留', type: "'left' | 'right'", default: '-' },
  { property: 'duration', description: '自动关闭时间，0 表示不自动关闭', type: 'number', default: '3000' },
  { property: 'onClose', description: '关闭回调', type: '() => void', default: '-' },
]

const tocItems = [
  { id: 'basic', title: '基础用法', level: 1 },
  { id: 'duration', title: '持续时间', level: 1 },
  { id: 'position', title: '显示位置', level: 1 },
  { id: 'config', title: '配置对象', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const basicCode = `import { message } from '../components/ui/Message'

message.normal('这是一条普通提示')
message.info('这是一条信息提示')
message.success('操作成功')
message.warning('请注意检查')
message.error('操作失败')`

const durationCode = `message.success('默认 3 秒关闭')
message.success('5 秒后关闭', 5000)
message.info('不自动关闭', 0)`

const positionCode = `message.success('顶部居中（默认）')
message.success('左下角显示', { position: 'bottom-left' })
message.success('右下角显示', { position: 'bottom-right' })`

const configCode = `message({
  content: '使用配置对象',
  type: 'success',
  position: 'bottom-right',
  duration: 5000,
  onClose: () => console.log('关闭了'),
})`

function StarMessageDemoPage() {
  const showNormal = () => message.normal('这是一条普通提示')
  const showInfo = () => message.info('这是一条信息提示')
  const showSuccess = () => message.success('操作成功')
  const showWarning = () => message.warning('请注意检查')
  const showError = () => message.error('操作失败，请重试')
  const showLong = () => message.success('这条消息 5 秒后关闭', 5000)
  const showPersistent = () => message.info('这条消息不会自动关闭，需要手动关闭', 0)
  const showTop = () => message.success('顶部居中（默认）')
  const showBottomLeft = () => message.success('左下角显示', { position: 'bottom-left' })
  const showBottomRight = () => message.success('右下角显示', { position: 'bottom-right' })

  return (
    <StarComponentPage
      title="Message 消息提示"
      description="星露谷风格的全局消息提示组件，用于展示操作反馈信息。"
      toc={tocItems}
    >
      <StarComponentDemo id="basic" title="基础用法" description="五种不同类型的消息提示。" code={basicCode}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <StarNineSliceButton onClick={showNormal}>普通提示</StarNineSliceButton>
          <StarNineSliceButton onClick={showInfo}>信息提示</StarNineSliceButton>
          <StarNineSliceButton onClick={showSuccess}>成功提示</StarNineSliceButton>
          <StarNineSliceButton onClick={showWarning}>警告提示</StarNineSliceButton>
          <StarNineSliceButton onClick={showError}>错误提示</StarNineSliceButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="duration" title="持续时间" description="设置消息显示的持续时间。" code={durationCode}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <StarNineSliceButton variant="primary" onClick={showSuccess}>
            默认 3 秒
          </StarNineSliceButton>
          <StarNineSliceButton variant="primary" onClick={showLong}>
            5 秒关闭
          </StarNineSliceButton>
          <StarNineSliceButton variant="primary" onClick={showPersistent}>
            不自动关闭
          </StarNineSliceButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="position" title="显示位置" description="通过 `position` 指定消息出现的位置。" code={positionCode}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <StarNineSliceButton variant="primary" onClick={showTop}>
            顶部居中
          </StarNineSliceButton>
          <StarNineSliceButton variant="primary" onClick={showBottomLeft}>
            左下角
          </StarNineSliceButton>
          <StarNineSliceButton variant="primary" onClick={showBottomRight}>
            右下角
          </StarNineSliceButton>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="config" title="配置对象" description="使用配置对象方式调用，也支持位置配置。" code={configCode}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <StarNineSliceButton
            variant="primary"
            onClick={() =>
              message({
                content: '使用配置对象的消息',
                type: 'success',
                position: 'bottom-right',
                duration: 3000,
              })
            }
          >
            配置对象调用
          </StarNineSliceButton>
        </div>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={messageApiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarMessageDemoPage
