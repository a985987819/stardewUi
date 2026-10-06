import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarTag, type TagTone } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '标签 Tag',
    desc: '像钉在告示板上的木牌小签，用来标记作物品质、任务状态与分类：羊皮纸底配两像素木框，阶梯角与输入框同族，可关闭的标签点击 × 后自行摘下。',
    toc: ['基础用法', '预设色板', '可关闭', 'API'],
    demos: [
      ['基础用法', '默认的羊皮纸底加深棕木框，适合并排摆放一组分类或状态小签。'],
      ['预设色板', 'tone 提供六种取自项目色板的预设：只更换木框、文字与关闭悬停色，底色保持同一张羊皮纸，一排标签仍是同一种材质。tone 是「从这六档里挑一档」，color 才是任意 CSS 颜色 —— 与全库其它组件一致。'],
      ['可关闭', 'closable 显示像素 ×，点击后标签自行移除并触发 onClose；示例把标签放进一个可增删的清单里，配合父级状态使用。'],
    ],
    basic: ['防风草', '春季作物', '成长 4 天'],
    colors: ['铱星品质', '新鲜作物', '高峰定价', '深海鱼', '秘境种子'],
    colorNames: ['默认', '绿', '红', '黄', '蓝', '紫'],
    addTag: '加一个标签',
    removed: '已移除',
  },
  en: {
    title: 'Tag',
    desc: 'Little wooden name tags pinned to the notice board for crop quality, quest states, and categories: a parchment fill inside a 2px wood ring, stepped corners in the Input family, and a closable × that unpins the tag.',
    toc: ['Basic Usage', 'Preset Colors', 'Closable', 'API'],
    demos: [
      ['Basic Usage', 'The default parchment fill with a dark brown wood ring, for a row of category or status tags sitting side by side.'],
      ['Preset Colors', 'tone ships six presets drawn from the project palette: the ring, text, and close-hover accent swap while the parchment fill stays shared, so a row of tags still reads as one material. tone means "pick one of these six"; color is any CSS colour, as in every other component.'],
      ['Closable', 'closable shows a pixel × that removes the tag and fires onClose. The demo keeps tags in an editable list driven by parent state.'],
    ],
    basic: ['Parsnip', 'Spring crop', 'Grows in 4 days'],
    colors: ['Iridium quality', 'Fresh crops', 'Peak pricing', 'Ocean fish', 'Secret seeds'],
    colorNames: ['Default', 'Green', 'Red', 'Yellow', 'Blue', 'Purple'],
    addTag: 'Add a tag',
    removed: 'Removed',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; basic: string[]; colors: string[]; colorNames: string[]; addTag: string; removed: string }>

const apiData = {
  zh: [
    { property: 'tone', description: '预设配色：更换木框、文字与关闭悬停色', type: "'default' | 'green' | 'red' | 'yellow' | 'blue' | 'purple'", default: "'default'" },
    { property: 'color', description: '任意 CSS 颜色，覆盖 tone 的预设', type: 'string', default: '-' },
    { property: 'closable', description: '是否显示像素 × 关闭按钮', type: 'boolean', default: 'false' },
    { property: 'open', description: '受控可见性；关闭后可由外部复位', type: 'boolean', default: '-' },
    { property: 'defaultOpen', description: '非受控模式的初始可见性', type: 'boolean', default: 'true' },
    { property: 'onClose', description: '点击关闭按钮移除标签后触发', type: '() => void', default: '-' },
    { property: 'closeLabel', description: '关闭按钮的无障碍名称', type: 'string', default: "'Close'" },
    { property: 'children', description: '标签内容', type: 'ReactNode', default: '-' },
  ],
  en: [
    { property: 'tone', description: 'Preset ink for the ring, text, and close-hover accent.', type: "'default' | 'green' | 'red' | 'yellow' | 'blue' | 'purple'", default: "'default'" },
    { property: 'color', description: 'Any CSS colour; overrides the tone preset.', type: 'string', default: '-' },
    { property: 'closable', description: 'Shows the pixel × close button.', type: 'boolean', default: 'false' },
    { property: 'open', description: 'Controlled visibility; lets a dismissed tag be restored.', type: 'boolean', default: '-' },
    { property: 'defaultOpen', description: 'Starting visibility for the uncontrolled mode.', type: 'boolean', default: 'true' },
    { property: 'onClose', description: 'Fires after the close button removes the tag.', type: '() => void', default: '-' },
    { property: 'closeLabel', description: 'Accessible name of the close button.', type: 'string', default: "'Close'" },
    { property: 'children', description: 'Tag content.', type: 'ReactNode', default: '-' },
  ],
}

const basicTagCode = `import { StarTag } from 'stardew-valley-ui'

export function CropQualityTags() {
  return (
    <>
      <StarTag>防风草</StarTag>
      <StarTag tone="green">新鲜作物</StarTag>
      <StarTag tone="red">高峰定价</StarTag>
    </>
  )
}`

const closableTagCode = `import { useState } from 'react'
import { StarTag } from 'stardew-valley-ui'

export function RemovableTags() {
  const [tags, setTags] = useState(['防风草', '土豆', '草莓'])

  return (
    <>
      {tags.map((tag) => (
        <StarTag key={tag} closable onClose={() => setTags(tags.filter((item) => item !== tag))}>
          {tag}
        </StarTag>
      ))}
    </>
  )
}`

const TAG_TONES: TagTone[] = ['default', 'green', 'red', 'yellow', 'blue', 'purple']

function StarTagDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [tags, setTags] = useState([t.basic[0], t.basic[1]])
  const [removalNote, setRemovalNote] = useState('')
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'colors', 'closable', 'api'][index], title, level: 1 }))

  const removeTag = (tag: string) => {
    setTags((current) => current.filter((item) => item !== tag))
    setRemovalNote(`${t.removed}: ${tag}`)
  }

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={basicTagCode}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <StarTag>{t.basic[0]}</StarTag>
          <StarTag>{t.basic[1]}</StarTag>
          <StarTag>{t.basic[2]}</StarTag>
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="colors"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={lang === 'zh'
          ? '<StarTag tone="green">新鲜作物</StarTag>\n<StarTag tone="red">高峰定价</StarTag>\n<StarTag tone="yellow">待交付</StarTag>\n<StarTag tone="blue">深海鱼</StarTag>\n<StarTag tone="purple">秘境种子</StarTag>'
          : '<StarTag tone="green">Fresh crop</StarTag>\n<StarTag tone="red">Peak price</StarTag>\n<StarTag tone="yellow">Awaiting delivery</StarTag>\n<StarTag tone="blue">Deep sea fish</StarTag>\n<StarTag tone="purple">Secret seeds</StarTag>'}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          {TAG_TONES.map((color, index) => (
            <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, opacity: 0.7, minWidth: 56 }}>{t.colorNames[index]}</span>
              <StarTag tone={color}>{t.colors[index]}</StarTag>
            </div>
          ))}
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="closable"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={closableTagCode}
        data={[{ label: 'tags', value: tags.length ? tags.join(', ') : '[]' }, { label: 'last event', value: removalNote || '-' }]}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {tags.map((tag) => (
            <StarTag key={tag} closable closeLabel={t.removed} onClose={() => removeTag(tag)}>
              {tag}
            </StarTag>
          ))}
          {tags.length === 0 ? <StarTag tone="yellow">{t.demos[2][0]}</StarTag> : null}
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarTagDemoPage
