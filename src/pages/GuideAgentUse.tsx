import StarCodeBlock from '../components/layout/CodeBlock'
import { StarTitle, StarTypewriter } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './Guide.module.scss'

/**
 * The shell command and the skill tree keep their literal paths and identifiers
 * in both languages — only the surrounding comments are translated, because
 * `skills add a985987819/stardewUi` and `references/react-project.md` are copied
 * verbatim and must not drift.
 *
 * The two prompt templates *are* translated. They exist to be copy-pasted, and
 * the person hitting copy is reading the page in whatever language they picked;
 * handing an English-only template to a Chinese reader would make the block
 * decorative rather than useful.
 */
const installCommandZh = `# 从 GitHub 安装（推荐）
skills add a985987819/stardewUi

# 或手动复制仓库中的目录
# skills/stardew-valley-ui/ → 你的 Agent skills 目录

# 安装后可在需求开头明确调用
# $stardew-valley-ui 用 StarCard 做一个农场库存页`

const installCommandEn = `# Install from GitHub (recommended)
skills add a985987819/stardewUi

# Or copy the directory from the repo manually
# skills/stardew-valley-ui/ → your Agent skills directory

# After installing, call it explicitly at the start of a request
# $stardew-valley-ui build a farm inventory page with StarCard`

const agentBriefZh = `请在我的 React 项目中使用 stardew-valley-ui 完成这个界面：

- 场景：背包整理页，需要让物品分组清楚、操作有反馈
- 组件：优先使用 StarCard、StarTab、StarDialog、message
- 体验：保留像素风边框；窄屏时一列展示；删除操作须二次确认
- 约束：从公开入口导入；不要猜 props；显式引入一次 style.css
- 交付：修改组件代码、补充必要类型、运行检查，并说明如何验证`

const agentBriefEn = `Use stardew-valley-ui in my React project to build this screen:

- Scenario: a backpack-sorting page where items are clearly grouped and actions give feedback
- Components: prefer StarCard, StarTab, StarDialog, message
- Experience: keep the pixel borders; single column on narrow screens; confirm before deleting
- Constraints: import from the public entry point; do not guess props; import style.css exactly once
- Delivery: edit the component code, add the necessary types, run the checks, and explain how to verify`

const reviewBriefZh = `请检查这次 StardewValley UI 的接入：

1. 是否只使用了公开导出的组件与类型；
2. style.css 与 /auto 是否只选用了一种；
3. 组件状态是否受控，键盘操作是否可用；
4. SSR 边界和 message() 调用是否只发生在客户端；
5. 是否遵守本项目“仅限非商业用途”的许可。`

const reviewBriefEn = `Please review this StardewValley UI integration:

1. Does it use only publicly exported components and types?
2. Is exactly one of style.css and /auto used?
3. Is component state controlled, and is keyboard operation usable?
4. Do SSR boundaries and message() calls stay on the client?
5. Does it respect this project's non-commercial license?`

const skillTree = `stardew-valley-ui/
├── SKILL.md                         # 安装、实际调用、规则与交付清单
└── references/
    ├── react-project.md             # React、样式、SSR 与验证
    └── component-catalog.md         # 组件选择与公开 API 范围`

