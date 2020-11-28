type EachRuleType = (value: any, ...extraArgs: any[]) => any | string | Promise<any | string>
export type RuleType = Array<EachRuleType> | EachRuleType

export async function validate(
  value: any,
  rule?: RuleType,
  {
    defaultErrorMsg = '校验失败',
    extraArgs = []
  }: {
    defaultErrorMsg?: string
    extraArgs?: any[]
  } = {}
): Promise<{ message: string; rule: EachRuleType } | undefined> {
  if (!rule) {
    return
  }
  if (!Array.isArray(rule)) {
    rule = [rule]
  }

  for (const eachRule of rule) {
    try {
      const isPassed = await eachRule(value, ...extraArgs)
      if (typeof isPassed === 'string') {
        return {
          rule: eachRule,
          message: isPassed
        }
      }
      if (isPassed === false) {
        return {
          rule: eachRule,
          message: defaultErrorMsg
        }
      }
    } catch (err) {
      console.error(err)
      return {
        rule: eachRule,
        message: err.message
      }
    }
  }
}
