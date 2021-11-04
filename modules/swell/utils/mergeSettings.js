import { toCamel } from 'swell-js/dist/utils'
import merge from 'deepmerge'

function sortById(a, b) {
  if (!a.id) return 1 // put empty ids in last
  if (!b.id) return -1

  return a.id.localeCompare(b.id)
}

export function combineMerge(target, originalSource, options) {
  const identifiableItems = [...target, ...originalSource].some(
    (obj) => !!obj.id
  )

  let destination, source
  if (identifiableItems) {
    destination = [...target].sort(sortById)
    source = [...originalSource].sort(sortById)
  } else {
    destination = [...target]
    source = originalSource
  }

  source.forEach((item, index) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
      return
    }

    if (identifiableItems) {
      const matchingItem = destination.findIndex((obj) => obj.id === item.id)

      if (matchingItem !== -1) {
        destination[matchingItem] = merge(target[index], item, options)
      }
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options)
    } else if (!target.includes(item)) {
      destination.push(item)
    }
  })

  return destination
}

export function mergeSettings(settings, sourceSettings, options = {}) {
  const merged = merge(settings, toCamel(sourceSettings), {
    arrayMerge: combineMerge,
    ...options,
  })

  return merged
}
