import * as React from 'react'

import { useFormIt } from '../'
import { observer, Observer, useLocalStore } from 'mobx-react'
import { RuleType } from '@form-it/core'
import { action } from 'mobx'
import { useRef } from 'react'

const useFormItFieldItem = (name: string, rule?: RuleType, message?: string) => {
  const formIt = useFormIt()

  const defaultChangeTypeRef = useRef('init')

  const state = useLocalStore(() => ({
    isSetted: false,
    value: null,
    clear() {
      this.isSetted = false
      this.value = null
    },
    setValue(val: any) {
      this.isSetted = true
      this.value = val
    }
  }))

  const errorState = useLocalStore(() => ({
    message: null,
    // 是否发生过错误
    hadMessage: false,
    clear(resetHadMessage = false) {
      this.message = null
      if (resetHadMessage) {
        this.hadMessage = false
      }
    },
    setValue(val: string) {
      this.message = val
      this.hadMessage = true
    }
  }))

  React.useEffect(() => {
    if (formIt && rule && name) {
      formIt.rule[name] = rule
      return () => {
        delete formIt.rule[name]
      }
    }
  }, [formIt, rule, name])

  React.useEffect(() => {
    if (formIt && message && name) {
      formIt.defaultErrorMsgs[name] = message
      return () => {
        delete formIt.defaultErrorMsgs[name]
      }
    }
  }, [formIt, message, name])

  React.useEffect(() => {
    // 认为一个宏任务后 值修改是用户操作
    setTimeout(() => {
      defaultChangeTypeRef.current = 'user'
    })
  }, [])

  React.useEffect(() => {
    if (!formIt) {
      return
    }
    const onReset = () => {
      state.clear()
      errorState.clear(true)
    }
    formIt.on('reset', onReset)

    const onValidate = (result: any) => {
      // console.log(name, result)
      if (result && Object.hasOwnProperty.call(result, name)) {
        errorState.setValue(result[name].message)
      } else {
        errorState.clear()
      }
    }
    formIt.on('validate', onValidate)

    const onFieldChanged = (changed: any) => {
      if (errorState.hadMessage && changed.name === name) {
        // 发生过错误，则每次修改都需校验
        formIt.validate([name])
      }
    }
    formIt.on('fieldDidChange', onFieldChanged)
    return () => {
      formIt.off('reset', onReset)
      formIt.off('validate', onValidate)
    }
  }, [errorState, state, name, formIt])

  return !formIt
    ? null
    : {
        get globalValue() {
          return formIt?.value
        },
        formIt,
        fieldProps: formIt.fieldProps,
        // 异步触发 mobx observable, 保证访问 error 属性的组件会触发更新
        get error() {
          return errorState.message
        },
        // 异步触发 mobx observable
        get value() {
          return formIt?.value[name]
        },
        get stateValue() {
          return state.value
        },
        name,
        onStateValueValue: action((newValue: any) => {
          state.setValue(newValue)
        }),
        onChange: action((newValue: any, changeType = defaultChangeTypeRef.current) => {
          // console.log('defaultChangeTypeRef.current', defaultChangeTypeRef.current, changeType)
          formIt.assignValue({ [name]: newValue }, changeType)
          state.clear()
        })
      }
}

export type FieldItemInput = ReturnType<typeof useFormItFieldItem>

export interface FormItFieldProps {
  name: string
  rule?: RuleType
  defaultValue?: any
  message?: string
  children?: ((ctx: FieldItemInput | null) => React.ReactNode) | React.ReactNode | any
}

export const FormItFieldContext = React.createContext<ReturnType<typeof useFormItFieldItem> | null>(null)

export const FormItFieldConsumer = FormItFieldContext.Consumer

export function useFormItField() {
  return React.useContext(FormItFieldContext)
}

const FormItField: React.FC<FormItFieldProps> = observer(function FormItField({
  name,
  children,
  rule,
  message,
  defaultValue
  // ...props
}) {
  const ctx = useFormItFieldItem(name, rule, message)

  const formIt = useFormIt()
  React.useEffect(() => {
    if (formIt && formIt.value[name] == null && formIt.value[name] !== (defaultValue || null)) {
      formIt.assignValue({ [name]: defaultValue || null }, 'init')
    }
    // eslint-disable-next-line no-prototype-builtins
  }, [formIt?.value && formIt.value.hasOwnProperty(name), name])

  return (
    <Observer>
      {() => {
        let child = children || null
        if (typeof children === 'function') {
          child = children(ctx) || null
        }
        return <FormItFieldContext.Provider value={ctx}>{child}</FormItFieldContext.Provider>
      }}
    </Observer>
  )
})

export default React.memo(FormItField)
