import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarDrawer, StarNineSliceButton, type DrawerPlacement } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './DrawerDemo.module.scss'

const DIRECTIONS: Array<{ placement: DrawerPlacement; zh: string; en: string }> = [
  { placement: 'left', zh: '从左侧进入', en: 'Enter from Left' },
  { placement: 'right', zh: '从右侧进入', en: 'Enter from Right' },
  { placement: 'top', zh: '从上方进入', en: 'Enter from Top' },
  { placement: 'bottom', zh: '从下方进入', en: 'Enter from Bottom' },
]

const copy = {
  zh: {
    title: 'Drawer 抽屉',
    desc: '从页面边缘滑入的像素抽屉，适合不打断当前任务的筛选、编辑和上下文操作。',
    toc: ['基础抽屉', '四个方向', '聚焦效果', '自定义遮罩', 'API'],
    demos: [
      ['基础抽屉', '用 open 受控显示，标题、正文和 footer 均可按需提供。'],
      ['四个方向', '抽屉可从上、右、下、左四个方向进入。'],
      ['聚焦效果', '默认会缩小并柔化原页面；传 focusEffect={false} 可取消。'],
      ['自定义遮罩', '通过 maskStyle 直接覆盖遮罩层样式。'],
    ],
    open: '打开抽屉',
    close: '关闭',
    save: '保存设置',
    drawerTitle: '农场背包',
    body: '这里可以放置筛选项、表单、物品栏，或任何 React children 内容。',
    footer: '背包容量：12 / 24',
    focusOn: '打开聚焦抽屉',
    focusOff: '关闭聚焦效果',
    customMask: '打开蓝色遮罩',
  },
  en: {
    title: 'Drawer',
    desc: 'Pixel drawers that slide in from a page edge for filters, editing, and contextual work without breaking flow.',
    toc: ['Basic Drawer', 'Four Directions', 'Focus Effect', 'Custom Mask', 'API'],
    demos: [
      ['Basic Drawer', 'Visibility is controlled with open; title, body, and footer are optional.'],
      ['Four Directions', 'Drawers can enter from the top, right, bottom, or left edge.'],
      ['Focus Effect', 'The page scales and softens by default; pass focusEffect={false} to turn it off.'],
      ['Custom Mask', 'Use maskStyle to override the backdrop directly.'],
    ],
    open: 'Open Drawer',
    close: 'Close',
    save: 'Save settings',
    drawerTitle: 'Farm Pack',
    body: 'Use this space for filters, forms, inventory, or any React children.',
    footer: 'Pack capacity: 12 / 24',
    focusOn: 'Open focused drawer',
    focusOff: 'Disable focus effect',
    customMask: 'Open blue mask',
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; open: string; close: string; save: string; drawerTitle: string; body: string; footer: string; focusOn: string; focusOff: string; customMask: string }>

const apiData = {
  zh: [
    { property: 'open', description: '受控的抽屉可见状态', type: 'boolean', default: '-', required: true },
    { property: 'placement', description: '抽屉进入方向', type: "'top' | 'right' | 'bottom' | 'left'", default: "'right'" },
    { property: 'title', description: '可选标题', type: 'ReactNode', default: '-' },
    { property: 'footer', description: '可选固定页脚', type: 'ReactNode', default: '-' },
    { property: 'children', description: '抽屉主体内容', type: 'ReactNode', default: '-' },
    { property: 'className', description: '添加到抽屉面板的类名', type: 'string', default: '-' },
    { property: 'maskStyle', description: '遮罩层内联样式', type: 'CSSProperties', default: '-' },
    { property: 'focusEffect', description: '是否缩小并柔化原页面', type: 'boolean', default: 'true' },
    { property: 'maskClosable', description: '点击遮罩是否请求关闭', type: 'boolean', default: 'true' },
    { property: 'onClose', description: '关闭按钮、遮罩或 Escape 请求关闭时触发', type: '() => void', default: '-' },
  ],
  en: [
    { property: 'open', description: 'Controlled drawer visibility.', type: 'boolean', default: '-', required: true },
    { property: 'placement', description: 'Drawer entry edge.', type: "'top' | 'right' | 'bottom' | 'left'", default: "'right'" },
    { property: 'title', description: 'Optional heading.', type: 'ReactNode', default: '-' },
    { property: 'footer', description: 'Optional fixed footer.', type: 'ReactNode', default: '-' },
    { property: 'children', description: 'Drawer body content.', type: 'ReactNode', default: '-' },
    { property: 'className', description: 'Class added to the drawer panel.', type: 'string', default: '-' },
    { property: 'maskStyle', description: 'Inline backdrop styles.', type: 'CSSProperties', default: '-' },
    { property: 'focusEffect', description: 'Whether the page scales and softens.', type: 'boolean', default: 'true' },
    { property: 'maskClosable', description: 'Request close on mask click.', type: 'boolean', default: 'true' },
    { property: 'onClose', description: 'Called by close button, mask, or Escape.', type: '() => void', default: '-' },
  ],
}

function StarDrawerDemoPage() {
  const { lang } = useI18n()
  const [basicOpen, setBasicOpen] = useState(false)
  const [direction, setDirection] = useState<DrawerPlacement | null>(null)
  const [focusOpen, setFocusOpen] = useState(false)
  const [plainOpen, setPlainOpen] = useState(false)
  const [maskOpen, setMaskOpen] = useState(false)
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'directions', 'focus', 'mask', 'api'][index], title, level: 1 }))

  const drawerBody = <p className={styles['drawer-demo__copy']}>{t.body}</p>

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]}>
        <StarNineSliceButton onClick={() => setBasicOpen(true)}>{t.open}</StarNineSliceButton>
        <StarDrawer open={basicOpen} title={t.drawerTitle} footer={<span>{t.footer}</span>} onClose={() => setBasicOpen(false)}>
          {drawerBody}
        </StarDrawer>
      </StarComponentDemo>

      <StarComponentDemo id="directions" title={t.demos[1][0]} description={t.demos[1][1]}>
        <div className={styles['drawer-demo__direction-buttons']}>
          {DIRECTIONS.map(({ placement, zh, en }) => (
            <StarNineSliceButton key={placement} size="small" onClick={() => setDirection(placement)}>
              {lang === 'zh' ? zh : en}
            </StarNineSliceButton>
          ))}
        </div>
        <StarDrawer open={direction !== null} placement={direction ?? 'right'} title={t.drawerTitle} onClose={() => setDirection(null)}>
          {drawerBody}
        </StarDrawer>
      </StarComponentDemo>

      <StarComponentDemo id="focus" title={t.demos[2][0]} description={t.demos[2][1]}>
        <StarNineSliceButton variant="primary" onClick={() => setFocusOpen(true)}>{t.focusOn}</StarNineSliceButton>
        <StarNineSliceButton onClick={() => setPlainOpen(true)}>{t.focusOff}</StarNineSliceButton>
        <StarDrawer open={focusOpen} title={t.focusOn} onClose={() => setFocusOpen(false)}>{drawerBody}</StarDrawer>
        <StarDrawer open={plainOpen} focusEffect={false} title={t.focusOff} onClose={() => setPlainOpen(false)}>{drawerBody}</StarDrawer>
      </StarComponentDemo>

      <StarComponentDemo id="mask" title={t.demos[3][0]} description={t.demos[3][1]}>
        <StarNineSliceButton variant="info" onClick={() => setMaskOpen(true)}>{t.customMask}</StarNineSliceButton>
        <StarDrawer
          open={maskOpen}
          title={t.customMask}
          maskStyle={{ background: 'rgba(21, 69, 104, 0.62)' }}
          onClose={() => setMaskOpen(false)}
        >
          {drawerBody}
        </StarDrawer>
      </StarComponentDemo>

      <div id="api" className="component-page-api"><StarApiTable title="Drawer API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarDrawerDemoPage
