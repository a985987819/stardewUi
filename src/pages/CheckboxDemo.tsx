import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarCheckbox, type CheckboxOption } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'Checkbox 多选框',
    desc: '像贴在农场任务板上的小印章一样勾选作物、准备项和偏好：Card 式木框承托红色对勾，出现时从左向右揭开，取消时像评分图标一样摇晃缩退。',
    toc: ['横向多选', '纵向与禁用项', '尺寸与形状', 'API'],
    demos: [
      ['横向多选', '默认水平排列，适合并排选择一组作物或装备。红色 ✔ 会从左向右先慢后快地显现。'],
      ['纵向与禁用项', 'direction="vertical" 适合设置清单；单个选项可以通过 disabled 保持可见但不可选择。'],
      ['尺寸与形状', 'size 控制控件密度；shape 默认 square，也可以切换为 round 印章框。'],
    ],
    crops: ['防风草', '土豆', '草莓'],
    tasks: ['带上镐子', '准备补给', '矿洞钥匙（未解锁）'],
    sizes: ['小号方框', '中号圆框', '大号方框'],
  },
  en: {
    title: 'Checkbox',
    desc: 'Check crops, preparations, and preferences like small stamps pinned to a farm task board: a Card-material frame carries a red check that reveals left to right and leaves with Rating’s shake-and-shrink motion.',
    toc: ['Horizontal Group', 'Vertical & Disabled', 'Sizes & Shapes', 'API'],
    demos: [
      ['Horizontal Group', 'Horizontal is the default for crops and equipment that belong side by side. The red ✔ reveals left to right, slow first and then faster.'],
      ['Vertical & Disabled', 'Use direction="vertical" for a settings list. Individual disabled options remain visible but cannot be chosen.'],
      ['Sizes & Shapes', 'size controls density; shape defaults to square and can switch to a round seal frame.'],
    ],
    crops: ['Parsnip', 'Potato', 'Strawberry'],
    tasks: ['Bring pickaxe', 'Pack supplies', 'Mine key (locked)'],
    sizes: ['Small square', 'Medium round', 'Large square'],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; crops: string[]; tasks: string[]; sizes: string[] }>

const apiData = {
  zh: [
    { property: 'options', description: '选项列表，单项可配置 value、label 与 disabled', type: 'CheckboxOption[]', default: '-' , required: true },
    { property: 'value / defaultValue', description: '受控选中值或非受控初始选中值', type: 'string[]', default: '[]' },
    { property: 'onChange', description: '选中项变化时返回完整的 value 数组', type: '(value: string[]) => void', default: '-' },
    { property: 'direction', description: '选项排列方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
    { property: 'disabled', description: '禁用整个多选框组', type: 'boolean', default: 'false' },
    { property: 'size', description: '控件尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'shape', description: '控件轮廓', type: "'square' | 'round'", default: "'square'" },
    { property: 'aria-label', description: '多选框组的无障碍名称', type: 'string', default: "'Checkbox'" },
  ],
  en: [
    { property: 'options', description: 'Option list; every option accepts value, label, and disabled.', type: 'CheckboxOption[]', default: '-', required: true },
    { property: 'value / defaultValue', description: 'Controlled or initial selected values.', type: 'string[]', default: '[]' },
    { property: 'onChange', description: 'Receives the complete next selection.', type: '(value: string[]) => void', default: '-' },
    { property: 'direction', description: 'Option layout direction.', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
    { property: 'disabled', description: 'Disables the full checkbox group.', type: 'boolean', default: 'false' },
    { property: 'size', description: 'Control scale.', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'shape', description: 'Control outline.', type: "'square' | 'round'", default: "'square'" },
    { property: 'aria-label', description: 'Accessible group name.', type: 'string', default: "'Checkbox'" },
  ],
}

const makeOptions = (values: string[], disabledIndex?: number): CheckboxOption[] => values.map((label, index) => ({
  value: `option-${index}`,
  label,
  disabled: index === disabledIndex,
}))

function StarCheckboxDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [crops, setCrops] = useState(['option-0'])
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'vertical', 'size', 'api'][index], title, level: 1 }))
  const cropOptions = makeOptions(t.crops)
  const taskOptions = makeOptions(t.tasks, 2)

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]} code={'<StarCheckbox options={crops} value={value} onChange={setValue} />'}>
        <StarCheckbox options={cropOptions} value={crops} onChange={setCrops} aria-label={t.demos[0][0]} />
      </StarComponentDemo>
      <StarComponentDemo id="vertical" title={t.demos[1][0]} description={t.demos[1][1]} code={'<StarCheckbox direction="vertical" options={[{ value: "key", label: "Mine key", disabled: true }]} />'}>
        <StarCheckbox direction="vertical" options={taskOptions} defaultValue={['option-0']} aria-label={t.demos[1][0]} />
      </StarComponentDemo>
      <StarComponentDemo id="size" title={t.demos[2][0]} description={t.demos[2][1]} code={'<StarCheckbox size="small" shape="square" options={options} />\n<StarCheckbox size="medium" shape="round" options={options} />'}>
        <div style={{ display: 'grid', gap: 18 }}>
          <StarCheckbox size="small" options={[{ value: 'small', label: t.sizes[0] }]} defaultValue={['small']} aria-label={t.sizes[0]} />
          <StarCheckbox shape="round" options={[{ value: 'medium', label: t.sizes[1] }]} defaultValue={['medium']} aria-label={t.sizes[1]} />
          <StarCheckbox size="large" options={[{ value: 'large', label: t.sizes[2] }]} defaultValue={['large']} aria-label={t.sizes[2]} />
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Checkbox API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarCheckboxDemoPage
