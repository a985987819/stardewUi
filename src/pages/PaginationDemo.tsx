import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarPagination } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: '分页 Pagination',
    desc: '翻看公告板上一页页委托的像素翻页器：方形羊皮纸页码块像栅栏柱一样排开，当前页像盖了墨章一样变深，长页码用省略号搭桥，首尾永远可见。',
    toc: ['基础用法', '长列表省略', '单页隐藏', 'API'],
    demos: [
      ['基础用法', 'total 是总条数，pageSize 决定每页几条；onChange 回调返回最新页码和页大小，前后箭头在边界自动禁用。'],
      ['长列表省略', '页数超过 7 时自动折叠：始终保留第 1 页和最后一页，当前页前后各留一个邻居，其余用省略号占位。'],
      ['单页隐藏', 'hideOnSinglePage 让只有一页时整个翻页器退场，避免孤零零一块木牌挂在页脚。'],
    ],
    quests: '条委托',
    currentPage: '当前页',
  },
  en: {
    title: 'Pagination',
    desc: 'A pixel pager for flipping through notice-board quests one page at a time: square parchment chips joined like fence posts, the active page darkened like an ink stamp, with ellipsis bridges over long runs while the first and last pages stay visible.',
    toc: ['Basic Usage', 'Long-Run Ellipsis', 'Hide on Single Page', 'API'],
    demos: [
      ['Basic Usage', 'total is the item count and pageSize splits it into pages; onChange reports the next page and page size, and the arrows disable themselves at the edges.'],
      ['Long-Run Ellipsis', 'Past 7 pages the run folds up: page 1 and the last page always stay, one neighbour on each side of the active page, and ellipses hold the gaps.'],
      ['Hide on Single Page', 'hideOnSinglePage dismisses the whole pager when everything fits on one page, so no lonely wooden board hangs at the footer.'],
    ],
    quests: 'quests',
    currentPage: 'Current page',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; quests: string; currentPage: string }>

const apiData = {
  zh: [
    { property: 'total', description: '总条数，翻页器据此推导总页数', type: 'number', default: '-' },
    { property: 'pageSize', description: '每页条数', type: 'number', default: '10' },
    { property: 'current', description: '受控当前页（从 1 开始）；不传则组件自持状态', type: 'number', default: '-' },
    { property: 'defaultCurrent', description: '非受控模式的初始页码', type: 'number', default: '1' },
    { property: 'onChange', description: '页码变化时触发', type: '(page: number, pageSize: number) => void', default: '-' },
    { property: 'hideOnSinglePage', description: '只有一页时是否隐藏', type: 'boolean', default: 'false' },
    { property: 'ariaLabel', description: '翻页器的无障碍名称', type: 'string', default: "'Pagination'" },
  ],
  en: [
    { property: 'total', description: 'Total item count; the pager derives the page count from it.', type: 'number', default: '-' },
    { property: 'pageSize', description: 'Items per page.', type: 'number', default: '10' },
    { property: 'current', description: 'Controlled active page (1-based); omit to own the state.', type: 'number', default: '-' },
    { property: 'defaultCurrent', description: 'Initial page for the uncontrolled mode.', type: 'number', default: '1' },
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

function StarPaginationDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'ellipsis', 'hide', 'api'][index], title, level: 1 }))

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

export default StarPaginationDemoPage
