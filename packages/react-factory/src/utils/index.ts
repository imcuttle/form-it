import * as React from 'react'
import { parse, stringify } from 'querystring'

let useLocation = () => null
let useHistory = () => null
try {
  useLocation = require('react-router').useLocation || useLocation
  useHistory = require('react-router').useHistory || useHistory
} catch (e) {
  console.error(e)
}

export function useLocationWithQuery() {
  const location = useLocation()
  const locQuery = React.useMemo(() => parse(location?.search.slice(1) || ''), [location?.search])
  return React.useMemo(() => (location ? { ...location, query: locQuery } : location), [locQuery, location])
}

export function useExtendQueryHistory() {
  const history = useHistory()
  const location = useLocationWithQuery()

  return React.useMemo(() => {
    if (!history) {
      return null
    }
    const createPush = (originPush: any, isExtend: boolean) => (loca: any, ...args: any[]) => {
      if (typeof loca === 'string') {
        return originPush(loca, args)
      }

      originPush({
        // @ts-ignore
        ...loca,
        search: isExtend
          ? `?${stringify({
              ...location.query,
              ...loca.query
            })}`
          : `?${stringify(loca.query)}`
      })
    }

    return {
      push: createPush(history.push.bind(history), false),
      pushExtend: createPush(history.push.bind(history), true),
      replace: createPush(history.replace.bind(history), false),
      replaceExtend: createPush(history.replace.bind(history), true),
      originHistory: history
    }
  }, [history, location?.query])
}
