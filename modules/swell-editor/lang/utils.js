import objectScan from 'object-scan'
import { pipe, get, set, camelCase, reduce } from 'lodash/fp'
import ruPluralizationRule from './pluralization/ru'

export function getDefaultsFromEditor(editorSettings) {
  const defaultsPaths = objectScan(['lang.**.default'])(editorSettings)

  const defaultValues = defaultsPaths.map(path => {
    return {
      defaultValue: get(path)(editorSettings),
      id: get(path.slice(0, -1).concat('id'))(editorSettings)
    }
  })

  return defaultValues.reduce(
    (acc, { defaultValue, id }) => set(id, defaultValue)(acc),
    {}
  )
}

export function getLangMessages(defaultLocale, settings) {
  const { lang } = settings

  const defaultMessages = pipe(
    objectScan(['**,!**.$locale.**'], {
      filterFn: ({ value }) => typeof value === 'string'
    }),
    reduce((acc, basePath) => {
      const defaultText = get(basePath)(lang)
      const normalizedBasePath = basePath.map(camelCase)

      return set([defaultLocale, ...normalizedBasePath], defaultText)(acc)
    }, {})
  )(lang)

  const localeMessages = pipe(
    objectScan(['**.$locale.**'], {
      filterFn: ({ value }) => typeof value === 'string'
    }),
    reduce((acc, basePath) => {
      const message = get(basePath)(lang)
      const messageLocale = basePath.slice(-2, -1)[0]
      const messagePath = [
        messageLocale,
        ...basePath
          .filter(segment => !['$locale', messageLocale].includes(segment))
          .map(camelCase)
      ]

      return message ? set(messagePath, message)(acc) : acc
    }, {})
  )(lang)

  return { ...defaultMessages, ...localeMessages }
}

export function getLangSettings(settings, editorMode) {
  const defaultLocale = settings.store.locale
  const localesSettings = settings.store.locales
  const isMultiLocale = localesSettings?.length > 0

  const locales = isMultiLocale
    ? localesSettings.map(({ code, name }) => ({ code, name }))
    : [{ code: defaultLocale }]

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
        ru: ruPluralizationRule
      }
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'swell-locale',
      onlyOnRoot: true, // recommended,
      alwaysRedirect: true
    },
    skipSettingLocaleOnNavigate: true
  }

  return editorMode
    ? {
        ...defaultSettings,
        locales: defaultSettings.locales.map(localeOptions => ({
          ...localeOptions,
          file: 'index.js'
        })),
        langDir: '~/modules/swell-editor/lang',
        lazy: true
      }
    : {
        ...defaultSettings,
        vueI18n: {
          ...defaultSettings.vueI18n,
          messages: getLangMessages(defaultLocale, settings)
        }
      }
}
