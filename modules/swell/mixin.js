import Vue from 'vue'
import get from 'lodash/get'
import settings from '~/config/settings'

// Components
import VisualMedia from '~/modules/swell/components/VisualMedia'

Vue.use({
  install(Vue) {
    Vue.mixin({
      methods: {
        formatMoney,
        resolveUrl
      }
    })

    Vue.component('VisualMedia', VisualMedia)
  }
})

function formatMoney(valueAmount, valueCurrency) {
  const amount = valueAmount
  const state = get(this, '$nuxt.$store.state', {})
  const { locale = state.locale, currency = state.currency } = settings.store

  if (valueCurrency !== currency) {
    // Convert the price currency into the display currency
    // const rate = exchangeRates[valueCurrency]
    // amount = (amount / 100) * rate
  }

  let formatter
  try {
    const localeFormatted = locale.replace('_', '-')
    formatter = new Intl.NumberFormat(localeFormatted, {
      style: 'currency',
      currency
    })
  } catch (err) {
    console.error(err)
  }

  // TODO polyfill?
  if (!formatter) return ''

  if (typeof amount === 'number') {
    // If amount passed, return it with the appropriate currency symbol
    return formatter.format(amount)
  } else {
    // Otherwise return the currency symbol only, falling back to '$'
    return get(formatter.formatToParts(0), '0.value', '$')
  }
}

function resolveUrl(item) {
  // Return error path if link item is invalid
  if (!item) return '#invalid-link-item'

  if (typeof item === 'object' && item !== null) {
    // Build full path from link item object
    let itemPath = getContentPath(item)

    // Add/remove trailing slash according to router configuration
    const useTrailingSlash = '<%= options.trailingSlash %>' === 'true'
    const endsWithSlash = itemPath.slice(-1) === '/'

    if (useTrailingSlash && !endsWithSlash && itemPath.length > 1) {
      itemPath = itemPath + '/'
    }

    if (!useTrailingSlash && endsWithSlash && itemPath.length > 1) {
      itemPath = itemPath.slice(0, -1)
    }

    return itemPath // TODO wrap nuxt-i18n to generate localized path
  } else {
    // Treat item as complete URL
    return item
  }
}

function getContentPath({ type, value }) {
  // Get slug from linked object, fall back to value itself
  const slug = get(value, 'slug', get(value, 'id', value)) || ''

  // Build path based on content type of item
  switch (type) {
    case 'home':
      return '/'
    case 'category':
      return `/categories/${slug}`
    case 'product':
      return `/products/${slug}`
    case 'search':
      return `/search/`
    default:
      return `/${slug}`
  }
}
