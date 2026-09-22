import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarDialog, StarNineSliceButton } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'Dialog 对话框',
    desc: '对话框适合 NPC 台词、剧情推进和重要确认，像站在镇民面前听他们说话。',
    toc: ['基础对话', '分页剧情', '自定义动作', '底部全宽', '遮罩风格', 'API'],
    open: '打开对话',
    close: '关闭',
    confirm: '确认',
    darkMask: '深色遮罩',
    lightMask: '浅色遮罩',
    basic: ['基础对话', '打开一个带标题和打字机效果的紧凑对话框。'],
    pages: ['分页剧情', '数组内容会变成多页台词；只有一页时默认不显示分页，也可以用 showPagination 强制显示或关掉。'],
    actions: ['自定义动作', '最后一页可以出现自定义操作。'],
    bottom: ['底部全宽', '使用 placement="bottom" 将对话框固定在屏幕下方中间，并铺满页面可用宽度。'],
    masks: ['遮罩风格', '使用 mask="dark" 聚焦对话内容，或使用 mask="light" 保留更多页面环境。'],
  },
  en: {
    title: 'Dialog',
    desc: 'Dialogs fit NPC lines, story beats, and important confirmations, like standing in front of a villager.',
    toc: ['Basic Dialog', 'Paged Story', 'Custom Actions', 'Full-width Bottom', 'Mask Styles', 'API'],
    open: 'Open Dialog',
    close: 'Close',
    confirm: 'Confirm',
    darkMask: 'Dark Mask',
    lightMask: 'Light Mask',
    basic: ['Basic Dialog', 'Open a compact dialog with title and typewriter effect.'],
    pages: ['Paged Story', 'Array content becomes multiple dialog pages; a single page hides the pager, and showPagination overrides that.'],
    actions: ['Custom Actions', 'Custom actions can appear on the final page.'],
    bottom: ['Full-width Bottom', 'Use placement="bottom" to pin the dialog to the bottom center at the full available page width.'],
    masks: ['Mask Styles', 'Use mask="dark" to focus on the dialog, or mask="light" to retain more page context.'],
  },
} satisfies Record<
  Lang,
  {
    title: string
    desc: string
    toc: string[]
    open: string
    close: string
    confirm: string
    darkMask: string
    lightMask: string
    basic: string[]
    pages: string[]
    actions: string[]
    bottom: string[]
    masks: string[]
  }
>

const apiData = {
  zh: [
    { property: 'open', description: '是否打开', type: 'boolean', default: '-', required: true },
    { property: 'content', description: '内容或分页内容', type: 'string | string[]', default: '-', required: true },
    { property: 'title', description: '标题', type: 'string', default: '-' },
    { property: 'image', description: '右侧角色立绘', type: 'string', default: '-' },
    { property: 'name', description: '右侧角色名', type: 'string', default: '-' },
    { property: 'actions', description: '最后一页的操作按钮（{ label, variant?, disabled?, onClick? }）；传 null 表示不显示', type: 'DialogAction[] | null', default: '确认 / 取消' },
    { property: 'mask', description: '遮罩风格：深色或浅色', type: "'dark' | 'light'", default: "'dark'" },
    { property: 'placement', description: '屏幕位置；底部模式会在下方居中并占满可用宽度', type: "'center' | 'bottom'", default: "'center'" },
    { property: 'maskClosable', description: '点击遮罩是否关闭', type: 'boolean', default: 'true' },
    { property: 'typewriter', description: '标题与正文是否逐字打出来', type: 'boolean', default: 'true' },
    { property: 'typewriterSpeed', description: '每个字之间的间隔（毫秒）', type: 'number', default: '100' },
    { property: 'showPagination', description: '是否显示分页；不传则单页时隐藏', type: 'boolean', default: '单页隐藏' },
    { property: 'onClose', description: '关闭时的回调', type: '() => void', default: '-' },
  ],
  en: [
    { property: 'open', description: 'Controls visibility.', type: 'boolean', default: '-', required: true },
    { property: 'content', description: 'Content or paged content.', type: 'string | string[]', default: '-', required: true },
    { property: 'title', description: 'Dialog title.', type: 'string', default: '-' },
    { property: 'image', description: 'Portrait shown on the right.', type: 'string', default: '-' },
    { property: 'name', description: 'Speaker name shown on the right.', type: 'string', default: '-' },
    { property: 'actions', description: 'Buttons on the final page ({ label, variant?, disabled?, onClick? }); pass null to render none.', type: 'DialogAction[] | null', default: 'confirm / cancel' },
    { property: 'mask', description: 'Backdrop tone.', type: "'dark' | 'light'", default: "'dark'" },
    { property: 'placement', description: 'Viewport placement; bottom centers at the lower edge with full available width.', type: "'center' | 'bottom'", default: "'center'" },
    { property: 'maskClosable', description: 'Close when the mask is clicked.', type: 'boolean', default: 'true' },
    { property: 'typewriter', description: 'Types the title and body out letter by letter.', type: 'boolean', default: 'true' },
    { property: 'typewriterSpeed', description: 'Delay between characters, in ms.', type: 'number', default: '100' },
    { property: 'showPagination', description: 'Shows the prev/next pager; a single page hides it unless this is set.', type: 'boolean', default: 'single page hides' },
    { property: 'onClose', description: 'Called when the dialog closes.', type: '() => void', default: '-' },
  ],
}