const copy = {
  zh: {
    board: 'AI 技能包 · STARDEW VALLEY UI',
    title: '让 Agent 真正会用',
    lede: '这不是一段一次性的提示词，而是一份可安装、按需加载的项目知识包：让 AI 知道什么时候该用、去哪里查、哪些规则绝不能越界。',
    chips: ['React + TypeScript', '公开 API 对照', '像素风约束', '非商业许可'],
    blocks: [
      [
        '快速开始',
        '安装后直接描述需求；匹配任务会自动加载，也可在开头写 $stardew-valley-ui 明确调用。',
      ],
      ['它如何工作', '技能是纯文本知识包，不改动你的工程，也不会永久塞满模型上下文。'],
      ['两个入口，按任务取用', '把通用约束放在入口，把容易变化的技术细节放进 references，既准确也节省上下文。'],
      ['技能目录', '一个好的 Skill 需要短入口、可追溯的参考资料，以及清楚的安装与实际调用说明。'],
      ['组件目录', '以下分类来自当前包的公开导出；精确 Props 仍应以本地 TypeScript 声明为准。'],
      ['可直接复用的需求模板', '把场景、优先组件、体验要求和交付标准一并交代，结果会稳定很多。'],
    ],
    quick: [
      ['安装技能', '使用 skills CLI，或把仓库中的技能目录复制到 Agent 识别的 skills 位置。'],
      ['直接提需求', '说明页面目标、数据与交互，例如“$stardew-valley-ui 用 Stardew Valley UI 做一个农场库存页；显式引入一次 style.css”。'],
      ['按真实流程验收', '让 Agent 确认安装状态、只选一种样式入口、复查公开导入与可访问性，再运行项目检查并说明客户端边界和非商业许可。'],
    ],
    workflow: [
      ['发现', 'Agent 根据 SKILL.md 的 description 判断任务是否需要安装、接入或复查 StardewValley UI。'],
      ['加载', '命中后才读取 Skill；也可在需求开头写 $stardew-valley-ui 主动调用。'],
      ['接入', '确认 npm 包后只选一种样式入口；真实 React 项目再读取接入说明。'],
      ['核对', '需要组件或 Props 时才查目录，并以本地类型声明和公开导出为准。'],
      ['交付', '按像素设计语言完成实现，跑项目检查，并报告样式入口、客户端边界与许可限制。'],
    ],
    scenarios: [
      ['React 项目', '真实组件库接入', '安装 npm 包后，Agent 根据公共类型、样式入口和 SSR 边界完成组件实现。'],
      ['组件选择', '避免“凭印象写 API”', '需要选控件或判断公开范围时，先查组件目录，再以已安装包的类型声明确认参数。'],
    ],
    catalog: [
      ['容器与展示', 'StarTitle · StarCard · StarDisplayFrame · StarAvatar · StarDivider · StarEmptyState · StarLoading'],
      ['操作与表单', 'StarNineSliceButton · StarInput · StarSwitch · StarCheckbox · StarRating · StarProgress'],
      ['反馈与浮层', 'StarDialog · StarDrawer · StarPopup · message · StarTypewriter'],
      ['日期与导航', 'StarCalendar · StarDatePicker · StarTab'],
    ],
    reviewSubheading: '交付前巡一遍田',
    calloutTitle: '许可边界：',
    calloutBody: 'StardewValley UI 与这份技能均遵循项目的非商业许可证。Agent 可以实现和复查代码，但不能替你决定产品目标、商业授权或素材权利。',
    installCommand: installCommandZh,
    agentBrief: agentBriefZh,
    reviewBrief: reviewBriefZh,
  },
  en: {
    board: 'AI SKILL PACK · STARDEW VALLEY UI',
    title: 'Make your Agent actually able to use it',
    lede: 'This is not a one-off prompt but an installable, load-on-demand knowledge pack: it teaches an AI when to reach for the kit, where to look things up, and which rules it must never cross.',
    chips: ['React + TypeScript', 'Public API reference', 'Pixel-art constraints', 'Non-commercial license'],
    blocks: [
      [
        'Quick start',
        'Describe what you need after installing; matching tasks load automatically, or call $stardew-valley-ui explicitly at the start.',
      ],
      [
        'How it works',
        'A skill is a plain-text knowledge pack. It does not modify your project, and it does not permanently occupy the model context.',
      ],
      [
        'Two entry points, pick by task',
        'Keep general constraints in the entry and volatile technical detail in references — accurate and context-efficient at once.',
      ],
      [
        'Skill layout',
        'A good skill needs a short entry, traceable references, and clear instructions for installing and calling it.',
      ],
      [
        'Component catalog',
        'The categories below come from the current package exports; for exact props, trust the local TypeScript declarations.',
      ],
      [
        'Reusable request templates',
        'State the scenario, preferred components, experience requirements, and delivery bar together — the result gets far more consistent.',
      ],
    ],
    quick: [
      ['Install the skill', 'Use the skills CLI, or copy the skill directory from the repo to wherever your Agent looks for skills.'],
      ['Just ask', 'Describe the page goal, data, and interactions — e.g. "$stardew-valley-ui build a farm inventory page with Stardew Valley UI; import style.css exactly once".'],
      [
        'Accept by real flow',
        'Have the Agent confirm install state, use exactly one style entry, re-check public imports and accessibility, then run the project checks and state the client boundary and non-commercial limits.',
      ],
    ],
    workflow: [
      ['Discover', 'The Agent reads the description in SKILL.md to decide whether a task needs installing, integrating, or reviewing StardewValley UI.'],
      ['Load', 'The Skill is read only once it matches; you can also call it explicitly with $stardew-valley-ui at the start of a request.'],
      ['Integrate', 'Once the npm package is confirmed, pick exactly one style entry; real React projects then read the integration guide.'],
      ['Verify', 'Look things up in the catalog only when a component or prop is needed, and trust local type declarations and public exports.'],
      ['Deliver', 'Implement in the pixel design language, run the project checks, and report the style entry, client boundary, and license limits.'],
    ],
    scenarios: [
      ['React project', 'Real component-library integration', 'After installing the npm package, the Agent implements against public types, the style entry, and SSR boundaries.'],
      [
        'Component choice',
        'Avoid writing APIs from memory',
        'Before picking a control or judging what is public, check the catalog, then confirm the parameters against the installed package types.',
      ],
    ],
    catalog: [
      ['Containers & display', 'StarTitle · StarCard · StarDisplayFrame · StarAvatar · StarDivider · StarEmptyState · StarLoading'],
      ['Actions & forms', 'StarNineSliceButton · StarInput · StarSwitch · StarCheckbox · StarRating · StarProgress'],
      ['Feedback & overlays', 'StarDialog · StarDrawer · StarPopup · message · StarTypewriter'],
      ['Date & navigation', 'StarCalendar · StarDatePicker · StarTab'],
    ],
    reviewSubheading: 'Walk the field before delivering',
    calloutTitle: 'License boundary: ',
    calloutBody:
      'Both StardewValley UI and this skill follow the project non-commercial license. An Agent may implement and review code, but it cannot decide your product goals, commercial licensing, or asset rights for you.',
    installCommand: installCommandEn,
    agentBrief: agentBriefEn,
    reviewBrief: reviewBriefEn,
  },
} satisfies Record<
  Lang,
  {
    board: string
    title: string
    lede: string
    chips: string[]
    blocks: [string, string][]
    quick: [string, string][]
    workflow: [string, string][]
    scenarios: [string, string, string][]
    catalog: [string, string][]
    reviewSubheading: string
    calloutTitle: string
    calloutBody: string
    installCommand: string
    agentBrief: string
    reviewBrief: string
  }
