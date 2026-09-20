import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarNineSliceButton, StarRating } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'Rating 评分',
    desc: '用像素爱心记录村民好感，也可以切换为星星评分；半格和禁用状态都保留清晰的农场游戏感。',
    toc: ['基础评分', '增减动效', '星星与半格', '评分个数', '禁用状态', 'API'],
    demos: [
      ['基础评分', '默认爱心适合好感度、收藏度和任务评价。'],
      ['增减动效', '加星时整颗图标按进度条格子的弹入曲线弹一下；减星时先左右摇晃，摇完点亮的那层再缩小消失。用下面的按钮加减试试。'],
      ['星星与半格', '星星图标支持半格，适合更精细的评分。'],
      ['评分个数', 'count 决定图标数量，3 到 10 个都行，图标会自己排开。'],
      ['禁用状态', '只读评分仍会保留已获得的图标状态。'],
    ],
    actions: ['-1', '+1'],
  },
  en: {
    title: 'Rating',
    desc: 'Record villager friendship with pixel hearts, or switch to stars for a half-step score.',
    toc: ['Basic Rating', 'Add & Remove Motion', 'Stars & Halves', 'Icon Count', 'Disabled', 'API'],
    demos: [
      ['Basic Rating', 'Hearts suit friendship, favorites, and quest reviews.'],
      ['Add & Remove Motion', 'Earning a star pops the whole icon in on the Progress-cell curve; losing one wobbles it first, then shrinks the lit layer away. Use the buttons below to try both.'],
      ['Stars & Halves', 'Stars can be scored in half steps.'],
      ['Icon Count', 'count sets how many icons to draw — three to ten — and they lay themselves out.'],
      ['Disabled', 'Read-only scores keep their earned icon state.'],
    ],
    actions: ['-1', '+1'],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][]; actions: string[] }>

const apiData = {
  zh: [
    { property: 'value / defaultValue', description: '受控值或默认评分', type: 'number', default: '0' },
    { property: 'count', description: '评分图标总数', type: 'number', default: '5' },
    { property: 'icon', description: '图标类型', type: "'heart' | 'star'", default: "'heart'" },
    { property: 'allowHalf', description: '允许半格评分', type: 'boolean', default: 'false' },
    { property: 'disabled', description: '禁用交互', type: 'boolean', default: 'false' },
    { property: 'color', description: '已点亮图标颜色', type: 'string', default: '心 #E53935 / 星 #D7992E' },
    { property: 'emptyColor', description: '未点亮图标颜色', type: 'string', default: '#CDBDA8' },
  ],
  en: [
    { property: 'value / defaultValue', description: 'Controlled or initial score.', type: 'number', default: '0' },
    { property: 'count', description: 'Number of score icons.', type: 'number', default: '5' },
    { property: 'icon', description: 'Icon type.', type: "'heart' | 'star'", default: "'heart'" },
    { property: 'allowHalf', description: 'Allows half-step values.', type: 'boolean', default: 'false' },
    { property: 'disabled', description: 'Disables interaction.', type: 'boolean', default: 'false' },
    { property: 'color', description: 'Filled icon color.', type: 'string', default: 'heart #E53935 / star #D7992E' },
    { property: 'emptyColor', description: 'Empty icon color.', type: 'string', default: '#CDBDA8' },
  ],
}

const MOTION_MAX = 5

function StarRatingDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [friendship, setFriendship] = useState(3)
  const [stars, setStars] = useState(3.5)
  const [motionValue, setMotionValue] = useState(3)
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'motion', 'half', 'count', 'disabled', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]} code={'<StarRating value={3} onChange={setValue} />'}>
        <StarRating value={friendship} onChange={setFriendship} aria-label="Friendship rating" />
      </StarComponentDemo>
      <StarComponentDemo id="motion" title={t.demos[1][0]} description={t.demos[1][1]} code={'<StarRating value={value} count={5} onChange={setValue} />'}>
        <div style={{ display: 'grid', gap: 18 }}>
          <StarRating value={motionValue} count={MOTION_MAX} onChange={setMotionValue} aria-label="Motion rating" />
          <div style={{ display: 'flex', gap: 10 }}>
            <StarNineSliceButton variant="secondary" disabled={motionValue <= 0} onClick={() => setMotionValue((current) => Math.max(0, current - 1))}>{t.actions[0]}</StarNineSliceButton>
            <StarNineSliceButton variant="primary" disabled={motionValue >= MOTION_MAX} onClick={() => setMotionValue((current) => Math.min(MOTION_MAX, current + 1))}>{t.actions[1]}</StarNineSliceButton>
          </div>
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="half" title={t.demos[2][0]} description={t.demos[2][1]} code={'<StarRating icon="star" allowHalf defaultValue={3.5} />'}>
        <StarRating value={stars} onChange={setStars} icon="star" allowHalf color="#D7992E" aria-label="Star rating" />
      </StarComponentDemo>
      <StarComponentDemo id="count" title={t.demos[3][0]} description={t.demos[3][1]} code={'<StarRating count={3} defaultValue={2} />\n<StarRating count={10} defaultValue={6} />'}>
        <div style={{ display: 'grid', gap: 16 }}>
          <StarRating count={3} defaultValue={2} aria-label="Three hearts" />
          <StarRating count={10} defaultValue={6} aria-label="Ten hearts" />
          <StarRating count={7} defaultValue={4} icon="star" color="#D7992E" aria-label="Seven stars" />
        </div>
      </StarComponentDemo>
      <StarComponentDemo id="disabled" title={t.demos[4][0]} description={t.demos[4][1]} code={'<StarRating defaultValue={4} disabled />'}>
        <StarRating defaultValue={4} disabled aria-label="Disabled rating" />
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Rating API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarRatingDemoPage
