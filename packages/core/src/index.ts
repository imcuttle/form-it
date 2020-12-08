import {
  observable,
  action,
  toJS,
  observe,
  intercept,
  Lambda,
  runInAction,
  IValueDidChange as MobxValueDidChange,
  IValueWillChange as MobxValueWillChange
} from 'mobx'
import AwaitEventEmitter from 'await-event-emitter'

import { RuleType, validate } from './validation'
import { inferResetAtomValue } from './utils'

export * from './validation'

export { toJS }

export interface IValueWillChange<T = any> extends MobxValueWillChange<T> {
  changeType: string
}

export interface IValueDidChange<T = any> extends MobxValueDidChange<T> {
  changeType: string
  name: string
}

export type FormItPlugin = (formIt: FormIt) => void

export type ValueType = Record<any, any>

export default class FormIt extends AwaitEventEmitter {
  public value = observable<any>({})
  public rule: Record<any, RuleType> = Object.create(null)
  public disposes: Array<Function | Lambda> = []
  public defaultErrorMsgs: Record<string, string> = {}
  public state = observable({ submitTimes: 0, isValidating: false })

  public tmp = { changeType: 'user', isFirstSubmit: false }

  constructor(value?: any) {
    super()
    if (value) {
      this.setValue(value)
    }
  }

  // 允许嵌套
  compose(name: string, otherFormIt: FormIt) {
    if (otherFormIt === this) {
      console.error('FormIt#compose can not call it with self')
      return
    }

    const onBeforeValidateField = (ctx: any) => {
      if (ctx.name === name) {
        ctx.shouldValidate = false
      }
    }
    const onReset = (values: any) => {
      otherFormIt.reset(values ? values[name] : undefined)
    }
    const onValidateField = async (ctx: any) => {
      if (ctx.name === name) {
        // 已经有出错信息了
        if (ctx.errorInfo) {
          ctx.errorInfo = [ctx.errorInfo]
        }
        if (Array.isArray(ctx.errorInfo)) {
          ctx.errorInfo.push(await otherFormIt.validate([]))
          ctx.errorInfo = ctx.errorInfo.filter(Boolean)
          if (!ctx.errorInfo.length) {
            ctx.errorInfo = null
          }
        } else {
          ctx.errorInfo = await otherFormIt.validate([])
        }
      }
    }
    this.on('reset', onReset)
    this.on('validateField:before', onBeforeValidateField)
    this.on('validateField', onValidateField)

    return () => {
      this.off('reset', onReset)
      this.off('validateField:before', onBeforeValidateField)
      this.off('validateField', onValidateField)
    }
  }

  reset(resetValue?: ValueType) {
    const newResetValue = this._getValue((value) => {
      if (resetValue) {
        return resetValue
      }
      return inferResetAtomValue(value)
    })
    this.emitSync('reset', newResetValue)
    return this.assignValue(newResetValue, 'reset')
  }

  async submit({
    validateFields = [],
    validateBreakWhenError,
    reset = false,
    resetValue
  }: {
    reset?: boolean
    resetValue?: ValueType
    validateFields?: string[] | null | false
    validateBreakWhenError?: boolean
  } = {}) {
    if (this.state.isValidating) {
      return
    }

    this.tmp.isFirstSubmit = false

    const done = async () => {
      await this.emit('submit', this.value)
      runInAction(() => {
        // eslint-disable-next-line no-plusplus
        this.state.submitTimes++
      })

      if (reset) {
        this.reset(resetValue)
      }

      return this.value
    }

    if (validateFields) {
      const errorInfo = await this.validate(validateFields, { breakWhenError: validateBreakWhenError })
      if (!errorInfo) {
        return done()
      }
      return
    }
    return done()
  }

  private _getValue(newValue?: ((oldValue: ValueType) => ValueType) | ValueType, oldValue = this.value) {
    if (typeof newValue === 'function') {
      return newValue(oldValue)
    }
    return newValue
  }

  @action assignState(newValue: ((oldValue: ValueType) => ValueType) | ValueType) {
    const mergedValue = this._getValue(newValue, this.state)
    Object.assign(this.state, mergedValue)
  }

  @action assignValue(newValue: ((oldValue: ValueType) => ValueType) | ValueType, changeType = 'init') {
    const mergedValue = this._getValue(newValue)
    this.tmp.changeType = changeType
    Object.assign(this.value, mergedValue)
  }

  @action setState(newValue: ((oldValue: ValueType) => ValueType) | ValueType) {
    this.state = observable(this._getValue(newValue, this.state))
  }

  @action setValue(newValue?: ((oldValue: ValueType) => ValueType) | ValueType, changeType = 'user') {
    this.destroy()
    const replacedValue = this._getValue(newValue)
    this.tmp.changeType = changeType
    this.value = observable(replacedValue)
    this.ob()
  }

  use(plugin?: FormItPlugin | FormItPlugin[]) {
    if (!plugin) {
      return this
    }
    if (Array.isArray(plugin)) {
      plugin.forEach((plg) => plg(this))
    } else {
      plugin(this)
    }
    return this
  }

  _validate(...args: Parameters<typeof validate>): ReturnType<typeof validate> {
    return validate(...args)
  }

  async validateField(name: string) {
    const ctx = { name, shouldValidate: true }
    this.emitSync('validateField:before', ctx)

    let errorInfo = null
    if (ctx.shouldValidate) {
      errorInfo = await this._validate(this.value[ctx.name], this.rule[ctx.name], {
        defaultErrorMsg: this.defaultErrorMsgs[ctx.name],
        extraArgs: [this.value, this]
      })
    }

    const ctxAfter = { errorInfo, name }
    await this.emit('validateField', ctxAfter)
    return ctxAfter.errorInfo
  }

  async validate(fields: string[] = [], { breakWhenError = false } = {}) {
    runInAction(() => {
      this.state.isValidating = true
      this.emitSync('validate:before', fields, { breakWhenError })
    })
    if (fields && !fields.length) {
      fields = Object.keys(this.value)
    }

    const result = Object.create(null)
    const done = () => {
      runInAction(() => {
        this.emitSync('validate', result)
        this.state.isValidating = false
      })
      return Object.keys(result).length ? result : null
    }

    let resolve: Function
    let resolved = false
    const p = new Promise((r) => {
      resolve = r
    }).finally(() => {
      resolved = true
    })

    const tasks = []
    if (fields && fields.length) {
      for (const field of fields) {
        if (resolved) {
          break
        }
        // eslint-disable-next-line promise/catch-or-return,no-loop-func
        tasks.push(
          // eslint-disable-next-line no-loop-func
          this.validateField(field).then((errorInfo) => {
            if (errorInfo) {
              result[field] = errorInfo
              if (breakWhenError) {
                return resolve(done())
              }
            }
          })
        )
      }
    }
    // eslint-disable-next-line promise/catch-or-return
    Promise.all(tasks).finally(() => {
      if (!resolved) {
        resolve(done())
      }
    })

    return p
  }

  destroy() {
    this.disposes.forEach((fn) => fn())
  }

  ob() {
    this.disposes.push(
      intercept(this.value, (willChange: IValueWillChange) => {
        willChange.changeType = this.tmp.changeType
        this.emitSync('fieldWillChange', willChange)
        return willChange
      }),
      observe(
        this.value,
        (change: IValueDidChange) => {
          change.changeType = this.tmp.changeType
          this.emitSync('fieldDidChange', change)
        },
        false
      )
    )
  }
}
