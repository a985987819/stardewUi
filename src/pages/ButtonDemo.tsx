import ComponentPage from '../components/layout/ComponentPage'
import ComponentDemo from '../components/layout/ComponentDemo'
import ApiTable from '../components/layout/ApiTable'
import { NineSliceButton, type NineSliceButtonTheme } from '../components/ui'
import styles from './ButtonDemo.module.css'

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

const basicCode = `<NineSliceButton>默认按钮</NineSliceButton>
<NineSliceButton variant="primary">主要按钮</NineSliceButton>
<NineSliceButton variant="dashed">虚线按钮</NineSliceButton>
<NineSliceButton variant="text">文本按钮</NineSliceButton>
<NineSliceButton variant="link">链接按钮</NineSliceButton>`

const sizeCode = `<NineSliceButton variant="primary" size="small">小按钮</NineSliceButton>
<NineSliceButton variant="primary">默认按钮</NineSliceButton>
<NineSliceButton variant="primary" size="large">大按钮</NineSliceButton>`

const disabledCode = `<NineSliceButton variant="primary" disabled>禁用主要按钮</NineSliceButton>
<NineSliceButton disabled>禁用默认按钮</NineSliceButton>`

const themeCode = `<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>
<NineSliceButton theme="summer">夏季默认按钮</NineSliceButton>
<NineSliceButton theme="autumn">秋季默认按钮</NineSliceButton>
<NineSliceButton theme="winter">冬季默认按钮</NineSliceButton>`

const multiInstanceCode = `{Array.from({ length: 10 }).map((_, index) => (
  <NineSliceButton key={index}>按钮 {index + 1}</NineSliceButton>
))}`

function StarButtonDemoPage() {
  return (
    <ComponentPage title="Button 按钮" description="按钮用于触发一个操作或事件，是用户界面中最基础的交互元素。">
      <ComponentDemo title="按钮类型" description="支持多种不同类型的按钮" code={basicCode}>
        <NineSliceButton>默认按钮</NineSliceButton>
        <NineSliceButton variant="primary">主要按钮</NineSliceButton>
        <NineSliceButton variant="dashed">虚线按钮</NineSliceButton>
        <NineSliceButton variant="text">文本按钮</NineSliceButton>
        <NineSliceButton variant="link">链接按钮</NineSliceButton>
      </ComponentDemo>

      <ComponentDemo title="季节主题" description="通过 theme 属性切换春夏秋冬四种默认按钮风格，其它特殊按钮保持统一配色。" code={themeCode}>
        <div className={styles['button-theme-grid']}>
          {seasonalThemes.map((item) => (
            <div key={item.key} className={styles['button-theme-card']}>
              <p className={styles['button-theme-title']}>{item.label}</p>
              <div className={styles['button-theme-actions']}>
                <NineSliceButton theme={item.key}>默认按钮</NineSliceButton>
              </div>
            </div>
          ))}
        </div>
      </ComponentDemo>

      <ComponentDemo title="按钮尺寸" description="提供三种尺寸的按钮" code={sizeCode}>
        <NineSliceButton variant="primary" size="small">小按钮</NineSliceButton>
        <NineSliceButton variant="primary">默认按钮</NineSliceButton>
        <NineSliceButton variant="primary" size="large">大按钮</NineSliceButton>
      </ComponentDemo>

      <ComponentDemo title="禁用状态" description="按钮的禁用状态" code={disabledCode}>
        <NineSliceButton variant="primary" disabled>禁用主要按钮</NineSliceButton>
        <NineSliceButton disabled>禁用默认按钮</NineSliceButton>
      </ComponentDemo>

      <ComponentDemo title="多实例场景" description="同一页面多个按钮可复用同一图片缓存并独立绘制" code={multiInstanceCode}>
        <div className={styles['demo-multi-buttons']}>
          {Array.from({ length: 10 }).map((_, index) => (
            <NineSliceButton key={`multi-${index}`}>按钮 {index + 1}</NineSliceButton>
          ))}
        </div>
      </ComponentDemo>

      <div className="component-page-api">
        <ApiTable data={buttonApiData} />
      </div>
    </ComponentPage>
  )
}

export default StarButtonDemoPage
