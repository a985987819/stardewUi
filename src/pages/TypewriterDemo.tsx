import { useState } from 'react'
import StarComponentPage from '../components/layout/ComponentPage'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarApiTable from '../components/layout/ApiTable'
import { StarTypewriter } from '../components/ui'
import { classNames } from '../utils/classNames'
import appStyles from '../styles/global.module.scss'

const typewriterApiData = [
  { property: 'text', description: '要显示的文本内容', type: 'string', default: '-', required: true },
  { property: 'speed', description: '打字速度（毫秒/字符）', type: 'number', default: '100' },
  { property: 'startDelay', description: '开始打字前的延迟时间', type: 'number', default: '0' },
  { property: 'className', description: '自定义类名', type: 'string', default: '-' },
  { property: 'onComplete', description: '打字完成回调', type: '() => void', default: '-' },
]

const tocItems = [
  { id: 'basic', title: '基础用法', level: 1 },
  { id: 'speed', title: '不同速度', level: 1 },
  { id: 'delay', title: '延迟开始', level: 1 },
  { id: 'api', title: 'API', level: 1 },
]

const basicCode = `<StarTypewriter text="你好，欢迎来到星露谷！" />`

const speedCode = `<StarTypewriter text="快速打字效果" speed={50} />
<StarTypewriter text="慢速打字效果" speed={150} />`

const delayCode = `<StarTypewriter
  text="延迟 1 秒后开始打字"
  startDelay={1000}
/>`

function StarTypewriterDemoPage() {
  const [key, setKey] = useState(0)
  const restart = () => setKey((value) => value + 1)

  return (
    <StarComponentPage
      title="Typewriter 打字机"
      description="打字机效果组件，模拟文本逐字出现的动画效果，点击文本可快速完成显示。"
      toc={tocItems}
    >
      <StarComponentDemo id="basic" title="基础用法" description="最简单的打字机效果。" code={basicCode}>
        <div className={appStyles.typewriterDemoBox}>
          <StarTypewriter text="你好，欢迎来到星露谷！这是一个美丽的农场世界。" key={key} />
        </div>
        <button className={classNames(appStyles.demoButton, appStyles.demoButtonPrimary)} onClick={restart} style={{ marginTop: '12px' }}>
          重新播放
        </button>
      </StarComponentDemo>

      <StarComponentDemo id="speed" title="不同速度" description="自定义打字速度。" code={speedCode}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className={appStyles.typewriterDemoBox}>
            <div style={{ marginBottom: '4px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>快速（50ms）</div>
            <StarTypewriter text="这是快速打字效果，每个字符间隔 50 毫秒。" speed={50} key={`fast-${key}`} />
          </div>
          <div className={appStyles.typewriterDemoBox}>
            <div style={{ marginBottom: '4px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>默认（100ms）</div>
            <StarTypewriter text="这是默认打字速度，每个字符间隔 100 毫秒。" speed={100} key={`default-${key}`} />
          </div>
          <div className={appStyles.typewriterDemoBox}>
            <div style={{ marginBottom: '4px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>慢速（150ms）</div>
            <StarTypewriter text="这是慢速打字效果，每个字符间隔 150 毫秒。" speed={150} key={`slow-${key}`} />
          </div>
        </div>
        <button className={classNames(appStyles.demoButton, appStyles.demoButtonPrimary)} onClick={restart} style={{ marginTop: '12px' }}>
          重新播放
        </button>
      </StarComponentDemo>

      <StarComponentDemo id="delay" title="延迟开始" description="设置开始打字前的延迟时间。" code={delayCode}>
        <div className={appStyles.typewriterDemoBox}>
          <StarTypewriter text="这段文字会在 1 秒后开始逐字出现..." startDelay={1000} key={`delay-${key}`} />
        </div>
        <button className={classNames(appStyles.demoButton, appStyles.demoButtonPrimary)} onClick={restart} style={{ marginTop: '12px' }}>
          重新播放
        </button>
      </StarComponentDemo>

      <div id="api" className="component-page-api">
        <StarApiTable data={typewriterApiData} />
      </div>
    </StarComponentPage>
  )
}

export default StarTypewriterDemoPage
