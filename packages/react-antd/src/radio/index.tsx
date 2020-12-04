import * as React from 'react'
import { Radio } from 'antd'
import { RadioProps } from 'antd/es/radio'
import { observer } from 'mobx-react'
import { useFormItField } from '@form-it/react-factory'

const FormItAntdRadioGroup = observer(
  React.forwardRef<React.PickComponentRefType<typeof Radio.Group>, RadioProps>(function FormItAntdRadioGroup(
    props,
    ref
  ) {
    const fieldCtx = useFormItField()

    if (fieldCtx) {
      return (
        <Radio.Group
          ref={ref}
          value={fieldCtx.value}
          onChange={(evt) => {
            return fieldCtx.onChange(evt.target.checked)
          }}
          {...props}
        />
      )
    }

    return <Radio.Group ref={ref} {...props} />
  })
)

const FormItAntdRadio = React.forwardRef<React.PickComponentRefType<typeof Radio>, RadioProps>(function FormItAntdRadio(
  props,
  ref
) {
  const fieldCtx = useFormItField()

  if (fieldCtx) {
    return (
      <Radio
        ref={ref}
        value={fieldCtx.value}
        onChange={(evt) => {
          return fieldCtx.onChange(evt.target.checked)
        }}
        {...props}
      />
    )
  }

  return <Radio ref={ref} {...props} />
})

export default Object.assign(observer(FormItAntdRadio), {
  Group: FormItAntdRadioGroup
})
