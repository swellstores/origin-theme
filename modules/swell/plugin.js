import consola from 'consola'
import swell from 'swell-js'
import menusJSON from '~/config/menus'
import settingsJSON from '~/config/settings'

const logger = consola.withScope('swell')

export default async (context, inject) => {
  const settings = settingsJSON
  const storeId = '<%= options.storeId || "" %>' || settings.store.id
  const publicKey = '<%= options.publicKey || "" %>' || settings.store.public_key

  // Bail if options aren't provided
  if (!storeId || !publicKey) {
    throw new Error('[swell module]: a store ID and public API key must be provided')
  }

  // Set up swell-js client
  swell.init(storeId, publicKey, {
    useCamelCase: true,
    url: '<%= options.storeUrl %>'
  })

  // Inject client into nuxt context as $swell
  context.$swell = swell
  inject('swell', swell)

  if (process.env.NODE_ENV === 'production') {
    swell.settings.state = settingsJSON
    swell.settings.menuState = menusJSON
  } else {
    // Get live store settings config for dev mode
    await swell.settings.get()
    await swell.settings.menus()
  }
}
