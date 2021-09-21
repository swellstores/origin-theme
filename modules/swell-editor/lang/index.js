import deepmerge from 'deepmerge'
import { toCamel } from 'swell-js/dist/utils'
import settings from '~/config/settings.json'
import { combineMerge } from '~/modules/swell/utils/mergeSettings'

// lang settings lazy loader
export default async ({ $swell }, locale) => {
  await $swell.locale.set(locale)
  const currentLang = await $swell.settings.get('lang')
  return deepmerge(toCamel(settings.lang), currentLang, {
    arrayMerge: combineMerge,
  })
}
