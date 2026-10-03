import { StarTitle, StarTypewriter } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import styles from './Guide.module.scss'

/**
 * The two lists are the legally load-bearing part of this page, so they are kept
 * as parallel same-length arrays per language: a dropped or reordered clause
 * would show up as a length mismatch rather than silently changing what the
 * license says.
 */
const copy = {
  zh: {
    board: '播种之前，请先读完这块牌子',
    title: '版权相关',
    lede: '本项目以非商业学习与个人创作为边界。使用前请确认你的用途不涉及收费、销售、获客或为商业客户交付。',
    allowedTitle: '允许的用途',
    allowed: [
      '个人学习、研究、作品集展示与非营利开源实验；',
      '内部原型验证，前提是不对外销售、收费或用于商业运营；',
      '在保留许可证与来源说明的前提下，为上述非商业用途修改代码。',
    ],
    deniedTitle: '明确禁止的用途',
    denied: [
      '将本项目、其代码、演示站或衍生成果出售、出租、授权收费或打包进付费产品与服务；',
      '将其用于商业网站、广告营销、获客、商业客户项目或任何直接、间接盈利活动；',
      '移除许可证、来源说明，或暗示你拥有本项目及其素材的原始权利。',
    ],
    assetsTitle: '素材与品牌边界',
    assetsBody:
      '项目不直接包含《星露谷物语》的官方美术、音乐、角色或其他游戏素材；“Stardew Valley”及相关标识的权利归其权利人所有。你不得把本项目描述为官方作品、合作项目或获得权利人背书的产品。',
    calloutTitle: '需要商业授权？',
    calloutBody:
      '本仓库当前不提供商业授权。请不要将其用于商业场景；具体法律问题请向有资质的专业人士咨询，并以根目录 LICENSE 文件为准。',
  },
  en: {
    board: 'Read this sign before you plant',
    title: 'Licensing',
    lede: 'This project is bounded by non-commercial study and personal creation. Before using it, confirm your purpose involves no fees, sales, customer acquisition, or delivery to commercial clients.',
    allowedTitle: 'Permitted uses',
    allowed: [
      'Personal study, research, portfolio display, and non-profit open-source experiments;',
      'Internal prototype validation, provided it is not sold, charged for, or used in commercial operation;',
      'Modifying the code for those non-commercial purposes, provided the license and attribution are preserved.',
    ],
    deniedTitle: 'Explicitly prohibited uses',
    denied: [
      'Selling, renting, licensing for a fee, or bundling this project, its code, its demo site, or derivative work into paid products or services;',
      'Using it for commercial sites, advertising, customer acquisition, commercial client work, or any direct or indirect profit-making activity;',
      'Removing the license or attribution, or implying that you hold the original rights to this project and its assets.',
    ],
    assetsTitle: 'Asset and brand boundary',
    assetsBody:
      'This project does not include any official art, music, characters, or other game assets from Stardew Valley. "Stardew Valley" and related marks belong to their rights holder. You may not present this project as an official work, a collaboration, or a product endorsed by the rights holder.',
    calloutTitle: 'Need a commercial license?',
    calloutBody:
      'This repository does not currently offer commercial licensing. Please do not use it in commercial contexts. Consult a qualified professional on specific legal questions; the LICENSE file at the repository root is authoritative.',
  },
} satisfies Record<
  Lang,
  {
    board: string
    title: string
    lede: string
    allowedTitle: string
    allowed: string[]
    deniedTitle: string
    denied: string[]
    assetsTitle: string
    assetsBody: string
    calloutTitle: string
    calloutBody: string
  }
>

function StarGuideLicensePage() {
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
      </header>

      <section className={styles['guide-license-panel']}>
        <h2>{t.allowedTitle}</h2>
        <ul>
          {t.allowed.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className={styles['guide-license-panel']}>
        <h2>{t.deniedTitle}</h2>
        <ul>
          {t.denied.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <h2>{t.assetsTitle}</h2>
      <p>{t.assetsBody}</p>

      <aside className={styles['guide-callout']}>
        <strong>{t.calloutTitle}</strong>{t.calloutBody}
      </aside>
    </article>
  )
}

export default StarGuideLicensePage