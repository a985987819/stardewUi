import { useState } from 'react'
import ComponentPage from '../components/layout/ComponentPage'
import ComponentDemo from '../components/layout/ComponentDemo'
import ApiTable from '../components/layout/ApiTable'
import Typewriter from '../components/ui/Typewriter'

const typewriterApiData = [
  {
    property: 'text',
    description: '要显示的文本内容',
    type: 'string',
    default: '-',
    required: true,
  },
  {
    property: 'speed',
    description: '打字速度（毫秒/字符）',
    type: 'number',
    default: '100',
  },
  {
    property: 'startDelay',
    description: '开始打字前的延迟（毫秒）',
    type: 'number',
    default: '0',
  },
  {
    property: 'className',
    description: '自定义类名',
    type: 'string',
    default: '-',
  },
  {
    property: 'onComplete',
    description: '打字完成回调',
    type: '() => void',
    default: '-',
  },
]

const basicCode = `<Typewriter text="你好，欢迎来到星露谷！" />`

const speedCode = `<Typewriter text="快速打字效果" speed={50} />
<Typewriter text="慢速打字效果" speed={150} />`

const delayCode = `<Typewriter 
  text="延迟1秒后开始打字" 
  startDelay={1000} 
/>`

function TypewriterDemo() {
  const [key, setKey] = useState(0)

  const restart = () => setKey((k) => k + 1)

  return (
    <ComponentPage
      title="Typewriter 打字机"
      description="打字机效果组件，模拟文字逐个出现的动画效果。点击文字可快速显示全部内容。"
    >
      <ComponentDemo title="基础用法" description="最简单的打字机效果" code={basicCode}>
        <div className="typewriter-demo-box">
          <Typewriter text="你好，欢迎来到星露谷！这是一个美丽的农场世界。" key={key} />
        </div>
        <button className="demo-button demo-button-primary" onClick={restart} style={{ marginTop: '12px' }}>
          重新播放
        </button>
      </ComponentDemo>

      <ComponentDemo title="不同速度" description="自定义打字速度" code={speedCode}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="typewriter-demo-box">
            <div style={{ marginBottom: '4px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>快速 (50ms):</div>
            <Typewriter text="这是快速打字效果，每个字符间隔50毫秒。" speed={50} key={`fast-${key}`} />
          </div>
          <div className="typewriter-demo-box">
            <div style={{ marginBottom: '4px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>默认 (100ms):</div>
            <Typewriter text="这是默认打字速度，每个字符间隔100毫秒。" speed={100} key={`default-${key}`} />
          </div>
          <div className="typewriter-demo-box">
            <div style={{ marginBottom: '4px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>慢速 (150ms):</div>
            <Typewriter text="这是慢速打字效果，每个字符间隔150毫秒。" speed={150} key={`slow-${key}`} />
          </div>
        </div>
        <button className="demo-button demo-button-primary" onClick={restart} style={{ marginTop: '12px' }}>
          重新播放
        </button>
      </ComponentDemo>

      <ComponentDemo title="延迟开始" description="设置开始打字前的延迟时间" code={delayCode}>
        <div className="typewriter-demo-box">
          <Typewriter
            text="这段文字会在1秒后开始逐字出现..."
            startDelay={1000}
            key={`delay-${key}`}
          />
        </div>
        <button className="demo-button demo-button-primary" onClick={restart} style={{ marginTop: '12px' }}>
          重新播放
        </button>
      </ComponentDemo>

      <div className="component-page-api">
        <ApiTable data={typewriterApiData} />
      </div>
    </ComponentPage>
  )
}

export default TypewriterDemo
