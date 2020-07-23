import camelCase from 'lodash/camelCase'
import snakeCase from 'lodash/snakeCase'

function normalizeKeys(obj, params) {
  const options = {
    case: 'camel',
    ignoredKeys: ['$cache'],
    ...params
  }

  if (obj && obj.constructor === Object) {
    Object.keys(obj).forEach(key => {
      if (options.ignoredKeys.includes(key)) return

      const value = obj[key]
      delete obj[key]

      if (options.case === 'camel') {
        key = camelCase(key)
      } else if (options.case === 'snake') {
        key = snakeCase(key)
      }

      obj[key] = normalizeKeys(value, options)
    })
  } else if (obj && obj.constructor === Array) {
    obj = obj.map(v => normalizeKeys(v, options))
  }

  return obj
}

function parseSerializedOption(value) {
  const obj = JSON.parse(value)
  return normalizeKeys(obj)
}

export default async (context, inject) => {
  const useLocalSettings = '<%= options.useLocalSettings %>' !== 'false'

  if (process.env.NODE_ENV === 'production' || useLocalSettings) {
    // Load settings from filesystem
    context.app.$swell.settings.state = parseSerializedOption(`<%= options.settings %>`)
    context.app.$swell.settings.menuState = parseSerializedOption(`<%= options.menus %>`)
  } else {
    // Get settings via API
    await context.app.$swell.settings.get()
    await context.app.$swell.settings.menus()
  }
}
