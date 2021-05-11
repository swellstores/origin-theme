// lang settings lazy loader
export default async ({ $swell }, locale) => {
  await $swell.locale.set(locale)
  return await $swell.settings.get('lang')
}
