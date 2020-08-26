import { editor, normalizeKeys } from './swell-editor-utils'

function parseSerializedOption(value) {
  const obj = JSON.parse(value)
  return normalizeKeys(obj)
}

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
      editor.processMessage({ data: { type: 'settings.loaded' } }, context)
    }
  }
}
