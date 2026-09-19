import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarDisplayFrame } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '展示框 DisplayFrame',
    desc: '单层像素边框的展示框：2px 深色最外层、4px 主色带、2px 深线与 2px 亮线托住一块米黄底的内容面，四角各缺 2px 像素。宽度随内容自适应，本身就是纯容器。',
    toc: ['基础用法', '并排布局', '自由排版', 'API'],
    demos: [
      [
        '基础用法',
        '框里只放要展示的数据：底色 #fed384、文字黑色。不给宽度时按内容自适应，单个数字、一组指标或一段说明都能装。',
      ],
      [
        '并排布局',
        '它是纯容器 —— className 与其余 div 属性都落在根节点上，所以 flex / grid 这类布局类可以直接挂在框上，不用再包一层。',
      ],
      [
        '自由排版',
        '数据怎么排由你决定：左右对齐的键值行、单位、脚注都写在子元素里，框只负责外观。',
      ],
    ],
    stats: ['春季总收入', '蜂蜜', '果酒'],
    rows: ['上古种子', '铱星鱼', '总收入'],
    values: ['12 瓶', '7 条', '4,820G'],
    note: '统计至第 28 天结算。',
  },
  en: {
    title: 'DisplayFrame',
    desc: 'A single-layer pixel frame: 2px of dark outline, a 4px colour band, a 2px dark line and a 2px light line around a cream surface, with 2px cut from every corner. It sizes to its content and is a plain container.',
    toc: ['Basic Usage', 'Grid Layout', 'Free Layout', 'API'],
    demos: [
      [
        'Basic Usage',
        'Put only the data inside: #fed384 surface, black text. Without a width it sizes to its content, so a single number or a short note both fit.',
      ],
      [
        'Grid Layout',
        'It is a plain container — className and the rest of the div props land on the root, so flex / grid classes go straight on the frame without an extra wrapper.',
      ],
      [
        'Free Layout',
        'How the data is arranged is up to you: label/value rows, units and footnotes all live in the children; the frame only draws itself.',
      ],
    ],
    stats: ['Spring income', 'Honey', 'Wine'],
    rows: ['Ancient seeds', 'Iridium fish', 'Total'],
    values: ['12 bottles', '7 fish', '4,820G'],
    note: 'Tallied at the end of day 28.',
  },
} satisfies Record<
  Lang,
  { title: string; desc: string; toc: string[]; demos: string[][]; stats: string[]; rows: string[]; values: string[]; note: string }
>

const apiData = {
  zh: [
    { property: 'children', description: '框内内容（数据由你自己排版）', type: 'ReactNode', default: '-' },
    { property: 'className', description: '追加到根节点的类名，布局类挂这里', type: 'string', default: '-' },
    {
      property: '...rest',
      description: '其余原生 div 属性（style / onClick / aria-* 等）',
      type: 'HTMLAttributes<HTMLDivElement>',
      default: '-',
    },
    {
      property: '（固定外观）',
      description: '四层厚度与颜色写死为 2px #562c2b / 4px #dd7a0b / 2px #af4f0e / 2px #fdecb1，四角各缺 2px，不提供改色 props',
      type: '-',
      default: '-',
    },
  ],
  en: [
    { property: 'children', description: 'Frame content; you lay the data out.', type: 'ReactNode', default: '-' },
    { property: 'className', description: 'Appended to the root — put layout classes here.', type: 'string', default: '-' },
    {
      property: '...rest',
      description: 'Any other native div prop (style / onClick / aria-*, …).',
      type: 'HTMLAttributes<HTMLDivElement>',
      default: '-',
    },
    {
      property: '(fixed look)',
      description: 'The four bands are baked in: 2px #562c2b / 4px #dd7a0b / 2px #af4f0e / 2px #fdecb1, 2px cut from each corner. No colour props.',
      type: '-',
      default: '-',
    },
  ],
}

const statValue = { fontSize: 22, fontWeight: 700, lineHeight: 1.1 } as const
const statLabel = { fontSize: 13, opacity: 0.72, marginTop: 2 } as const

function StarDisplayFrameDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'grid', 'free', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={`<StarDisplayFrame>
  <strong>1,240G</strong>
</StarDisplayFrame>`}
      >
        <StarDisplayFrame>
          <div style={statValue}>1,240G</div>
          <div style={statLabel}>{t.stats[0]}</div>
        </StarDisplayFrame>
        <StarDisplayFrame>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>{t.note}</div>
        </StarDisplayFrame>
      </StarComponentDemo>
      <StarComponentDemo
        id="grid"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={`<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
  <StarDisplayFrame>…</StarDisplayFrame>
</div>`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%' }}>
          {t.stats.slice(1).map((label, index) => (
            <StarDisplayFrame key={label}>
              <div style={statValue}>{['86', '540'][index]}</div>
              <div style={statLabel}>{label}</div>
            </StarDisplayFrame>
          ))}
          <StarDisplayFrame>
            <div style={statValue}>4,820</div>
            <div style={statLabel}>G</div>
          </StarDisplayFrame>
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="free"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={`<StarDisplayFrame style={{ width: 260 }}>
  <Row label="上古种子" value="12 瓶" />
</StarDisplayFrame>`}
      >
        <StarDisplayFrame style={{ width: 260 }}>
          {t.rows.map((row, index) => (
            <div
              key={row}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                fontSize: 13,
                lineHeight: 1.9,
                borderBottom: index === t.rows.length - 1 ? 'none' : '2px dotted rgba(0, 0, 0, 0.22)',
              }}
            >
              <span style={{ opacity: 0.72 }}>{row}</span>
              <span style={{ fontWeight: 700 }}>{t.values[index]}</span>
            </div>
          ))}
          <div style={{ ...statLabel, marginTop: 6, fontSize: 12 }}>{t.note}</div>
        </StarDisplayFrame>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="DisplayFrame API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarDisplayFrameDemoPage
