import { useState } from 'react'
import ComponentPage from '../components/layout/ComponentPage'
import ComponentDemo from '../components/layout/ComponentDemo'
import ApiTable from '../components/layout/ApiTable'
import { NineSliceButton, Popup, type PopupPlacement } from '../components/ui'
import './PopupDemo.css'

const popupApiData = [
  { property: 'open', description: '是否显示气泡', type: 'boolean', default: 'true' },
  {
    property: 'placement',
    description: '弹出位置',
    type: "'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end'",
    default: "'right'",
  },
  { property: 'title', description: '标题区域', type: 'ReactNode', default: '-' },
  { property: 'content', description: '内容区域', type: 'ReactNode', default: '-', required: true },
  { property: 'actions', description: '底部操作按钮', type: 'PopupAction[]', default: '-' },
  { property: 'offset', description: '与触发元素的间距', type: 'number', default: '12' },
  { property: 'children', description: '触发元素', type: 'ReactNode', default: '-', required: true },
]

const placements: PopupPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'right-start',
  'right',
  'right-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
]

const rightPlacementCode = `<Popup
  open
  placement="right-start"
  title="提示"
  content="支持像素气泡箭头与动作按钮"
  actions={[
    { label: 'No' },
    { label: 'Yes', variant: 'primary' },
  ]}
>
  <NineSliceButton>right-start</NineSliceButton>
</Popup>`

const allPlacementCode = `const [placement, setPlacement] = useState<PopupPlacement>('right-start')

<Popup
  open
  placement={placement}
  title="全方向控制"
  content="支持 top / right / bottom / left，以及 start / end 对齐。"
>
  <NineSliceButton variant="primary">{placement}</NineSliceButton>
</Popup>`

function PopupDemo() {
  const [placement, setPlacement] = useState<PopupPlacement>('right-start')

  return (
    <ComponentPage title="Popup 气泡弹窗" description="像素风气泡弹窗组件，支持上下左右及 start/end 对齐控制。">
      <ComponentDemo
        title="右侧弹窗"
        description="效果接近参考图中的右侧对话框，包含 start / center / end 三种对齐。"
        code={rightPlacementCode}
      >
        <div className="popup-demo-stack">
          {(['right-start', 'right', 'right-end'] as PopupPlacement[]).map((item) => (
            <Popup
              key={item}
              open
              placement={item}
              title="?"
              content="Right placement prompts info"
              actions={[
                { label: 'No' },
                { label: 'Yes', variant: 'primary' },
              ]}
            >
              <NineSliceButton variant={item === 'right' ? 'primary' : 'default'}>{item}</NineSliceButton>
            </Popup>
          ))}
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="全方向控制"
        description="通过 placement 切换所有方向与对齐方式。"
        code={allPlacementCode}
      >
        <div className="popup-demo-control-panel">
          {placements.map((item) => (
            <button
              key={item}
              type="button"
              className={`popup-demo-placement-btn ${item === placement ? 'is-active' : ''}`}
              onClick={() => setPlacement(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="popup-demo-playground">
          <Popup
            open
            placement={placement}
            title="位置控制"
            content="支持 top / right / bottom / left 以及 start / end 对齐。"
            actions={[
              { label: '取消' },
              { label: '确认', variant: 'primary' },
            ]}
          >
            <NineSliceButton variant="primary">{placement}</NineSliceButton>
          </Popup>
        </div>
      </ComponentDemo>

      <div className="component-page-api">
        <ApiTable data={popupApiData} />
      </div>
    </ComponentPage>
  )
}

export default PopupDemo
