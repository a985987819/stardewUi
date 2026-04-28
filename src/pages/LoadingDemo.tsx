import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarLoading, StarNineSliceButton } from '../components/ui'
import styles from './LoadingDemo.module.scss'

const loadingApiData = [
  { property: 'active', description: '是否播放加载动画，可用于立即中断', type: 'boolean', default: 'true' },
  { property: 'text', description: '加载文案；传空字符串时只显示图形', type: 'string', default: "'请稍候...'" },
  { property: 'size', description: '图形尺寸，单位为 px', type: 'number', default: '28' },
  { property: 'gap', description: '图形与文字之间的间距，单位为 px', type: 'number', default: '8' },
  { property: 'center', description: '内容是否水平居中', type: 'boolean', default: 'false' },
  { property: 'block', description: '是否按块级元素占满一行', type: 'boolean', default: 'false' },
  { property: 'fill', description: '是否占满父容器并在其中居中', type: 'boolean', default: 'false' },
  { property: 'className', description: '自定义类名', type: 'string', default: '-' },
]

const tocItems = [
  { id: 'basic', title: '基础用法', level: 1 },
  { id: 'content', title: '文案控制', level: 1 },
  { id: 'layout', title: '布局与居中', level: 1 },
  { id: 'button', title: '按钮集成', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const basicCode = `<StarLoading />
<StarLoading size={36} text="" />`

const contentCode = `<StarLoading text="正在收取农作物" />
<StarLoading text="" />
<StarLoading active={false} text="已暂停" />`

const layoutCode = `<div style={{ height: 180 }}>
  <StarLoading block fill center text="页面加载中" />
</div>`

const buttonCode = `<StarNineSliceButton loading>
  保存中
</StarNineSliceButton>`

function StarLoadingDemoPage() {
  const [active, setActive] = useState(true)
  const [buttonLoading, setButtonLoading] = useState(true)

  return (
    <StarComponentPage
      title="Loading 加载"
      description="基于 canvas 绘制的包子加载动画组件，可独立用于页面和区域加载，也可嵌入按钮等交互控件。"
      toc={tocItems}
    >
      <StarComponentDemo
        id="basic"
        title="基础用法"
        description="默认文案会自动跟随动画节奏切换省略号数量，也可以只显示图形。"
        code={basicCode}
      >
        <div className={styles['loading-demo__inline-group']}>
          <StarLoading size={80} />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="content"
        title="文案与中断控制"
        description="通过 active 可以立即暂停动画，text 可自定义，也可以传空字符串隐藏文案。"
        code={contentCode}
      >
        <div className={styles['loading-demo__stack']}>
          <div className={styles['loading-demo__panel']}>
            <p className={styles['loading-demo__panel-title']}>动画控制</p>
            <div className={styles['loading-demo__button-row']}>
              <StarNineSliceButton size="small" onClick={() => setActive((value) => !value)}>
                {active ? '停止动画' : '重新开始'}
              </StarNineSliceButton>
            </div>
            <div style={{ marginTop: '12px' }}>
              <StarLoading active={active} text={active ? '正在收取农作物' : '已暂停'} />
            </div>
          </div>

          <div className={styles['loading-demo__inline-group']}>
            <StarLoading text="正在同步存档" />
            <StarLoading text="" />
          </div>
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="layout"
        title="布局与居中"
        description="配合 block、fill、center 可以直接作为页面区域加载态使用。"
        code={layoutCode}
      >
        <div className={styles['loading-demo__center-box']}>
          <StarLoading block fill center text="页面加载中" />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="button"
        title="按钮集成"
        description="按钮组件已支持 loading 属性，加载图标会出现在文本左侧，并自动进入禁用态。"
        code={buttonCode}
      >
        <div className={styles['loading-demo__button-row']}>
          <StarNineSliceButton loading={buttonLoading}>保存中</StarNineSliceButton>
          <StarNineSliceButton size="small" onClick={() => setButtonLoading((value) => !value)}>
            {buttonLoading ? '停止按钮加载' : '开始按钮加载'}
          </StarNineSliceButton>
        </div>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={loadingApiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarLoadingDemoPage
