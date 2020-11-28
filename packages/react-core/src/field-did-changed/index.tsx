import * as React from 'react'

import { FormItReactProps, useFormIt } from '..'

export type FormItFieldDidChanged = {
  listener: FormItReactProps['onFieldDidChange']
  children?: React.ReactNode
}

// @ts-ignore
const FormItFieldDidChanged: React.FunctionComponent<FormItFieldDidChanged> = function FormItFieldDidChanged({
  listener,
  children
}) {
  const formIt = useFormIt()
  React.useEffect(() => {
    const onFieldDidChange = listener
    if (!onFieldDidChange) {
      return
    }
    formIt?.on('fieldDidChange', onFieldDidChange)
    return () => {
      formIt?.off('fieldDidChange', onFieldDidChange)
    }
  }, [formIt, listener])

  return children
}

export default React.memo(FormItFieldDidChanged)
