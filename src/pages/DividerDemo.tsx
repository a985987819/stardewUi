import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { FENCE_POST_HEIGHT, FENCE_POST_WIDTH, StarDivider } from '../components/ui'
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
      ['像素规格', '单个栅栏放大 6 倍：20×28 的方块，上、左、右三边各 4px #9b440d 实心框、底边不封，顶部两角 5px 圆角；框内侧上、右各一条 3px #ffd9a3 高光，长度各取所在边的一半；左下再垫一块外扩 3px 的 #999 投影。横杆连接尚未实现。'],
    ],
  },
  en: {
    title: 'Divider',
    desc: 'A separator built from evenly spaced pixel fence posts. Each post reuses the Progress cell lighting — a solid frame on three edges, rounded top corners, an upper-right highlight, and a lower-left drop shadow — and fills its container by default.',
    toc: ['Basic Fence', 'Fixed Count', 'Pixel Spec', 'API'],
    demos: [
      ['Basic Fence', 'Fills its container by default, laying out fence posts at a steady 30px rhythm to separate inventories, lists, and sections.'],
      ['Fixed Count', 'Pass count to pin the number of posts, for narrow columns or when the density needs to be exact.'],
      ['Pixel Spec', 'One post magnified 6×: a 20×28 block with a 4px #9b440d frame on the top, left, and right edges — the bottom stays open — and 5px rounded top corners. The inner top and right edges each carry a 3px #ffd9a3 highlight half the length of its own edge, with a #999 block dropped 3px down-left behind. Connecting rails are not implemented yet.'],
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
    ['高光', '框内侧上、右各 3px #ffd9a3，各取该边一半'],
    ['阴影', '左下外扩 3px 的 #999 投影'],
    ['间距', '相邻栅栏 30px'],
  ],
  en: [
    ['Post', '20px wide × 28px tall'],
    ['Body', '12 × 24 of #fa9405, open at the bottom'],
    ['Frame', 'Solid 4px #9b440d on the top, left, and right'],
    ['Radius', '5px on the two top corners'],
    ['Highlight', '3px #ffd9a3 inside the top and right, each half that edge'],
    ['Shadow', 'A #999 block dropped 3px down-left'],
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
          <div style={{ width: FENCE_POST_WIDTH * MAGNIFY, height: FENCE_POST_HEIGHT * MAGNIFY, flex: 'none' }}>
            <div style={{ width: FENCE_POST_WIDTH, height: FENCE_POST_HEIGHT, transform: `scale(${MAGNIFY})`, transformOrigin: 'top left' }}>
              <StarDivider count={1} style={{ width: FENCE_POST_WIDTH }} />
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
