import swell from 'swell-js'
import merge from 'deepmerge'

const combineMerge = (target, source, options) => {
  const destination = target.slice()

  source.forEach((item, index) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options)
    } else if (!target.includes(item)) {
      destination.push(item)
    }
  })

  return destination
}

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

  return merge(swell.settings.state, localSettings, {
    arrayMerge: combineMerge,
  })
}
