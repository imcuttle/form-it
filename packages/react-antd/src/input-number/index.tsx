import * as React from 'react'
import { InputNumber } from 'antd'
import { InputNumberProps } from 'antd/es/input-number'
import { observer } from 'mobx-react'
import { useFormItField } from '@form-it/react-factory'

const FormItAntdInputNumber = React.forwardRef<React.PickComponentRefType<typeof InputNumber>, InputNumberProps>(
  function FormItAntdInputNumber(props, ref) {
    const fieldCtx = useFormItField()

    if (fieldCtx) {
      return (
        <InputNumber
          ref={ref}
          value={fieldCtx.value}
          onChange={(number) => {
            return fieldCtx.onChange(number)
          }}
          {...props}
        />
      )
    }

    return <InputNumber ref={ref} {...props} />
  }
)

export default observer(FormItAntdInputNumber)
