import swell from 'swell-js'
import merge from 'deepmerge'

export async function mergeSettings(localSettings) {
  const storeId = process.env.SWELL_STORE_ID || localSettings.store.id
  const publicKey =
    process.env.SWELL_PUBLIC_KEY || localSettings.store.public_key
  const storeUrl = process.env.SWELL_STORE_URL || localSettings.store.url

  swell.init(storeId, publicKey, {
    useCamelCase: true,
    url: storeUrl,
  })

  await swell.settings.load()

  return merge(swell.settings.state, localSettings)
}
