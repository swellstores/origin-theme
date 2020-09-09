export default async (context, inject) => {
  const useEditorSettings = '<%= options.useEditorSettings %>' !== 'false'

  if (process.env.NODE_ENV === 'production' || !useEditorSettings) {
    // Load settings from filesystem
    context.app.$swell.settings.state = parseSerializedOption(`<%= options.settings %>`)
    context.app.$swell.settings.menuState = parseSerializedOption(`<%= options.menus %>`)
  } else {
    // Load all settings via API
    await context.app.$swell.settings.load()
    // Notify editor when settings are loaded
    if (useEditorSettings) {
      try {
        const { editor } = require('./utils')
        editor.processMessage({ data: { type: 'settings.loaded' } }, context)
      } catch (err) {
        // noop
      }
    }
  }
}

function parseSerializedOption(value) {
  const obj = JSON.parse(value)
  return normalizeKeys(obj)
}

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
        key = _.camelCase(key)
      } else if (options.case === 'snake') {
        key = _.snakeCase(key)
      }
      obj[key] = normalizeKeys(value, options)
    })
  } else if (obj && obj.constructor === Array) {
    obj = obj.map(v => normalizeKeys(v, options))
  }
  return obj
}
