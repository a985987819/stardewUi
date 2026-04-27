import StarComponentPage from '../components/layout/ComponentPage'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarApiTable from '../components/layout/ApiTable'
import { StarNineSliceButton, type NineSliceButtonTheme } from '../components/ui'
import styles from './ButtonDemo.module.scss'

const seasonalThemes: Array<{ key: NineSliceButtonTheme; label: string }> = [
  { key: 'spring', label: '春季' },
  { key: 'summer', label: '夏季' },
  { key: 'autumn', label: '秋季' },
  { key: 'winter', label: '冬季' },
]

const buttonApiData = [
  { property: 'variant', description: '按钮类型', type: "'default' | 'primary' | 'warning' | 'danger' | 'dashed' | 'text' | 'link'", default: "'default'" },
  { property: 'size', description: '按钮大小', type: "'small' | 'medium' | 'large'", default: "'medium'" },
  { property: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' },
  { property: 'block', description: '是否块级元素', type: 'boolean', default: 'false' },
  { property: 'theme', description: '季节主题，仅对默认按钮生效', type: "'spring' | 'summer' | 'autumn' | 'winter'", default: '-' },
  { property: 'onClick', description: '点击事件回调', type: '(event: MouseEvent) => void', default: '-' },
  { property: 'children', description: '按钮内容', type: 'ReactNode', default: '-', required: true },
]

const tocItems = [
  { id: 'basic', title: '按钮类型', level: 1 },
  { id: 'theme', title: '季节主题', level: 1 },
  { id: 'size', title: '按钮尺寸', level: 1 },
  { id: 'disabled', title: '禁用状态', level: 1 },
  { id: 'multi', title: '多实例场景', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const basicCode = `<StarNineSliceButton>默认按钮</StarNineSliceButton>
<StarNineSliceButton variant="primary">主要按钮</StarNineSliceButton>
<StarNineSliceButton variant="dashed">虚线按钮</StarNineSliceButton>
<StarNineSliceButton variant="text">文本按钮</StarNineSliceButton>
<StarNineSliceButton variant="link">链接按钮</StarNineSliceButton>`

const sizeCode = `<StarNineSliceButton variant="primary" size="small">小按钮</StarNineSliceButton>
<StarNineSliceButton variant="primary">默认按钮</StarNineSliceButton>
<StarNineSliceButton variant="primary" size="large">大按钮</StarNineSliceButton>`

const disabledCode = `<StarNineSliceButton variant="primary" disabled>禁用主要按钮</StarNineSliceButton>
<StarNineSliceButton disabled>禁用默认按钮</StarNineSliceButton>`

const themeCode = `<StarNineSliceButton theme="spring">春季默认按钮</StarNineSliceButton>
<StarNineSliceButton theme="summer">夏季默认按钮</StarNineSliceButton>
<StarNineSliceButton theme="autumn">秋季默认按钮</StarNineSliceButton>
<StarNineSliceButton theme="winter">冬季默认按钮</StarNineSliceButton>`

const multiInstanceCode = `{Array.from({ length: 10 }).map((_, index) => (
  <StarNineSliceButton key={index}>按钮 {index + 1}</StarNineSliceButton>
))}`

function StarButtonDemoPage() {
  return (
    <StarComponentPage title="Button 按钮" description="按钮用于触发一个操作或事件，是用户界面中最基础的交互元素。" toc={tocItems}>
      <StarComponentDemo id="basic" title="按钮类型" description="支持多种不同类型的按钮" code={basicCode}>
        <StarNineSliceButton>默认按钮</StarNineSliceButton>
        <StarNineSliceButton variant="primary">主要按钮</StarNineSliceButton>
        <StarNineSliceButton variant="dashed">虚线按钮</StarNineSliceButton>
        <StarNineSliceButton variant="text">文本按钮</StarNineSliceButton>
        <StarNineSliceButton variant="link">链接按钮</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo id="theme" title="季节主题" description="通过 theme 属性切换春夏秋冬四种默认按钮风格，其它特殊按钮保持统一配色。" code={themeCode}>
        <div className={styles['button-theme-grid']}>
          {seasonalThemes.map((item) => (
            <div key={item.key} className={styles['button-theme-card']}>
              <p className={styles['button-theme-title']}>{item.label}</p>
              <div className={styles['button-theme-actions']}>
                <StarNineSliceButton theme={item.key}>默认按钮</StarNineSliceButton>
              </div>
            </div>
          ))}
        </div>
      </StarComponentDemo>

      <StarComponentDemo id="size" title="按钮尺寸" description="提供三种尺寸的按钮" code={sizeCode}>
        <StarNineSliceButton variant="primary" size="small">小按钮</StarNineSliceButton>
        <StarNineSliceButton variant="primary">默认按钮</StarNineSliceButton>
        <StarNineSliceButton variant="primary" size="large">大按钮</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo id="disabled" title="禁用状态" description="按钮的禁用状态" code={disabledCode}>
        <StarNineSliceButton variant="primary" disabled>禁用主要按钮</StarNineSliceButton>
        <StarNineSliceButton disabled>禁用默认按钮</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo id="multi" title="多实例场景" description="同一页面多个按钮可复用同一图片缓存并独立绘制" code={multiInstanceCode}>
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
