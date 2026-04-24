import ComponentPage from '../components/layout/ComponentPage'
import ComponentDemo from '../components/layout/ComponentDemo'
import ApiTable from '../components/layout/ApiTable'
import './ButtonDemo.css'

const buttonApiData = [
  {
    property: 'type',
    description: '按钮类型',
    type: "'default' | 'primary' | 'dashed' | 'text' | 'link'",
    default: "'default'",
  },
  {
    property: 'size',
    description: '按钮大小',
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
  },
  {
    property: 'disabled',
    description: '是否禁用',
    type: 'boolean',
    default: 'false',
  },
  {
    property: 'block',
    description: '是否块级元素',
    type: 'boolean',
    default: 'false',
  },
  {
    property: 'onClick',
    description: '点击事件回调',
    type: '(event: MouseEvent) => void',
    default: '-',
  },
  {
    property: 'children',
    description: '按钮内容',
    type: 'ReactNode',
    default: '-',
    required: true,
  },
]

const basicCode = `<button className="demo-button">默认按钮</button>
<button className="demo-button demo-button-primary">主要按钮</button>
<button className="demo-button demo-button-dashed">虚线按钮</button>
<button className="demo-button demo-button-text">文本按钮</button>
<button className="demo-button demo-button-link">链接按钮</button>`

const sizeCode = `<button className="demo-button demo-button-primary demo-button-small">小按钮</button>
<button className="demo-button demo-button-primary">默认按钮</button>
<button className="demo-button demo-button-primary demo-button-large">大按钮</button>`

const disabledCode = `<button className="demo-button demo-button-primary" disabled>禁用主要按钮</button>
<button className="demo-button" disabled>禁用默认按钮</button>`

function ButtonDemo() {
  return (
    <ComponentPage
      title="Button 按钮"
      description="按钮用于触发一个操作或事件，是用户界面中最基础的交互元素。"
    >
      <ComponentDemo title="按钮类型" description="支持多种不同类型的按钮" code={basicCode}>
        <button className="demo-button">默认按钮</button>
        <button className="demo-button demo-button-primary">主要按钮</button>
        <button className="demo-button demo-button-dashed">虚线按钮</button>
        <button className="demo-button demo-button-text">文本按钮</button>
        <button className="demo-button demo-button-link">链接按钮</button>
      </ComponentDemo>

      <ComponentDemo title="按钮尺寸" description="提供三种尺寸的按钮" code={sizeCode}>
        <button className="demo-button demo-button-primary demo-button-small">小按钮</button>
        <button className="demo-button demo-button-primary">默认按钮</button>
        <button className="demo-button demo-button-primary demo-button-large">大按钮</button>
      </ComponentDemo>

      <ComponentDemo title="禁用状态" description="按钮的禁用状态" code={disabledCode}>
        <button className="demo-button demo-button-primary" disabled>禁用主要按钮</button>
        <button className="demo-button" disabled>禁用默认按钮</button>
      </ComponentDemo>

      <div className="component-page-api">
        <ApiTable data={buttonApiData} />
      </div>
    </ComponentPage>
  )
}

export default ButtonDemo
