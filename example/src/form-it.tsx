import * as React from 'react'

import { Form, Field } from '@form-it/react-antd/src'
import { fields, fieldValues } from './config'

const FormItDemo = () => {
  const [values] = React.useState({ ...fieldValues })

  return (
    <Form value={values}>
      {fields.map((field) => (
        <Field span={24} key={field.name} name={field.name} label={field.name}>
          {({ globalValue }: any) => {
            return React.createElement(field.render.formIt, { disabled: globalValue[field.relatedName] === 'disabled' })
          }}
        </Field>
      ))}
    </Form>
  )
}

export default FormItDemo
