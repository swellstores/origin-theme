<template>
  <main class="">
    <div class="container pt-7 pb-4">
      <ProductPreviews :products="products" />
    </div>
  </main>
</template>

<script>
export default {
  name: 'ProductIndexPage',

  async fetch() {
    const { $swell, $route } = this
    const page = parseInt($route.query.page) || 1
    const limit = parseInt($route.query.limit) || 24

    // Set preload data
    this.products = [...Array(limit).keys()]

    // Fetch all products
    const products = await $swell.products.list({ page, limit })

    // Set component data
    if (products) {
      this.products = products.results
      this.productCount = products.count
      this.pages = products.pages
      this.currentPage = page
    }
  },

  data() {
    return {
      products: [],
      productCount: 0,
      pages: {},
      currentPage: 0,
      settings: {
        productCols: 3
      }
    }
  },

  // Watch URL query for pagination changes (triggers fetch method again)
  // https://nuxtjs.org/api/pages-watchquery/
  watchQuery: ['page']
}
</script>
