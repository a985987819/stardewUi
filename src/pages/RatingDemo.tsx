import { useState } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarRating } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'Rating 评分',
    desc: '用像素爱心记录村民好感，也可以切换为星星评分；半格和禁用状态都保留清晰的农场游戏感。',
    toc: ['基础评分', '星星与半格', '禁用状态', 'API'],
    demos: [['基础评分', '默认爱心适合好感度、收藏度和任务评价。'], ['星星与半格', '星星图标支持半格，适合更精细的评分。'], ['禁用状态', '只读评分仍会保留已获得的图标状态。']],
  },
  en: {
    title: 'Rating',
    desc: 'Record villager friendship with pixel hearts, or switch to stars for a half-step score.',
    toc: ['Basic Rating', 'Stars & Halves', 'Disabled', 'API'],
    demos: [['Basic Rating', 'Hearts suit friendship, favorites, and quest reviews.'], ['Stars & Halves', 'Stars can be scored in half steps.'], ['Disabled', 'Read-only scores keep their earned icon state.']],
  },
} satisfies Record<Lang, { title: string; desc: string; toc: string[]; demos: string[][] }>

const apiData = {
  zh: [
    { property: 'value / defaultValue', description: '受控值或默认评分', type: 'number', default: '0' },
    { property: 'count', description: '评分图标总数', type: 'number', default: '5' },
    { property: 'icon', description: '图标类型', type: "'heart' | 'star'", default: "'heart'" },
    { property: 'allowHalf', description: '允许半格评分', type: 'boolean', default: 'false' },
    { property: 'disabled', description: '禁用交互', type: 'boolean', default: 'false' },
    { property: 'color', description: '已点亮图标颜色', type: 'string', default: '#D9899A' },
  ],
  en: [
    { property: 'value / defaultValue', description: 'Controlled or initial score.', type: 'number', default: '0' },
    { property: 'count', description: 'Number of score icons.', type: 'number', default: '5' },
    { property: 'icon', description: 'Icon type.', type: "'heart' | 'star'", default: "'heart'" },
    { property: 'allowHalf', description: 'Allows half-step values.', type: 'boolean', default: 'false' },
    { property: 'disabled', description: 'Disables interaction.', type: 'boolean', default: 'false' },
    { property: 'color', description: 'Filled icon color.', type: 'string', default: '#D9899A' },
  ],
}

function StarRatingDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [friendship, setFriendship] = useState(3)
  const [stars, setStars] = useState(3.5)
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'half', 'disabled', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo id="basic" title={t.demos[0][0]} description={t.demos[0][1]} code={'<StarRating value={3} onChange={setValue} />'}>
        <StarRating value={friendship} onChange={setFriendship} aria-label="Friendship rating" />
      </StarComponentDemo>
      <StarComponentDemo id="half" title={t.demos[1][0]} description={t.demos[1][1]} code={'<StarRating icon="star" allowHalf defaultValue={3.5} />'}>
        <StarRating value={stars} onChange={setStars} icon="star" allowHalf color="#D7992E" aria-label="Star rating" />
      </StarComponentDemo>
      <StarComponentDemo id="disabled" title={t.demos[2][0]} description={t.demos[2][1]} code={'<StarRating defaultValue={4} disabled />'}>
        <StarRating defaultValue={4} disabled aria-label="Disabled rating" />
      </StarComponentDemo>
      <div id="api" className="component-page-api"><StarApiTable title="Rating API" data={apiData[lang]} /></div>
    </StarComponentPage>
  )
}

export default StarRatingDemoPage
