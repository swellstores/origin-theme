<template>
  <!-- Collection preview -->
  <section class="py-16">
    <div class="container">
      <div v-if="$fetchState.pending" class="loader-el w-64 h-8 mb-2 md:h-10"></div>
      <NuxtLink v-else :to="resolveUrl({ type: 'category', value: slug })">
        <h2>{{ name }}</h2>
      </NuxtLink>

      <!-- Product previews -->
      <ProductListing :products="products" :column-count="3" />
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionCollectionPreview',

  props: {
    id: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    name: {
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
    this.products = [...Array(6).keys()].map(() => ({}))

    // Fetch category with products
    if (this.categoryId) {
      const category = await $swell.categories.get(this.categoryId, { expand: 'products' })

      // Set component data
      if (category) {
        this.slug = category.slug
        this.products = category.products ? category.products.results : []
      } else {
        this.products = []
      }
    }
  },

  data() {
    return {
      products: [],
      slug: ''
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

<style lang="scss" scoped></style>
