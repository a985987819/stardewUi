import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarRadio, type RadioOption } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '单选框 Radio',
    desc: 'Card 风格圆框承托像素种子的单选控件：一次只选一个，选中时种子以弹跳入场，换选时旧种子像评分图标一样摇晃缩退；重复点击已选项不会清空选择。',
    toc: ['基础用法', '纵向与禁用项', '尺寸', 'API'],
    demos: [
      ['基础用法', '受控使用：value 与 onChange 组成一个标准单选组，适合选作物、选工具、选难度这类一次只能定一件事的场景。'],
      ['纵向与禁用项', 'direction="vertical" 适合设置清单；单个选项可以通过 disabled 保持可见但不可选择，整组禁用同样支持。'],
      ['尺寸', 'size 控制控件密度；三个尺寸分别适合紧凑清单、默认表单和强调型选择。'],
    ],
    fences: ['木质栅栏', '石质墙体', '硬木围栏'],
    seasons: ['春季', '夏季', '秋季（已过）', '冬季'],
    sizes: ['小号圆框', '中号圆框', '大号圆框'],
  },
  en: {
    title: 'Radio',
    desc: 'A Card-framed single-choice control carrying a pixel seed dot: one choice at a time, the dot pops in on selection and leaves with the Rating shake-and-shrink motion, and re-clicking the selected option never empties the group.',
    toc: ['Basic Usage', 'Vertical & Disabled', 'Sizes', 'API'],
    demos: [
      ['Basic Usage', 'Controlled usage: value and onChange form a standard radio group for picking one crop, tool, or difficulty.'],
      ['Vertical & Disabled', 'Use direction="vertical" for a settings list. Individually disabled options stay visible but cannot be chosen; the whole group can be disabled too.'],
      ['Sizes', 'size controls control density: compact for lists, medium for standard forms, and large for emphasized choices.'],
    ],
    fences: ['Wood fence', 'Stone wall', 'Hardwood fence'],
    seasons: ['Spring', 'Summer', 'Fall (over)', 'Winter'],
    sizes: ['Small seal', 'Medium seal', 'Large seal'],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; fences: string[]; seasons: string[]; sizes: string[] }>

const apiData = {
  zh: [
    { property: 'options', description: '选项列表，单项可配置 value、label 与 disabled', type: 'RadioOption[]', default: '-', required: true },
    { property: 'value / defaultValue', description: '受控选中值或非受控初始选中值', type: 'string', default: '-' },
    { property: 'onChange', description: '选中项变化时返回新的 value', type: '(value: string) => void', default: '-' },
    { property: 'direction', description: '选项排列方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
    { property: 'disabled', description: '禁用整个单选组', type: 'boolean', default: 'false' },
    { property: 'size', description: '控件尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'aria-label', description: '单选组的无障碍名称', type: 'string', default: "'Radio'" },
  ],
  en: [
    { property: 'options', description: 'Option list; every option accepts value, label, and disabled.', type: 'RadioOption[]', default: '-', required: true },
    { property: 'value / defaultValue', description: 'Controlled or initial selected value.', type: 'string', default: '-' },
    { property: 'onChange', description: 'Receives the next selected value.', type: '(value: string) => void', default: '-' },
    { property: 'direction', description: 'Option layout direction.', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
    { property: 'disabled', description: 'Disables the full radio group.', type: 'boolean', default: 'false' },
    { property: 'size', description: 'Control scale.', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'aria-label', description: 'Accessible group name.', type: 'string', default: "'Radio'" },
  ],
}

const makeOptions = (values: string[], disabledIndex?: number): RadioOption[] => values.map((label, index) => ({
  value: `option-${index}`,
  label,
  disabled: index === disabledIndex,
}))

const controlledRadioCode = `import { useState } from 'react'
import { StarRadio, type RadioOption } from 'stardew-valley-ui'

const fenceOptions: RadioOption[] = [
  { value: 'wood', label: 'Wood fence' },
  { value: 'stone', label: 'Stone wall' },
  { value: 'hardwood', label: 'Hardwood fence' },
]

export function FenceChoice() {
  const [fence, setFence] = useState('wood')

  return (
    <>
      <StarRadio options={fenceOptions} value={fence} onChange={setFence} />
      <output>Selected: {fence}</output>
    </>
  )
}`

function StarRadioDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [fence, setFence] = useState('option-0')
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'vertical', 'size', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={controlledRadioCode}
        data={[{ label: 'selected value', value: fence }]}
      >
        <StarRadio options={makeOptions(t.fences)} value={fence} onChange={setFence} aria-label={t.demos[0][0]} />
      </StarComponentDemo>
      <StarComponentDemo
        id="vertical"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={'<StarRadio direction="vertical" options={[{ value: "fall", label: "Fall", disabled: true }]} />'}
      >
        <StarRadio direction="vertical" options={makeOptions(t.seasons, 2)} defaultValue="option-0" aria-label={t.demos[1][0]} />
      </StarComponentDemo>
      <StarComponentDemo
        id="size"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={'<StarRadio size="small" options={options} />\n<StarRadio size="medium" options={options} />\n<StarRadio size="large" options={options} />'}
      >
        <div style={{ display: 'grid', gap: 18 }}>
          <StarRadio size="small" options={[{ value: 'small', label: t.sizes[0] }]} defaultValue="small" aria-label={t.sizes[0]} />
          <StarRadio options={[{ value: 'medium', label: t.sizes[1] }]} defaultValue="medium" aria-label={t.sizes[1]} />
          <StarRadio size="large" options={[{ value: 'large', label: t.sizes[2] }]} defaultValue="large" aria-label={t.sizes[2]} />
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Radio API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarRadioDemoPage
