import { useState } from 'react'
import { Sprout, Fish, Pickaxe, Heart, Swords } from 'lucide-react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarTab } from '../components/ui'

const tocItems = [
  { id: 'basic', title: '基础用法', level: 1 },
  { id: 'icon', title: '带图标', level: 1 },
  { id: 'position', title: '底部导航', level: 1 },
  { id: 'custom', title: '自定义选中样式', level: 1 },
  { id: 'disabled', title: '禁用选项', level: 1 },
  { id: 'controlled', title: '受控模式', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const apiData = [
  { property: 'items', description: '选项卡数据列表', type: 'StarTabItem[]', default: '-', required: true },
  { property: 'activeKey', description: '当前激活的选项卡 key（受控）', type: 'string', default: '-' },
  { property: 'defaultActiveKey', description: '默认激活的选项卡 key（非受控）', type: 'string', default: '第一项 key' },
  { property: 'onChange', description: '切换选项卡时的回调', type: '(key: string) => void', default: '-' },
  { property: 'position', description: '导航栏位置', type: "'top' | 'bottom'", default: "'top'" },
]

const tabItemApiData = [
  { property: 'key', description: '选项卡唯一标识', type: 'string', default: '-', required: true },
  { property: 'label', description: '选项卡标题', type: 'string', default: '-', required: true },
  { property: 'icon', description: '选项卡图标', type: 'ReactNode', default: '-' },
  { property: 'content', description: '选项卡内容', type: 'ReactNode', default: '-', required: true },
  { property: 'activeStyle', description: '选中时的内联样式', type: 'CSSProperties', default: '-' },
  { property: 'activeClassName', description: '选中时追加的类名', type: 'string', default: '-' },
  { property: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' },
]

const basicCode = `<StarTab
  items={[
    { key: 'spring', label: '春季', content: '春天来了，万物复苏！可以种植土豆、花椰菜和草莓。' },
    { key: 'summer', label: '夏季', content: '夏日炎炎，番茄、蓝莓和甜瓜是最佳选择。' },
    { property: 'fall', label: '秋季', content: '秋高气爽，南瓜、蔓越莓和茄子正当时。' },
    { key: 'winter', label: '冬季', content: '冬天来了，虽然不能种植，但可以采矿和钓鱼。' },
  ]}
/>`

const iconCode = `<StarTab
  items={[
    { key: 'farm', label: '农场', icon: <Sprout size={16} />, content: '管理你的农场...' },
    { key: 'fish', label: '钓鱼', icon: <Fish size={16} />, content: '在湖边享受钓鱼时光...' },
    { key: 'mine', label: '矿洞', icon: <Pickaxe size={16} />, content: '深入矿洞探索...' },
  ]}
/>`

const positionCode = `<StarTab
  position="bottom"
  items={[
    { key: 'home', label: '首页', icon: <Heart size={16} />, content: '欢迎回到星露谷！' },
    { key: 'adventure', label: '冒险', icon: <Swords size={16} />, content: '前往矿洞探险吧！' },
  ]}
/>`

const customCode = `<StarTab
  items={[
    {
      key: 'spring',
      label: '春季',
      content: '春暖花开...',
      activeStyle: { background: '#7a9d3d', color: '#fff8eb' },
    },
    {
      key: 'summer',
      label: '夏季',
      content: '夏日炎炎...',
      activeStyle: { background: '#d7992e', color: '#fff8eb' },
    },
  ]}
/>`

const disabledCode = `<StarTab
  items={[
    { key: 'open', label: '已解锁', content: '这个区域已经开放了！' },
    { key: 'locked', label: '未解锁', content: '需要更多经验值...', disabled: true },
  ]}
/>`

const controlledCode = `const [key, setKey] = useState('spring')

<StarTab
  activeKey={key}
  onChange={setKey}
  items={[...]}
/>`

const basicItems = [
  { key: 'spring', label: '春季', content: '春天来了，万物复苏！可以种植土豆、花椰菜和草莓。别忘了参加花舞节！' },
  { key: 'summer', label: '夏季', content: '夏日炎炎，番茄、蓝莓和甜瓜是最佳选择。月光水母节在夏夜等你。' },
  { key: 'fall', label: '秋季', content: '秋高气爽，南瓜、蔓越莓和茄子正当时。星露谷展览会是秋天的重头戏！' },
  { key: 'winter', label: '冬季', content: '冬天来了，虽然不能种植，但可以采矿和钓鱼。冬至节温暖你的心。' },
]

const iconItems = [
  { key: 'farm', label: '农场', icon: <Sprout size={16} />, content: '管理你的农场，种植作物、照料动物，享受田园生活的每一天。' },
  { key: 'fish', label: '钓鱼', icon: <Fish size={16} />, content: '在山谷的湖泊和河流中，不同季节和天气能钓到不同的鱼。' },
  { key: 'mine', label: '矿洞', icon: <Pickaxe size={16} />, content: '深入矿洞，击败怪物，收集矿石和宝石，发现地下的秘密。' },
]

const bottomItems = [
  { key: 'home', label: '首页', icon: <Heart size={16} />, content: '欢迎回到星露谷！今天又是美好的一天。' },
  { key: 'adventure', label: '冒险', icon: <Swords size={16} />, content: '前往矿洞探险吧！带上你的镐子和剑。' },
  { key: 'fishing', label: '钓鱼', icon: <Fish size={16} />, content: '去海边钓鱼，说不定能钓到传说中的鱼。' },
]

const customItems = [
  {
    key: 'spring',
    label: '春季',
    content: '春暖花开，播种希望。绿色是春天的主色调！',
    activeStyle: { background: '#7a9d3d', color: '#fff8eb', textShadow: '0 1px 0 rgba(0,0,0,0.3)' },
  },
  {
    key: 'summer',
    label: '夏季',
    content: '夏日炎炎，金色阳光洒满大地。',
    activeStyle: { background: '#d7992e', color: '#fff8eb', textShadow: '0 1px 0 rgba(0,0,0,0.3)' },
  },
  {
    key: 'fall',
    label: '秋季',
    content: '秋高气爽，橙红色的落叶铺满小径。',
    activeStyle: { background: '#c45c3e', color: '#fff8eb', textShadow: '0 1px 0 rgba(0,0,0,0.3)' },
  },
  {
    key: 'winter',
    label: '冬季',
    content: '银装素裹，静谧的冬天适合在壁炉旁读书。',
    activeStyle: { background: '#5b8fa8', color: '#fff8eb', textShadow: '0 1px 0 rgba(0,0,0,0.3)' },
  },
]

const disabledItems = [
  { key: 'open', label: '已解锁', content: '这个区域已经开放了！欢迎探索。' },
  { key: 'locked', label: '未解锁', content: '需要更多经验值才能进入此区域。', disabled: true },
  { key: 'secret', label: '隐藏区域', content: '你发现了秘密区域！这里有稀有宝物。' },
]

function StarTabDemoPage() {
  const [controlledKey, setControlledKey] = useState('spring')

  return (
    <StarComponentPage
      title="Tab 选项卡"
      description="像素风选项卡组件，支持图标、自定义选中样式、顶部/底部导航以及禁用选项。"
      toc={tocItems}
    >
      <StarComponentDemo
        id="basic"
        title="基础用法"
        description="最简单的选项卡，只需要提供 label 和 content。"
        code={basicCode}
      >
        <div style={{ width: '100%' }}>
          <StarTab items={basicItems} />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="icon"
        title="带图标"
        description="每个选项卡可以配置图标，图标与标签并排显示。"
        code={iconCode}
      >
        <div style={{ width: '100%' }}>
          <StarTab items={iconItems} />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="position"
        title="底部导航"
        description="设置 position 为 bottom，导航栏和选中指示条移到内容下方。"
        code={positionCode}
      >
        <div style={{ width: '100%' }}>
          <StarTab items={bottomItems} position="bottom" />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="custom"
        title="自定义选中样式"
        description="为每个选项卡设置 activeStyle，覆盖默认选中样式。不设置则使用默认的白色指示条。"
        code={customCode}
      >
        <div style={{ width: '100%' }}>
          <StarTab items={customItems} />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="disabled"
        title="禁用选项"
        description="设置 disabled 为 true 可以禁用某个选项卡，禁用后无法点击切换。"
        code={disabledCode}
      >
        <div style={{ width: '100%' }}>
          <StarTab items={disabledItems} />
        </div>
      </StarComponentDemo>

      <StarComponentDemo
        id="controlled"
        title="受控模式"
        description="通过 activeKey 和 onChange 控制当前激活的选项卡。"
        code={controlledCode}
      >
        <div style={{ width: '100%' }}>
          <StarTab
            activeKey={controlledKey}
            onChange={setControlledKey}
            items={basicItems}
          />
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            当前选中：<strong>{controlledKey}</strong>
          </p>
        </div>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable title="Tab API" data={apiData} />
        <StarApiTable title="StarTabItem API" data={tabItemApiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarTabDemoPage
