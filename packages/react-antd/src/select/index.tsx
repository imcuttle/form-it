import * as React from 'react'
import { Select } from 'antd'
import { SelectProps } from 'antd/es/select'
import { observer } from 'mobx-react'
import { useFormItField } from '@form-it/react-factory'

const FormItAntdSelect = React.forwardRef<React.PickComponentRefType<typeof Select>, SelectProps<any>>(
  function FormItAntdSelect(props, ref) {
    const fieldCtx = useFormItField()

    if (fieldCtx) {
      return (
        <Select
          ref={ref}
          value={fieldCtx.value}
          onChange={(value) => {
            return fieldCtx.onChange(value)
          }}
          {...props}
        />
      )
    }

    return <Select ref={ref} {...props} />
  }
)

export default observer(FormItAntdSelect)
