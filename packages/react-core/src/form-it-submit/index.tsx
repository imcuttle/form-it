import * as React from 'react'
import { Observer } from 'mobx-react'

import { useFormIt } from '..'
import FormIt from '@form-it/core'

export type FormItSubmitProps = {
  children: (ctx: { submit: FormIt['submit']; formIt: FormIt | null }) => any
}

const FormItSubmit: React.FC<FormItSubmitProps> = function FormItSubmit({ children }) {
  const formIt = useFormIt()
  return (
    <Observer>
      {() =>
        children({
          formIt,
          submit: (...args: Parameters<FormIt['submit']>) => formIt!.submit(...args)
        })
      }
    </Observer>
  )
}

export default React.memo(FormItSubmit)
