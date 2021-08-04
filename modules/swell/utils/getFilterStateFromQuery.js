// Return a filter state object with active filter IDs and values
import isObject from 'lodash/isObject'

export function getFilterStateFromQuery(query, filters) {
  const filterState = {}
  const arrayedTypes = ['select']

  // Go through filters and check if there's a matching query param
  if (isObject(query) && Array.isArray(filters)) {
    const queryKeys = Object.keys(query)

    filters.forEach(({ id, type }) => {
      if (queryKeys.includes(id)) {
        const queryValue = query[id]
        const useArray =
          arrayedTypes.includes(type) && !Array.isArray(queryValue)
        filterState[id] = useArray ? [queryValue] : queryValue
      }
    })
  }

  return filterState
}
