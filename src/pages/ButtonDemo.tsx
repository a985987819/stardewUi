import { Pickaxe } from 'lucide-react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarNineSliceButton, type NineSliceButtonTheme } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './ButtonDemo.module.scss'

const seasonalThemes: Array<{ key: NineSliceButtonTheme; zh: string; en: string }> = [
  { key: 'spring', zh: '春天', en: 'Spring' },
  { key: 'summer', zh: '夏天', en: 'Summer' },
  { key: 'autumn', zh: '秋天', en: 'Autumn' },
  { key: 'winter', zh: '冬天', en: 'Winter' },
]

const copy = {
  zh: {
    title: 'Button 按钮',
    desc: '像素按钮用于提交、取消、采集、升级等高频动作。季节主题能让同一个操作在不同页面里拥有不同情绪。',
    toc: ['默认按钮', '季节主题', '按钮尺寸', '颜色推导', '图标按钮', '禁用状态', '多实例场景', 'API'],
    demo: {
      basic: ['默认按钮', '常规按钮使用浅米色背景和像素边框，适合日常操作。'],
      theme: ['季节主题', '春天适合播种，夏天适合冒险，秋天适合收获，冬天适合整理背包。'],
      size: ['按钮尺寸', 'small、medium、large 对应不同层级的操作入口。'],
      color: ['颜色推导', '传入 color 后会推导边框和文字色，像给工具刷上新漆。'],
      icon: ['图标按钮', '图标可以强调动作意图，例如拿起镐子去矿洞。'],
      disabled: ['禁用状态', '当体力不足或任务未解锁时，禁用态会保留形状但降低权重。'],
      multi: ['多实例场景', '同一页面里可以放置多个按钮，用作背包、商店或任务列表操作。'],
    },
    labels: ['默认按钮', '确认交易', '丢弃物品', '小按钮', '大按钮', '木质边框', '森林边框', '湖蓝边框', '工具', '收藏', '禁用按钮', '加载按钮', '块级按钮'],
  },
  en: {
    title: 'Button',
    desc: 'Pixel buttons handle frequent actions such as submit, cancel, gather, and upgrade. Seasonal themes give the same action a different mood per page.',
    toc: ['Default Button', 'Season Themes', 'Sizes', 'Color Derivation', 'Icon Button', 'Disabled State', 'Multiple Instances', 'API'],
    demo: {
      basic: ['Default Button', 'Regular buttons use a cream background and pixel border for everyday actions.'],
      theme: ['Season Themes', 'Spring plants, summer quests, autumn harvests, and winter inventory checks all get distinct button moods.'],
      size: ['Sizes', 'small, medium, and large map to different action priorities.'],
      color: ['Color Derivation', 'Passing color derives border and text colors like repainting a trusted tool.'],
      icon: ['Icon Button', 'Icons sharpen intent, such as grabbing a pickaxe before entering the mine.'],
      disabled: ['Disabled State', 'When stamina is low or a quest is locked, disabled buttons keep shape while lowering priority.'],
      multi: ['Multiple Instances', 'Render many independent buttons for backpacks, shops, and quest lists.'],
    },
    labels: ['Default', 'Confirm Trade', 'Trash Item', 'Small', 'Large', 'Wood Border', 'Forest Border', 'Lake Border', 'Tool', 'Favorite', 'Disabled', 'Loading', 'Block Button'],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demo: Record<string, [string, string]>; labels: string[] }>

const apiData = {
  zh: [
    { property: 'variant', description: '按钮类型', type: "'default' | 'primary' | 'warning' | 'danger' | 'dashed' | 'text' | 'link'", default: "'default'" },
    { property: 'size', description: '按钮尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' },
    { property: 'loading', description: '是否显示加载状态', type: 'boolean', default: 'false' },
    { property: 'theme', description: '季节主题，仅对默认按钮生效', type: "'spring' | 'summer' | 'autumn' | 'winter'", default: '-' },
    { property: 'onClick', description: '点击事件回调', type: '(event: MouseEvent) => void', default: '-' },
  ],
  en: [
    { property: 'variant', description: 'Button visual variant.', type: "'default' | 'primary' | 'warning' | 'danger' | 'dashed' | 'text' | 'link'", default: "'default'" },
    { property: 'size', description: 'Button size.', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'disabled', description: 'Disables interaction.', type: 'boolean', default: 'false' },
    { property: 'loading', description: 'Shows loading state.', type: 'boolean', default: 'false' },
    { property: 'theme', description: 'Seasonal theme for default buttons.', type: "'spring' | 'summer' | 'autumn' | 'winter'", default: '-' },
    { property: 'onClick', description: 'Click callback.', type: '(event: MouseEvent) => void', default: '-' },
  ],
}

const code = `<StarNineSliceButton theme="spring">Plant Seeds</StarNineSliceButton>`

function StarButtonDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'theme', 'size', 'color', 'icon', 'disabled', 'multi', 'api'][index], title, level: 1 }))
  const label = (index: number) => t.labels[index]

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demo.basic[0]} description={t.demo.basic[1]} code={code}>
        <StarNineSliceButton>{label(0)}</StarNineSliceButton>
        <StarNineSliceButton variant="primary">{label(1)}</StarNineSliceButton>
        <StarNineSliceButton variant="danger">{label(2)}</StarNineSliceButton>
      </StarComponentDemo>
      <StarComponentDemo id="theme" title={t.demo.theme[0]} description={t.demo.theme[1]} code={code}>
        <div className={styles['button-theme-grid']}>
          {seasonalThemes.map((item) => {
            const season = item[lang]
            return (
              <div key={item.key} className={styles['button-theme-card']}>
                <p className={styles['button-theme-title']}>{season}</p>
                <div className={styles['button-theme-actions']}>
                  <StarNineSliceButton theme={item.key}>{season}</StarNineSliceButton>
                  <StarNineSliceButton theme={item.key} size="small">{label(3)}</StarNineSliceButton>
                  <StarNineSliceButton theme={item.key} loading>{label(11)}</StarNineSliceButton>
                  <StarNineSliceButton theme={item.key} disabled>{label(10)}</StarNineSliceButton>
                </div>
              </div>
            )
          })}
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="size" title={t.demo.size[0]} description={t.demo.size[1]} code={code}>
        <StarNineSliceButton size="small">{label(3)}</StarNineSliceButton>
        <StarNineSliceButton>{label(0)}</StarNineSliceButton>
        <StarNineSliceButton size="large">{label(4)}</StarNineSliceButton>
      </StarComponentDemo>
      <StarComponentDemo id="color" title={t.demo.color[0]} description={t.demo.color[1]} code={code}>
        <StarNineSliceButton color="#8B4513">{label(5)}</StarNineSliceButton>
        <StarNineSliceButton color="#2E6F40">{label(6)}</StarNineSliceButton>
        <StarNineSliceButton color="#355C9A">{label(7)}</StarNineSliceButton>
      </StarComponentDemo>
      <StarComponentDemo id="icon" title={t.demo.icon[0]} description={t.demo.icon[1]} code={code}>
        <StarNineSliceButton icon={<Pickaxe size={18} />}>{label(8)}</StarNineSliceButton>
        <StarNineSliceButton icon="☆">{label(9)}</StarNineSliceButton>
      </StarComponentDemo>
      <StarComponentDemo id="disabled" title={t.demo.disabled[0]} description={t.demo.disabled[1]} code={code}>
        <StarNineSliceButton disabled>{label(10)}</StarNineSliceButton>
        <StarNineSliceButton theme="winter" disabled>{label(10)}</StarNineSliceButton>
      </StarComponentDemo>
      <StarComponentDemo id="multi" title={t.demo.multi[0]} description={t.demo.multi[1]} code={code}>
        <div className={styles['demo-multi-buttons']}>{Array.from({ length: 8 }).map((_, index) => <StarNineSliceButton key={index}>{`${label(0)} ${index + 1}`}</StarNineSliceButton>)}</div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarButtonDemoPage
