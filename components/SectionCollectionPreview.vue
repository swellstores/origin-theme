<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="$fetchState.error"
    heading="Collection preview"
    :description="$fetchState.error.message"
  />

  <section v-else class="py-16">
    <div class="container">
      <template v-if="showTitle">
        <div v-if="!loaded && $fetchState.pending" class="loader-el w-64 h-8 mb-2 md:h-10"></div>
        <NuxtLink v-else :to="localePath(resolveUrl({ type: 'category', value: slug }))">
          <h1 v-if="titleSize === 'lg'" class="mb-2">{{ name }}</h1>
          <h2 v-if="titleSize === 'md'" class="mb-2">{{ name }}</h2>
          <h3 v-if="titleSize === 'sm'" class="mb-2">{{ name }}</h3>
        </NuxtLink>
      </template>

      <!-- Product previews -->
      <ProductPreviews
        :products="products"
        :column-count="productCols"
        :text-align="textAlign"
        :show-price="showPrice"
      />
    </div>
  </section>
</template>

<script>
// Helpers
import get from 'lodash/get'

export default {
  name: 'SectionCollectionPreview',

  props: {
    type: {
      type: String,
      default: null
    },
    id: {
      type: String,
      default: null
    },
    categoryId: {
      type: String,
      default: null
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    titleSize: {
      type: String,
      default: 'md'
    },
    productCols: {
      type: Number,
      default: 3
    },
    productRows: {
      type: Number,
      default: 1
    },
    showPrice: {
      type: Boolean,
      default: true
    },
    textAlign: {
      type: String,
      default: 'left'
    }
  },

  async fetch() {
    const { $swell } = this

    // Set preload data
    if (!this.loaded) {
      this.products = [...Array(this.productCols * this.productRows).keys()].map(() => ({}))
    }

    if (!this.categoryId) {
      return
    }

    // Fetch category and products
    const category = await $swell.categories.get(this.categoryId)
    const products = await $swell.products.list({
      $filters: { category: [this.categoryId] },
      expand: ['variants']
    })

    if (!category) {
      throw new Error(`Category "${this.categoryId}" inactive or not found`)
    }

    // Set component data
    this.name = this.title || category.name
    this.slug = category.slug
    this.products = get(products, 'results', []).slice(0, this.productCols * this.productRows)

    this.loaded = true
  },

  data() {
    return {
      name: null,
      slug: null,
      products: [],
      loaded: false
    }
  },

  activated() {
    // Call fetch again if last fetch more than a minute ago
    if (this.$fetchState.timestamp <= Date.now() - 60000) {
      this.$fetch()
    }
  }
}
</script>
