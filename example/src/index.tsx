import * as ReactDom from 'react-dom'
import * as React from 'react'
import { Switch, Select } from 'antd'
import 'antd/dist/antd.less'

import FormItDemo from './form-it'
import AntdDemo from './antd-form'

const div = document.createElement('div')
document.body.appendChild(div)

const App = () => {
  const [isRender, setIsRender] = React.useState(false)
  const [type, setType] = React.useState('antd')

  return (
    <div>
      <Switch
        checked={isRender}
        onChange={(checked) => setIsRender(checked)}
        checkedChildren={'开启渲染'}
        unCheckedChildren={'关闭渲染'}
      />
      <Select
        value={type}
        onChange={(opt) => {
          setType(opt)
        }}
      >
        <Select.Option value="formIt">FormIt</Select.Option>
        <Select.Option value="antd">AntdForm</Select.Option>
        <Select.Option value="antd-controlled">AntdForm 受控</Select.Option>
      </Select>
      {isRender && (
        <div>
          {type === 'formIt' && <FormItDemo />}
          {type === 'antd' && <AntdDemo />}
          {type === 'antd-controlled' && <AntdDemo controlled />}
        </div>
      )}
    </div>
  )
}

ReactDom.render(<App />, div)
