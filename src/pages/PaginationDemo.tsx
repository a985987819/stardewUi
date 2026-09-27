import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarPagination } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const QUEST_POOL: Record<Lang, string[]> = {
  zh: [
    '帮 Linus 找回帽子',
    '清除农场石块 ×20',
    '给 Willy 送一条鲈鱼',
    '修复社区中心的暖房',
    '囤 99 个木材过冬',
    '在矿洞 20 层找到旧地图',
    '给 Marnie 送一打鸡蛋',
    '钓起传说中的鱼',
    '向皮埃尔卖出 5 个防风草',
    '雨天钓一条鲶鱼',
    '替 Robin 收集 10 块硬木',
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
      ['委托板', '拖动滑块调委托总量、点按钮切每页条数，看页码条与省略号实时变形；当前页的委托就贴在翻页器下面。'],
    ],
    quests: '条委托',
    currentPage: '当前页',
    questBoard: '委托板',
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
      ['Quest Board', 'Drag the slider to change the quest total and tap to switch the page size — watch the chips and ellipses reshape live; the active page\'s quests pin right below the pager.'],
    ],
    quests: 'quests',
    currentPage: 'Current page',
    questBoard: 'Quest Board',
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
  ],
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
  ],
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
import { StarPagination } from 'stardew-valley-ui'

export function QuestBoard() {
  const [total, setTotal] = useState(45)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  // Slice the pinned quests for the active page.
  return (
    <>
      <input type="range" min={5} max={300} value={total} onChange={...} />
      <StarPagination total={total} pageSize={pageSize} current={page} onChange={setPage} />
      {quests.slice((page - 1) * pageSize, page * pageSize).map(...) }
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
        <QuestBoard pool={QUEST_POOL[lang]} totalLabel={t.questTotal} perPageLabel={t.questPerPage} />
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Pagination API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

function ControlledPagination({ pagerLabel }: { pagerLabel: string }) {
  const [page, setPage] = useState(1)

  return (
    <>
      <StarPagination
        total={45}
        pageSize={10}
        current={page}
        onChange={setPage}
        showTotal={(total, range) => `${range[0]}-${range[1]} / ${total}`}
        ariaLabel={pagerLabel}
      />
      <span style={{ fontSize: 12, opacity: 0.75 }}>current: {page} / 5</span>
    </>
  )
}

function SizeChangerPager({ logLabel }: { logLabel: string }) {
  const [log, setLog] = useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
      <StarPagination
        total={45}
        defaultCurrent={9}
        defaultPageSize={5}
        showSizeChanger
        pageSizeOptions={[5, 10, 20]}
        onShowSizeChange={(page, size) => setLog(`onShowSizeChange(${page}, ${size})`)}
        ariaLabel="公告分页 4"
      />
      {log ? (
        <span style={{ fontSize: 12, opacity: 0.75 }}>{logLabel}: <code>{log}</code></span>
      ) : null}
    </div>
  )
}

export default StarPaginationDemoPage

function QuestBoard({ pool, totalLabel, perPageLabel }: { pool: string[]; totalLabel: string; perPageLabel: string }) {
  const [total, setTotal] = useState(45)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const activePage = Math.min(page, totalPages)
  const visible = Array.from({ length: total }, (_, index) => pool[index % pool.length])
    .slice((activePage - 1) * pageSize, activePage * pageSize)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ opacity: 0.75 }}>{totalLabel}</span>
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
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ opacity: 0.75 }}>{perPageLabel}</span>
          {[5, 10, 20].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setPageSize(size)
                setPage(1)
              }}
              style={{
                padding: '3px 10px',
                cursor: 'pointer',
                fontFamily: 'var(--font-pixel)',
                fontSize: 12,
                background: pageSize === size ? '#d4a72c' : undefined,
                color: pageSize === size ? '#fff3dc' : undefined,
              }}
            >
              {size}
            </button>
          ))}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <StarPagination
          total={total}
          pageSize={pageSize}
          current={activePage}
          onChange={setPage}
          showTotal={(questTotal, range) => `${range[0]}-${range[1]} / ${questTotal}`}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {visible.map((quest, index) => (
          <span
            key={`${activePage}-${index}`}
            style={{
              padding: '4px 10px',
              border: '2px solid #b5895a',
              background: '#fff3dc',
              color: '#4a2c1a',
              fontSize: 12,
            }}
          >
            {quest}
          </span>
        ))}
      </div>
    </div>
  )
}
