<template>
  <!-- Error/empty state -->
  <div v-if="$fetchState.error" class="py-24 text-center">
    <h3>SectionCollectionPreview</h3>
    <p>{{ $fetchState.error.message }}</p>
  </div>

  <section v-else class="py-16">
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
    if (!this.categoryId) throw new Error(`No category selected`)

    const { $swell } = this

    // Set preload data
    this.products = [...Array(3).keys()].map(() => ({}))

    // Fetch category with products
    const category = await $swell.categories.get(this.categoryId, { expand: 'products' })

    if (!category) {
      throw new Error(`Category named "${this.name}" not found`)
    }

    // Set component data
    this.name = category.name
    this.slug = category.slug
    this.products = category.products ? category.products.results : []
  },

  data() {
    return {
      name: null,
      slug: null,
      products: []
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
