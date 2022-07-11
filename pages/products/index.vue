<template>
  <main class="">
    <div class="container pt-7 pb-4">
      <ProductPreviews :products="products" />
    </div>
  </main>
</template>

<script>
import refetchCurrencyMixin from '~/modules/swell/mixins/refetchCurrency';

export default {
  name: 'ProductIndexPage',
  mixins: [refetchCurrencyMixin],

  data() {
    return {
      products: [],
      productCount: 0,
      pages: {},
      currentPage: 0,
      settings: {
        productCols: 3,
      },
    };
  },

  async fetch() {
    const { $swell, $route } = this;
    const page = parseInt($route.query.page) || 1;
    const limit = parseInt($route.query.limit) || 24;

    // Set preload data
    this.products = [...Array(limit).keys()];

    // Fetch all products
    const products = await $swell.products.list({
      page,
      limit,
      expand: ['variants'],
      $currency: $swell.currency.list().map((currency) => currency.code),
    });

    // Set component data
    if (products) {
      this.products = products.results;
      this.productCount = products.count;
      this.pages = products.pages;
      this.currentPage = page;
    }
  },

  // Watch URL query for pagination changes (triggers fetch method again)
  // https://nuxtjs.org/api/pages-watchquery/
  watchQuery: ['page'],
};
</script>
