import * as React from 'react'

import { Input } from '@form-it/react-antd/src'
import { Input as AntdInput } from 'antd'

export const fields: any[] = []
export const fieldValues: any = {}

const rdm = (min: number, max: number) => parseInt(String(min + Math.random() * (max - min)), 10)

for (let i = 0; i < 3000; i++) {
  const name = `name-${i}`
  const value = `value-${rdm(0, 10000)}`

  const debugHoc = (comp: any, log: any) => (props: any) => {
    console.log(log)

    let newProps = props
    if (props.onChange) {
      newProps = {
        ...props,
        onChange: (evt: any) => {
          if (typeof evt === 'string') {
            // eslint-disable-next-line no-unused-expressions
            props.onChange && props.onChange(evt)
          } else {
            // eslint-disable-next-line no-unused-expressions
            props.onChange && props.onChange(evt.target.value)
          }
        }
      }
    }

    return React.createElement(comp, newProps)
  }

  fields.push({
    relatedName: `name-${i - 1}`,
    name,
    value,
    render: {
      formIt: debugHoc(Input, `render: ${name}`),
      antd: debugHoc(AntdInput, `render: ${name}`)
    }
  })

  fieldValues[name] = value
}
