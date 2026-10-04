import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarNineSliceButton, StarTextarea } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '多行输入 Textarea',
    desc: '木框凹陷的多行输入框，是 Input 的高个子兄弟：同款 4px 阶梯木框与羊皮纸凹槽，用来写长信、备注和任务描述；支持状态染色、字数统计与拖拽调高。',
    toc: ['基础用法', '状态与校验', '字数统计', '礼物附言', '便签板', 'API'],
    demos: [
      ['基础用法', 'label 标注用途，rows 控制初始可见行数；autoSize 随内容自动长高并禁用拖拽，size 调整字号，color 可微调强调色。'],
      ['状态与校验', 'status 给木框和光标染色，message 在框下展示提示或校验文案；error 状态的提示会以 role="alert" 播报。'],
      ['字数统计', 'showCount 在右下角显示已输入字数，配合 maxLength 变为 已输入/上限；超限输入会被原生拦截。'],
      ['礼物附言', '给朋友的礼物写一句附言：空着报错、不足六字警告、合格成功——status 与 message 跟着输入实时变化，合格后才能打包。'],
      ['便签板', 'allowClear 在计数器左边立起一枚小 ×，随时清空；回车直接把便签钉到板上（onPressEnter，中文输入法选词回车不会误触，Shift+Enter 仍然换行）。'],
    ],
    letterLabel: '给皮埃尔的信',
    letterPlaceholder: '亲爱的皮埃尔，最近的种子……',
    questLabel: '任务描述',
    questMessage: '描述至少 10 个字，请再补充些细节。',
    bioLabel: '农场简介',
    bioPlaceholder: '介绍一下你的农场……',
    bioDraft: '有机农场第四年，主种杨桃。',
    gift: '礼物附言',
    giftLabel: '附言',
    giftPlaceholder: '写点想对 TA 说的话……',
    giftEmpty: '空着手可不行，写点什么吧。',
    giftShort: '再多写几个字，收到的人会更开心。',
    giftPerfect: '包装完成！好感度 +80。',
    giftPack: '打包礼物',
    giftPacked: '已放进背包，快去送吧！',
    giftAgain: '再写一张',
    noteLabel: '便签',
    notePlaceholder: '写一条待办，回车钉到板上……',
    noteHint: '回车钉板，Shift+Enter 换行；写岔了点 × 随时清空。',
    noteClear: '清空',
    notePin: '钉到板上',
    noteEmpty: '板上还没有便签。',
    noteRemove: '撢下',
  },
  en: {
    title: 'Textarea',
    desc: "A recessed multi-line field — Input's taller sibling: the same 4px stepped wooden frame and parchment groove, for letters, notes, and quest descriptions; with status tints, a character counter, and drag-to-resize.",
    toc: ['Basic Usage', 'Status & Validation', 'Character Count', 'Gift Note', 'Sticky Notes', 'API'],
    demos: [
      ['Basic Usage', 'A label names the purpose and rows set the visible height; autoSize grows the field with its content and disables the grip, size adjusts the type, and color tints the accent.'],
      ['Status & Validation', 'status tints the frame and caret, and message renders hints or validation copy below; error messages announce via role="alert".'],
      ['Character Count', 'showCount displays the typed length at the bottom-right, becoming typed/limit with maxLength; typing past the limit is blocked natively.'],
      ['Gift Note', 'Write a note for a friend\'s gift: empty errors, under six characters warns, and a pass turns success — status and message follow every keystroke, and only a pass can be wrapped.'],
      ['Sticky Notes', 'allowClear raises a tiny × left of the counter for an instant wipe; Enter pins the note straight onto the board (onPressEnter — IME composing won\'t misfire, Shift+Enter still breaks a line).'],
    ],
    letterLabel: 'Letter to Pierre',
    letterPlaceholder: 'Dear Pierre, about the seeds lately...',
    questLabel: 'Quest description',
    questMessage: 'At least 10 characters — please add more detail.',
    bioLabel: 'Farm bio',
    bioPlaceholder: 'Introduce your farm...',
    bioDraft: 'Year four of the organic farm, mostly starfruit.',
    gift: 'Gift Note',
    giftLabel: 'Note',
    giftPlaceholder: 'Write something for the lucky friend...',
    giftEmpty: 'Arriving empty-handed? Write a line or two.',
    giftShort: 'A few more words will earn extra hearts.',
    giftPerfect: 'Wrapped! Friendship +80.',
    giftPack: 'Wrap the gift',
    giftPacked: 'In the backpack — go deliver it!',
    giftAgain: 'Write another',
    noteLabel: 'Sticky note',
    notePlaceholder: 'Write a to-do, hit Enter to pin...',
    noteHint: 'Enter pins, Shift+Enter breaks a line; the × wipes the field anytime.',
    noteClear: 'Clear',
    notePin: 'Pin it',
    noteEmpty: 'No notes pinned yet.',
    noteRemove: 'Tear off',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; letterLabel: string; letterPlaceholder: string; questLabel: string; questMessage: string; bioLabel: string; bioPlaceholder: string; bioDraft: string; gift: string; giftLabel: string; giftPlaceholder: string; giftEmpty: string; giftShort: string; giftPerfect: string; giftPack: string; giftPacked: string; giftAgain: string; noteLabel: string; notePlaceholder: string; noteHint: string; noteClear: string; notePin: string; noteEmpty: string; noteRemove: string }>

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
    { property: 'allowClear', description: '显示一键清空按钮（有内容且可编辑时出现）', type: 'boolean', default: 'false' },
    { property: 'clearLabel', description: '清空按钮的无障碍名称', type: 'string', default: "'Clear'" },
    { property: 'onPressEnter', description: '按下回车时触发（Shift+Enter 与输入法选词不触发）', type: '(event: KeyboardEvent) => void', default: '-' },
    { property: 'autoSize', description: '随内容自动增高，并禁用手动拖拽手柄', type: 'boolean', default: 'false' },
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
    { property: 'allowClear', description: 'Shows a clear button while editable with content.', type: 'boolean', default: 'false' },
    { property: 'clearLabel', description: 'Accessible name of the clear button.', type: 'string', default: "'Clear'" },
    { property: 'onPressEnter', description: 'Fires on bare Enter (Shift+Enter and IME composing excluded).', type: '(event: KeyboardEvent) => void', default: '-' },
    { property: 'autoSize', description: 'Grows with the content and disables the manual resize grip.', type: 'boolean', default: 'false' },
  ],
}

