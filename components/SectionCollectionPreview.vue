<template>
  <!-- Collection preview -->
  <section class="py-16">
    <NuxtLink :to="resolveUrl({ type: 'category', value: slug })">
      <h2>{{ name }}</h2>
    </NuxtLink>

    <!-- Product previews -->
    <ProductListing :products="products" />
  </section>
</template>

<script>
export default {
  name: 'SectionCollectionPreview',

  props: {
    id: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    slug: {
      type: String,
      default: ''
    }
  },

  async fetch() {
    const { $swell, slug } = this

    if (this.slug) {
      // Fetch category with products
      const { products } = await $swell.categories.get(slug, { expand: 'products' })

      // Set component data
      this.products = products.results
    }
  },

  data() {
    return {
      products: []
    }
  }
}
</script>

<style lang="scss" scoped></style>
