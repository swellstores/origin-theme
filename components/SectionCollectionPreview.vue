<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="$fetchState.error"
    heading="Collection preview"
    :description="$fetchState.error.message"
  />

  <section v-else class="py-16">
    <div class="container">
      <div v-if="!loaded && $fetchState.pending" class="loader-el w-64 h-8 mb-2 md:h-10"></div>
      <NuxtLink v-else :to="resolveUrl({ type: 'category', value: slug })">
        <h2>{{ name }}</h2>
      </NuxtLink>

      <!-- Product previews -->
      <ProductPreviews :products="products" :column-count="productCols" />
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
    }
  },

  async fetch() {
    const { $swell } = this

    // Set preload data
    if (!this.loaded) {
      this.products = [...Array(4).keys()].map(() => ({}))
    }

    if (!this.categoryId) {
      return
    }

    // Fetch category with products
    const category = await $swell.categories.get(this.categoryId, { expand: 'products:4' })

    if (!category) {
      throw new Error(`Category "${this.categoryId}" inactive or not found`)
    }

    // Set component data
    this.name = category.name
    this.slug = category.slug
    this.productCols = get(category, 'content.productCols', 4)
    this.products = get(category, 'products.results', []).slice(0, this.productCols)

    this.loaded = true
  },

  data() {
    return {
      name: null,
      slug: null,
      products: [],
      productCols: 4,
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
