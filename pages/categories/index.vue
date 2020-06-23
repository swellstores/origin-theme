<template>
  <main class="container">
    <SectionCollectionPreview v-for="category in categories" :key="category.id" v-bind="category" />
  </main>
</template>

<script>
export default {
  name: 'CategoryIndexPage',

  async fetch() {
    const { $swell, $route } = this
    const page = parseInt($route.query.page) || 1

    // Set preload data
    this.categories = [...Array(10).keys()]

    // Fetch all categories
    const categories = await $swell.categories.list()

    // Set component data
    this.categories = categories.results
    this.categoriesCount = categories.count
    this.pages = categories.pages
    this.currentPage = page
  },

  data() {
    return {
      categories: [],
      categoriesCount: 0,
      pages: {},
      currentPage: 0
    }
  },

  // Watch URL query for pagination changes (triggers fetch method again)
  // https://nuxtjs.org/api/pages-watchquery/
  watchQuery: ['page']
}
</script>
