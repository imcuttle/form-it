import * as React from 'react'

import { Form } from 'antd'
import { fields, fieldValues } from './config'

const { Item: Field } = Form

const AntdDemo = () => {
  // const [values, setValues] = React.useState({ ...fieldValues });
  console.log('AntdDemo')
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      initialValues={fieldValues}
      onValuesChange={(changed, value) => {
        // console.log(changed, value)
        // setValues(value)
      }}
    >
      {fields.map((field) => (
        <Field
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues[field.relatedName] !== currentValues[field.relatedName]
          }
        >
          {({ getFieldValue }) => {
            return (
              <Field name={field.name} label={field.name}>
                {React.createElement(field.render.antd, {
                  disabled: getFieldValue(field.relatedName) === 'disabled'
                })}
              </Field>
            )
          }}
        </Field>
      ))}
    </Form>
  )
}

export default AntdDemo
