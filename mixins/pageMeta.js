import get from 'lodash/get'

const generateMetaImage = (media) => {
  const src = Array.isArray(media)
    ? get(media, '0.file.url')
    : get(media, 'file.url')
  const size = {
    width: 1200,
    height: 630,
  }

  return src ? `${src}?w=${size.width}&h=${size.height}&q=100&fit=fill` : ''
}

export default {
  async asyncData({ $swell }) {
    const storeName = await $swell.settings.get('store.name')
    const storeUrl = await $swell.settings.get('store.url')

    return {
      storeName,
      storeUrl,
    }
  },

  computed: {
    pageMeta() {
      const {
        $route,
        category,
        categories,
        product,
        products,
        page,
        storeName,
        storeUrl,
      } = this
      const formatTitle = (itemTitle) => itemTitle + ' - ' + storeName

      const meta = {
        storeName,
        url: storeUrl + $route.path,
        title: storeName,
        description: '',
        image: {}, // TODO global fallback image,
        link: [],
      }

      if (get(this, '$fetchState.pending')) {
        // Content is being loaded
        meta.title = 'Loading...'
      } else if (category) {
        // For a category detail page
        const title = category.metaTitle || category.name
        meta.title = formatTitle(title)
        meta.description = category.metaDescription || ''
        meta.image = generateMetaImage(category.images)
      } else if (categories) {
        // For a category index page
        meta.title = formatTitle('Categories')
        meta.image = generateMetaImage(get(categories, '0.images'))
      } else if (product) {
        // For a product detail page
        const title = product.metaTitle || product.name
        meta.title = formatTitle(title)
        meta.description = product.metaDescription || ''
        meta.image = generateMetaImage(product.images)
      } else if (products) {
        // For a product index page
        meta.title = formatTitle('Products')
        meta.image = generateMetaImage(get(products, '0.images'))
      } else if (page) {
        // For a standard page
        const title = page.metaTitle || page.name
        meta.title = formatTitle(title)
        meta.description = page.metaDescription || ''
      }

      return meta
    },

    // Generate schema.org structured data
    structuredData() {
      // Item is a Product
      const { product } = this

      if (product) {
        const stockStatus = product.stockStatus || 'inStock'
        const availabilityDefs = {
          inStock: 'InStock',
          limitedAvailability: 'LimitedAvailability',
          preorder: 'PreOrder',
          outOfStock: 'OutOfStock',
          soldOut: 'SoldOut',
        }

        return {
          '@context': 'http://schema.org',
          '@type': 'Product',
          name: product.name,
          image: generateMetaImage(get(this, 'product.images[0]')),
          description: product.description,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency,
            availability: `http://schema.org/${availabilityDefs[stockStatus]}`,
          },
        }
      }
    },
  },

  head() {
    const { pageMeta, structuredData } = this
    const { storeName, url, title, description, image, link } = pageMeta
    const script = []

    if (structuredData) {
      script.push({
        innerHTML: JSON.stringify(structuredData),
        type: 'application/ld+json',
      })
    }

    return {
      __dangerouslyDisableSanitizers: ['script'],
      script,
      title,
      link,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: description,
        },
        // Open Graph
        {
          hid: 'og:site_name',
          property: 'og:site_name',
          content: storeName,
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: title,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description,
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: url,
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: image,
        },
        // Twitter Card
        {
          property: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          property: 'twitter:title',
          content: title,
        },
        {
          property: 'twitter:description',
          content: description,
        },
        {
          property: 'twitter:image',
          content: image,
        },
      ],
    }
  },
}
