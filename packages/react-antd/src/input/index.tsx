import * as React from 'react'
import { Input } from 'antd'
import { InputProps } from 'antd/es/input'
import { observer } from 'mobx-react'
import { useFormItField } from '@form-it/react-factory'

const FormItAntdInput = React.forwardRef<Input, InputProps>(function FormItAntdInput(props, ref) {
  const fieldCtx = useFormItField()

  if (fieldCtx) {
    return (
      <Input
        ref={ref}
        value={fieldCtx.value}
        onChange={(event) => {
          return fieldCtx.onChange(event.target.value)
        }}
        {...props}
      />
    )
  }

  return <Input ref={ref} {...props} />
})

export default observer(FormItAntdInput)
