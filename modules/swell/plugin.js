import swell from 'swell-js'

export default async (context, inject) => {
  const storeId = '<%= options.storeId || "" %>'
  const publicKey = '<%= options.publicKey || "" %>'

  // Bail if options aren't provided
  if (!storeId) {
    throw new Error('[swell module]: a store ID must be provided')
  }
  if (!publicKey) {
    throw new Error('[swell module]: a public API key must be provided')
  }

  // Load cookies on server side
  const cookies = parseCookies(context.req)
  const locale =
    cookies['swell-locale'] ||
    context.i18n.localeProperties.code ||
    '<%= options.settings.store.locale || "" %>'

  // Set up swell-js client
  swell.init(storeId, publicKey, {
    useCamelCase: true,
    previewContent: '<%= options.previewContent %>' === 'true',
    url: '<%= options.storeUrl %>',
    session: cookies['swell-session'],
    currency: cookies['swell-currency'],
    locale,
  })

  await swell.locale.select(locale)

  await swell.settings.load()

  // Inject client into nuxt context as $swell
  inject('swell', swell)
}

function parseCookies(req) {
  if (!req || !req.headers.cookie) {
    return {}
  }
  return req.headers.cookie
    .split(/;\s*/)
    .map((line) => line.split('='))
    .reduce(
      (acc, parts) => ({
        ...acc,
        [parts[0].toLowerCase()]: decodeURIComponent(parts[1]),
      }),
      {}
    )
}
