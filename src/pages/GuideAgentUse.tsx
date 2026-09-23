import StarCodeBlock from '../components/layout/CodeBlock'
import styles from './Guide.module.scss'

const installCommand = `# 从 GitHub 安装（推荐）
skills add a985987819/stardewUi

# 或手动复制仓库中的目录
# skills/stardew-valley-ui/ → 你的 Agent skills 目录`

const agentBrief = `请在我的 React 项目中使用 stardew-valley-ui 完成这个界面：

- 场景：背包整理页，需要让物品分组清楚、操作有反馈
- 组件：优先使用 StarCard、StarTab、StarDialog、message
- 体验：保留像素风边框；窄屏时一列展示；删除操作须二次确认
- 约束：从公开入口导入；不要猜 props；显式引入一次 style.css
- 交付：修改组件代码、补充必要类型、运行检查，并说明如何验证`

const reviewBrief = `请检查这次 StardewValley UI 的接入：

1. 是否只使用了公开导出的组件与类型；
2. style.css 与 /auto 是否只选用了一种；
3. 组件状态是否受控，键盘操作是否可用；
4. SSR 边界和 message() 调用是否只发生在客户端；
5. 是否遵守本项目“仅限非商业用途”的许可。`

const workflow = [
  ['1', '发现', 'Agent 根据 SKILL.md 的 description 判断任务是否与星露谷像素 UI、组件接入或视觉复查相关。'],
  ['2', '加载', '命中后才读取 SKILL.md；日常对话不会被完整 API 文档占满。'],
  ['3', '路由', 'React 项目读取接入说明；需要选组件或查 API 时，再打开组件目录。'],
  ['4', '核对', '以本地类型声明和公开导出为准，不凭记忆虚构 props、变体或回调。'],
  ['5', '交付', '按像素设计语言完成实现，并检查样式、响应式、键盘操作与许可证边界。'],
]

const catalog = [
  ['容器与展示', 'StarCard · StarDisplayFrame · StarAvatar · StarDivider · StarEmptyState · StarLoading'],
  ['操作与表单', 'StarNineSliceButton · StarInput · StarSwitch · StarCheckbox · StarRating · StarProgress'],
  ['反馈与浮层', 'StarDialog · StarDrawer · StarPopup · message · StarTypewriter'],
  ['日期与导航', 'StarCalendar · StarDatePicker · StarTab'],
]

const skillTree = `stardew-valley-ui/
├── SKILL.md                         # 触发条件、设计规则、交付清单
├── README.md                        # 人类可读的安装说明
└── references/
    ├── react-project.md             # React、样式、SSR 与验证
    └── component-catalog.md         # 组件选择与公开 API 范围`

function StarGuideAgentUsePage() {
  return (
    <article className={styles['guide-section']}>
      <header className={styles['guide-intro']}>
        <span>AI SKILL · STARDEW VALLEY UI</span>
        <h1>让 Agent 真正会用</h1>
        <p>这不是一段一次性的提示词，而是一份可安装、按需加载的项目知识包：让 AI 知道什么时候该用、去哪里查、哪些规则绝不能越界。</p>
        <div className={styles['guide-chip-row']}>
          <span>React + TypeScript</span>
          <span>公开 API 对照</span>
          <span>像素风约束</span>
          <span>非商业许可</span>
        </div>
      </header>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}>
          <span>01</span>
          <div><h2>快速开始</h2><p>安装后照常描述需求；当任务命中技能描述时，兼容的 Agent 会自行加载相关规则。</p></div>
        </div>
        <ol className={styles['guide-quick-list']}>
          <li><strong>安装技能</strong><p>使用 skills CLI，或把仓库中的技能目录复制到 Agent 识别的 skills 位置。</p><StarCodeBlock code={installCommand} language="bash" /></li>
          <li><strong>直接提需求</strong><p>不需要背诵命令。说明页面目标、数据与交互，例如“用 Stardew Valley UI 做一个农场库存页”。</p></li>
          <li><strong>按规则验收</strong><p>要求 Agent 复查公开导入、样式加载、可访问性、客户端边界和非商业许可。</p></li>
        </ol>
      </section>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}><span>02</span><div><h2>它如何工作</h2><p>技能是纯文本知识包，不改动你的工程，也不会永久塞满模型上下文。</p></div></div>
        <div className={styles['guide-workflow']}>
          {workflow.map(([number, title, description]) => <div className={styles['guide-workflow-step']} key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></div>)}
        </div>
      </section>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}><span>03</span><div><h2>两个入口，按任务取用</h2><p>把通用约束放在入口，把容易变化的技术细节放进 references，既准确也节省上下文。</p></div></div>
        <div className={styles['guide-scenario-grid']}>
          <div className={styles['guide-scenario']}><span>React 项目</span><h3>真实组件库接入</h3><p>安装 npm 包后，Agent 根据公共类型、样式入口和 SSR 边界完成组件实现。</p><code>references/react-project.md</code></div>
          <div className={styles['guide-scenario']}><span>组件选择</span><h3>避免“凭印象写 API”</h3><p>需要选控件或判断公开范围时，先查组件目录，再以已安装包的类型声明确认参数。</p><code>references/component-catalog.md</code></div>
        </div>
      </section>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}><span>04</span><div><h2>技能目录</h2><p>一个好的 Skill 需要短入口、可追溯的参考资料，以及清楚的人类安装说明。</p></div></div>
        <StarCodeBlock code={skillTree} language="text" />
      </section>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}><span>05</span><div><h2>组件目录</h2><p>以下分类来自当前包的公开导出；精确 Props 仍应以本地 TypeScript 声明为准。</p></div></div>
        <div className={styles['guide-catalog']}>
          {catalog.map(([title, names]) => <div key={title}><strong>{title}</strong><code>{names}</code></div>)}
        </div>
      </section>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}><span>06</span><div><h2>可直接复用的需求模板</h2><p>把场景、优先组件、体验要求和交付标准一并交代，结果会稳定很多。</p></div></div>
        <StarCodeBlock code={agentBrief} language="text" />
        <h3 className={styles['guide-subheading']}>交付前巡一遍田</h3>
        <StarCodeBlock code={reviewBrief} language="text" />
      </section>

      <aside className={styles['guide-callout']}>
        <strong>许可边界：</strong>StardewValley UI 与这份技能均遵循项目的非商业许可证。Agent 可以实现和复查代码，但不能替你决定产品目标、商业授权或素材权利。
      </aside>
    </article>
  )
}

export default StarGuideAgentUsePage
