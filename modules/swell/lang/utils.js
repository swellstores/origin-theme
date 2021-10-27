import path from 'path'
import fs from 'fs'
import consola from 'consola'
import ruPluralizationRule from './pluralization/ru'

const logger = consola.withScope('swell')

export async function generateLangFiles(swell, locales) {
  await Promise.all(
    locales.map(async ({ code }) => {
      swell.options.locale = code
      const localeSettings = await swell.get('/settings')

      const langPath = path.resolve(
        __dirname,
        '../../../static/lang',
        `${code}.json`
      )
      fs.writeFileSync(
        langPath,
        JSON.stringify(localeSettings.lang, null, '  ')
      )

      return localeSettings.lang
    })
  )

  logger.success('Generated language settings files')
}

export async function getLocales(swell) {
  const defaultLocale = await swell.settings.get('store.locale', 'en-US')
  const localesSettings = await swell.settings.get('store.locales')
  const isMultiLocale = localesSettings && localesSettings.length > 0

  const locales = isMultiLocale
    ? localesSettings.map(({ code, name }) => ({ code, name }))
    : [{ code: defaultLocale }]

  return { defaultLocale, locales }
}

export async function getLangSettings(swell) {
  const { defaultLocale, locales } = await getLocales(swell)

  const fallbackLocale = locales
    .filter(({ code }) => code !== defaultLocale)
    .reduce(
      (acc, { code, fallback }) => {
        acc[code] = [fallback || defaultLocale]
        return acc
      },
      { default: [defaultLocale] }
    )

  const defaultSettings = {
    defaultLocale,
    locales,
    vueI18n: {
      fallbackLocale,
      pluralizationRules: {
        // example custom pluralization rule
        ru: ruPluralizationRule,
      },
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'swell-locale',
      redirectOn: 'root',
      alwaysRedirect: true,
    },
    skipSettingLocaleOnNavigate: true,
  }

  await generateLangFiles(swell, locales)
  swell.options.locale = defaultLocale

  return {
    ...defaultSettings,
    locales: defaultSettings.locales.map((localeOptions) => ({
      ...localeOptions,
      file: `${localeOptions.code}.json`,
    })),
    langDir: '~/static/lang',
    lazy: true,
  }
}
