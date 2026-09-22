import { useState } from 'react'
import { Coins, Lock, Search, User } from 'lucide-react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarInput } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'Input 输入框',
    desc: '木框凹陷的像素输入框：4px 阶梯边框 + 顶部内阴影，写农场名、村民昵称或给皮埃尔留言都像在羊皮纸上落笔。',
    toc: ['基础输入', '前缀与清除', '校验状态', '尺寸与字数', 'API'],
    demos: [
      ['基础输入', '受控与非受控都可以；label 通过 for/id 绑定，点标题就能聚焦输入框。'],
      ['前缀与清除', '图标或单位放进输入框内部强调用途，allowClear 附加一个像素叉来一键清空。'],
      ['校验状态', 'status 同时改变边框颜色和下方提示文字，message 用来解释哪里不对。'],
      ['尺寸与字数', 'small、medium、large 对应不同密度；showCount 配合 maxLength 做硬性字数限制。'],
    ],
    labels: {
      farmName: '农场名',
      nickname: '村民昵称',
      note: '给皮埃尔的留言',
      budget: '今日预算',
      price: '售价',
      search: '搜索作物',
      ship: '出货箱名称',
    },
    placeholders: {
      farmName: '例如：鹈鹕农场',
      nickname: '输入村民名字',
      note: '今天想买点什么？',
      search: '搜索…',
    },
    messages: {
      error: '名字最多 12 个字，剩下的要留给鸡舍。',
      warning: '这个名字有点长，寄信时会挤在一起。',
      success: '听起来是个好农场，可以开张了。',
    },
  },
  en: {
    title: 'Input',
    desc: 'A recessed pixel text field: 4px stepped frame over a parchment fill, for farm names, villager nicknames, and notes to Pierre.',
    toc: ['Basic Input', 'Affix & Clear', 'Validation', 'Sizes & Count', 'API'],
    demos: [
      ['Basic Input', 'Controlled or uncontrolled; the label is bound with for/id, so tapping the caption focuses the field.'],
      ['Affix & Clear', 'Icons or units sit inside the frame, and allowClear adds a pixel × for one-tap emptying.'],
      ['Validation', 'status tints both the frame and the message below it, while message explains what went wrong.'],
      ['Sizes & Count', 'small, medium, and large map to different densities; showCount plus maxLength hard-caps the length.'],
    ],
    labels: {
      farmName: 'Farm name',
      nickname: 'Villager nickname',
      note: 'Note to Pierre',
      budget: 'Daily budget',
      price: 'Price',
      search: 'Search crops',
      ship: 'Shipping bin label',
    },
    placeholders: {
      farmName: 'e.g. Pelican Farm',
      nickname: 'Type a villager name',
      note: 'What are you buying today?',
      search: 'Search…',
    },
    messages: {
      error: 'At most 12 characters — the coop needs the rest of the sign.',
      warning: 'That name is long enough to crowd the envelope.',
      success: 'Sounds like a farm worth opening.',
    },
  },
} satisfies Record<
  Lang,
  {
    title: string
    desc: string
    toc: string[]
    demos: string[][]
    labels: Record<string, string>
    placeholders: Record<string, string>
    messages: Record<string, string>
  }
>

