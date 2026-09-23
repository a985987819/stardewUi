import styles from './Guide.module.scss'

function StarGuideLicensePage() {
  return (
    <article className={styles['guide-section']}>
      <header className={styles['guide-intro']}>
        <span>PLEASE READ BEFORE PLANTING</span>
        <h1>版权相关</h1>
        <p>本项目以非商业学习与个人创作为边界。使用前请确认你的用途不涉及收费、销售、获客或为商业客户交付。</p>
      </header>

      <section className={styles['guide-license-panel']}>
        <h2>允许的用途</h2>
        <ul>
          <li>个人学习、研究、作品集展示与非营利开源实验；</li>
          <li>内部原型验证，前提是不对外销售、收费或用于商业运营；</li>
          <li>在保留许可证与来源说明的前提下，为上述非商业用途修改代码。</li>
        </ul>
      </section>

      <section className={styles['guide-license-panel']}>
        <h2>明确禁止的用途</h2>
        <ul>
          <li>将本项目、其代码、演示站或衍生成果出售、出租、授权收费或打包进付费产品与服务；</li>
          <li>将其用于商业网站、广告营销、获客、商业客户项目或任何直接、间接盈利活动；</li>
          <li>移除许可证、来源说明，或暗示你拥有本项目及其素材的原始权利。</li>
        </ul>
      </section>

      <h2>素材与品牌边界</h2>
      <p>项目不直接包含《星露谷物语》的官方美术、音乐、角色或其他游戏素材；“Stardew Valley”及相关标识的权利归其权利人所有。你不得把本项目描述为官方作品、合作项目或获得权利人背书的产品。</p>

      <aside className={styles['guide-callout']}>
        <strong>需要商业授权？</strong>本仓库当前不提供商业授权。请不要将其用于商业场景；具体法律问题请向有资质的专业人士咨询，并以根目录 LICENSE 文件为准。
      </aside>
    </article>
  )
}

export default StarGuideLicensePage
