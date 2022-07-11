<template>
  <main>
    <SectionCollectionPreview
      v-for="category in categories"
      :key="category.id"
      v-bind="category"
      :category-id="category.id"
    />
  </main>
</template>

<script>
// Helpers
import pageMeta from '~/mixins/pageMeta';
import refetchCurrencyMixin from '~/modules/swell/mixins/refetchCurrency';

export default {
  name: 'CategoryIndexPage',
  mixins: [pageMeta, refetchCurrencyMixin],

  data() {
    return {
      categories: [],
      categoriesCount: 0,
      pages: {},
      currentPage: 0,
    };
  },

  async fetch() {
    const { $swell, $route } = this;
    const page = parseInt($route.query.page) || 1;

    // Set preload data
    this.categories = [...Array(5).keys()].map(() => ({}));

    // Fetch all categories
    const categories = await $swell.categories.list();

    // Set component data
    if (categories) {
      this.categories = categories.results;
      this.categoriesCount = categories.count;
      this.pages = categories.pages;
      this.currentPage = page;
    }
  },

  // Watch URL query for pagination changes (triggers fetch method again)
  // https://nuxtjs.org/api/pages-watchquery/
  watchQuery: ['page'],
};
</script>
