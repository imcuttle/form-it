export function inferResetAtomValue(value: any) {
  if (typeof value === 'string') {
    return ''
  }
  if (typeof value === 'number') {
    return null
  }

  if (Array.isArray(value)) {
    return []
  }

  if (value && value.constructor === Object) {
    const newValue: any = {}
    Object.keys(value).forEach((name) => {
      newValue[name] = inferResetAtomValue(name)
    })
    return newValue
  }

  return value
}
