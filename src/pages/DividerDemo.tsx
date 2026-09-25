import { useState, type CSSProperties, type ReactNode } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { FENCE_POST_HEIGHT, FENCE_POST_PITCH, STAR_DIVIDER_HEIGHT, STAR_DIVIDER_PITCH, StarDivider, StarNineSliceButton } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import { DEFAULT_DIVIDER_COLOR } from '../utils/dividerPalette'

const MAGNIFY = 6

/** One-tap inputs for the colour section. Each is a body colour the palette derives from. */
const colorPresets = [
  { label: 'wood', value: DEFAULT_DIVIDER_COLOR },
  { label: 'forest', value: '#78ad55' },
  { label: 'lake', value: '#67b8c8' },
  { label: 'blossom', value: '#e68da4' },
  { label: 'night', value: '#5c3a57' },
] as const

const copy = {
  zh: {
    title: 'Divider 分割线',
    desc: '由像素木栅栏或像素星星等距排列组成的分割线。两种图案沿用 Progress 格子的立体做法：深色描边、右上高光、左下投影，默认按容器宽度自动铺满，颜色可以整套替换。',
    toc: ['基础栅栏', '星星分割线', '颜色主题', '固定个数', '像素规格', 'API'],
    demos: [
      ['基础栅栏', '默认按 30px 间隔自动铺满容器：格数向上取整一直排到右边缘，宽度不是整步距时最后一格被截断，所以两端都不会空出一截。'],
      ['星星分割线', '把 icon 换成 star，每个栅栏变成一颗 9×9 的像素星星。外描边、右上高光和左下投影全部沿用栅栏那套颜色，只是形状换成了星星，间距和自动铺满的规则都不变。'],
      ['颜色主题', '传一个 color，外框、高光和左下投影会一起实时重算：外框混向暖黑、高光是主体的淡色、投影是主体的深色，所以换个色相进来也不会留下旧的木头棕。下面的取色器可以直接试，两种图案同步变化。'],
      ['固定个数', '传入 count 就固定图案个数，两种图标都适用，适合放在窄栏或需要精确控制密度的位置。'],
      ['像素规格', '左边是放大 6 倍的单个栅栏、右边是放大 6 倍的单个星星，各自的图层尺寸见下方规格表。'],
    ],
    colorLabel: '主体色',
    colorHint: '支持 #rgb / #rrggbb，非法值会回退到默认木色。',
  },
  en: {
    title: 'Divider',
    desc: 'A separator built from evenly spaced pixel fence posts or pixel stars. Both reuse the Progress cell lighting — a dark outline, an upper-right highlight, and a lower-left drop shadow — and fill their container by default. The whole palette is replaceable.',
    toc: ['Basic Fence', 'Star Divider', 'Color Theme', 'Fixed Count', 'Pixel Spec', 'API'],
    demos: [
      ['Basic Fence', 'Fills its container by default, laying out fence posts at a steady 30px rhythm. The count rounds up to reach the far edge and the last post is clipped when the width is not a whole number of pitches, so neither end is left short.'],
      ['Star Divider', 'Set icon to star and every post becomes a 9×9 pixel star. The outline, the top-right highlight, and the lower-left drop shadow all keep the fence colours — only the shape changes — while the 30px rhythm and the fill behaviour stay identical.'],
      ['Color Theme', 'Pass a color and the outline, highlight, and lower-left shadow are recomputed together: the outline mixes toward a warm near-black, the highlight is a pale tint of the body, and the shadow is the body pushed far darker — so a new hue never leaves the old wood browns behind. Try the picker below; both motifs follow.'],
      ['Fixed Count', 'Pass count to pin the number of motifs. It applies to both icons, for narrow columns or when the density needs to be exact.'],
      ['Pixel Spec', 'A single post magnified 6× on the left, a single star magnified 6× on the right; each layer is measured in the spec table beside it.'],
    ],
    colorLabel: 'Body colour',
    colorHint: 'Accepts #rgb / #rrggbb; invalid values fall back to the default wood.',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; colorLabel: string; colorHint: string }>

const apiData = {
  zh: [
    { property: 'count', description: '固定图案个数；不传则按容器宽度自动铺满', type: 'number', default: '-' },
    { property: 'icon', description: '图案类型：木栅栏或像素星星', type: "'fence' | 'star'", default: "'fence'" },
    { property: 'color', description: '主体色（hex）；外框、高光与左下投影据此实时推导', type: 'string', default: "'#fa9405'" },
    { property: 'className / style', description: '根元素样式', type: 'string / CSSProperties', default: '-' },
  ],
  en: [
    { property: 'count', description: 'Pin the number of motifs; omit it to fill the container width.', type: 'number', default: '-' },
    { property: 'icon', description: 'Motif to repeat: wooden post or pixel star.', type: "'fence' | 'star'", default: "'fence'" },
    { property: 'color', description: 'Body colour (hex); the outline, highlight, and lower-left shadow are derived from it live.', type: 'string', default: "'#fa9405'" },
    { property: 'className / style', description: 'Root styles.', type: 'string / CSSProperties', default: '-' },
  ],
}

const specRows = {
  zh: [
    ['栅栏', '20px 宽 × 28px 高'],
    ['主体', '12 × 24 的 #fa9405，底边不封框'],
    ['外框', '上、左、右各 4px #9b440d 实心'],
    ['圆角', '顶部两角 5px'],
    ['高光', '外框内侧 3px #ffd9a3，上、右各取内沿一半（6px / 12px），自由端 3px 圆角'],
    ['横杆', '左右各两根 5.5px 厚（上下各 1.5px #9b440d 描边 + 2.5px #fa9405），各伸 15px = 半个间距'],
    ['横杆位置', '距上沿 6px、两根间隔 5px、距下沿 6px'],
    ['接头', '横杆不画竖向描边，相邻两格在间隙正中无感相接；最外两端补竖边收口'],
    ['阴影', '左下外扩 3px 的 #492b18 投影'],
    ['间距', '相邻栅栏 30px'],
  ],
  en: [
    ['Post', '20px wide × 28px tall'],
    ['Body', '12 × 24 of #fa9405, open at the bottom'],
    ['Frame', 'Solid 4px #9b440d on the top, left, and right'],
    ['Radius', '5px on the two top corners'],
    ['Highlight', '3px #ffd9a3 inside the frame, half of each inner edge (6px / 12px), 3px rounded free end'],
    ['Rails', 'Two per post, 5.5px thick (a 1.5px #9b440d edge over a 2.5px #fa9405 core), each reaching 15px = half a gap'],
    ['Rail spacing', '6px from the top, 5px apart, 6px from the bottom'],
    ['Joints', 'Rails carry no vertical edge, so neighbouring posts meet invisibly mid-gap; only the two outer ends of the divider get a cap'],
    ['Shadow', 'A #492b18 block dropped 3px down-left'],
    ['Gap', '30px between neighbouring posts'],
  ],
}

const starSpecRows = {
  zh: [
    ['星星', '9×9 像素格，格子 3px'],
    ['主体', '41 格的 #fa9405 五角星剪影'],
    ['外描边', '沿剪影外沿 1 格（3px）的 #9b440d，斜角一并包住'],
    ['高光', '主体上沿与右沿各 1 格（3px）的 #ffd9a3，只取主对角线右上那一半，与栅栏同一个右上光源'],
    ['阴影', '整个剪影向左下各偏移 1 格（3px）的 #492b18'],
    ['整体', '含描边与阴影共 12×12 格 = 36×36px'],
    ['间距', '相邻星星 30px'],
  ],
  en: [
    ['Star', 'A 9×9 pixel grid, 3px per cell'],
    ['Body', '41 cells of #fa9405 forming the five-pointed silhouette'],
    ['Outline', 'One 3px #9b440d cell around the silhouette, diagonals included'],
    ['Highlight', 'One 3px #ffd9a3 cell along the top and right rim, cut to the light side of the main diagonal \u2014 the fence\u2019s own top-right light'],
    ['Shadow', 'The whole silhouette shifted one 3px cell down-left in #492b18'],
    ['Footprint', '12×12 cells = 36×36px including outline and shadow'],
    ['Gap', '30px between neighbouring stars'],
  ],
}

const starCode = `import { StarDivider } from 'stardew-valley-ui'

export function QuestDivider() {
  return (
    <>
      <span>Quest rewards</span>
      <StarDivider icon="star" />
      <span>Claimed</span>
    </>
  )
}`

const colorCode = `import { StarDivider } from 'stardew-valley-ui'

export function ThemedDivider() {
  return (
    <>
      <StarDivider color="#78ad55" />
      <StarDivider icon="star" color="#78ad55" />
    </>
  )
}`

const inputStyle: CSSProperties = {
  width: 110,
  padding: '6px 8px',
  fontFamily: 'inherit',
  fontSize: 13,
  color: '#3a2e39',
  background: 'rgba(255, 255, 255, 0.72)',
  border: '3px solid rgba(157, 65, 0, 0.32)',
}

function MagnifiedGlyph({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  return (
    <div style={{ width: width * MAGNIFY, height: height * MAGNIFY, flex: 'none' }}>
      <div style={{ width, height, transform: `scale(${MAGNIFY})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  )
}

function SpecList({ rows }: { rows: string[][] }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 14px', margin: 0 }}>
      {rows.map(([term, detail]) => (
        <div key={term} style={{ display: 'contents' }}>
          <dt style={{ fontWeight: 700 }}>{term}</dt>
          <dd style={{ margin: 0 }}>{detail}</dd>
        </div>
      ))}
    </dl>
  )
}

function StarDividerDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [dividerColor, setDividerColor] = useState<string>(DEFAULT_DIVIDER_COLOR)
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'star', 'color', 'count', 'pixel', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]} code={'<StarDivider />'}>
        <div style={{ width: 'min(100%, 520px)', display: 'grid', gap: 12 }}>
          <span>{lang === 'zh' ? '背包物品' : 'Backpack items'}</span>
          <StarDivider />
          <span>{lang === 'zh' ? '任务奖励' : 'Quest rewards'}</span>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="star" title={t.demos[1][0]} description={t.demos[1][1]} code={starCode}>
        <div style={{ width: 'min(100%, 520px)', display: 'grid', gap: 12 }}>
          <span>{lang === 'zh' ? '春季作物' : 'Spring crops'}</span>
          <StarDivider icon="star" />
          <span>{lang === 'zh' ? '矿洞收获' : 'Mine findings'}</span>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="color" title={t.demos[2][0]} description={t.demos[2][1]} code={colorCode}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center', gap: 24, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13 }}>{t.colorLabel}</span>
              <input type="color" value={dividerColor} onChange={(event) => setDividerColor(event.target.value)} />
            </div>
            <input value={dividerColor} onChange={(event) => setDividerColor(event.target.value)} spellCheck={false} style={inputStyle} />
            <span style={{ fontSize: 12, opacity: 0.75 }}>{t.colorHint}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {colorPresets.map((preset) => (
                <StarNineSliceButton key={preset.label} size="small" variant="concise" onClick={() => setDividerColor(preset.value)}>
                  {preset.label}
                </StarNineSliceButton>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 16, flex: '1 1 300px', maxWidth: 420 }}>
            <StarDivider color={dividerColor} />
            <StarDivider icon="star" color={dividerColor} />
          </div>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="count" title={t.demos[3][0]} description={t.demos[3][1]} code={'<StarDivider count={5} />\n<StarDivider icon="star" count={5} />'}>
        <div style={{ width: 'min(100%, 260px)', display: 'grid', gap: 12 }}>
          <span>{lang === 'zh' ? '五格栅栏' : 'Five posts'}</span>
          <StarDivider count={5} />
          <span>{lang === 'zh' ? '五颗星星' : 'Five stars'}</span>
          <StarDivider icon="star" count={5} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="pixel" title={t.demos[4][0]} description={t.demos[4][1]} code={'<StarDivider count={1} />\n<StarDivider icon="star" count={1} />'}>
        <div style={{ display: 'grid', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
            <MagnifiedGlyph width={FENCE_POST_PITCH} height={FENCE_POST_HEIGHT}>
              <StarDivider count={1} style={{ width: FENCE_POST_PITCH }} />
            </MagnifiedGlyph>
            <SpecList rows={specRows[lang]} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
            <MagnifiedGlyph width={STAR_DIVIDER_PITCH} height={STAR_DIVIDER_HEIGHT}>
              <StarDivider icon="star" count={1} style={{ width: STAR_DIVIDER_PITCH }} />
            </MagnifiedGlyph>
            <SpecList rows={starSpecRows[lang]} />
          </div>
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Divider API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarDividerDemoPage
