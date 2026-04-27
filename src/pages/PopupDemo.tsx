import { useState } from 'react'
import ComponentPage from '../components/layout/ComponentPage'
import ComponentDemo from '../components/layout/ComponentDemo'
import ApiTable from '../components/layout/ApiTable'
import { NineSliceButton, Popup, type PopupPlacement } from '../components/ui'
import './PopupDemo.css'

const popupApiData = [
  { property: 'open', description: '\u662f\u5426\u663e\u793a\u5f39\u7a97', type: 'boolean', default: 'true' },
  {
    property: 'placement',
    description: '\u5f39\u51fa\u4f4d\u7f6e',
    type: "'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end'",
    default: "'right'",
  },
  { property: 'title', description: '\u6807\u9898\u533a\u57df', type: 'ReactNode', default: '-' },
  { property: 'content', description: '\u5185\u5bb9\u533a\u57df', type: 'ReactNode', default: '-', required: true },
  { property: 'actions', description: '\u5e95\u90e8\u64cd\u4f5c\u6309\u94ae', type: 'PopupAction[]', default: '-' },
  { property: 'offset', description: '\u4e0e\u89e6\u53d1\u5143\u7d20\u7684\u95f4\u8ddd', type: 'number', default: '12' },
  { property: 'children', description: '\u89e6\u53d1\u5143\u7d20', type: 'ReactNode', default: '-', required: true },
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
  title="\u63d0\u793a"
  content="\u652f\u6301\u50cf\u7d20\u6c14\u6ce1\u7bad\u5934\u548c\u591a\u6309\u94ae\u64cd\u4f5c\u3002"
  actions={[
    { label: '\u53d6\u6d88' },
    { label: '\u786e\u8ba4', variant: 'primary' },
  ]}
>
  <NineSliceButton>right-start</NineSliceButton>
</Popup>`

const allPlacementCode = `const [placement, setPlacement] = useState<PopupPlacement>('right-start')

<Popup
  open
  placement={placement}
  title="\u5168\u65b9\u4f4d\u63a7\u5236"
  content="\u652f\u6301 top / right / bottom / left\uff0c\u4ee5\u53ca start / end \u5bf9\u9f50\u3002"
  actions={[
    { label: '\u53d6\u6d88' },
    { label: '\u7981\u7528', disabled: true },
    { label: '\u786e\u8ba4', variant: 'primary' },
  ]}
>
  <NineSliceButton variant="primary">{placement}</NineSliceButton>
</Popup>`

function PopupDemo() {
  const [placement, setPlacement] = useState<PopupPlacement>('right-start')

  return (
    <ComponentPage
      title="Popup \u6c14\u6ce1\u5f39\u7a97"
      description="\u50cf\u7d20\u98ce\u6c14\u6ce1\u5f39\u7a97\u7ec4\u4ef6\uff0c\u652f\u6301\u56db\u5411\u4f4d\u7f6e\u4e0e start/end \u5bf9\u9f50\u63a7\u5236\u3002"
    >
      <ComponentDemo
        title="\u53f3\u4fa7\u5f39\u7a97"
        description="\u53f3\u4fa7\u4e09\u79cd\u5bf9\u9f50\u65b9\u5f0f\u7684\u57fa\u7840\u793a\u4f8b\u3002"
        code={rightPlacementCode}
      >
        <div className="popup-demo-stack">
          {rightPlacements.map((item) => (
            <Popup
              key={item}
              open
              placement={item}
              title="\u63d0\u793a"
              content="Right placement prompts info"
              actions={[
                { label: '\u53d6\u6d88' },
                { label: '\u786e\u8ba4', variant: 'primary' },
              ]}
            >
              <NineSliceButton variant={item === 'right' ? 'primary' : 'default'}>{item}</NineSliceButton>
            </Popup>
          ))}
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="\u5168\u65b9\u4f4d\u63a7\u5236"
        description="\u6309\u7167\u53c2\u8003\u56fe\u7684\u56db\u5411\u5e03\u5c40\u6392\u5217\u6240\u6709 placement \u63a7\u5236\u6309\u94ae\u3002"
        code={allPlacementCode}
      >
        <div className="popup-demo-placement-map">
          <div className="popup-demo-placement-row popup-demo-placement-row--top">
            {placementGroups.top.map((item) => (
              <NineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className="popup-demo-placement-btn"
                onClick={() => setPlacement(item)}
              >
                {item}
              </NineSliceButton>
            ))}
          </div>

          <div className="popup-demo-placement-column popup-demo-placement-column--left">
            {placementGroups.left.map((item) => (
              <NineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className="popup-demo-placement-btn"
                onClick={() => setPlacement(item)}
              >
                {item}
              </NineSliceButton>
            ))}
          </div>

          <div className="popup-demo-playground">
            <Popup
              open
              placement={placement}
              title="\u4f4d\u7f6e\u63a7\u5236"
              content="\u652f\u6301 top / right / bottom / left \u4ee5\u53ca start / end \u5bf9\u9f50\u3002"
              actions={[
                { label: '\u53d6\u6d88' },
                { label: '\u7981\u7528', disabled: true },
                { label: '\u786e\u8ba4', variant: 'primary' },
              ]}
            >
              <NineSliceButton variant="primary">{placement}</NineSliceButton>
            </Popup>
          </div>

          <div className="popup-demo-placement-column popup-demo-placement-column--right">
            {placementGroups.right.map((item) => (
              <NineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className="popup-demo-placement-btn"
                onClick={() => setPlacement(item)}
              >
                {item}
              </NineSliceButton>
            ))}
          </div>

          <div className="popup-demo-placement-row popup-demo-placement-row--bottom">
            {placementGroups.bottom.map((item) => (
              <NineSliceButton
                key={item}
                type="button"
                size="small"
                variant={item === placement ? 'primary' : 'default'}
                className="popup-demo-placement-btn"
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

export default PopupDemo
