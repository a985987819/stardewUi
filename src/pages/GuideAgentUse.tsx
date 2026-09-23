import StarCodeBlock from '../components/layout/CodeBlock'
import styles from './Guide.module.scss'

const agentBrief = `请在我的 React 项目中使用 StardewValley UI 完成这个界面：

- 场景：背包整理页，需要让物品分组清楚、操作有反馈
- 组件：优先使用 StarCard、StarTab、StarDialog、StarMessage
- 体验：保留像素风边框；窄屏时一列展示；删除操作须二次确认
- 交付：修改组件代码、补充必要的类型，并说明如何验证`

const reviewBrief = `请检查这次 StardewValley UI 的接入：

1. 是否只使用了公开导出的组件与类型；
2. 组件状态是否受控，键盘操作是否可用；
3. 是否复用了主题 token，而不是写散落的颜色；
4. 是否遵守本项目“仅限非商业用途”的许可。`

function StarGuideAgentUsePage() {
  return (
    <article className={styles['guide-section']}>
      <header className={styles['guide-intro']}>
        <span>ASK THE FARMHAND</span>
        <h1>Agent 帮我使用</h1>
        <p>把场景、想要的交互和验收标准写清楚，Agent 才不会把洒水器装到鸡舍屋顶。下面两段提示词可直接作为起点。</p>
      </header>

      <h2>先交代场景，再指定组件</h2>
      <p>告诉 Agent 页面要解决什么问题、哪些组件优先，以及你在意的响应式、状态与无障碍细节。</p>
      <StarCodeBlock code={agentBrief} language="text" />

      <h2>让它在交付前巡一遍田</h2>
      <p>把复查项留在提示词里，能避免只看见画面长出来、却忘了交互和项目约束。</p>
      <StarCodeBlock code={reviewBrief} language="text" />

      <aside className={styles['guide-callout']}>
        <strong>小贴士：</strong>请提供现有页面、数据结构或设计稿的上下文。Agent 能帮你完成实现，但不能替你决定产品目标或授权范围。
      </aside>
    </article>
  )
}

export default StarGuideAgentUsePage