function StarDialogDemoPage() {
  const { lang } = useI18n()
  const [basicOpen, setBasicOpen] = useState(false)
  const [pagesOpen, setPagesOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [bottomOpen, setBottomOpen] = useState(false)
  const [darkMaskOpen, setDarkMaskOpen] = useState(false)
  const [lightMaskOpen, setLightMaskOpen] = useState(false)
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'pages', 'actions', 'bottom', 'masks', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.basic[0]} description={t.basic[1]}>
        <StarNineSliceButton onClick={() => setBasicOpen(true)}>{t.open}</StarNineSliceButton>
        <StarDialog open={basicOpen} onClose={() => setBasicOpen(false)} title={lang === 'zh' ? '莱纳斯' : 'Linus'} content={lang === 'zh' ? '山里的夜很安静，适合听风，也适合检查你的背包。' : 'The mountain is quiet at night. Good for listening to wind and checking your pack.'} />
      </StarComponentDemo>

      <StarComponentDemo id="pages" title={t.pages[0]} description={t.pages[1]}>
        <StarNineSliceButton onClick={() => setPagesOpen(true)}>{t.open}</StarNineSliceButton>
        <StarDialog open={pagesOpen} onClose={() => setPagesOpen(false)} title={lang === 'zh' ? '任务开始' : 'Quest Start'} content={lang === 'zh' ? ['先去杂货店买种子。', '然后浇水，等待发芽。', '花舞节之前记得留出体力。'] : ['Buy seeds at the general store.', 'Water them and wait for sprouts.', 'Save energy before the Flower Dance.']} />
      </StarComponentDemo>

      <StarComponentDemo id="actions" title={t.actions[0]} description={t.actions[1]}>
        <StarNineSliceButton onClick={() => setActionsOpen(true)}>{t.open}</StarNineSliceButton>
        <StarDialog open={actionsOpen} onClose={() => setActionsOpen(false)} title={lang === 'zh' ? '出售作物' : 'Sell Crops'} content={lang === 'zh' ? '确定出售今天收获的草莓吗？' : 'Sell today’s strawberry harvest?'} actions={[{ label: t.close, onClick: () => setActionsOpen(false) }, { label: t.confirm, onClick: () => setActionsOpen(false) }]} />
      </StarComponentDemo>

      <StarComponentDemo id="bottom" title={t.bottom[0]} description={t.bottom[1]}>
        <StarNineSliceButton onClick={() => setBottomOpen(true)}>{t.open}</StarNineSliceButton>
        <StarDialog open={bottomOpen} placement="bottom" onClose={() => setBottomOpen(false)} title={lang === 'zh' ? '夜间播报' : 'Nightly Bulletin'} content={lang === 'zh' ? '矿洞入口已关闭。明天再来继续探索吧。' : 'The mine entrance is closed. Return tomorrow to keep exploring.'} />
      </StarComponentDemo>

      <StarComponentDemo id="masks" title={t.masks[0]} description={t.masks[1]}>
        <StarNineSliceButton variant="primary" onClick={() => setDarkMaskOpen(true)}>{t.darkMask}</StarNineSliceButton>
        <StarNineSliceButton onClick={() => setLightMaskOpen(true)}>{t.lightMask}</StarNineSliceButton>
        <StarDialog open={darkMaskOpen} mask="dark" onClose={() => setDarkMaskOpen(false)} title={t.darkMask} content={lang === 'zh' ? '深色遮罩让重要选择从背景中清晰浮现。' : 'The dark mask brings an important choice into clear focus.'} />
        <StarDialog open={lightMaskOpen} mask="light" onClose={() => setLightMaskOpen(false)} title={t.lightMask} content={lang === 'zh' ? '浅色遮罩保留农场环境，同时维持对话层级。' : 'The light mask preserves the farm setting while keeping the dialog distinct.'} />
      </StarComponentDemo>

      <div id="api" className="component-page-api"><StarApiTable title="Dialog API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarDialogDemoPage
