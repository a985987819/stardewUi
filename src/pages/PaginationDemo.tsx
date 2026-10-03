import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarCheckbox, StarDisplayFrame, StarNineSliceButton, StarPagination, StarTitle } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './PaginationDemo.module.scss'

const QUEST_POOL: Record<Lang, string[]> = {
  zh: [
    '帮莱纳斯找回他的帽子',
    '清除农场石块 ×20',
    '给威利送一条鲈鱼',
    '修复社区中心的暖房',
    '囤 99 个木材过冬',
    '在矿洞 20 层找到旧地图',
    '给玛妮送一打鸡蛋',
    '钓起传说中的鱼',
    '向皮埃尔卖出 5 个防风草',
    '雨天钓一条鲶鱼',
    '替罗宾收 10 块硬木',
    '给博物馆捐一件古物',
  ],
  en: [
    'Find Linus his hat',
    'Clear 20 stones off the farm',
    'Bring Willy a bass',
    'Fix the community center greenhouse',
    'Stock 99 wood for winter',
    'Find the old map on mine floor 20',
    'Deliver a dozen eggs to Marnie',
    'Catch the legendary fish',
    'Sell Pierre 5 parsnips',
    'Hook a catfish in the rain',
    'Gather 10 hardwood for Robin',
    'Donate an artifact to the museum',
  ],
}

const copy = {
  zh: {
    title: '分页 Pagination',
    desc: '翻看公告板上一页页委托的像素翻页器：方形羊皮纸页码块像栅栏柱一样排开，当前页像盖了墨章一样变深，长页码用省略号搭桥，首尾永远可见。',
    toc: ['基础用法', '长列表省略', '单页隐藏', '每页条数', '委托板', 'API'],
    demos: [
      ['基础用法', 'total 是总条数，pageSize 决定每页几条；onChange 回调返回最新页码和页大小，前后箭头在边界自动禁用。'],
      ['长列表省略', '页数超过 7 时自动折叠：始终保留第 1 页和最后一页，当前页前后各留一个邻居，其余用省略号占位。'],
      ['单页隐藏', 'hideOnSinglePage 让只有一页时整个翻页器退场，避免孤零零一块木牌挂在页脚。'],
      ['每页条数', 'showSizeChanger 在页码旁立起一个木框下拉，pageSizeOptions 决定档位；换档时当前页会重锚到「原来那条数据」所在的新页——停在末页第 9 页第 41 条，换成每页 20 条后落在第 3 页。'],
      ['委托板', '委托贴在板子上、页码在板子下方：顶部悬浮的标题压住板沿，每条委托一块展示框，任务名后面用点线牵到最右侧的勾选框，勾一下就算接下了这条活；拖滑块调总量、点按钮切每页条数，页码条与省略号实时变形。'],
    ],
    quests: '条委托',
    currentPage: '当前页',
    questBoard: '【委托板】',
    questTotal: '委托总量',
    questPerPage: '每页条数',
    sizeLog: '最近一次切换',
  },
  en: {
    title: 'Pagination',
    desc: 'A pixel pager for flipping through notice-board quests one page at a time: square parchment chips joined like fence posts, the active page darkened like an ink stamp, with ellipsis bridges over long runs while the first and last pages stay visible.',
    toc: ['Basic Usage', 'Long-Run Ellipsis', 'Hide on Single Page', 'Page Size', 'Quest Board', 'API'],
    demos: [
      ['Basic Usage', 'total is the item count and pageSize splits it into pages; onChange reports the next page and page size, and the arrows disable themselves at the edges.'],
      ['Long-Run Ellipsis', 'Past 7 pages the run folds up: page 1 and the last page always stay, one neighbour on each side of the active page, and ellipses hold the gaps.'],
      ['Hide on Single Page', 'hideOnSinglePage dismisses the whole pager when everything fits on one page, so no lonely wooden board hangs at the footer.'],
      ['Page Size', 'showSizeChanger raises a wooden select beside the chips, and pageSizeOptions sets the gears; switching re-anchors the page onto the item you were looking at — parked on the last page at item 41 of 5-per-page, a jump to 20 lands you on page 3.'],
      ['Quest Board', 'Quests pin onto the board with the pager below it: a floating title overlaps the board\'s top edge, every quest gets its own framed row, a dot leader carries the task name out to the tick box on the right, and ticking one takes the job. Drag the slider for the total and tap for the page size — the chips reshape live.'],
    ],
    quests: 'quests',
    currentPage: 'Current page',
    questBoard: '【QUEST BOARD】',
    questTotal: 'Quest total',
    questPerPage: 'Per page',
    sizeLog: 'Last change',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; quests: string; currentPage: string; questBoard: string; questTotal: string; questPerPage: string; sizeLog: string }>

const apiData = {
  zh: [
    { property: 'total', description: '总条数，翻页器据此推导总页数', type: 'number', default: '-' },
    { property: 'pageSize', description: '每页条数', type: 'number', default: '10' },
    { property: 'current', description: '受控当前页（从 1 开始）；不传则组件自持状态', type: 'number', default: '-' },
    { property: 'defaultCurrent', description: '非受控模式的初始页码', type: 'number', default: '1' },
    { property: 'defaultPageSize', description: '非受控模式的初始每页条数', type: 'number', default: '10' },
    { property: 'showSizeChanger', description: '是否显示每页条数切换器', type: 'boolean', default: 'false' },
    { property: 'pageSizeOptions', description: '条数切换器的可选档位（自动并入当前值并排序）', type: 'number[]', default: '[10, 20, 50]' },
    { property: 'onShowSizeChange', description: '换档时触发，参数为重锚后的 (页码, 条数)', type: '(page: number, pageSize: number) => void', default: '-' },
    { property: 'onChange', description: '页码变化时触发', type: '(page: number, pageSize: number) => void', default: '-' },
    { property: 'hideOnSinglePage', description: '只有一页时是否隐藏', type: 'boolean', default: 'false' },
    { property: 'ariaLabel', description: '翻页器的无障碍名称', type: 'string', default: "'Pagination'" },
    { property: 'showTotal', description: '自定义总数文案', type: '(total: number, range: [number, number]) => ReactNode', default: '-' },],
  en: [
    { property: 'total', description: 'Total item count; the pager derives the page count from it.', type: 'number', default: '-' },
    { property: 'pageSize', description: 'Items per page.', type: 'number', default: '10' },
    { property: 'current', description: 'Controlled active page (1-based); omit to own the state.', type: 'number', default: '-' },
    { property: 'defaultCurrent', description: 'Initial page for the uncontrolled mode.', type: 'number', default: '1' },
    { property: 'defaultPageSize', description: 'Initial page size for the uncontrolled mode.', type: 'number', default: '10' },
    { property: 'showSizeChanger', description: 'Shows the page-size select.', type: 'boolean', default: 'false' },
    { property: 'pageSizeOptions', description: 'Gear list for the select (the active size always joins, sorted).', type: 'number[]', default: '[10, 20, 50]' },
    { property: 'onShowSizeChange', description: 'Fires on a gear change with the re-anchored (page, pageSize).', type: '(page: number, pageSize: number) => void', default: '-' },
    { property: 'onChange', description: 'Fires when the page changes.', type: '(page: number, pageSize: number) => void', default: '-' },
    { property: 'hideOnSinglePage', description: 'Hides the pager when everything fits on one page.', type: 'boolean', default: 'false' },
    { property: 'ariaLabel', description: 'Accessible name of the pager.', type: 'string', default: "'Pagination'" },
    { property: 'showTotal', description: 'Renders custom total copy.', type: '(total: number, range: [number, number]) => ReactNode', default: '-' },],
}

const basicCode = `import { useState } from 'react'
import { StarPagination } from 'stardew-valley-ui'

export function Board() {
  const [page, setPage] = useState(1)
  return (
    <StarPagination
      total={45}
      pageSize={10}
      current={page}
      onChange={setPage}
      showTotal={(total, range) => range[0] + '-' + range[1] + ' / ' + total}
    />
  )
}`

const ellipsisCode = `import { StarPagination } from 'stardew-valley-ui'

<StarPagination total={300} defaultCurrent={15} />`

const hideCode = `import { useState } from 'react'
import { StarPagination } from 'stardew-valley-ui'

export function QuestBoard() {
  const [page, setPage] = useState(1)
  return (
    <StarPagination
      total={8}
      pageSize={10}
      hideOnSinglePage
      current={page}
      onChange={setPage}
    />
  )
}`

const sizeCode = `import { StarPagination } from 'stardew-valley-ui'

<StarPagination
  total={45}
  defaultCurrent={9}
  defaultPageSize={5}
  showSizeChanger
  pageSizeOptions={[5, 10, 20]}
  onShowSizeChange={(page, size) => console.log(page, size)}
/>`

const boardCode = `import { useState } from 'react'
import { StarCheckbox, StarDisplayFrame, StarPagination, StarTitle } from 'stardew-valley-ui'

export function QuestBoard() {
  const [total, setTotal] = useState(45)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [done, setDone] = useState({})
  const quests = ... // slice the active page
  const range = [(page - 1) * pageSize + 1, Math.min(page * pageSize, total)]

  return (
    <>
      {/* Board title floats over the top edge, then one framed row per quest */}
      <StarTitle level={3} fontSize={34}>【委托板】</StarTitle>
      {quests.map((quest, index) => (
        <StarDisplayFrame key={index}>
          <span>{quest}</span>
          <i className="dot-leader" />
          <StarCheckbox
            size="small"
            options={[{ value: String(index), label: '' }]}
            value={done[index] ? [String(index)] : []}
            onChange={() => setDone(...)}
          />
        </StarDisplayFrame>
      ))}
      <input type="range" min={5} max={300} value={total} onChange={...} />
      {/* The pager stays bare; its numbers live on their own line */}
      <StarPagination total={total} pageSize={pageSize} current={page} onChange={setPage} />
      <span>{range[0]}-{range[1]} / {total} · current: {page} / {Math.ceil(total / pageSize)}</span>
    </>
  )
}`

function StarPaginationDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'ellipsis', 'hide', 'size', 'board', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={basicCode}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
          <ControlledPagination pagerLabel={`${t.quests} · ${t.currentPage}`} />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="ellipsis"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={ellipsisCode}
      >
        <div style={{ width: '100%', textAlign: 'center' }}>
          <StarPagination total={300} defaultCurrent={15} ariaLabel="公告分页 2" />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="hide"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={hideCode}
      >
        <div style={{ width: '100%', textAlign: 'center' }}>
          <StarPagination total={8} pageSize={10} hideOnSinglePage ariaLabel="公告分页 3" />
        </div>
      </StarComponentDemo>
      <StarComponentDemo
        id="size"
        title={t.demos[3][0]}
        description={t.demos[3][1]}
        code={sizeCode}
      >
        <SizeChangerPager logLabel={t.sizeLog} />
      </StarComponentDemo>
      <StarComponentDemo
        id="board"
        title={t.demos[4][0]}
        description={t.demos[4][1]}
        code={boardCode}
      >
        <QuestBoard
          pool={QUEST_POOL[lang]}
          totalLabel={t.questTotal}
          perPageLabel={t.questPerPage}
          boardTitle={t.questBoard}
        />
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Pagination API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

/**
 * The pager's own numbers, kept on one line *outside* the nav: the visible
 * range and the current page are readouts, not controls, so they never mix
 * into the chip run.
 */
function PagerMeta({
  range,
  total,
  current,
  totalPages,
}: {
  range: [number, number]
  total: number
  current: number
  totalPages: number
}) {
  return (
    <span className={styles['pager-meta']}>
      <span>
        {range[0]}-{range[1]} / {total}
      </span>
      <span className={styles['pager-meta__sep']} aria-hidden>
        ·
      </span>
      <span>
        current: {current} / {totalPages}
      </span>
    </span>
  )
}

function ControlledPagination({ pagerLabel }: { pagerLabel: string }) {
  const [page, setPage] = useState(1)
  const total = 45
  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className={styles['pager-stack']}>
      <StarPagination
        total={total}
        pageSize={pageSize}
        current={page}
        onChange={setPage}
        ariaLabel={pagerLabel}
      />
      <PagerMeta
        range={[(page - 1) * pageSize + 1, Math.min(page * pageSize, total)]}
        total={total}
        current={page}
        totalPages={totalPages}
      />
    </div>
  )
}

