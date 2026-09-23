import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarDialog, StarNineSliceButton } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'Dialog 对话框',
    desc: '矿洞的石门落下、镇民把一封信塞进你手里时，农场该先安静一会儿。这里的每段对话都有自己的发生地点、作用和镜头感。',
    toc: ['夜路相逢', '信箱任务', '出货箱前', '矿洞播报', '镜头聚焦', '进场与退场', '页脚安排', '晨雾与夜幕', 'API'],
    basicOpen: '和莱纳斯聊聊',
    pagesOpen: '拆开山里的来信',
    actionsOpen: '查看出货箱',
    bottomOpen: '听矿洞广播',
    focusOn: '让画面安静下来',
    focusOff: '保留农场全景',
    motionOn: '看钥匙登场',
    motionOff: '直接读公告',
    footerDefault: '查看默认页脚',
    footerNone: '读一张没有尾巴的便笺',
    footerCustom: '收下矿洞遗物',
    leave: '先不卖',
    sell: '送进出货箱',
    pack: '放进背包',
    darkMask: '夜色遮罩',
    lightMask: '晨雾遮罩',
    basic: ['夜路相逢', '深夜从山路回家，莱纳斯在篝火旁叫住你；**typewriter** 让一句台词像是刚刚说出口。'],
    pages: ['信箱任务', '信件要交代目标、顺序和下一站：把 **content** 写成数组，每页都是一张翻开的便笺；**showPagination** 决定是否露出翻页器。'],
    actions: ['出货箱前', '收获堆在农场门口时，用 **actions** 写下玩家此刻会做的两件事，而不是“确认 / 取消”。'],
    bottom: ['矿洞播报', '用 **placement="bottom"** 把全宽台词贴在画面下沿：冒险仍在眼前继续，矿洞管理员已在远处敲响关门铃。'],
    focus: ['镜头聚焦', '重要选择出现时，**focusEffect** 默认会缩小、柔化身后的农场，让桌上的钥匙和眼前的话成为唯一焦点；也能关掉，留住完整场景。'],
    motion: ['进场与退场', '重要物件不会硬切到眼前：**motion** 让它先从无到有、略微越过目标尺寸，再稳稳落下；路过公告则可直接关闭动效。'],
    footer: ['页脚安排', '**footer** 不传时负责翻信和作决定；**footer={null}** 让便笺没有尾巴；传入 ReactNode 时，它能换成这段剧情专属的收纳动作。'],
    masks: ['晨雾与夜幕', '**mask** 的夜色适合秘密、警告和抉择；晨雾则适合不想遮住作物与小屋的日常提醒。'],
  },
  en: {
    title: 'Dialog',
    desc: 'When the mine gate shuts or a villager presses a letter into your hand, the farm should go quiet for a moment. Each dialog here has a place, a purpose, and a little camera direction.',
    toc: ['A Meeting on the Trail', 'A Lettered Quest', 'At the Shipping Bin', 'Mine Bulletin', 'Camera Focus', 'Arrival & Departure', 'Footer Choices', 'Morning Mist & Nightfall', 'API'],
    basicOpen: 'Talk to Linus',
    pagesOpen: 'Open the mountain letter',
    actionsOpen: 'Check the shipping bin',
    bottomOpen: 'Hear the mine bulletin',
    focusOn: 'Let the scene go quiet',
    focusOff: 'Keep the farm in view',
    motionOn: 'Watch the key arrive',
    motionOff: 'Read the notice directly',
    footerDefault: 'See the default footer',
    footerNone: 'Read a note with no tail',
    footerCustom: 'Take the mine relic',
    leave: 'Keep the harvest',
    sell: 'Ship the crop',
    pack: 'Put it in the pack',
    darkMask: 'Nightfall mask',
    lightMask: 'Morning-mist mask',
    basic: ['A Meeting on the Trail', 'On the way home after dark, Linus calls from his campfire. **typewriter** makes one line feel freshly spoken.'],
    pages: ['A Lettered Quest', 'A letter can set the goal, its order, and the next stop: make **content** an array for unfolded notes, while **showPagination** decides whether its pager appears.'],
    actions: ['At the Shipping Bin', 'With a harvest at the farm gate, use **actions** to name the two things a farmer would actually do—not a generic confirmation.'],
    bottom: ['Mine Bulletin', 'With **placement="bottom"**, a full-width line sits at the screen edge: adventure remains in view, but someone is ringing the closing bell.'],
    focus: ['Camera Focus', 'For a meaningful choice, **focusEffect** shrinks and softens the farm by default so the key and the words in front of it own the frame. Turn it off to keep the whole scene.'],
    motion: ['Arrival & Departure', 'An important object does not hard-cut into view: **motion** grows it from nothing, lets it overshoot a little, then settles it. A passing notice can disable that entrance.'],
    footer: ['Footer Choices', 'Omit **footer** for built-in paging and decisions; use **footer={null}** for a note meant only to be read; pass a ReactNode for a mine relic’s own action.'],
    masks: ['Morning Mist & Nightfall', 'The **mask** of nightfall suits secrets, warnings, and hard choices; morning mist keeps crops and cottages visible for everyday notes.'],
  },
} satisfies Record<
  Lang,
  {
    title: string
    desc: string
    toc: string[]
    basicOpen: string
    pagesOpen: string
    actionsOpen: string
    bottomOpen: string
    focusOn: string
    focusOff: string
    motionOn: string
    motionOff: string
    footerDefault: string
    footerNone: string
    footerCustom: string
    leave: string
    sell: string
    pack: string
    darkMask: string
    lightMask: string
    basic: string[]
    pages: string[]
    actions: string[]
    bottom: string[]
    focus: string[]
    motion: string[]
    footer: string[]
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
    { property: 'footer', description: '页脚：不传则保留默认的操作与翻页；null 彻底移除；传 ReactNode 则替换为自定义内容', type: 'ReactNode | null', default: '默认页脚' },
    { property: 'mask', description: '遮罩风格：深色或浅色', type: "'dark' | 'light'", default: "'dark'" },
    { property: 'placement', description: '屏幕位置；底部模式会在下方居中并占满可用宽度', type: "'center' | 'bottom'", default: "'center'" },
    { property: 'focusEffect', description: '是否让农场画面缩小、柔化，把当前台词或选择推到镜头中心', type: 'boolean', default: 'true' },
    { property: 'motion', description: '是否播放从 0 到 105% 再回到 100% 的进场，以及缩小淡出的退场动画', type: 'boolean', default: 'true' },
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
    { property: 'footer', description: 'Footer content: omit for built-in actions and paging, use null to remove it, or provide a ReactNode to replace it.', type: 'ReactNode | null', default: 'built-in footer' },
    { property: 'mask', description: 'Backdrop tone.', type: "'dark' | 'light'", default: "'dark'" },
    { property: 'placement', description: 'Viewport placement; bottom centers at the lower edge with full available width.', type: "'center' | 'bottom'", default: "'center'" },
    { property: 'focusEffect', description: 'Scales and softens the farm behind the dialog so the current line or choice owns the frame.', type: 'boolean', default: 'true' },
    { property: 'motion', description: 'Plays the 0 → 105% → 100% entrance and a shrinking fade-out on exit.', type: 'boolean', default: 'true' },
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
  const [focusOpen, setFocusOpen] = useState(false)
  const [wideOpen, setWideOpen] = useState(false)
  const [motionOpen, setMotionOpen] = useState(false)
  const [instantOpen, setInstantOpen] = useState(false)
  const [defaultFooterOpen, setDefaultFooterOpen] = useState(false)
  const [emptyFooterOpen, setEmptyFooterOpen] = useState(false)
  const [customFooterOpen, setCustomFooterOpen] = useState(false)
  const [darkMaskOpen, setDarkMaskOpen] = useState(false)
  const [lightMaskOpen, setLightMaskOpen] = useState(false)
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'pages', 'actions', 'bottom', 'focus', 'motion', 'footer', 'masks', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.basic[0]} description={t.basic[1]}>
        <StarNineSliceButton onClick={() => setBasicOpen(true)}>{t.basicOpen}</StarNineSliceButton>
        <StarDialog open={basicOpen} onClose={() => setBasicOpen(false)} title={lang === 'zh' ? '莱纳斯' : 'Linus'} content={lang === 'zh' ? '山里的夜会把脚步声传得很远。回农场前，先看看背包里有没有能煮成晚餐的东西吧。' : 'At night the mountain carries every footstep. Before you head home, see whether your pack holds something for supper.'} />
      </StarComponentDemo>

      <StarComponentDemo id="pages" title={t.pages[0]} description={t.pages[1]}>
        <StarNineSliceButton onClick={() => setPagesOpen(true)}>{t.pagesOpen}</StarNineSliceButton>
        <StarDialog open={pagesOpen} onClose={() => setPagesOpen(false)} title={lang === 'zh' ? '一封带松针香味的信' : 'A Letter That Smells of Pine'} content={lang === 'zh' ? ['矿洞口的石头松了，明早去找罗宾借一把结实的镐子。', '先清掉入口的碎石，再往下走；火把放在背包最顺手的位置。', '天黑前回到山脚。那条路在雨后很容易迷路。\n——山里的朋友'] : ['The stones at the mine entrance have loosened. Borrow a sturdy pickaxe from Robin tomorrow morning.', 'Clear the rubble before heading down, and keep your torch where your hand can find it.', 'Be back at the foothills before dark. That trail loses itself after rain.\n— A friend in the mountains']} />
      </StarComponentDemo>

      <StarComponentDemo id="actions" title={t.actions[0]} description={t.actions[1]}>
        <StarNineSliceButton onClick={() => setActionsOpen(true)}>{t.actionsOpen}</StarNineSliceButton>
        <StarDialog open={actionsOpen} onClose={() => setActionsOpen(false)} title={lang === 'zh' ? '出货箱前的最后一篮草莓' : 'The Last Basket of Strawberries'} content={lang === 'zh' ? '今天的草莓足够换一座新的鸡舍。要在日落前送进出货箱，还是留几颗给明早的早餐？' : 'Today’s strawberries could pay for a new coop. Ship them before sunset, or save a few for tomorrow’s breakfast?'} actions={[{ label: t.leave, onClick: () => setActionsOpen(false) }, { label: t.sell, variant: 'primary', onClick: () => setActionsOpen(false) }]} />
      </StarComponentDemo>

      <StarComponentDemo id="bottom" title={t.bottom[0]} description={t.bottom[1]}>
        <StarNineSliceButton onClick={() => setBottomOpen(true)}>{t.bottomOpen}</StarNineSliceButton>
        <StarDialog open={bottomOpen} placement="bottom" onClose={() => setBottomOpen(false)} title={lang === 'zh' ? '矿洞夜间播报' : 'Mine Night Bulletin'} content={lang === 'zh' ? '叮——矿洞将在午夜封门。把矿石和怪物掉落物收进箱子，明天再往更深处走。' : 'Ding— the mine closes at midnight. Stow your ore and monster loot; the deeper floors can wait until tomorrow.'} />
      </StarComponentDemo>

      <StarComponentDemo id="focus" title={t.focus[0]} description={t.focus[1]}>
        <StarNineSliceButton variant="primary" onClick={() => setFocusOpen(true)}>{t.focusOn}</StarNineSliceButton>
        <StarNineSliceButton onClick={() => setWideOpen(true)}>{t.focusOff}</StarNineSliceButton>
        <StarDialog open={focusOpen} onClose={() => setFocusOpen(false)} title={lang === 'zh' ? '书桌上的生锈钥匙' : 'A Rusted Key on the Desk'} content={lang === 'zh' ? '钥匙齿缝里嵌着蓝色矿石。它也许能打开矿井更深处那扇从未开启的门。' : 'Blue ore is lodged between the key’s teeth. It may open the unopened door far below the mine.'} />
        <StarDialog open={wideOpen} focusEffect={false} onClose={() => setWideOpen(false)} title={lang === 'zh' ? '早晨的公告板' : 'The Morning Noticeboard'} content={lang === 'zh' ? '花舞节还有三天。农场、溪流和镇上的人都还在视野里，这只是路过时读到的一张便条。' : 'Three days until the Flower Dance. The farm, the creek, and the town stay in view—this is only a note read in passing.'} />
      </StarComponentDemo>

      <StarComponentDemo id="motion" title={t.motion[0]} description={t.motion[1]}>
        <StarNineSliceButton variant="primary" onClick={() => setMotionOpen(true)}>{t.motionOn}</StarNineSliceButton>
        <StarNineSliceButton onClick={() => setInstantOpen(true)}>{t.motionOff}</StarNineSliceButton>
        <StarDialog open={motionOpen} onClose={() => setMotionOpen(false)} title={lang === 'zh' ? '雨后捡到的钥匙' : 'A Key Found After the Rain'} content={lang === 'zh' ? '它从湿漉漉的石阶缝里滑出来，在晨光下闪了一下。' : 'It slipped from a crack in the rain-soaked steps and flashed once in the morning light.'} />
        <StarDialog open={instantOpen} motion={false} onClose={() => setInstantOpen(false)} title={lang === 'zh' ? '路过时的公告' : 'A Notice Passed By'} content={lang === 'zh' ? '镇广场今天有新鲜面包。若你正好路过，别让它凉了。' : 'Fresh bread is waiting in the town square today. If you pass by, do not let it go cold.'} />
      </StarComponentDemo>

      <StarComponentDemo id="footer" title={t.footer[0]} description={t.footer[1]}>
        <StarNineSliceButton onClick={() => setDefaultFooterOpen(true)}>{t.footerDefault}</StarNineSliceButton>
        <StarNineSliceButton onClick={() => setEmptyFooterOpen(true)}>{t.footerNone}</StarNineSliceButton>
        <StarNineSliceButton variant="primary" onClick={() => setCustomFooterOpen(true)}>{t.footerCustom}</StarNineSliceButton>
        <StarDialog open={defaultFooterOpen} onClose={() => setDefaultFooterOpen(false)} title={lang === 'zh' ? '旅行商人的账本' : 'The Travelling Merchant’s Ledger'} content={lang === 'zh' ? ['第一页夹着一粒从没见过的种子。', '最后一页写着：下周五，秘密森林入口见。'] : ['The first page holds a seed you have never seen.', 'The last page reads: Meet me at the Secret Woods entrance next Friday.']} />
        <StarDialog open={emptyFooterOpen} footer={null} onClose={() => setEmptyFooterOpen(false)} title={lang === 'zh' ? '贴在谷仓门上的便笺' : 'A Note on the Barn Door'} content={lang === 'zh' ? '明天会下雨。水桶和种子都放在门边，醒来时别急着浇地。' : 'Rain is due tomorrow. The bucket and seeds are by the door, so do not rush to water at dawn.'} />
        <StarDialog open={customFooterOpen} onClose={() => setCustomFooterOpen(false)} title={lang === 'zh' ? '幽暗矿洞的遗物' : 'A Relic from the Dark Mine'} content={lang === 'zh' ? '这枚刻着螺旋纹的石片摸起来仍有余温。它应该待在背包里，而不是继续留在这里。' : 'The spiral-carved shard is still warm to the touch. It belongs in your pack, not down here.'} footer={<><span>{lang === 'zh' ? '物品栏还有空位。' : 'There is room in your pack.'}</span><StarNineSliceButton type="button" size="small" variant="primary" onClick={() => setCustomFooterOpen(false)}>{t.pack}</StarNineSliceButton></>} />
      </StarComponentDemo>

      <StarComponentDemo id="masks" title={t.masks[0]} description={t.masks[1]}>
        <StarNineSliceButton variant="primary" onClick={() => setDarkMaskOpen(true)}>{t.darkMask}</StarNineSliceButton>
        <StarNineSliceButton onClick={() => setLightMaskOpen(true)}>{t.lightMask}</StarNineSliceButton>
        <StarDialog open={darkMaskOpen} mask="dark" onClose={() => setDarkMaskOpen(false)} title={t.darkMask} content={lang === 'zh' ? '山路尽头的脚印忽然消失在树影里。先别急着回头，听听风里有没有别的声音。' : 'At the end of the trail, the footprints vanish beneath the trees. Do not turn around just yet; listen for another sound in the wind.'} />
        <StarDialog open={lightMaskOpen} mask="light" onClose={() => setLightMaskOpen(false)} title={t.lightMask} content={lang === 'zh' ? '皮埃尔把新到的防风种子放在柜台上。春风还凉，正适合今天带回农场。' : 'Pierre sets a fresh packet of windproof seeds on the counter. The spring breeze is still cool—just right for taking them home today.'} />
      </StarComponentDemo>

      <div id="api" className="component-page-api"><StarApiTable title="Dialog API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarDialogDemoPage
