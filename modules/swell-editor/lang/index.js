// lang settings lazy loader
export default async ({ $swell }, locale) => {
  await $swell.locale.set(locale)
  await $swell.settings.refresh()
  await $swell.settings.load()
  const currentLang = await $swell.settings.get('lang')

  return currentLang
}
