import * as React from 'react'

import OriginFormIt, { FormItPlugin, IValueDidChange, IValueWillChange, ValueType } from '@form-it/core'

import { useFormItField } from './form-it-field'

export class FormIt extends OriginFormIt {
  fieldProps?: any

  defaultResetValue?: ValueType

  reset(resetValue = this.defaultResetValue): void {
    super.reset(resetValue)
  }

  setDefaultResetValue(defaultValue?: ValueType) {
    this.defaultResetValue = defaultValue
  }
}

export interface FormItReactProps {
  formIt?: FormIt
  // field props
  commonFieldProps?: any
  labelWidth?: any

  className?: string
  value?: ValueType
  defaultValue?: ValueType
  onFieldWillChange?: (willChange: IValueWillChange, formIt: FormIt) => IValueWillChange
  onFieldDidChange?: (didChange: IValueDidChange, formIt: FormIt) => void
  onSubmit?(value: ValueType, formIt: FormIt): void
  onSetup?(formIt: FormIt): void
  plugins?: FormItPlugin[]
}

export type FormItReactRefType = FormIt

const FormItContext = React.createContext<FormIt | null>(null)

export function useFormIt() {
  return React.useContext(FormItContext)
}

const useHandleEvent = (formIt: FormIt, type: string, handle?: Function) => {
  React.useEffect(() => {
    if (handle) {
      const onHandle = (...args: any[]) => handle(...args, formIt)
      formIt.on(type, onHandle)
      return () => {
        formIt.removeListener(type, onHandle)
      }
    }
  }, [handle, formIt])
}

const FormItReact = React.forwardRef<FormItReactRefType, FormItReactProps>(function FormItReact(
  { formIt: _formIt, plugins, commonFieldProps = {}, onSetup, className, children, ...props },
  ref
) {
  const parentFormIt = useFormIt()
  const formItField = useFormItField()

  const formIt = React.useMemo(() => {
    const formItCore = _formIt || new FormIt()
    formItCore.use(plugins)
    if (onSetup) {
      onSetup(formItCore)
    }
    return formItCore
  }, [_formIt, onSetup, plugins])

  React.useEffect(() => {
    if (formItField && parentFormIt) {
      return parentFormIt.compose(formItField.name, formIt)
    }
  }, [formItField?.name, parentFormIt, formIt])

  React.useMemo(() => {
    if (props.value || props.defaultValue) {
      formIt.setValue(props.value || props.defaultValue)
    }
  }, [props.value || props.defaultValue, formIt])
  React.useMemo(() => {
    formIt.setDefaultResetValue(props.defaultValue)
  }, [props.defaultValue])
  useHandleEvent(formIt, 'submit', props.onSubmit)
  useHandleEvent(formIt, 'fieldWillChange', props.onFieldWillChange)
  useHandleEvent(formIt, 'fieldDidChange', props.onFieldDidChange)

  React.useEffect(() => {
    if (formIt) {
      return () => formIt.destroy()
    }
  }, [formIt])

  const ctxValue = React.useMemo(() => {
    formIt.fieldProps = commonFieldProps
    return formIt
  }, [formIt, commonFieldProps])
  React.useImperativeHandle<FormIt, FormIt>(ref, () => ctxValue, [ctxValue])

  return <FormItContext.Provider value={ctxValue}>{children}</FormItContext.Provider>
})

export const Form = React.memo(FormItReact)

export { default as Field } from './form-it-field'
export * from './form-it-field'
export { default as Submit } from './form-it-submit'
export { default as Reset } from './form-it-reset'
