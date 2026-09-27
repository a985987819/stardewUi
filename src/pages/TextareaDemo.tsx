import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarTextarea } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '多行输入 Textarea',
    desc: '木框凹陷的多行输入框，是 Input 的高个子兄弟：同款 4px 阶梯木框与羊皮纸凹槽，用来写长信、备注和任务描述；支持状态染色、字数统计与拖拽调高。',
    toc: ['基础用法', '状态与校验', '字数统计', 'API'],
    demos: [
      ['基础用法', 'label 标注用途，rows 控制初始可见行数；autoSize 随内容自动长高并禁用拖拽，size 调整字号，color 可微调强调色。'],
      ['状态与校验', 'status 给木框和光标染色，message 在框下展示提示或校验文案；error 状态的提示会以 role="alert" 播报。'],
      ['字数统计', 'showCount 在右下角显示已输入字数，配合 maxLength 变为 已输入/上限；超限输入会被原生拦截。'],
    ],
    letterLabel: '给皮埃尔的信',
    letterPlaceholder: '亲爱的皮埃尔，最近的种子……',
    questLabel: '任务描述',
    questMessage: '描述至少 10 个字，请再补充些细节。',
    bioLabel: '农场简介',
    bioPlaceholder: '介绍一下你的农场……',
    bioDraft: '有机农场第四年，主种杨桃。',
  },
  en: {
    title: 'Textarea',
    desc: "A recessed multi-line field — Input's taller sibling: the same 4px stepped wooden frame and parchment groove, for letters, notes, and quest descriptions; with status tints, a character counter, and drag-to-resize.",
    toc: ['Basic Usage', 'Status & Validation', 'Character Count', 'API'],
    demos: [
      ['Basic Usage', 'A label names the purpose and rows set the visible height; autoSize grows the field with its content and disables the grip, size adjusts the type, and color tints the accent.'],
      ['Status & Validation', 'status tints the frame and caret, and message renders hints or validation copy below; error messages announce via role="alert".'],
      ['Character Count', 'showCount displays the typed length at the bottom-right, becoming typed/limit with maxLength; typing past the limit is blocked natively.'],
    ],
    letterLabel: 'Letter to Pierre',
    letterPlaceholder: 'Dear Pierre, about the seeds lately...',
    questLabel: 'Quest description',
    questMessage: 'At least 10 characters — please add more detail.',
    bioLabel: 'Farm bio',
    bioPlaceholder: 'Introduce your farm...',
    bioDraft: 'Year four of the organic farm, mostly starfruit.',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; letterLabel: string; letterPlaceholder: string; questLabel: string; questMessage: string; bioLabel: string; bioPlaceholder: string; bioDraft: string }>

const apiData = {
  zh: [
    { property: 'value', description: '受控文本；不传则组件自持状态', type: 'string', default: '-' },
    { property: 'defaultValue', description: '非受控初始文本', type: 'string', default: "''" },
    { property: 'onChange', description: '输入时触发，参数为最新文本', type: '(value: string) => void', default: '-' },
    { property: 'rows', description: '初始可见行数', type: 'number', default: '4' },
    { property: 'size', description: '尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'status', description: '语义状态，决定框与光标颜色', type: "'default' | 'warning' | 'error' | 'success'", default: "'default'" },
    { property: 'color', description: '自定义强调色，优先于 status', type: 'string', default: '-' },
    { property: 'label', description: '可见标签，通过 htmlFor 绑定输入框', type: 'ReactNode', default: '-' },
    { property: 'message', description: '框下方的提示或校验文案', type: 'ReactNode', default: '-' },
    { property: 'showCount', description: '显示字数统计', type: 'boolean', default: 'false' },
    { property: 'block', description: '铺满容器宽度', type: 'boolean', default: 'false' },
  ],
  en: [
    { property: 'value', description: 'Controlled text; omit to let the field keep its own state.', type: 'string', default: '-' },
    { property: 'defaultValue', description: 'Initial text for the uncontrolled field.', type: 'string', default: "''" },
    { property: 'onChange', description: 'Fires while typing with the next text.', type: '(value: string) => void', default: '-' },
    { property: 'rows', description: 'Visible rows before scrolling.', type: 'number', default: '4' },
    { property: 'size', description: 'Field size.', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'status', description: 'Semantic tint for the frame and caret.', type: "'default' | 'warning' | 'error' | 'success'", default: "'default'" },
    { property: 'color', description: 'Custom accent; overrides status.', type: 'string', default: '-' },
    { property: 'label', description: 'Visible caption bound via htmlFor.', type: 'ReactNode', default: '-' },
    { property: 'message', description: 'Hint or validation copy under the field.', type: 'ReactNode', default: '-' },
    { property: 'showCount', description: 'Shows the character counter.', type: 'boolean', default: 'false' },
    { property: 'block', description: 'Stretches to the container width.', type: 'boolean', default: 'false' },
  ],
}

const basicCode = `import { StarTextarea } from 'stardew-valley-ui'

<StarTextarea label="Letter to Pierre" autoSize rows={4} block />
<StarTextarea label="Farm bio" size="small" defaultValue="Year four." rows={2} block />
<StarTextarea label="Quest" color="#308BE2" rows={3} block />`

const statusCode = `import { StarTextarea } from 'stardew-valley-ui'

<StarTextarea label="Quest" status="error" message="Too short.">
<StarTextarea label="Saved" status="success" message="All good." />
<StarTextarea label="Accent" color="#308BE2" />`

const countCode = `import { StarTextarea } from 'stardew-valley-ui'

<StarTextarea label="Farm bio" showCount maxLength={80} />`

function StarTextareaDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'status', 'count', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={basicCode}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
          <StarTextarea label={t.letterLabel} placeholder={t.letterPlaceholder} autoSize rows={4} block />
          <StarTextarea label={t.bioLabel} size="small" defaultValue={t.bioDraft} rows={2} block />
          <StarTextarea label={t.questLabel} color="#308BE2" rows={3} block />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="status"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={statusCode}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
          <StarTextarea label={t.questLabel} status="error" message={t.questMessage} rows={3} block />
          <StarTextarea label={t.bioLabel} status="success" rows={3} block />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="count"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={countCode}
      >
        <div style={{ width: '100%' }}>
          <CountTextarea label={t.bioLabel} placeholder={t.bioPlaceholder} />
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Textarea API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

function CountTextarea({ label, placeholder }: { label: string; placeholder: string }) {
  const [text, setText] = useState('')

  return (
    <StarTextarea
      label={label}
      placeholder={placeholder}
      showCount
      maxLength={80}
      rows={3}
      block
      value={text}
      onChange={setText}
    />
  )
}

export default StarTextareaDemoPage