function SizeChangerPager({ logLabel }: { logLabel: string }) {
  const [log, setLog] = useState('')
  const [page, setPage] = useState(9)
  const [pageSize, setPageSize] = useState(5)
  const total = 45

  return (
    <div className={styles['pager-stack']}>
      <StarPagination
        total={total}
        defaultCurrent={9}
        defaultPageSize={5}
        showSizeChanger
        pageSizeOptions={[5, 10, 20]}
        onChange={(nextPage, nextSize) => {
          setPage(nextPage)
          setPageSize(nextSize)
        }}
        onShowSizeChange={(nextPage, nextSize) => {
          setPage(nextPage)
          setPageSize(nextSize)
          setLog(`onShowSizeChange(${nextPage}, ${nextSize})`)
        }}
        ariaLabel="公告分页 4"
      />
      <PagerMeta
        range={[(page - 1) * pageSize + 1, Math.min(page * pageSize, total)]}
        total={total}
        current={page}
        totalPages={Math.max(1, Math.ceil(total / pageSize))}
      />
      {log ? (
        <span style={{ fontSize: 12, opacity: 0.75 }}>
          {logLabel}: <code>{log}</code>
        </span>
      ) : null}
    </div>
  )
}

export default StarPaginationDemoPage

function QuestBoard({
  pool,
  totalLabel,
  perPageLabel,
  boardTitle,
}: {
  pool: string[]
  totalLabel: string
  perPageLabel: string
  boardTitle: string
}) {
  const [total, setTotal] = useState(45)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  // Which pinned quests are ticked off, keyed by page + row so flipping pages
  // never inherits another page's ticks.
  const [done, setDone] = useState<Record<string, boolean>>({})

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const activePage = Math.min(page, totalPages)
  const visible = Array.from({ length: total }, (_, index) => pool[index % pool.length])
    .slice((activePage - 1) * pageSize, activePage * pageSize)

  return (
    <div className={styles['board']}>
      {/* Board content first: the title floats over the top edge of the list. */}
      <div className={styles['board__title-wrap']}>
        <StarTitle level={3} fontSize={34} className={styles['board__title']}>
          {boardTitle}
        </StarTitle>
      </div>

      <div className={styles['board__list']}>
        {visible.map((quest, index) => {
          const key = `${activePage}-${index}`

          return (
            <StarDisplayFrame key={key} className={styles['board__row']}>
              <div className={styles['board__row-inner']}>
                <span className={styles['board__quest']}>{quest}</span>
                <span className={styles['board__leader']} aria-hidden />
                <StarCheckbox
                  className={styles['board__check']}
                  size="small"
                  aria-label={quest}
                  options={[{ value: key, label: '' }]}
                  value={done[key] ? [key] : []}
                  onChange={(next) => {
                    const ticked = next.includes(key)
                    setDone((current) => ({ ...current, [key]: ticked }))
                  }}
                />
              </div>
            </StarDisplayFrame>
          )
        })}
      </div>

      <div className={styles['board__controls']}>
        <label className={styles['board__control-group']} style={{ cursor: 'pointer' }}>
          <span className={styles['board__control-label']}>{totalLabel}</span>
          <input
            type="range"
            min={5}
            max={300}
            step={5}
            value={total}
            onChange={(event) => {
              setTotal(Number(event.target.value))
              setPage(1)
            }}
          />
          <code>{total}</code>
        </label>
        <span className={styles['board__control-group']}>
          <span className={styles['board__control-label']}>{perPageLabel}</span>
          {[5, 10, 20].map((size) => (
            <StarNineSliceButton
              key={size}
              type="button"
              size="small"
              variant={pageSize === size ? 'primary' : 'default'}
              aria-pressed={pageSize === size}
              onClick={() => {
                setPageSize(size)
                setPage(1)
              }}
            >
              {size}
            </StarNineSliceButton>
          ))}
        </span>
      </div>

      <div className={styles['pager-stack']}>
        <StarPagination
          total={total}
          pageSize={pageSize}
          current={activePage}
          onChange={setPage}
        />
        <PagerMeta
          range={[
            (activePage - 1) * pageSize + 1,
            Math.min(activePage * pageSize, total),
          ]}
          total={total}
          current={activePage}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