const apiData = {
  zh: [
    { property: 'value / defaultValue', description: '受控值或初始值', type: 'string', default: "''" },
    { property: 'onChange', description: '文本变化回调，同时返回最新文本', type: '(value: string) => void', default: '-' },
    { property: 'label', description: '可见标题，用 for/id 绑定输入框', type: 'ReactNode', default: '-' },
    { property: 'message', description: '字段下方的提示或校验文案', type: 'ReactNode', default: '-' },
    { property: 'status', description: '语义状态，决定边框与提示颜色', type: "'default' | 'warning' | 'error' | 'success'", default: "'default'" },
    { property: 'size', description: '输入框尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'color', description: '强调色，覆盖 status 的默认色', type: 'string', default: "'#71964a'" },
    { property: 'prefix / suffix', description: '框内的前置 / 后置内容', type: 'ReactNode', default: '-' },
    { property: 'allowClear', description: '显示一键清空按钮', type: 'boolean', default: 'false' },
    { property: 'showCount', description: '显示字数（配合 maxLength 显示 n/max）', type: 'boolean', default: 'false' },
    { property: 'block', description: '撑满容器宽度', type: 'boolean', default: 'false' },
  ],
  en: [
    { property: 'value / defaultValue', description: 'Controlled text or initial text.', type: 'string', default: "''" },
    { property: 'onChange', description: 'Fires with the latest text.', type: '(value: string) => void', default: '-' },
    { property: 'label', description: 'Visible caption bound with for/id.', type: 'ReactNode', default: '-' },
    { property: 'message', description: 'Hint or validation copy under the field.', type: 'ReactNode', default: '-' },
    { property: 'status', description: 'Semantic tint for frame and message.', type: "'default' | 'warning' | 'error' | 'success'", default: "'default'" },
    { property: 'size', description: 'Field size.', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'color', description: 'Accent that overrides the status tint.', type: 'string', default: "'#71964a'" },
    { property: 'prefix / suffix', description: 'Content rendered inside the frame.', type: 'ReactNode', default: '-' },
    { property: 'allowClear', description: 'Shows the clear button.', type: 'boolean', default: 'false' },
    { property: 'showCount', description: 'Shows the length (n/max with maxLength).', type: 'boolean', default: 'false' },
    { property: 'block', description: 'Stretches to the container width.', type: 'boolean', default: 'false' },
  ],
}

const stackStyle = { display: 'grid', gap: 16, width: 'min(100%, 420px)' } as const

const controlledInputCode = `import { useState } from 'react'
import { StarInput } from 'stardew-valley-ui'

export function FarmNameField() {
  const [farmName, setFarmName] = useState('Pelican Farm')

  return (
    <>
      <StarInput label="Farm name" value={farmName} onChange={setFarmName} block />
      <output>Farm name: {farmName || '(empty)'}</output>
    </>
  )
}`

const controlledAffixInputCode = `import { useState } from 'react'
import { Search, User } from 'lucide-react'
import { StarInput } from 'stardew-valley-ui'

export function ShippingBinField() {
  const [shippingBinLabel, setShippingBinLabel] = useState('')

  return (
    <>
      <StarInput
        label="Shipping bin label"
        prefix={<User size={16} />}
        value={shippingBinLabel}
        onChange={setShippingBinLabel}
        allowClear
      />
      <StarInput label="Search crops" prefix={<Search size={16} />} allowClear />
      <output>Shipping bin label: {shippingBinLabel || '(empty)'}</output>
    </>
  )
}`

function StarInputDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [farmName, setFarmName] = useState('鹈鹕农场')
  const [nickname, setNickname] = useState('')
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'affix', 'status', 'size', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={controlledInputCode}
        data={[{ label: 'farmName', value: farmName || '(empty)' }]}
      >
        <div style={stackStyle}>
          <StarInput
            label={t.labels.farmName}
            placeholder={t.placeholders.farmName}
            value={farmName}
            onChange={setFarmName}
            block
          />
          <StarInput label={t.labels.nickname} placeholder={t.placeholders.nickname} defaultValue="阿比盖尔" block />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="affix"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={controlledAffixInputCode}
        data={[{ label: 'shippingBinLabel', value: nickname || '(empty)' }]}
      >
        <div style={stackStyle}>
          <StarInput
            label={t.labels.search}
            placeholder={t.placeholders.search}
            prefix={<Search size={16} />}
            allowClear
            clearLabel={lang === 'zh' ? '清空' : 'Clear'}
            defaultValue="上古水果"
            block
          />
          <StarInput
            label={t.labels.price}
            prefix={<Coins size={16} />}
            suffix={lang === 'zh' ? '金币' : 'g'}
            defaultValue="1200"
            block
          />
          <StarInput
            label={t.labels.ship}
            prefix={<User size={16} />}
            placeholder={t.placeholders.nickname}
            value={nickname}
            onChange={setNickname}
            block
          />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="status"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={'<StarInput status="error" message="…" maxLength={12} showCount />'}
      >
        <div style={stackStyle}>
          <StarInput
            label={t.labels.farmName}
            status="error"
            message={t.messages.error}
            maxLength={12}
            showCount
            defaultValue="鹈鹕镇的第四个农场"
            block
          />
          <StarInput
            label={t.labels.note}
            status="warning"
            message={t.messages.warning}
            prefix={<Lock size={16} />}
            defaultValue="请给我留一包防风草种子"
            block
          />
          <StarInput
            label={t.labels.nickname}
            status="success"
            message={t.messages.success}
            color="#71964a"
            defaultValue="月光农场"
            block
          />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="size"
        title={t.demos[3][0]}
        description={t.demos[3][1]}
        code={'<StarInput size="large" maxLength={20} showCount />'}
      >
        <div style={stackStyle}>
          <StarInput size="small" label={t.labels.nickname} placeholder={t.placeholders.nickname} block />
          <StarInput label={t.labels.nickname} placeholder={t.placeholders.nickname} block />
          <StarInput
            size="large"
            label={t.labels.budget}
            suffix={lang === 'zh' ? '金币' : 'g'}
            maxLength={20}
            showCount
            defaultValue="春天的第一笔种子钱"
            block
          />
          <StarInput label={t.labels.note} placeholder={t.placeholders.note} disabled allowClear block />
        </div>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable title="Input API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarInputDemoPage
