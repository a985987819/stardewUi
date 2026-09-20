import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { FENCE_POST_HEIGHT, FENCE_POST_PITCH, StarDivider } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const MAGNIFY = 6

const copy = {
  zh: {
    title: 'Divider 分割线',
    desc: '由像素木栅栏等距排列组成的分割线。每个栅栏沿用 Progress 格子的立体做法：三边实心深框、顶部圆角、右上高光、左下投影，默认按容器宽度自动铺满。',
    toc: ['基础栅栏', '固定个数', '像素规格', 'API'],
    demos: [
      ['基础栅栏', '默认撑满容器宽度，按 30px 间隔自动铺满木栅栏，用来分隔背包栏、清单和区块。'],
      ['固定个数', '传入 count 就固定栅栏个数，适合放在窄栏或需要精确控制密度的位置。'],
      ['像素规格', '单个栅栏放大 6 倍：20×28 的方块，上、左、右三边各 4px #9b440d 实心框、底边不封，顶部两角 5px 圆角；高光 #ffd9a3 贴在外框内侧 3px，沿内沿上边右半段（6px）、内沿右边上半段（12px）接成 Γ，自由端 3px 圆角、拐角跟着外框圆角裁；左右各伸出两根 5.5px 厚的横杆（上下各 1.5px #9b440d 描边 + 2.5px #fa9405 主体），各伸半个间距，横杆不画竖向描边所以相邻两格在间隙正中无感相接，只有整条线最外两端补竖边收口；左下再垫一块外扩 3px 的 #492b18 投影。'],
    ],
  },
  en: {
    title: 'Divider',
    desc: 'A separator built from evenly spaced pixel fence posts. Each post reuses the Progress cell lighting — a solid frame on three edges, rounded top corners, an upper-right highlight, and a lower-left drop shadow — and fills its container by default.',
    toc: ['Basic Fence', 'Fixed Count', 'Pixel Spec', 'API'],
    demos: [
      ['Basic Fence', 'Fills its container by default, laying out fence posts at a steady 30px rhythm to separate inventories, lists, and sections.'],
      ['Fixed Count', 'Pass count to pin the number of posts, for narrow columns or when the density needs to be exact.'],
      ['Pixel Spec', 'One post magnified 6×: a 20×28 block with a 4px #9b440d frame on the top, left, and right edges — the bottom stays open — and 5px rounded top corners. A 3px #ffd9a3 highlight hugs the inside of that frame, running half way along the top (6px) and half way down the right (12px) into a rounded corner that follows the frame. Two 5.5px rails run out of the left and right — a 1.5px #9b440d edge over a 2.5px #fa9405 core — each reaching half a gap; they carry no vertical edge, so neighbouring posts meet invisibly in the middle, and only the two outer ends of the whole divider get a cap. A #492b18 block is dropped 3px down-left behind.'],
    ],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][] }>

const apiData = {
  zh: [
    { property: 'count', description: '固定栅栏个数；不传则按容器宽度自动铺满', type: 'number', default: '-' },
    { property: 'className / style', description: '根元素样式', type: 'string / CSSProperties', default: '-' },
  ],
  en: [
    { property: 'count', description: 'Pin the number of posts; omit it to fill the container width.', type: 'number', default: '-' },
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

function StarDividerDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'count', 'pixel', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]} code={'<StarDivider />'}>
        <div style={{ width: 'min(100%, 520px)', display: 'grid', gap: 12 }}>
          <span>{lang === 'zh' ? '背包物品' : 'Backpack items'}</span>
          <StarDivider />
          <span>{lang === 'zh' ? '任务奖励' : 'Quest rewards'}</span>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="count" title={t.demos[1][0]} description={t.demos[1][1]} code={'<StarDivider count={5} />'}>
        <div style={{ width: 'min(100%, 260px)', display: 'grid', gap: 12 }}>
          <span>{lang === 'zh' ? '春季作物' : 'Spring crops'}</span>
          <StarDivider count={5} />
          <span>{lang === 'zh' ? '矿洞收获' : 'Mine findings'}</span>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="pixel" title={t.demos[2][0]} description={t.demos[2][1]} code={'<StarDivider count={1} />'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ width: FENCE_POST_PITCH * MAGNIFY, height: FENCE_POST_HEIGHT * MAGNIFY, flex: 'none' }}>
            <div style={{ width: FENCE_POST_PITCH, height: FENCE_POST_HEIGHT, transform: `scale(${MAGNIFY})`, transformOrigin: 'top left' }}>
              <StarDivider count={1} style={{ width: FENCE_POST_PITCH }} />
            </div>
          </div>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 14px', margin: 0 }}>
            {specRows[lang].map(([term, detail]) => (
              <div key={term} style={{ display: 'contents' }}>
                <dt style={{ fontWeight: 700 }}>{term}</dt>
                <dd style={{ margin: 0 }}>{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Divider API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarDividerDemoPage
