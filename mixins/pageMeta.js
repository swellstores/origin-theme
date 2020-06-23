import get from 'lodash/get'

const generateMetaImage = image => {
  const src = get(image, 'file.url')
  const size = {
    width: 1200,
    height: 630
  }

  return `${src}?w=${size.width}&h=${size.height}&q=100&fit=fill`
}

export default {
  async fetch() {
    const { $swell } = this
    this.storeUrl = await $swell.settings.get('store.url')
    this.storeName = await $swell.settings.get('store.name')
    console.log(this.storeName);
  },

  computed: {
    pageMeta() {
      const formatTitle = itemTitle => itemTitle + ' - ' + this.storeName

      if (this.page) {
        // Item is a Page
        const image = generateMetaImage(get(this, 'product.images[0]'))

        return {
          url: this.page.slug !== 'home' ? `${this.storeUrl}/${this.page.slug}` : this.storeUrl,
          title: formatTitle(this.page.metaTitle),
          description: this.page.metaDescription,
          image
        }
      } else if (this.product) {
        // Item is a Product
        const image = generateMetaImage(get(this, 'product.images[0]'))

        return {
          url: `${this.storeUrl}/products/${this.product.slug}`,
          title: formatTitle(this.product.name),
          description: this.product.description || '',
          image
        }
      } else {
        // Item is totally unexpected
        const image = generateMetaImage()

        return {
          url: this.storeUrl,
          title: this.storeName,
          description: '',
          image
        }
      }
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
          soldOut: 'SoldOut'
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
            availability: `http://schema.org/${availabilityDefs[stockStatus]}`
          }
        }
      }
    }
  },

  head() {
    return {
      __dangerouslyDisableSanitizers: ['script'],
      script: [
        {
          innerHTML: this.structuredData ? JSON.stringify(this.structuredData) : '{}',
          type: 'application/ld+json'
        }
      ],
      title: this.pageMeta.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.pageMeta.description
        },
        // Open Graph
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.pageMeta.title
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.pageMeta.description
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: this.pageMeta.url
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: this.pageMeta.image.src
        },
        // Twitter Card
        {
          property: 'twitter:card',
          content: 'summary_large_image'
        },
        {
          property: 'twitter:title',
          content: this.pageMeta.title
        },
        {
          property: 'twitter:description',
          content: this.pageMeta.description
        },
        {
          property: 'twitter:image',
          content: this.pageMeta.image.src
        },
        {
          property: 'twitter:image:alt',
          content: this.pageMeta.image.description
        }
      ]
    }
  }
}
