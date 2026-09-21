import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarAvatar } from '../components/ui'
import { useI18n, type Lang } from '../i18n'
import type { ReactNode } from 'react'
import styles from './AvatarDemo.module.scss'

const portrait = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#78936b"/><rect y="45" width="64" height="19" fill="#516d50"/><path fill="#3a241d" d="M15 34c0-17 8-27 18-27s17 10 17 27v15H15z"/><circle cx="32" cy="29" r="15" fill="#f1bd91"/><path fill="#6d3b2f" d="M17 27c2-14 9-19 16-19 10 0 16 9 16 19-7-5-19-6-32 0z"/><rect x="24" y="27" width="3" height="3" fill="#35251e"/><rect x="37" y="27" width="3" height="3" fill="#35251e"/><path d="M28 37h8" stroke="#9f5543" stroke-width="2"/></svg>`)}`

const copy = {
  zh: {
    title: 'Avatar 头像',
    desc: '带有 Card 同款多层木纹、受光边框和右侧阴影的像素头像。可选方框或圆框，图片加载失败时自动回退为姓名缩写。',
    toc: ['基础头像', '方框与圆框', '尺寸与配色', 'API'],
    demos: [
      ['基础头像', '传入 src 与 alt 显示像素化头像；没有图片时，从 name 或 alt 提取最多两个字母作为后备内容。'],
      ['方框与圆框', 'square 是与 Card 相同的轻微圆角方框，circle 则将木纹、内框和高光收进完整圆形。'],
      ['尺寸与配色', 'small、medium、large 对应常用密度；color 输入可见主体色，自动推导出木纹和边框的明暗层级。'],
    ],
    labels: ['带图片', '姓名后备', '方框', '圆框', '春季', '矿洞'],
  },
  en: {
    title: 'Avatar',
    desc: 'A pixel avatar with Card-style layered wood grain, directional frame lighting, and a right-side shadow. Use a square or round frame, with automatic initial fallback.',
    toc: ['Basic Avatar', 'Square & Round', 'Sizes & Colors', 'API'],
    demos: [
      ['Basic Avatar', 'Pass src and alt for a pixelated portrait. Without an image, name or alt supplies up to two fallback initials.'],
      ['Square & Round', 'square is a gently rounded Card-like frame; circle carries the wood grain, inset frame, and gloss into a complete round profile.'],
      ['Sizes & Colors', 'small, medium, and large fit common densities. color is the visible surface and derives all wood and frame lighting.'],
    ],
    labels: ['Image portrait', 'Initial fallback', 'Square', 'Round', 'Spring', 'Mine'],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; labels: string[] }>

const apiData = {
  zh: [
    { property: 'src', description: '头像图片地址；加载失败时显示后备内容', type: 'string', default: '-' },
    { property: 'alt / name', description: '图片替代文本与后备缩写来源；name 优先', type: 'string', default: '-' },
    { property: 'shape', description: '边框形状', type: "'square' | 'circle'", default: "'square'" },
    { property: 'size', description: '预设尺寸或具体像素值', type: "'small' | 'medium' | 'large' | number", default: "'medium'" },
    { property: 'color', description: '可见木纹主体色，自动推导边框、阴影和条纹', type: 'string', default: '#FFC675' },
    { property: 'children', description: '自定义后备内容', type: 'ReactNode', default: '-' },
  ],
  en: [
    { property: 'src', description: 'Portrait URL; fallback is shown if it fails.', type: 'string', default: '-' },
    { property: 'alt / name', description: 'Image alternative text and initial source; name wins.', type: 'string', default: '-' },
    { property: 'shape', description: 'Frame shape.', type: "'square' | 'circle'", default: "'square'" },
    { property: 'size', description: 'Preset or exact pixel size.', type: "'small' | 'medium' | 'large' | number", default: "'medium'" },
    { property: 'color', description: 'Visible wood surface; frame, shadow, and grain are derived.', type: 'string', default: '#FFC675' },
    { property: 'children', description: 'Custom fallback content.', type: 'ReactNode', default: '-' },
  ],
}

function AvatarItem({ label, children }: { label: string; children: ReactNode }) {
  return <div className={styles['avatar-demo-item']}>{children}<span>{label}</span></div>
}

function StarAvatarDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'shape', 'color', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]} code={'<StarAvatar src="/portrait.png" alt="Abigail" />'}>
        <div className={styles['avatar-demo-row']}>
          <AvatarItem label={t.labels[0]}><StarAvatar src={portrait} alt="Abigail" /></AvatarItem>
          <AvatarItem label={t.labels[1]}><StarAvatar name="Leah Stone" color="#D9899A" /></AvatarItem>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="shape" title={t.demos[1][0]} description={t.demos[1][1]} code={'<StarAvatar shape="circle" name="Maru" />'}>
        <div className={styles['avatar-demo-row']}>
          <AvatarItem label={t.labels[2]}><StarAvatar name="Sam" shape="square" color="#D36C2A" /></AvatarItem>
          <AvatarItem label={t.labels[3]}><StarAvatar src={portrait} alt="Maru" shape="circle" color="#7699B5" /></AvatarItem>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="color" title={t.demos[2][0]} description={t.demos[2][1]} code={'<StarAvatar size="large" color="#82B651" name="Robin" />'}>
        <div className={styles['avatar-demo-row']}>
          <AvatarItem label={t.labels[4]}><StarAvatar size="small" color="#82B651" name="Robin" /></AvatarItem>
          <AvatarItem label={t.labels[5]}><StarAvatar size="large" shape="circle" color="#6A7DC9" name="Clint" /></AvatarItem>
        </div>
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Avatar API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarAvatarDemoPage
