import { useState } from 'react'
import ComponentPage from '../components/layout/ComponentPage'
import ComponentDemo from '../components/layout/ComponentDemo'
import ApiTable from '../components/layout/ApiTable'
import Dialog from '../components/ui/Dialog'

const dialogApiData = [
  {
    property: 'open',
    description: '是否显示弹窗',
    type: 'boolean',
    default: 'false',
    required: true,
  },
  {
    property: 'title',
    description: '弹窗标题',
    type: 'string',
    default: '-',
  },
  {
    property: 'content',
    description: '弹窗内容，支持字符串数组分页',
    type: 'string | string[]',
    default: '-',
    required: true,
  },
  {
    property: 'image',
    description: '右侧角色图片 URL',
    type: 'string',
    default: '-',
  },
  {
    property: 'name',
    description: '右侧角色名称',
    type: 'string',
    default: '-',
  },
  {
    property: 'actions',
    description: '操作按钮，传 null 隐藏按钮',
    type: 'DialogAction[] | null',
    default: '[确认, 取消]',
  },
  {
    property: 'maskClosable',
    description: '点击遮罩层是否关闭',
    type: 'boolean',
    default: 'true',
  },
  {
    property: 'typewriter',
    description: '是否启用打字机效果',
    type: 'boolean',
    default: 'true',
  },
  {
    property: 'typewriterSpeed',
    description: '打字机速度（毫秒/字符）',
    type: 'number',
    default: '30',
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
  { id: 'pagination', title: '分页对话', level: 1 },
  { id: 'custom-actions', title: '自定义按钮', level: 1 },
  { id: 'no-actions', title: '无操作按钮', level: 1 },
  { id: 'no-typewriter', title: '禁用打字机', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const basicCode = `const [open, setOpen] = useState(false)

<Dialog
  open={open}
  title="欢迎来到星露谷"
  content="你好，我是新来的农夫！这里真是个美丽的地方。"
  image="/avatar.png"
  name="农夫"
  onClose={() => setOpen(false)}
/>`

const paginationCode = `const [open, setOpen] = useState(false)

<Dialog
  open={open}
  title="任务对话"
  content={[
    "你好！我是村里的铁匠。",
    "我听说你在农场工作得很努力。",
    "如果你需要升级工具，可以来找我！",
  ]}
  image="/avatar.png"
  name="克林特"
  onClose={() => setOpen(false)}
/>`

const customActionsCode = `const [open, setOpen] = useState(false)

<Dialog
  open={open}
  title="确认操作"
  content="你确定要出售这个物品吗？此操作不可撤销。"
  actions={[
    { label: '出售', variant: 'danger', onClick: handleSell },
    { label: '保留', variant: 'default', onClick: () => setOpen(false) },
  ]}
  onClose={() => setOpen(false)}
/>`

const noActionsCode = `const [open, setOpen] = useState(false)

<Dialog
  open={open}
  title="提示"
  content="这是一个纯提示弹窗，没有操作按钮。"
  actions={null}
  maskClosable={true}
  onClose={() => setOpen(false)}
/>`

const noTypewriterCode = `const [open, setOpen] = useState(false)

<Dialog
  open={open}
  title="无打字机效果"
  content="这段文字会直接显示，没有打字机动画效果。"
  typewriter={false}
  onClose={() => setOpen(false)}
/>`

function DialogDemo() {
  const [basicOpen, setBasicOpen] = useState(false)
  const [paginationOpen, setPaginationOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [noActionOpen, setNoActionOpen] = useState(false)
  const [noTypewriterOpen, setNoTypewriterOpen] = useState(false)

  const handleSell = () => {
    alert('物品已出售！')
    setCustomOpen(false)
  }

  return (
    <ComponentPage
      title="Dialog 弹窗"
      description="星露谷风格的对话弹窗组件，支持分页内容和打字机效果。"
      toc={tocItems}
    >
      <ComponentDemo id="basic" title="基础用法" description="最简单的弹窗用法，带打字机效果" code={basicCode}>
        <button className="demo-button demo-button-primary" onClick={() => setBasicOpen(true)}>
          打开基础弹窗
        </button>
        <Dialog
          open={basicOpen}
          title="欢迎来到星露谷"
          content="你好，我是新来的农夫！这里真是个美丽的地方。点击文字可以快速显示全部内容。"
          image="https://stardewvalleywiki.com/mediawiki/images/2/28/Abigail.png"
          name="农夫"
          onClose={() => setBasicOpen(false)}
        />
      </ComponentDemo>

      <ComponentDemo id="pagination" title="分页对话" description="支持多页内容，按箭头切换" code={paginationCode}>
        <button className="demo-button demo-button-primary" onClick={() => setPaginationOpen(true)}>
          打开分页弹窗
        </button>
        <Dialog
          open={paginationOpen}
          title="任务对话"
          content={[
            '你好！我是村里的铁匠克林特。',
            '我听说你在农场工作得很努力，这很不错！',
            '如果你需要升级工具，随时可以来找我！我会给你优惠的。',
          ]}
          image="https://stardewvalleywiki.com/mediawiki/images/6/6e/Clint.png"
          name="克林特"
          onClose={() => setPaginationOpen(false)}
        />
      </ComponentDemo>

      <ComponentDemo id="custom-actions" title="自定义按钮" description="自定义操作按钮和样式" code={customActionsCode}>
        <button className="demo-button demo-button-primary" onClick={() => setCustomOpen(true)}>
          打开自定义按钮弹窗
        </button>
        <Dialog
          open={customOpen}
          title="确认操作"
          content="你确定要出售这个物品吗？此操作不可撤销。"
          image="https://stardewvalleywiki.com/mediawiki/images/5/52/Pierre.png"
          name="皮埃尔"
          actions={[
            { label: '出售', variant: 'danger', onClick: handleSell },
            { label: '保留', variant: 'default', onClick: () => setCustomOpen(false) },
          ]}
          onClose={() => setCustomOpen(false)}
        />
      </ComponentDemo>

      <ComponentDemo id="no-actions" title="无操作按钮" description="隐藏操作按钮，仅用于展示信息" code={noActionsCode}>
        <button className="demo-button demo-button-primary" onClick={() => setNoActionOpen(true)}>
          打开无按钮弹窗
        </button>
        <Dialog
          open={noActionOpen}
          title="提示"
          content="这是一个纯提示弹窗，没有操作按钮。点击遮罩层或按 ESC 关闭。"
          image="https://stardewvalleywiki.com/mediawiki/images/8/8e/Marnie.png"
          name="玛妮"
          actions={null}
          maskClosable={true}
          onClose={() => setNoActionOpen(false)}
        />
      </ComponentDemo>

      <ComponentDemo id="no-typewriter" title="禁用打字机" description="直接显示内容，无打字动画" code={noTypewriterCode}>
        <button className="demo-button demo-button-primary" onClick={() => setNoTypewriterOpen(true)}>
          打开无打字机弹窗
        </button>
        <Dialog
          open={noTypewriterOpen}
          title="无打字机效果"
          content="这段文字会直接显示，没有打字机动画效果。适用于需要快速展示内容的场景。"
          onClose={() => setNoTypewriterOpen(false)}
          typewriter={false}
        />
      </ComponentDemo>

      <div id="api" className="component-page-api">
        <ApiTable data={dialogApiData} />
      </div>
    </ComponentPage>
  )
}

export default DialogDemo
