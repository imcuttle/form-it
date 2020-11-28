import * as React from 'react'
import { Observer } from 'mobx-react'

import { useFormIt } from '..'
import FormIt, { ValueType } from '@form-it/core'

export type FormItResetProps = {
  children: (ctx: { formIt: FormIt | null; reset(resetValue?: ValueType): void }) => any
}

const FormItReset: React.FC<FormItResetProps> = function FormItReset({ children }) {
  const formIt = useFormIt()
  return (
    <Observer>
      {() =>
        children({
          reset: (resetValue?: ValueType) => formIt?.reset(resetValue),
          formIt
        })
      }
    </Observer>
  )
}

export default React.memo(FormItReset)
