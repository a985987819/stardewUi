import { useState, type ReactNode } from 'react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarSwitch } from '../components/ui'
import { useI18n, type Lang } from '../i18n'

const copy = {
  zh: {
    title: 'Switch 开关',
    desc: 'Checkbox 同族的木面板开关：暖木框内嵌一条凹槽，打开时凹槽点亮为作物绿，羊皮纸滑钮带着中心锁孔点以阶梯节奏滑过凹槽；顶部高光与硬边阴影保持全库一致的像素质感，适合灯光、自动浇水、音效和难度设置。',
    toc: ['基础开关', '尺寸与配色', '禁用状态', 'API'],
    demos: [
      ['基础开关', '用受控状态记录开关值，点击或键盘操作都会触发 onChange；关闭时凹槽是浅木色，打开后整条凹槽点亮。'],
      ['尺寸与配色', 'small、medium、large 对应不同密度的设置项，color 决定凹槽与锁孔点亮的颜色，并自动推导顶部暗边。'],
      ['禁用状态', '任务未解锁或设置不可改时，禁用态保留形状但停止响应。'],
    ],
    labels: ['谷仓灯', '自动浇水', '音效', '矿洞照明', '温室加热', '已锁定的开关'],
  },
  en: {
    title: 'Switch',
    desc: 'A wooden switch panel in the Checkbox family: a recessed groove inside a warm frame lights up with the checked colour while a parchment thumb with a keyhole dot slides across in stepped pixel motion; the lit top edge and hard shadows keep the shared pixel feel, for lamps, auto-watering, sound, and difficulty settings.',
    toc: ['Basic Switch', 'Sizes & Colors', 'Disabled', 'API'],
    demos: [
      ['Basic Switch', 'Keep the value in state; clicking or using the keyboard both fire onChange. The groove is pale wood while off and lights up fully when on.'],
      ['Sizes & Colors', 'small, medium, and large fit different settings densities; color sets the lit groove and keyhole dot, with its dark edge derived automatically.'],
      ['Disabled', 'When a quest is locked the switch keeps its shape but stops responding.'],
    ],
    labels: ['Barn lamp', 'Auto watering', 'Sound', 'Mine lighting', 'Greenhouse heat', 'Locked switch'],
  },
} satisfies Record<Lang, {
  title: string
  desc: string
  toc: string[]
  demos: string[][]
  labels: string[]
}>

const apiData = {
  zh: [
    { property: 'checked', description: '受控的开关状态', type: 'boolean', default: 'false' },
    { property: 'onChange', description: '状态变化回调', type: '(checked: boolean) => void', default: '-' },
    { property: 'disabled', description: '禁用交互', type: 'boolean', default: 'false' },
    { property: 'size', description: '开关尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'color', description: '打开时凹槽与锁孔点亮的颜色；顶部暗边从它自动推导', type: 'string', default: "'#71964A'" },
  ],
  en: [
    { property: 'checked', description: 'Controlled on/off state.', type: 'boolean', default: 'false' },
    { property: 'onChange', description: 'Change callback.', type: '(checked: boolean) => void', default: '-' },
    { property: 'disabled', description: 'Disables interaction.', type: 'boolean', default: 'false' },
    { property: 'size', description: 'Switch size.', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { property: 'color', description: 'Colour the lit groove and keyhole dot take while checked; its dark edge is derived automatically.', type: 'string', default: "'#71964A'" },
  ],
}

function SwitchField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {children}
      <span style={{ fontSize: 13, color: '#6b5b45' }}>{label}</span>
    </div>
  )
}

const controlledSwitchCode = `import { useState } from 'react'
import { StarSwitch } from 'stardew-valley-ui'

export function FarmSettings() {
  const [barnLamp, setBarnLamp] = useState(true)
  const [autoWatering, setAutoWatering] = useState(false)

  return (
    <>
      <StarSwitch checked={barnLamp} onChange={setBarnLamp} aria-label="谷仓的灯" />
      <StarSwitch checked={autoWatering} onChange={setAutoWatering} aria-label="自动浇水" />
      <output>{JSON.stringify({ barnLamp, autoWatering })}</output>
    </>
  )
}`

function StarSwitchDemoPage() {
  const { lang } = useI18n()
  const t = copy[lang]
  const [lamp, setLamp] = useState(true)
  const [watering, setWatering] = useState(false)
  const [sound, setSound] = useState(true)
  const [mineLight, setMineLight] = useState(true)
  const [heat, setHeat] = useState(true)
  const toc = t.toc.map((title, index) => ({ id: ['basic', 'size', 'disabled', 'api'][index], title, level: 1 }))

  return (
    <StarComponentPage title={t.title} description={t.desc} toc={toc}>
      <StarComponentDemo
        id="basic"
        title={t.demos[0][0]}
        description={t.demos[0][1]}
        code={controlledSwitchCode}
        data={[
          { label: 'barnLamp', value: String(lamp) },
          { label: 'autoWatering', value: String(watering) },
        ]}
      >
        <SwitchField label={t.labels[0]}>
          <StarSwitch checked={lamp} onChange={setLamp} aria-label={t.labels[0]} />
        </SwitchField>
        <SwitchField label={t.labels[1]}>
          <StarSwitch checked={watering} onChange={setWatering} aria-label={t.labels[1]} />
        </SwitchField>
      </StarComponentDemo>
      <StarComponentDemo
        id="size"
        title={t.demos[1][0]}
        description={t.demos[1][1]}
        code={'<StarSwitch size="large" color="#D7992E" />'}
        data={[
          { label: 'sound', value: String(sound) },
          { label: 'mineLight', value: String(mineLight) },
          { label: 'greenhouseHeat', value: String(heat) },
        ]}
      >
        <SwitchField label={t.labels[2]}>
          <StarSwitch size="small" checked={sound} onChange={setSound} aria-label={t.labels[2]} />
        </SwitchField>
        <SwitchField label={t.labels[2]}>
          <StarSwitch checked={sound} onChange={setSound} aria-label={t.labels[2]} />
        </SwitchField>
        <SwitchField label={t.labels[3]}>
          <StarSwitch size="large" color="#D7992E" checked={mineLight} onChange={setMineLight} aria-label={t.labels[3]} />
        </SwitchField>
        <SwitchField label={t.labels[4]}>
          <StarSwitch size="large" color="#7699B5" checked={heat} onChange={setHeat} aria-label={t.labels[4]} />
        </SwitchField>
      </StarComponentDemo>
      <StarComponentDemo
        id="disabled"
        title={t.demos[2][0]}
        description={t.demos[2][1]}
        code={'<StarSwitch disabled checked />'}
      >
        <SwitchField label={t.labels[5]}>
          <StarSwitch disabled checked aria-label={t.labels[5]} />
        </SwitchField>
        <SwitchField label={t.labels[5]}>
          <StarSwitch disabled aria-label={t.labels[5]} />
        </SwitchField>
      </StarComponentDemo>
      <div id="api" className="component-page-api">
        <StarApiTable title="Switch API" data={apiData[lang]} />
      </div>
    </StarComponentPage>
  )
}

export default StarSwitchDemoPage
