import ComponentPage from '../components/layout/ComponentPage'
import ComponentDemo from '../components/layout/ComponentDemo'
import ApiTable from '../components/layout/ApiTable'
import { message } from '../components/ui/Message'

const messageApiData = [
  {
    property: 'content',
    description: '提示内容',
    type: 'string',
    default: '-',
    required: true,
  },
  {
    property: 'type',
    description: '提示类型',
    type: "'normal' | 'info' | 'success' | 'warning' | 'error'",
    default: "'normal'",
  },
  {
    property: 'duration',
    description: '自动关闭时间（毫秒），0表示不自动关闭',
    type: 'number',
    default: '3000',
  },
  {
    property: 'onClose',
    description: '关闭回调',
    type: '() => void',
    default: '-',
  },
]

const tocItems = [
  { id: 'basic', title: '基础用法', level: 1 },
  { id: 'duration', title: '持续时间', level: 1 },
  { id: 'config', title: '配置对象', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const basicCode = `import { message } from '../components/ui/Message'

// 普通提示
message.normal('这是一条普通提示')

// 信息提示
message.info('这是一条信息提示')

// 成功提示
message.success('操作成功！')

// 警告提示
message.warning('请注意！')

// 错误提示
message.error('操作失败！')`

const durationCode = `// 3秒后自动关闭（默认）
message.success('默认3秒关闭')

// 5秒后自动关闭
message.success('5秒后关闭', 5000)

// 不自动关闭，需要手动点击关闭
message.info('不自动关闭', 0)`

const configCode = `// 使用配置对象
message({
  content: '自定义配置',
  type: 'success',
  duration: 5000,
  onClose: () => console.log('关闭了')
})`

function MessageDemo() {
  const showNormal = () => message.normal('这是一条普通提示')
  const showInfo = () => message.info('这是一条信息提示')
  const showSuccess = () => message.success('操作成功！')
  const showWarning = () => message.warning('请注意检查！')
  const showError = () => message.error('操作失败，请重试！')
  const showLong = () => message.success('这条消息5秒后关闭', 5000)
  const showPersistent = () => message.info('这条消息不会自动关闭，需要手动关闭', 0)

  return (
    <ComponentPage
      title="Message 消息提示"
      description="星露谷风格的消息提示组件，用于全局展示操作反馈信息。"
      toc={tocItems}
    >
      <ComponentDemo id="basic" title="基础用法" description="五种不同类型的消息提示" code={basicCode}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="demo-button" onClick={showNormal}>
            普通提示
          </button>
          <button className="demo-button" style={{ background: '#E0F7FA', color: '#2E4057' }} onClick={showInfo}>
            信息提示
          </button>
          <button className="demo-button" style={{ background: '#E6F2D9', color: '#2F5233' }} onClick={showSuccess}>
            成功提示
          </button>
          <button className="demo-button" style={{ background: '#FFF2D5', color: '#6B4226' }} onClick={showWarning}>
            警告提示
          </button>
          <button className="demo-button" style={{ background: '#FFD1E3', color: '#5C3A57' }} onClick={showError}>
            错误提示
          </button>
        </div>
      </ComponentDemo>

      <ComponentDemo id="duration" title="持续时间" description="设置消息显示的持续时间" code={durationCode}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="demo-button demo-button-primary" onClick={showSuccess}>
            默认3秒
          </button>
          <button className="demo-button demo-button-primary" onClick={showLong}>
            5秒关闭
          </button>
          <button className="demo-button demo-button-primary" onClick={showPersistent}>
            不自动关闭
          </button>
        </div>
      </ComponentDemo>

      <ComponentDemo id="config" title="配置对象" description="使用配置对象方式调用" code={configCode}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="demo-button demo-button-primary"
            onClick={() =>
              message({
                content: '使用配置对象的消息',
                type: 'success',
                duration: 3000,
              })
            }
          >
            配置对象调用
          </button>
        </div>
      </ComponentDemo>

      <div id="api" className="component-page-api">
        <ApiTable data={messageApiData} />
      </div>
    </ComponentPage>
  )
}

export default MessageDemo
