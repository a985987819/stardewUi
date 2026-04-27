import { useState } from 'react'
import StarComponentPage from '../components/layout/ComponentPage'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarApiTable from '../components/layout/ApiTable'
import { StarNineSliceButton, StarPopup, type PopupPlacement } from '../components/ui'
import styles from './PopupDemo.module.scss'

const popupApiData = [
  { property: 'open', description: '是否显示弹窗', type: 'boolean', default: 'true' },
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

const rightPlacements: PopupPlacement[] = ['right-start', 'right', 'right-end']
const placementGroups = {
  top: ['top-start', 'top', 'top-end'],
  right: ['right-start', 'right', 'right-end'],
  bottom: ['bottom-start', 'bottom', 'bottom-end'],
  left: ['left-start', 'left', 'left-end'],
} satisfies Record<'top' | 'right' | 'bottom' | 'left', PopupPlacement[]>

const rightPlacementCode = `<StarPopup
  open
  placement="right-start"
  title="提示"
  content="支持像素气泡箭头和多按钮操作。"
  actions={[
    { label: '取消' },
    { label: '确认', variant: 'primary' },
  ]}
>
  <StarNineSliceButton>right-start</StarNineSliceButton>
</StarPopup>`

const allPlacementCode = `const [placement, setPlacement] = useState<PopupPlacement>('right-start')

<StarPopup
  open
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
    <StarComponentPage title="Popup 气泡弹窗" description="像素风气泡弹窗组件，支持四向位置与 start/end 对齐控制。">
      <StarComponentDemo title="右侧弹窗" description="右侧三种对齐方式的基础示例。" code={rightPlacementCode}>
        <div className={styles['popup-demo-stack']}>
          {rightPlacements.map((item) => (
            <StarPopup
              key={item}
              open
              placement={item}
              title="提示"
              content="支持像素气泡箭头和多按钮操作。"
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

      <StarComponentDemo title="全方位控制" description="按照参考图的四向布局排列所有 placement 控制按钮。" code={allPlacementCode}>
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
              open
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

      <div className="component-page-api">
        <StarApiTable data={popupApiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarPopupDemoPage
