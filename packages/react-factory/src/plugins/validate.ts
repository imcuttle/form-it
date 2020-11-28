import { FormItPlugin } from '@form-it/core'
import { RuleType } from '@form-it/core'
import * as isPlainObject from 'lodash.isplainobject'
import validateByRuleObj, { RuleObj } from './validation'

const validatePlugin: FormItPlugin = (formIt) => {
  const _validate = formIt._validate
  // @ts-ignore
  formIt._validate = async function validate(
    value,
    rule?: RuleType | RuleObj | RuleObj[],
    { defaultErrorMsg, extraArgs }: { defaultErrorMsg?: string; extraArgs?: any[] } = {}
  ) {
    if (!rule) {
      return
    }

    // @ts-ignore
    let rules: any[] = rule
    if (!Array.isArray(rule)) {
      rules = [rule]
    }

    for (const eachRule of rules) {
      if (eachRule && isPlainObject(eachRule)) {
        // 外部没有设置 message
        const info = await validateByRuleObj(value, [eachRule], { defaultErrorMsg, extraArgs })
        // debugger
        if (typeof info === 'string') {
          return { message: info, rule: eachRule }
        }
        return false
      }
      const errorInfo = await _validate(value, eachRule, { defaultErrorMsg, extraArgs })
      if (errorInfo) {
        return errorInfo
      }
    }
  }
}

export default validatePlugin