>

function StarGuideAgentUsePage() {
  const { lang } = useI18n()
  const t = copy[lang]

  return (
    <article className={styles['guide-section']}>
      <header className={styles['guide-intro']}>
        <span>{t.board}</span>
        <StarTitle level={1} className={styles['guide-intro-title']}>{t.title}</StarTitle>
        <p className={styles['guide-intro-desc']}>
          <StarTypewriter text={t.lede} speed={60} />
        </p>
        <div className={styles['guide-chip-row']}>
          {t.chips.map((chip) => <span key={chip}>{chip}</span>)}
        </div>
      </header>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}>
          <span>01</span>
          <div><h2>{t.blocks[0][0]}</h2><p>{t.blocks[0][1]}</p></div>
        </div>
        <ol className={styles['guide-quick-list']}>
          {t.quick.map(([title, body], index) => (
            <li key={title}>
              <strong>{title}</strong>
              <p>{body}</p>
              {index === 0 ? <StarCodeBlock code={t.installCommand} language="bash" /> : null}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}>
          <span>02</span>
          <div><h2>{t.blocks[1][0]}</h2><p>{t.blocks[1][1]}</p></div>
        </div>
        <div className={styles['guide-workflow']}>
          {t.workflow.map(([title, description], index) => (
            <div className={styles['guide-workflow-step']} key={title}>
              <span>{String(index + 1)}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}>
          <span>03</span>
          <div><h2>{t.blocks[2][0]}</h2><p>{t.blocks[2][1]}</p></div>
        </div>
        <div className={styles['guide-scenario-grid']}>
          {t.scenarios.map(([tag, title, body], index) => (
            <div className={styles['guide-scenario']} key={title}>
              <span>{tag}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              {/* Literal file paths: these are what the reader opens, so they
                  stay identical in both languages. */}
              <code>{index === 0 ? 'references/react-project.md' : 'references/component-catalog.md'}</code>
            </div>
          ))}
        </div>
      </section>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}>
          <span>04</span>
          <div><h2>{t.blocks[3][0]}</h2><p>{t.blocks[3][1]}</p></div>
        </div>
        <StarCodeBlock code={skillTree} language="text" />
      </section>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}>
          <span>05</span>
          <div><h2>{t.blocks[4][0]}</h2><p>{t.blocks[4][1]}</p></div>
        </div>
        <div className={styles['guide-catalog']}>
          {t.catalog.map(([title, names]) => <div key={title}><strong>{title}</strong><code>{names}</code></div>)}
        </div>
      </section>

      <section className={styles['guide-block']}>
        <div className={styles['guide-heading']}>
          <span>06</span>
          <div><h2>{t.blocks[5][0]}</h2><p>{t.blocks[5][1]}</p></div>
        </div>
        <StarCodeBlock code={t.agentBrief} language="text" />
        <h3 className={styles['guide-subheading']}>{t.reviewSubheading}</h3>
        <StarCodeBlock code={t.reviewBrief} language="text" />
      </section>

      <aside className={styles['guide-callout']}>
        <strong>{t.calloutTitle}</strong>{t.calloutBody}
      </aside>
    </article>
  )
}

export default StarGuideAgentUsePage