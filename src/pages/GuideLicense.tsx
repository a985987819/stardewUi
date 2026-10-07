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
    lede: '本项目以 MIT 协议开源。你可以自由使用、修改、商用，包括放进闭源产品里——唯一的要求是保留版权声明与许可文本。',
    allowedTitle: 'MIT 允许你做的',
    allowed: [
      '个人学习、研究、作品集展示与非营利开源实验；',
      '商业项目、收费服务、闭源产品——无需申请，也无需付费；',
      '修改代码后分发，只需在副本里保留版权声明与许可文本。',
    ],
    deniedTitle: '你仍然要自己承担的',
    denied: [
      '移除版权声明或许可文本——MIT 的唯一义务，别丢掉它；',
      '暗示本项目是《星露谷物语》官方作品、合作项目或获得权利人背书；',
      '把游戏的美术、音乐、字体等素材打包进来——那些权利不属于本项目。',
    ],
    assetsTitle: '素材与品牌边界',
    assetsBody:
      '项目不包含《星露谷物语》的官方美术、音乐、角色或其他游戏素材；"Stardew Valley"及相关标识的权利归其权利人所有。MIT 协议只授予代码权利，**不涉及任何商标或素材**——这一条不会因为你采用 MIT 而放松。',
    calloutTitle: '需要更多？',
    calloutBody:
      'MIT 没有例外条款可卖，这是协议本身决定的。如果你的场景需要免责赔偿、私有 SLA，或想在自己的名义下维护分叉，那是付费合作的范畴——具体法律问题请向有资质的专业人士咨询，并以根目录 LICENSE 文件为准。',
  },
  en: {
    board: 'Read this sign before you plant',
    title: 'Licensing',
    lede: 'This project is MIT licensed. Use it, modify it, sell it, ship it inside a closed-source product — the only requirement is keeping the copyright notice and the license text.',
    allowedTitle: 'What MIT lets you do',
    allowed: [
      'Personal study, research, portfolio display, and non-profit open-source experiments;',
      'Commercial products, paid services, closed-source apps — no permission needed, no fee;',
      'Redistribute your modified version, as long as the copyright notice and license text travel with it.',
    ],
    deniedTitle: 'Still on you',
    denied: [
      'Removing the copyright notice or the license text — that is MIT\'s one obligation, do not drop it;',
      'Implying this is an official Stardew Valley work, a collaboration, or an endorsed product;',
      'Bundling in game artwork, music, or fonts — those rights are not ours to grant.',
    ],
    assetsTitle: 'Asset and brand boundary',
    assetsBody:
      'This project does not include any official art, music, characters, or other game assets from Stardew Valley. "Stardew Valley" and related marks belong to their rights holder. MIT grants rights in the code only — it says nothing about trademarks or assets, and switching to MIT did not relax this.',
    calloutTitle: 'Need more than that?',
    calloutBody:
      'MIT has no exception clause to sell; that follows from the license itself. If your situation needs indemnification, a private SLA, or a fork under your own name, that is paid work rather than a licensing question — consult a qualified professional, and treat the LICENSE file at the repository root as authoritative.',
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