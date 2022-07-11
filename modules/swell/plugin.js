import swell from 'swell-js';

export default async (context, inject) => {
  const storeId = '<%= options.storeId || "" %>';
  const publicKey = '<%= options.publicKey || "" %>';

  // Bail if options aren't provided
  if (!storeId) {
    throw new Error('[swell module]: a store ID must be provided');
  }
  if (!publicKey) {
    throw new Error('[swell module]: a public API key must be provided');
  }

  // Load cookies on server side
  const cookies = parseCookies(
    process.browser ? document.cookie : context.req?.headers?.cookie,
  );

  const currency =
    cookies['swell-currency'] ||
    '<%= options.currentSettings.store.currency || "" %>';
  const locale =
    cookies['swell-locale'] ||
    '<%= options.currentSettings.store.locale || "" %>';

  // Set up swell-js client
  swell.init(storeId, publicKey, {
    useCamelCase: true,
    previewContent: '<%= options.editorMode %>' === 'true',
    url: '<%= options.storeUrl %>',
    vaultUrl: '<%= options.vaultUrl || "" %>',
    session: cookies['swell-session'],
    currency,
    locale,
  });

  swell.currency.code = currency;
  swell.currency.state = { code: currency };
  swell.currency.locale = locale;

  swell.locale.set(locale);

  await swell.settings.load();

  // Inject client into nuxt context as $swell
  context.$swell = swell;
  inject('swell', swell);

  context.store.commit('setState', { key: 'currency', value: currency });
  context.store.commit('setState', { key: 'locale', value: locale });
};

function parseCookies(cookie) {
  if (!cookie) {
    return {};
  }
  return cookie
    .split(/;\s*/)
    .map((line) => line.split('='))
    .reduce(
      (acc, parts) => ({
        ...acc,
        [parts[0].toLowerCase()]: decodeURIComponent(parts[1]),
      }),
      {},
    );
}
