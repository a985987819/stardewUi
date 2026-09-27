import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarSelect, type SelectOption } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '下拉选择 Select',
    desc: '木框凹陷的下拉选择器：触发框与输入框同族的阶梯角和凹陷纹路，展开后从折叠清单里挑出作物、工具或村民；支持禁用项、三种尺寸与全宽布局。',
    toc: ['基础用法', '禁用与占位', '尺寸', 'API'],
    demos: [
      ['基础用法', '受控使用：value 与 onChange 组成标准下拉语义，选中项会在清单里保持高亮并带 ✔ 标记；点击外部或按 Esc 收起清单。'],
      ['禁用与占位', 'placeholder 在未选择时提示；单个选项可通过 disabled 保持可见但不可选择，整组禁用时触发框变为灰木色。'],
      ['尺寸', 'size 控制触发框密度；block 让选择器撑满容器宽度，适合放进表单网格。'],
    ],
    crops: ['防风草', '土豆', '草莓', '蓝莓'],
    tools: ['锄头（莫瑞）', '水壶（缺水）', '镐子', '斧头'],
    sizes: ['小号选择器', '中号选择器', '大号选择器'],
  },
  en: {
    title: 'Select',
    desc: 'A recessed pixel dropdown in the Input family: the trigger shares the same stepped corners and bevels as the text field, and unfolds into a folded list for picking crops, tools, or villagers; with disabled options, three sizes, and a full-width block layout.',
    toc: ['Basic Usage', 'Disabled & Placeholder', 'Sizes', 'API'],
    demos: [
      ['Basic Usage', 'Controlled usage: value and onChange form standard listbox semantics; the chosen row stays highlighted with a ✔ mark. Click outside or press Esc to fold the list back.'],
      ['Disabled & Placeholder', 'placeholder hints while nothing is chosen; individually disabled options stay visible but cannot be picked, and disabling the whole select turns the trigger grey-wood.'],
      ['Sizes', 'size controls the trigger density; block stretches the select across its container, ready for form grids.'],
    ],
    crops: ['Parsnip', 'Potato', 'Strawberry', 'Blueberry'],
    tools: ['Hoe (dented)', 'Watering can (dry)', 'Pickaxe', 'Axe'],
    sizes: ['Small select', 'Medium select', 'Large select'],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; crops: string[]; tools: string[]; sizes: string[] }>

const apiData = {
  zh: [
    { property: 'options', description: '选项列表，单项可配置 value、label 与 disabled', type: 'SelectOption[]', default: '-', required: true },
    { property: 'value / defaultValue', description: '受控选中值或非受控初始选中值', type: 'string', default: '-' },
    { property: 'onChange', description: '选中项变化时返回新的 value', type: '(value: string) => void', default: '-' },
    { property: 'placeholder', description: '未选择时在触发框内显示的占位文案', type: 'string', default: '-' },
    { property: 'disabled', description: '禁用整个选择器', type: 'boolean', default: 'false' },
    { property: 'size', description: '触发框尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'block', description: '撑满容器宽度', type: 'boolean', default: 'false' },
    { property: 'aria-label', description: '触发框与清单的无障碍名称', type: 'string', default: "'Select'" },
  ],
  en: [
    { property: 'options', description: 'Option list; every option accepts value, label, and disabled.', type: 'SelectOption[]', default: '-', required: true },
    { property: 'value / defaultValue', description: 'Controlled or initial selected value.', type: 'string', default: '-' },
    { property: 'onChange', description: 'Receives the next selected value.', type: '(value: string) => void', default: '-' },
    { property: 'placeholder', description: 'Shown in the trigger while nothing is selected.', type: 'string', default: '-' },
    { property: 'disabled', description: 'Disables the whole select.', type: 'boolean', default: 'false' },
    { property: 'size', description: 'Trigger scale.', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'block', description: 'Stretches the select to the container width.', type: 'boolean', default: 'false' },
    { property: 'aria-label', description: 'Accessible name of trigger and listbox.', type: 'string', default: "'Select'" },
  ],
}

const makeOptions = (values: string[], disabledIndex?: number): SelectOption[] => values.map((label, index) => ({
  value: `option-${index}`,
  label,
  disabled: index === disabledIndex,
}))

const controlledSelectCode = `import { useState } from 'react'
import { StarSelect, type SelectOption } from 'stardew-valley-ui'

const cropOptions: SelectOption[] = [
  { value: 'parsnip', label: 'Parsnip' },
  { value: 'potato', label: 'Potato' },
  { value: 'strawberry', label: 'Strawberry' },
]

export function CropPicker() {
  const [crop, setCrop] = useState('parsnip')

  return (
    <>
      <StarSelect options={cropOptions} value={crop} onChange={setCrop} aria-label="Crop" />
      <output>Selected: {crop}</output>
    </>
  )
}`

function StarSelectDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [crop, setCrop] = useState('option-0')
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'disabled', 'size', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={controlledSelectCode}
        data={[{ label: 'selected value', value: crop }]}
      >
        <StarSelect options={makeOptions(t.crops)} value={crop} onChange={setCrop} aria-label={t.demos[0][0]} />
      </StarComponentDemo>
      <StarComponentDemo
        id="disabled"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={'<StarSelect placeholder="选择工具" options={[{ value: "hoe", label: "锄头", disabled: true }]} />\n<StarSelect disabled options={options} defaultValue="option-0" />'}
      >
        <div style={{ display: 'grid', gap: 18 }}>
          <StarSelect placeholder={lang === 'zh' ? '选择工具' : 'Pick a tool'} options={makeOptions(t.tools, 0)} aria-label={t.demos[1][0]} />
          <StarSelect disabled options={makeOptions(t.tools)} defaultValue="option-2" aria-label={`${t.demos[1][0]} 2`} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="size"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={'<StarSelect size="small" options={options} />\n<StarSelect size="medium" options={options} />\n<StarSelect size="large" block options={options} />'}
      >
        <div style={{ display: 'grid', gap: 18 }}>
          <StarSelect size="small" options={[{ value: 'small', label: t.sizes[0] }]} defaultValue="small" aria-label={t.sizes[0]} />
          <StarSelect options={[{ value: 'medium', label: t.sizes[1] }]} defaultValue="medium" aria-label={t.sizes[1]} />
          <StarSelect size="large" block options={[{ value: 'large', label: t.sizes[2] }]} defaultValue="large" aria-label={t.sizes[2]} />
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Select API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarSelectDemoPage
