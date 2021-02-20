import camelCase from 'lodash/camelCase'
import snakeCase from 'lodash/snakeCase'
import settings from '~/config/settings.json'
import menus from '~/config/menus.json'

export default async (context, inject) => {
  const { $swell } = context.app;
  const useEditorSettings = '<%= options.useEditorSettings %>' !== 'false'

  if (process.env.NODE_ENV === 'production' || !useEditorSettings) {
    // Load settings from filesystem
    $swell.settings.state = normalizeKeys(settings)
    $swell.settings.menuState = normalizeKeys(menus)

    // TODO: figure how to load locale settings in production
  } else {
    // Load all settings via API
    await $swell.settings.load()
    // Notify editor when settings are loaded
    if (useEditorSettings) {
      try {
        const { editor } = require('./swell-editor-utils')
        editor.processMessage({ data: { type: 'settings.loaded' } }, context)
      } catch (err) {
        // noop
      }
    }
  }
}

function normalizeKeys(obj, params) {
  const options = {
    case: 'camel',
    ignoredKeys: ['$cache', '$locale'],
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
