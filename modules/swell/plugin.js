import { get } from 'lodash'
import swell from 'swell-js'
import settingsJson from '~/config/settings.json'
import menusJson from '~/config/menus.json'

export default (context, inject) => {
  const settings = settingsJson || {}
  const storeId = '<%= options.storeId || "" %>' || get(settings, 'store.id')
  const publicKey =
    '<%= options.publicKey || "" %>' || get(settings, 'store.public_key')

  // Bail if options aren't provided
  if (!storeId) {
    throw new Error('[swell module]: a store ID must be provided')
  }
  if (!publicKey) {
    throw new Error('[swell module]: a public API key must be provided')
  }

  // Load cookies on server side
  const cookies = parseCookies(context.req)

  // Set up swell-js client
  swell.init(storeId, publicKey, {
    useCamelCase: true,
    previewContent: '<%= options.previewContent %>' === 'true',
    url: '<%= options.storeUrl %>',
    session: cookies['swell-session'],
    locale: cookies['swell-locale'],
    currency: cookies['swell-currency'],
  })

  // Inject client into nuxt context as $swell
  context.$swell = swell
  context.$swell.settings.state = settingsJson
  context.$swell.settings.menuState = menusJson

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
