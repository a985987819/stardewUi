import { Coffee, Heart, ShieldCheck, Wrench } from 'lucide-react'
import { StarAlert, StarTitle, StarTypewriter } from '../components/ui'
import { resolveAssetPath } from '../utils/githubPages'
import { useI18n, type Lang } from '../i18n'
import styles from './Support.module.scss'

/**
 * The donation page.
 *
 * Two rules shaped this page, and both are load-bearing rather than stylistic:
 *
 *   1. **A donation is not a licence purchase.** The project is non-commercial
 *      and stays that way regardless of what anyone pays. The most expensive
 *      failure mode here is a reader inferring that money unlocks something, so
 *      that sentence leads — before the QR codes, not in a footnote.
 *   2. **The library stays free.** No feature is gated, no prop is paid for, no
 *      tier exists. That is stated plainly next to the codes, because "support
 *      me" pages tend to imply the opposite.
 *
 * The parallel arrays are kept same-length per language on purpose: a dropped
 * clause would otherwise show up as an undefined list item instead of a failing
 * length check. Same reasoning as GuideLicense.
 */
const copy = {
  zh: {
    board: '摊子在这儿，零钱随意',
    title: '请我喝杯咖啡',
    lede:
      '维护一个组件库的开销是看不见的：打磨像素、追查只在特定环境复现的 bug、把文档写到有人愿意读完。这些活儿没人派工，咖啡钱不解决问题，但能让搬砖的手速快一点。',
    freeTitle: '先说清楚三件事',
    freeBody:
      '组件库的使用本身不收取任何费用。支持是自愿的，不影响项目的免费使用，也不会改变许可证——无论是否支持、金额多少，本项目都保持非商业许可。费用仅用于项目维护：组件开发、缺陷修复、文档完善与素材制作。',
    methodsTitle: '两个二维码',
    methodsLede: '任选其一，扫一扫就行。金额随意，不必凑整。',
    wechat: '微信支付',
    alipay: '支付宝',
    pending: '码还没放上来',
    pendingHint: '维护者还没把收款码放进来：把图片放到 public/donate/ 下同名替换即可。',
    usageTitle: '钱花在哪',
    usage: [
      { icon: 'wrench', text: '组件开发：新组件、既有组件的能力补齐与缺陷修复' },
      { icon: 'book', text: '文档完善：把读不懂的地方写清楚，把踩过的坑记下来' },
      { icon: 'art', text: '素材制作：像素图、九宫格切片与动效的绘制打磨' },
      { icon: 'coffee', text: '杂项：构建、发版与那些"只有维护者才看得见"的活儿' },
    ],
    notFor: '不接受的用途',
    notForBody:
      '付费定制开发、商业授权费、开源挂名合作——这些不是钱的问题，是许可证边界的问题。商业用途请直接放弃使用本库。',
    thanks: '谢谢。无论是一杯还是一杯豆子，都算数。',
  },
  en: {
    board: 'The stall is here, loose change welcome',
    title: 'Buy me a coffee',
    lede:
      'Maintaining a component library has costs you never see: polishing pixels, chasing bugs that only reproduce in one environment, writing docs someone actually finishes. Nobody assigns that work to me. Coffee does not solve the problem, but it makes the typing slightly faster.',
    freeTitle: 'Three things first',
    freeBody:
      'Using the component library itself is free, always. Support is voluntary: it does not affect free use of the project, and it does not change the licence — this project stays non-commercial regardless of whether you support it, and how much. Money goes only to maintenance: component development, bug fixes, documentation and artwork.',
    methodsTitle: 'Two QR codes',
    methodsLede: 'Pick either one and scan. Any amount works — no need to round up.',
    wechat: 'WeChat Pay',
    alipay: 'Alipay',
    pending: 'Code not set up yet',
    pendingHint:
      'The maintainer has not dropped a payment code in yet: replace the image under public/donate/ with the same filename.',
    usageTitle: 'Where the money goes',
    usage: [
      { icon: 'wrench', text: 'Component development: new components, filling gaps in existing ones, fixing defects' },
      { icon: 'book', text: 'Documentation: writing down the parts that confused people, and recording the traps' },
      { icon: 'art', text: 'Artwork: pixel art, nine-slice slicing, and polishing motion' },
      { icon: 'coffee', text: 'Odds and ends: builds, releases, and the work only the maintainer can see' },
    ],
    notFor: 'What I do not take',
    notForBody:
      'Paid feature work, commercial licensing, "open source partnership" in name only. Those are licensing-boundary questions, not money questions. If you need the library commercially, please do not use it.',
    thanks: 'Thank you. A cup or a bean — both count.',
  },
} satisfies Record<
  Lang,
  {
    board: string
    title: string
    lede: string
    freeTitle: string
    freeBody: string
    methodsTitle: string
    methodsLede: string
    wechat: string
    alipay: string
    pending: string
    pendingHint: string
    usageTitle: string
    usage: { icon: string; text: string }[]
    notFor: string
    notForBody: string
    thanks: string
  }
>

/** Payment methods, in display order. Image paths are public assets. */
const METHODS = [
  { key: 'wechat', image: 'donate/wechat-qr.png' },
  { key: 'alipay', image: 'donate/alipay-qr.png' },
] as const

const ICONS = {
  wrench: Wrench,
  book: ShieldCheck,
  art: Coffee,
  coffee: Heart,
}

function StarSupportPage() {
  const { lang } = useI18n()
  const t = copy[lang]

  return (
    <article className={styles['support-page']}>
      <header className={styles['support-intro']}>
        <span className={styles['support-board']}>{t.board}</span>
        <StarTitle level={1} className={styles['support-title']}>
          {t.title}
        </StarTitle>
        <p className={styles['support-lede']}>
          <StarTypewriter text={t.lede} speed={45} />
        </p>
      </header>

      {/*
        Leads the page, above the codes. Placed first on purpose: a reader who
        sees a QR code first is already half-concluding that money changes the
        terms, and no footnote undoes that impression.
      */}
      <StarAlert type="info" title={t.freeTitle}>
        {t.freeBody}
      </StarAlert>

      <section className={styles['support-methods']}>
        <h2>{t.methodsTitle}</h2>
        <p className={styles['support-methods-lede']}>{t.methodsLede}</p>

        <div className={styles['support-method-grid']}>
          {METHODS.map(({ key, image }) => (
            <figure key={key} className={styles['support-method']}>
              <img
                className={styles['support-qr']}
                src={resolveAssetPath(image)}
                width={240}
                height={240}
                // The image is a placeholder until the maintainer drops a real
                // code in, and a blank alt would read as a broken card.
                alt={`${t[key]} — ${t.pending}`}
                loading="lazy"
              />
              <figcaption className={styles['support-method-name']}>{t[key]}</figcaption>
            </figure>
          ))}
        </div>

        <p className={styles['support-pending']}>
          {t.pending} — {t.pendingHint}
        </p>
      </section>

      <section className={styles['support-usage']}>
        <h2>{t.usageTitle}</h2>
        <ul>
          {t.usage.map((item) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS]
            return (
              <li key={item.text}>
                <Icon size={18} aria-hidden />
                <span>{item.text}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <aside className={styles['support-boundary']}>
        <strong>{t.notFor}</strong>
        {t.notForBody}
      </aside>

      <p className={styles['support-thanks']}>{t.thanks}</p>
    </article>
  )
}

export default StarSupportPage