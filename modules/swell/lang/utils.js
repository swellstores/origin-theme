import ruPluralizationRule from './pluralization/ru';

export async function getLocales(swell) {
  const defaultLocale = await swell.settings.get('store.locale', 'en-US');
  const localesSettings = await swell.settings.get('store.locales');
  const isMultiLocale = localesSettings && localesSettings.length > 0;

  const locales = isMultiLocale
    ? localesSettings.map(({ code, name }) => ({ code, name }))
    : [{ code: defaultLocale }];

  return { defaultLocale, locales };
}

export async function getLangSettings(swell) {
  const { defaultLocale, locales } = await getLocales(swell);

  const fallbackLocale = locales
    .filter(({ code }) => code !== defaultLocale)
    .reduce(
      (acc, { code, fallback }) => {
        acc[code] = [fallback || defaultLocale];
        return acc;
      },
      { default: [defaultLocale] },
    );

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
  };

  swell.options.locale = defaultLocale;

  return {
    ...defaultSettings,
    locales: defaultSettings.locales.map((localeOptions) => ({
      ...localeOptions,
      file: `${localeOptions.code}.json`,
    })),
    langDir: '~/static/lang',
    lazy: true,
  };
}
