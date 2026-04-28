import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarNineSliceButton, type NineSliceButtonTheme } from '../components/ui'
import styles from './ButtonDemo.module.scss'

const seasonalThemes: Array<{ key: NineSliceButtonTheme; label: string }> = [
  { key: 'spring', label: '春季' },
  { key: 'summer', label: '夏季' },
  { key: 'autumn', label: '秋季' },
  { key: 'winter', label: '冬季' },
]

const buttonApiData = [
  {
    property: 'variant',
    description: '按钮类型',
    type: "'default' | 'primary' | 'warning' | 'danger' | 'dashed' | 'text' | 'link'",
    default: "'default'",
  },
  { property: 'size', description: '按钮尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
  { property: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' },
  { property: 'block', description: '是否为块级按钮', type: 'boolean', default: 'false' },
  { property: 'loading', description: '是否显示加载态', type: 'boolean', default: 'false' },
  {
    property: 'theme',
    description: '季节主题，仅对默认按钮生效',
    type: "'spring' | 'summer' | 'autumn' | 'winter'",
    default: '-',
  },
  { property: 'backgroundSrc', description: '自定义九宫格背景图地址', type: 'string', default: "'/btnImg.png'" },
  {
    property: 'backgroundInsets',
    description: '九宫格切片边距',
    type: '{ top: number; right: number; bottom: number; left: number }',
    default: '{ top: 8, right: 8, bottom: 8, left: 8 }',
  },
  { property: 'onClick', description: '点击事件回调', type: '(event: MouseEvent) => void', default: '-' },
  { property: 'children', description: '按钮内容', type: 'ReactNode', default: '-', required: true },
]

const tocItems = [
  { id: 'basic', title: '默认按钮', level: 1 },
  { id: 'theme', title: '季节主题', level: 1 },
  { id: 'size', title: '按钮尺寸', level: 1 },
  { id: 'disabled', title: '禁用状态', level: 1 },
  { id: 'multi', title: '多实例场景', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const basicCode = `<StarNineSliceButton>默认按钮</StarNineSliceButton>
<StarNineSliceButton>确认</StarNineSliceButton>
<StarNineSliceButton>删除</StarNineSliceButton>`

const sizeCode = `<StarNineSliceButton size="small">小按钮</StarNineSliceButton>
<StarNineSliceButton>默认按钮</StarNineSliceButton>
<StarNineSliceButton size="large">大按钮</StarNineSliceButton>`

const disabledCode = `<StarNineSliceButton disabled>禁用默认按钮</StarNineSliceButton>
<StarNineSliceButton theme="winter" disabled>冬季禁用按钮</StarNineSliceButton>`

const themeCode = `<StarNineSliceButton theme="spring">春季默认按钮</StarNineSliceButton>
<StarNineSliceButton theme="summer">夏季默认按钮</StarNineSliceButton>
<StarNineSliceButton theme="autumn">秋季默认按钮</StarNineSliceButton>
<StarNineSliceButton theme="winter">冬季默认按钮</StarNineSliceButton>

<StarNineSliceButton theme="spring" size="small">春季小按钮</StarNineSliceButton>
<StarNineSliceButton theme="summer" loading>夏季加载按钮</StarNineSliceButton>
<StarNineSliceButton theme="autumn" disabled>秋季禁用按钮</StarNineSliceButton>
<StarNineSliceButton theme="winter" block>冬季块级按钮</StarNineSliceButton>`

const multiInstanceCode = `{Array.from({ length: 10 }).map((_, index) => (
  <StarNineSliceButton key={index}>按钮 {index + 1}</StarNineSliceButton>
))}`

function StarButtonDemoPage() {
  return (
    <StarComponentPage
      title="Button 按钮"
      description="默认按钮使用完整按钮图资源渲染，适合项目中的常见点击操作。"
      toc={tocItems}
    >
      <StarComponentDemo
        id="basic"
        title="默认按钮"
        description="项目中的常见点击按钮默认都使用这一套按钮写法。"
        code={basicCode}
      >
        <StarNineSliceButton>默认按钮</StarNineSliceButton>
        <StarNineSliceButton>确认</StarNineSliceButton>
        <StarNineSliceButton>删除</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo
        id="theme"
        title="季节主题"
        description="通过 theme 属性切换春夏秋冬四种默认按钮风格，并保持 small、loading、disabled、block 等状态能力。"
        code={themeCode}
      >
        <div className={styles['button-theme-grid']}>
          {seasonalThemes.map((item) => (
            <div key={item.key} className={styles['button-theme-card']}>
              <p className={styles['button-theme-title']}>{item.label}</p>
              <div className={styles['button-theme-actions']}>
                <StarNineSliceButton theme={item.key}>{item.label}默认按钮</StarNineSliceButton>
                <StarNineSliceButton theme={item.key} size="small">
                  {item.label}小按钮
                </StarNineSliceButton>
                <StarNineSliceButton theme={item.key} loading>
                  {item.label}加载按钮
                </StarNineSliceButton>
                <StarNineSliceButton theme={item.key} disabled>
                  {item.label}禁用按钮
                </StarNineSliceButton>
              </div>
              <div className={styles['button-theme-block']}>
                <StarNineSliceButton theme={item.key} block>
                  {item.label}块级按钮
                </StarNineSliceButton>
              </div>
            </div>
          ))}
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="size" title="按钮尺寸" description="提供三种尺寸的默认按钮。" code={sizeCode}>
        <StarNineSliceButton size="small">小按钮</StarNineSliceButton>
        <StarNineSliceButton>默认按钮</StarNineSliceButton>
        <StarNineSliceButton size="large">大按钮</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo id="disabled" title="禁用状态" description="默认按钮的禁用状态。" code={disabledCode}>
        <StarNineSliceButton disabled>禁用默认按钮</StarNineSliceButton>
        <StarNineSliceButton theme="winter" disabled>
          冬季禁用按钮
        </StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo
        id="multi"
        title="多实例场景"
        description="同一页面多个默认按钮可以复用同一份图资源并独立绘制。"
        code={multiInstanceCode}
      >
        <div className={styles['demo-multi-buttons']}>
          {Array.from({ length: 10 }).map((_, index) => (
            <StarNineSliceButton key={`multi-${index}`}>按钮 {index + 1}</StarNineSliceButton>
          ))}
        </div>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={buttonApiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarButtonDemoPage
