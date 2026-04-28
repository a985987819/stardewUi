import { useState } from 'react'
import StarComponentPage from '../components/layout/ComponentPage'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarApiTable from '../components/layout/ApiTable'
import { StarNineSliceButton, StarPopup, type PopupPlacement } from '../components/ui'
import styles from './PopupDemo.module.scss'

const popupApiData = [
  { property: 'open', description: '是否显示弹窗（受控）', type: 'boolean', default: '-' },
  {
    property: 'placement',
    description: '弹出位置',
    type: "'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end'",
    default: "'right'",
  },
  {
    property: 'trigger',
    description: '触发方式',
    type: "'hover' | 'click'",
    default: "'hover'",
  },
  { property: 'title', description: '标题区域', type: 'ReactNode', default: '-' },
  { property: 'content', description: '内容区域', type: 'ReactNode', default: '-', required: true },
  { property: 'actions', description: '底部操作按钮', type: 'PopupAction[]', default: '-' },
  { property: 'offset', description: '与触发元素的间距', type: 'number', default: '12' },
  { property: 'children', description: '触发元素', type: 'ReactNode', default: '-', required: true },
]

const tocItems = [
  { id: 'hover', title: 'Hover 触发', level: 1 },
  { id: 'click', title: 'Click 触发', level: 1 },
  { id: 'all-placement', title: '全方位控制', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const rightPlacements: PopupPlacement[] = ['right-start', 'right', 'right-end']
const placementGroups = {
  top: ['top-start', 'top', 'top-end'],
  right: ['right-start', 'right', 'right-end'],
  bottom: ['bottom-start', 'bottom', 'bottom-end'],
  left: ['left-start', 'left', 'left-end'],
} satisfies Record<'top' | 'right' | 'bottom' | 'left', PopupPlacement[]>

const hoverCode = `<StarPopup
  placement="right-start"
  title="提示"
  content="默认 hover 触发，支持像素气泡箭头和多按钮操作。"
  actions={[
    { label: '取消' },
    { label: '确认', variant: 'primary' },
  ]}
>
  <StarNineSliceButton>right-start</StarNineSliceButton>
</StarPopup>`

const clickCode = `<StarPopup
  trigger="click"
  placement="bottom"
  title="点击触发"
  content="点击按钮切换显示，点击外部自动关闭。"
  actions={[{ label: '知道了' }]}
>
  <StarNineSliceButton variant="primary">点击我</StarNineSliceButton>
</StarPopup>`

const allPlacementCode = `const [placement, setPlacement] = useState<PopupPlacement>('right-start')

<StarPopup
  trigger="click"
  placement={placement}
  title="全方位控制"
  content="支持 top / right / bottom / left，以及 start / end 对齐。"
  actions={[
    { label: '取消' },
    { label: '禁用', disabled: true },
    { label: '确认', variant: 'primary' },
  ]}
>
  <StarNineSliceButton variant="primary">{placement}</StarNineSliceButton>
</StarPopup>`

function StarPopupDemoPage() {
  const [placement, setPlacement] = useState<PopupPlacement>('right-start')

  return (
    <StarComponentPage title="Popup 气泡弹窗" description="像素风气泡弹窗组件，支持 hover / click 触发、四向位置与 start/end 对齐控制。" toc={tocItems}>
      <StarComponentDemo id="hover" title="Hover 触发" description="默认 hover 触发，鼠标移入显示、移出隐藏。" code={hoverCode}>
        <div className={styles['popup-demo-stack']}>
          {rightPlacements.map((item) => (
            <StarPopup
              key={item}
              placement={item}
              title="提示"
              content="默认 hover 触发，支持像素气泡箭头和多按钮操作。"
              actions={[
                { label: '取消' },
                { label: '确认', variant: 'primary' },
              ]}
            >
              <StarNineSliceButton variant={item === 'right' ? 'primary' : 'default'}>{item}</StarNineSliceButton>
            </StarPopup>
          ))}
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="click" title="Click 触发" description='trigger="click" 时，点击切换显示，点击弹窗外部自动关闭。' code={clickCode}>
        <div className={styles['popup-demo-stack']}>
          <StarPopup
            trigger="click"
            placement="bottom"
            title="点击触发"
            content="点击按钮切换显示，点击外部自动关闭。"
            actions={[{ label: '知道了' }]}
          >
            <StarNineSliceButton variant="primary">点击我</StarNineSliceButton>
          </StarPopup>

          <StarPopup
            trigger="click"
            placement="right"
            title="操作确认"
            content="确定要执行此操作吗？"
            actions={[
              { label: '取消' },
              { label: '确认', variant: 'primary' },
            ]}
          >
            <StarNineSliceButton>删除</StarNineSliceButton>
          </StarPopup>
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="all-placement" title="全方位控制" description="按照参考图的四向布局排列所有 placement 控制按钮。" code={allPlacementCode}>
        <div className={styles['popup-demo-placement-map']}>
          <div className={`${styles['popup-demo-placement-row']} ${styles['popup-demo-placement-row--top']}`}>
            {placementGroups.top.map((item) => (
              <StarNineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className={styles['popup-demo-placement-btn']}
                onClick={() => setPlacement(item)}
              >
                {item}
              </StarNineSliceButton>
            ))}
          </div>

          <div className={`${styles['popup-demo-placement-column']} ${styles['popup-demo-placement-column--left']}`}>
            {placementGroups.left.map((item) => (
              <StarNineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className={styles['popup-demo-placement-btn']}
                onClick={() => setPlacement(item)}
              >
                {item}
              </StarNineSliceButton>
            ))}
          </div>

          <div className={styles['popup-demo-playground']}>
            <StarPopup
              trigger="click"
              placement={placement}
              title="位置控制"
              content="支持 top / right / bottom / left 以及 start / end 对齐。"
              actions={[
                { label: '取消' },
                { label: '禁用', disabled: true },
                { label: '确认', variant: 'primary' },
              ]}
            >
              <StarNineSliceButton variant="primary">{placement}</StarNineSliceButton>
            </StarPopup>
          </div>

          <div className={`${styles['popup-demo-placement-column']} ${styles['popup-demo-placement-column--right']}`}>
            {placementGroups.right.map((item) => (
              <StarNineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className={styles['popup-demo-placement-btn']}
                onClick={() => setPlacement(item)}
              >
                {item}
              </StarNineSliceButton>
            ))}
          </div>

          <div className={`${styles['popup-demo-placement-row']} ${styles['popup-demo-placement-row--bottom']}`}>
            {placementGroups.bottom.map((item) => (
              <StarNineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className={styles['popup-demo-placement-btn']}
                onClick={() => setPlacement(item)}
              >
                {item}
              </StarNineSliceButton>
            ))}
          </div>
        </div>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={popupApiData} />
      </div>
    </StarComponentPage >
  )
}

export default StarPopupDemoPage
