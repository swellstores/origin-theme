// lang settings lazy loader
export default async (context, locale) => {
  const { $swell } = context;

  $swell.options.locale = locale;
  await $swell.locale.select(locale);
  await $swell.settings.refresh();
  await $swell.settings.load();
  const currentLang = await $swell.settings.get('lang');

  return currentLang;
};
