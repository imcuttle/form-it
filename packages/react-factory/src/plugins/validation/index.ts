import * as rules from './rules'

type RuleMap = typeof rules

type RuleNames = keyof RuleMap

export type RuleObj = { [name in RuleNames]?: Parameters<RuleMap[name]>[0] } & {
  message?: string | ((value: any, ...args: any[]) => string)
}

async function validateByRuleObj(
  value: any,
  ruleObjArray: RuleObj[],
  { defaultErrorMsg, extraArgs = [] }: { defaultErrorMsg?: string; extraArgs?: any[] } = {}
) {
  for (const ruleObj of ruleObjArray) {
    for (const ruleObjKey of Object.keys(ruleObj)) {
      // @ts-ignore
      const fn = rules[ruleObjKey]
      if (fn) {
        let result
        if (ruleObjKey === 'validate') {
          result = await fn(
            // @ts-ignore
            (val: any) => ruleObj[ruleObjKey](val, ...extraArgs),
            value
          )
        } else {
          // @ts-ignore
          result = await fn(ruleObj[ruleObjKey], value)
        }

        if (!result || typeof result === 'string') {
          let customMsg = ruleObj.message
          if (ruleObj.message) {
            customMsg = typeof ruleObj.message === 'string' ? ruleObj.message : ruleObj.message(value, ...extraArgs)
          }
          if (customMsg) {
            return customMsg
          }

          if (typeof result === 'string') {
            return result
          }
          return defaultErrorMsg
        }
      }
    }
  }
}
export default validateByRuleObj
