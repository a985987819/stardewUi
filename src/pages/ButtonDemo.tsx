import { Pickaxe } from 'lucide-react'
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
  { property: 'loading', description: '是否显示加载状态', type: 'boolean', default: 'false' },
  { property: 'icon', description: '按钮图标，支持 ReactNode 或 string', type: 'ReactNode | string', default: '-' },
  { property: 'color', description: '默认按钮外边框颜色，会联动计算内边框与文字颜色', type: 'string', default: '-' },
  {
    property: 'appearance',
    description: '按钮外观，显式声明为 classical 时才使用经典九宫格按钮',
    type: "'regular' | 'classical'",
    default: "'regular'",
  },
  {
    property: 'theme',
    description: '季节主题，仅对默认按钮生效',
    type: "'spring' | 'summer' | 'autumn' | 'winter'",
    default: '-',
  },
  { property: 'backgroundSrc', description: '自定义九宫格背景图地址', type: 'string', default: '-' },
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
  { id: 'color', title: '颜色推导', level: 1 },
  { id: 'icon', title: '图标按钮', level: 1 },
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

const colorCode = `<StarNineSliceButton color="#8B4513">木质边框</StarNineSliceButton>
<StarNineSliceButton color="#2E6F40">森林边框</StarNineSliceButton>
<StarNineSliceButton color="#355C9A">湖蓝边框</StarNineSliceButton>`

const iconCode = `<StarNineSliceButton icon={<Pickaxe size={18} />}>工具</StarNineSliceButton>
<StarNineSliceButton icon="★">收藏</StarNineSliceButton>`

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
      description="默认按钮现在由 SCSS 直接绘制双层边框和圆角背景，并支持从 color 推导内边框与可读文字颜色。"
      toc={tocItems}
    >
      <StarComponentDemo
        id="basic"
        title="默认按钮"
        description="常规默认按钮使用浅米色背景、深色外边框和浅色内边框，并会根据 hover / active / disabled 自动切换文字色。"
        code={basicCode}
      >
        <StarNineSliceButton>默认按钮</StarNineSliceButton>
        <StarNineSliceButton>确认</StarNineSliceButton>
        <StarNineSliceButton>删除</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo
        id="theme"
        title="季节主题"
        description="theme 属性仍然走独立的季节背景渲染，不受默认按钮 SCSS 绘制逻辑影响。"
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

      <StarComponentDemo id="size" title="按钮尺寸" description="默认按钮会随内容宽高自适应，small / medium / large 仅调整内边距和字号。" code={sizeCode}>
        <StarNineSliceButton size="small">小按钮</StarNineSliceButton>
        <StarNineSliceButton>默认按钮</StarNineSliceButton>
        <StarNineSliceButton size="large">大按钮</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo
        id="color"
        title="颜色推导"
        description="传入 color 后，这个颜色会作为默认按钮的外边框，并自动推导出更浅的内边框和对比度足够的文字颜色。"
        code={colorCode}
      >
        <StarNineSliceButton color="#8B4513">木质边框</StarNineSliceButton>
        <StarNineSliceButton color="#2E6F40">森林边框</StarNineSliceButton>
        <StarNineSliceButton color="#355C9A">湖蓝边框</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo
        id="icon"
        title="图标按钮"
        description="icon 支持 ReactNode 或 string。传入后按钮会切换为方形垂直布局，文字在上、图标在下。"
        code={iconCode}
      >
        <StarNineSliceButton icon={<Pickaxe size={18} />}>工具</StarNineSliceButton>
        <StarNineSliceButton icon="★">收藏</StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo id="disabled" title="禁用状态" description="禁用态会保留双层边框结构，并叠加半透明背景降低视觉权重。" code={disabledCode}>
        <StarNineSliceButton disabled>禁用默认按钮</StarNineSliceButton>
        <StarNineSliceButton theme="winter" disabled>
          冬季禁用按钮
        </StarNineSliceButton>
      </StarComponentDemo>

      <StarComponentDemo
        id="multi"
        title="多实例场景"
        description="同一页面多个默认按钮可以独立渲染，不依赖任何背景图片资源。"
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
