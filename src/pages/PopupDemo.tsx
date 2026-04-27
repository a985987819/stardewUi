import { useState } from 'react'
import ComponentPage from '../components/layout/ComponentPage'
import ComponentDemo from '../components/layout/ComponentDemo'
import ApiTable from '../components/layout/ApiTable'
import { NineSliceButton, Popup, type PopupPlacement } from '../components/ui'
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

const rightPlacementCode = `<Popup
  open
  placement="right-start"
  title="提示"
  content="支持像素气泡箭头和多按钮操作。"
  actions={[
    { label: '取消' },
    { label: '确认', variant: 'primary' },
  ]}
>
  <NineSliceButton>right-start</NineSliceButton>
</Popup>`

const allPlacementCode = `const [placement, setPlacement] = useState<PopupPlacement>('right-start')

<Popup
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
  <NineSliceButton variant="primary">{placement}</NineSliceButton>
</Popup>`

function StarPopupDemoPage() {
  const [placement, setPlacement] = useState<PopupPlacement>('right-start')

  return (
    <ComponentPage title="Popup 气泡弹窗" description="像素风气泡弹窗组件，支持四向位置与 start/end 对齐控制。">
      <ComponentDemo title="右侧弹窗" description="右侧三种对齐方式的基础示例。" code={rightPlacementCode}>
        <div className={styles['popup-demo-stack']}>
          {rightPlacements.map((item) => (
            <Popup
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
              <NineSliceButton variant={item === 'right' ? 'primary' : 'default'}>{item}</NineSliceButton>
            </Popup>
          ))}
        </div>
      </ComponentDemo>

      <ComponentDemo title="全方位控制" description="按照参考图的四向布局排列所有 placement 控制按钮。" code={allPlacementCode}>
        <div className={styles['popup-demo-placement-map']}>
          <div className={`${styles['popup-demo-placement-row']} ${styles['popup-demo-placement-row--top']}`}>
            {placementGroups.top.map((item) => (
              <NineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className={styles['popup-demo-placement-btn']}
                onClick={() => setPlacement(item)}
              >
                {item}
              </NineSliceButton>
            ))}
          </div>

          <div className={`${styles['popup-demo-placement-column']} ${styles['popup-demo-placement-column--left']}`}>
            {placementGroups.left.map((item) => (
              <NineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className={styles['popup-demo-placement-btn']}
                onClick={() => setPlacement(item)}
              >
                {item}
              </NineSliceButton>
            ))}
          </div>

          <div className={styles['popup-demo-playground']}>
            <Popup
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
              <NineSliceButton variant="primary">{placement}</NineSliceButton>
            </Popup>
          </div>

          <div className={`${styles['popup-demo-placement-column']} ${styles['popup-demo-placement-column--right']}`}>
            {placementGroups.right.map((item) => (
              <NineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className={styles['popup-demo-placement-btn']}
                onClick={() => setPlacement(item)}
              >
                {item}
              </NineSliceButton>
            ))}
          </div>

          <div className={`${styles['popup-demo-placement-row']} ${styles['popup-demo-placement-row--bottom']}`}>
            {placementGroups.bottom.map((item) => (
              <NineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className={styles['popup-demo-placement-btn']}
                onClick={() => setPlacement(item)}
              >
                {item}
              </NineSliceButton>
            ))}
          </div>
        </div>
      </ComponentDemo>

      <div className="component-page-api">
        <ApiTable data={popupApiData} />
      </div>
    </ComponentPage>
  )
}

export default StarPopupDemoPage
