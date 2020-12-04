---
title: FormIt
---

```jsx
import { Form, Field, Input, InputNumber, Submit } from '@form-it/react-antd'

export default () => (
  <Form
    onFieldDidChange={console.log.bind(console, 'onFieldDidChange')}
    onSubmit={console.log.bind(console, 'onSubmit')}
    gutter={20}
    labelWidth={'100px'}
    defaultValue={{ name: 'imcuttle', age: 25, marry: '已婚', gender: 'M' }}
  >
    <Field name={'name'} required label={'姓名'} span={12}>
      <Input style={{ width: '200px' }} />
    </Field>
    <Field name={'age'} label={'年龄'} span={12}>
      <InputNumber />
    </Field>

    <Field name={'gender'} label={'性别'} span={12}>
      <Radio.Group>
        <Radio value="M">男</Radio>
        <Radio value="W">女</Radio>
      </Radio.Group>
    </Field>

    <Field name={'marry'} label={'婚姻状态'} span={12}>
      <Select style={{ width: '200px' }}>
        {['已婚', '未婚'].map((option, index) => (
          <Option key={option} value={option}>
            {option}
          </Option>
        ))}
      </Select>
    </Field>

    <Col>
      <Submit>
        {({ submit }) => (
          <Button style={{ marginRight: '5px' }} type={'primary'} onClick={() => submit()}>
            提交
          </Button>
        )}
      </Submit>
      <Reset>{({ reset }) => <Button onClick={() => reset()}>重置</Button>}</Reset>
    </Col>
  </Form>
)
```