const basicCode = `import { StarTextarea } from 'stardew-valley-ui'

export function JournalFields() {
  return (
    <>
      <StarTextarea label="Letter to Pierre" autoSize rows={4} block />
      <StarTextarea label="Farm bio" size="small" defaultValue="Year four." rows={2} block />
      <StarTextarea label="Quest" color="#308BE2" rows={3} block />
    </>
  )
}`

const statusCode = `import { StarTextarea } from 'stardew-valley-ui'

export function StatusFields() {
  return (
    <>
      <StarTextarea label="Quest" status="error" message="Too short." />
      <StarTextarea label="Saved" status="success" message="All good." />
      <StarTextarea label="Accent" color="#308BE2" />
    </>
  )
}`

const countCode = `import { StarTextarea } from 'stardew-valley-ui'

<StarTextarea label="Farm bio" showCount maxLength={80} />`

const giftCode = `import { useState } from 'react'
import { StarNineSliceButton, StarTextarea } from 'stardew-valley-ui'

export function GiftNote() {
  const [text, setText] = useState('')
  // Empty errors, short warns, a pass turns success.
  const status = !text ? 'error' : text.length < 10 ? 'warning' : 'success'
  const message = !text
    ? 'Write something first.'
    : text.length < 10
      ? 'A bit more, please.'
      : 'Ready to wrap.'

  // Wire this to your own submit handler.
  const wrap = (note: string) => console.log('wrapping:', note)

  return (
    <>
      <StarTextarea
        label="Note"
        rows={3}
        block
        showCount
        maxLength={60}
        value={text}
        onChange={setText}
        status={status}
        message={message}
      />
      <StarNineSliceButton size="small" disabled={status !== 'success'} onClick={() => wrap(text)}>
        Wrap the gift
      </StarNineSliceButton>
    </>
  )
}`

const noteCode = `import { useState } from 'react'
import { StarTextarea } from 'stardew-valley-ui'

export function StickyNotes() {
  const [text, setText] = useState('')
  const [notes, setNotes] = useState([])
  // Enter pins the note; Shift+Enter keeps typing a new line.
  const pin = () => {
    if (!text.trim()) return
    setNotes((current) => [...current, text.trim()])
    setText('')
  }
  return (
    <StarTextarea
      label="Sticky note"
      rows={2}
      block
      showCount
      maxLength={40}
      allowClear
      value={text}
      onChange={setText}
      onPressEnter={pin}
    />
  )
}`

function StarTextareaDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'status', 'count', 'gift', 'note', 'api'][index], title, level: 1 }))

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
      <StarComponentDemo
        id="gift"
        title={t.demos[3][0]}
        description={t.demos[3][1]}
        code={giftCode}
      >
        <GiftNote
          label={t.giftLabel}
          placeholder={t.giftPlaceholder}
          empty={t.giftEmpty}
          short={t.giftShort}
          perfect={t.giftPerfect}
          packLabel={t.giftPack}
          packedLabel={t.giftPacked}
          againLabel={t.giftAgain}
        />
      </StarComponentDemo>
      <StarComponentDemo
        id="note"
        title={t.demos[4][0]}
        description={t.demos[4][1]}
        code={noteCode}
      >
        <StickyNotes
          label={t.noteLabel}
          placeholder={t.notePlaceholder}
          hint={t.noteHint}
          clearLabel={t.noteClear}
          pinLabel={t.notePin}
          emptyLabel={t.noteEmpty}
          removeLabel={t.noteRemove}
        />
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable data={apiData[lang]} />
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

const noteChipStyle = {
  padding: '4px 10px',
  border: '2px solid #b5895a',
  background: '#fff3dc',
  color: '#4a2c1a',
  fontSize: 12,
  display: 'inline-flex',
  gap: 6,
  alignItems: 'center',
} as const

function StickyNotes({
  label,
  placeholder,
  hint,
  clearLabel,
  pinLabel,
  emptyLabel,
  removeLabel,
}: {
  label: string
  placeholder: string
  hint: string
  clearLabel: string
  pinLabel: string
  emptyLabel: string
  removeLabel: string
}) {
  const [text, setText] = useState('')
  const [notes, setNotes] = useState<string[]>([])

  const pin = () => {
    const next = text.trim()
    if (!next) return
    setNotes((current) => [...current, next])
    setText('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <StarTextarea
        label={label}
        placeholder={placeholder}
        rows={2}
        block
        showCount
        maxLength={40}
        allowClear
        clearLabel={clearLabel}
        value={text}
        onChange={setText}
        onPressEnter={pin}
      />
      <span style={{ fontSize: 12, opacity: 0.75 }}>{hint}</span>
      <div style={{ display: 'flex', gap: 10 }}>
        <StarNineSliceButton type="button" size="small" variant="primary" onClick={pin}>{pinLabel}</StarNineSliceButton>
      </div>
      {notes.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>{emptyLabel}</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {notes.map((note, index) => (
            <span key={`${index}-${note}`} style={noteChipStyle}>
              {note}
              <button
                type="button"
                aria-label={`${removeLabel}: ${note}`}
                onClick={() => setNotes((current) => current.filter((_, i) => i !== index))}
                style={{
                  // Mirrors Tag's closable button: a small filled square instead
                  // of a floating glyph, so the remove affordance actually reads
                  // as a control inside the chip.
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  padding: 0,
                  border: 0,
                  borderRadius: 2,
                  background: '#b5895a',
                  color: '#fff3dc',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function GiftNote({
  label,
  placeholder,
  empty,
  short,
  perfect,
  packLabel,
  packedLabel,
  againLabel,
}: {
  label: string
  placeholder: string
  empty: string
  short: string
  perfect: string
  packLabel: string
  packedLabel: string
  againLabel: string
}) {
  const [text, setText] = useState('')
  const [packed, setPacked] = useState(false)

  const trimmed = text.trim()
  const status = trimmed.length === 0 ? 'error' : trimmed.length < 6 ? 'warning' : 'success'
  const message = status === 'error' ? empty : status === 'warning' ? short : perfect

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <StarTextarea
        label={label}
        placeholder={placeholder}
        rows={3}
        block
        showCount
        maxLength={60}
        value={text}
        status={status}
        message={message}
        onChange={(next) => {
          setText(next)
          setPacked(false)
        }}
      />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <StarNineSliceButton
          type="button"
          size="small"
          variant="primary"
          disabled={status !== 'success'}
          onClick={() => setPacked(true)}
        >
          {packLabel}
        </StarNineSliceButton>
        {text ? (
          <StarNineSliceButton
            type="button"
            size="small"
            onClick={() => {
              setText('')
              setPacked(false)
            }}
          >
            {againLabel}
          </StarNineSliceButton>
        ) : null}
        {packed ? <span style={{ fontSize: 12, color: '#557d3c' }}>{packedLabel}</span> : null}
      </div>
    </div>
  )
}
