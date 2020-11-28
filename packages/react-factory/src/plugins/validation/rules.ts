function applyMessage<RuleType = any>(
  msg: string | ((rule: RuleType, val: any) => string),
  fn: (rule: RuleType, val: any) => boolean | Promise<boolean>
) {
  return async (rule: RuleType, val: any) => {
    if (!(await fn(rule, val))) {
      if (typeof msg === 'function') {
        return msg(rule, val)
      }
      return msg.replace(/%RULE/g, String(rule)).replace(/%VALUE/g, String(val))
    }
    return true
  }
}

export const maxLen = applyMessage<number>('长度不能超过%RULE', (max, val: any) =>
  val == null ? true : max >= Array.from(val).length
)

export const minLen = applyMessage<number>('长度不能小于%RULE', (min, val: any) => min <= Array.from(val).length)

export const regex = (regexp: RegExp, val: string) => regexp.test(val)

export const oneOf = (array: any[], val: any) => array.includes(val)

// @ts-ignore
export const required = (isRequired: boolean, val: any) => {
  if (isRequired) {
    if (Array.isArray(val)) {
      return !!val.length && val.every((v) => required(isRequired, v))
    }
    return ![null, undefined, ''].includes(val)
  }
  return false
}

export const validate = (anyValidate: (val: any, ...args: any[]) => boolean | Promise<boolean>, val: string) =>
  anyValidate(val)

export const min = (minNum: number, val: any) => minNum <= Number(val)

export const max = (maxNum: number, val: any) => maxNum >= Number(val)
