import Vue from 'vue'
import get from 'lodash/get'
import { getLocaleDefaults } from '~/modules/swell/utils/getLocaleDefaults'

// Components
import VisualMedia from '~/modules/swell/components/VisualMedia'

Vue.use({
  install(Vue) {
    Vue.mixin({
      methods: {
        formatMoney,
        formatDate,
        resolveUrl,
        getCountryCodeFromLocale,
      },
    })

    Vue.component('VisualMedia', VisualMedia)
  },
})

function formatMoney(amount, code, convert = true) {
  return this.$nuxt.$store.$swell.currency.format(amount, {
    code,
    convert,
  })
}

function formatDate(
  date,
  options = { month: 'long', day: '2-digit', year: 'numeric' }
) {
  const d = new Date(date)
  const locale = this.$nuxt.$store.$swell.locale.selected() || 'default'

  return new Intl.DateTimeFormat(locale, options).format(d)
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

function getCountryCodeFromLocale(locale) {
  const split = locale.toUpperCase().split(/-|_/)
  const lang = split.shift()
  const country = split.pop()
  let code

  if (country) code = country
  if (!country) code = getLocaleDefaults[lang.toLowerCase()]

  return code.toLowerCase()
}

function getContentPath({ type, value, url }) {
  if (typeof type === 'undefined' && url) return url

  // Return URL value as-is
  if (type === 'url') return value

  // Get slug from linked object slug or id, fall back to value itself
  const fallback = typeof value === 'string' ? value : ''
  const slug = get(value, 'slug', get(value, 'id', fallback)) || ''

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
