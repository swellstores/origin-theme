export default async (context) => {
  const { $swell } = context.app

  // Load all settings via API
  await $swell.settings.load()

  // Notify editor when settings are loaded
  const { editor } = require('./swell-editor-utils')
  editor.processMessage({ data: { type: 'settings.loaded' } }, context)
}
