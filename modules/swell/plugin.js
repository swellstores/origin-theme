import get from 'lodash/get'
import consola from 'consola'
import swell from 'swell-js'
import settingsJSON from '~/config/settings'

const logger = consola.withScope('swell')

export default async (context, inject) => {
  const settings = settingsJSON || {}
  const storeId = '<%= options.storeId || "" %>' || get(settings, 'store.id')
  const publicKey = '<%= options.publicKey || "" %>' || get(settings, 'store.public_key')

  // Bail if options aren't provided
  if (!storeId) {
    throw new Error('[swell module]: a store ID must be provided')
  }
  if (!publicKey) {
    throw new Error('[swell module]: a public API key must be provided')
  }

  // Set up swell-js client
  swell.init(storeId, publicKey, {
    useCamelCase: true,
    previewContent: '<%= options.previewContent %>' === 'true',
    url: '<%= options.storeUrl %>'
  })

  // Inject client into nuxt context as $swell
  context.$swell = swell
  inject('swell', swell)
}
