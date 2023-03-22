<template>
  <main class="">
    <!-- Product Filter -->
    <FilterPanel
      v-show="filterModalIsVisible"
      :show="filterModalIsVisible"
      :filters="filters"
      :filter-state="filterState"
      @click-close="toggleFilterModal()"
      @change="updateFilters"
    />

    <!-- Category name & image -->
    <section v-if="settings.showHeroImage" class="relative">
      <div class="h-64 sm:h-72 md:h-80 lg:h-96 xl:h-112">
        <VisualMedia
          v-if="category && category.images"
          :source="category.images[0]"
          :is-background="true"
        />
      </div>
      <!-- Darkening overlay -->
      <div
        v-if="category && settings.darkenHeroImage"
        :style="{
          opacity: category.images ? settings.darkenHeroImage / 100 : 1,
        }"
        class="absolute inset-0 h-full w-full bg-primary-darkest"
      />
      <div v-if="category" class="center-xy container absolute text-center">
        <h1
          :class="{
            'text-primary-lightest': settings.textColor === 'light',
            'text-primary-darkest': settings.textColor === 'dark',
          }"
        >
          {{ category.name }}
        </h1>
        <div
          class="mx-auto max-w-128 text-lg"
          :class="{
            'text-primary-lightest': settings.textColor === 'light',
            'text-primary-darkest': settings.textColor === 'dark',
          }"
          v-html="category.description"
        />
      </div>
    </section>

    <div class="container pb-4 pt-7">
      <!-- Category name & description -->
      <template v-if="!settings.showHeroImage">
        <div
          v-if="!category && $fetchState.pending"
          class="loader-el mt-2 mb-9 h-10 w-64"
        />
        <div v-else-if="settings.headingPosition !== 'hero_image'" class="mb-7">
          <h1>{{ category && category.name }}</h1>
          <div class="text-lg" v-html="category && category.description" />
        </div>
      </template>

      <!-- Product filtering & sorting controls -->
      <aside class="mb-6 flex items-center text-sm">
        <!-- Filter -->
        <button
          v-if="filters.length > 0"
          class="inline-flex items-center"
          @click="toggleFilterModal()"
        >
          <div
            v-show="activeFilterCount"
            class="flex h-6 w-6 items-center justify-center rounded-full bg-accent-default text-primary-lighter"
          >
            <span class="block text-2xs leading-none">{{
              activeFilterCount
            }}</span>
          </div>
          <div v-show="!activeFilterCount">
            <BaseIcon icon="uil:filter" />
          </div>
          <span class="ml-1">{{ $t('categories._slug.filters') }}</span>
        </button>
        <span class="ml-1 hidden sm:inline">{{
          $fetchState.pending
            ? ''
            : $tc('categories._slug.productsCount', productsCount, {
                count: productsCount,
              })
        }}</span>
        <!-- Sort -->
        <div class="ml-auto">
          <div class="flex items-center">
            <span class="pr-2">{{ $t('categories._slug.sort') }}&nbsp;</span>
            <InputDropdown
              class="w-40"
              :options="sortModes"
              :value="sortMode"
              @change="updateSortMode"
            />
          </div>
        </div>
      </aside>

      <!-- Product previews -->
      <ProductPreviews
        v-if="products.length"
        :products="products"
        :column-count="settings.productCols"
      />
      <div
        v-else-if="activeFilterCount > 0"
        class="rounded bg-primary-lighter py-16 text-center"
      >
        <p>{{ $t('categories._slug.filterProductsNotFound') }}</p>
        <BaseButton
          class="mt-4"
          appearance="light"
          fit="static"
          :label="$t('categories._slug.editFilters')"
          @click.native="toggleFilterModal"
        />
      </div>
      <div v-else class="rounded bg-primary-lighter py-16 text-center">
        <p>{{ $t('categories._slug.categoryProductsNotFound') }}</p>
      </div>

      <!-- Category pagination controls -->
      <div v-if="pages" class="py-2 sm:py-4 md:py-6">
        <PaginationButtons
          :current-page="page"
          :pages="pages"
          :count="productsCount"
          :limit="limit"
          :appearance="paginationStyle"
        />
      </div>
    </div>
  </main>
</template>

<script>
// Helpers
import get from 'lodash/get';
import { mapState } from 'vuex';
import pageMeta from '~/mixins/pageMeta';
import { getFilterStateFromQuery } from '~/modules/swell/utils/getFilterStateFromQuery';
import refetchCurrencyMixin from '~/modules/swell/mixins/refetchCurrency';

// Calculate product limit from category rows/cols
function getProductLimit(category) {
  return (
    ~~get(category, 'content.productRows', 4) *
    ~~get(category, 'content.productCols', 6)
  );
}

export default {
  name: 'CategoryDetailPage',
  mixins: [pageMeta, refetchCurrencyMixin],

  data() {
    return {
      slug: undefined,
      category: undefined,
      products: undefined,
      productsCount: 0,
      filters: [],
      filterState: {},
      pages: {},
      page: 1,
      limit: 24,
      sortMode: '',
      filterModalIsVisible: false,
      paginationStyle: 'prevNext',
    };
  },

  async fetch() {
    const { $swell, $route } = this;
    this.slug = $route.params.slug;

    // Parse URL query params
    this.page = parseInt($route.query.page) || 1;
    this.sortMode = $route.query.sort || '';

    // Set data for the skeleton loader (as many products as we're going to fetch)
    this.products = [...Array(this.limit).keys()].map(() => ({}));

    // First fetch both the category and unfiltered products (so we get a complete list of filters)
    const category = await $swell.categories.get(this.slug);

    // Show 404 if category isn't found
    if (!category) {
      this.$nuxt.error({
        statusCode: 404,
        message: this.$t('errors.categoryNotFound'),
      });
    }

    // Set limit from category settings
    this.limit = getProductLimit(category);

    // Fetch unfiltered products
    let products = await this.fetchProducts();

    // Set category and filter data
    this.category = category;
    this.filters = await $swell.products.filterableAttributeFilters(products);
    this.filterState = getFilterStateFromQuery($route.query, this.filters);

    // If there's a filter query, get filtered products
    if (this.activeFilterCount) {
      products = await this.fetchProducts(this.filterState, this.filters);
    }

    this.setProducts(products);
    this.paginationStyle = get(category, 'content.paginationStyle');
  },

  computed: {
    ...mapState(['currency']),

    settings() {
      return get(this, 'category.content', {});
    },

    activeFilterCount() {
      return Object.keys(this.filterState).length;
    },
  },

  watch: {
    // Call the update method when the URL query changes
    '$route.query': 'updateProductsFiltered',
  },

  async mounted() {
    // Fetch filtered products on mount
    await this.updateProductsFiltered();
  },

  created() {
    this.sortModes = [
      {
        value: '',
        label: this.$t('categories._slug.sortModes.latest'),
      },
      {
        value: 'popularity',
        label: this.$t('categories._slug.sortModes.popularity'),
      },
      {
        value: 'price_asc',
        label: this.$t('categories._slug.sortModes.priceAsc'),
      },
      {
        value: 'price_desc',
        label: this.$t('categories._slug.sortModes.priceDesc'),
      },
    ];
  },

  methods: {
    fetchProducts(filterState) {
      const { $swell, page, limit, sortMode, slug } = this;
      return $swell.products.list({
        page,
        limit: limit <= 100 ? limit : 100,
        sort: typeof sortMode.value === 'undefined' ? sortMode : sortMode.value,
        categories: slug,
        $filters: filterState,
        expand: ['variants'],
        $currency: $swell.currency.list().map((currency) => currency.code),
      });
    },

    setProducts(products) {
      this.pages = products.pages;
      this.products = products.results;
      this.productsCount = products.count;
    },

    async updateProductsFiltered() {
      const { $route } = this;
      // Parse URL query params
      this.page = parseInt($route.query.page) || 1;
      this.sortMode = $route.query.sort || '';
      this.filterState = getFilterStateFromQuery($route.query, this.filters);
      const products = await this.fetchProducts(this.filterState, this.filters);
      this.setProducts(products);
    },

    toggleFilterModal() {
      this.filterModalIsVisible = !this.filterModalIsVisible;
    },

    updateFilters(filterState) {
      this.updateRouteQuery(filterState);
      this.toggleFilterModal();
    },

    updateSortMode(option) {
      this.updateRouteQuery({
        ...this.filterState,
        sort: typeof option.value === 'undefined' ? option : option.value,
      });
    },

    updateRouteQuery(newQuery) {
      const { path, query: currentQuery } = this.$route;
      const query = { ...currentQuery, ...newQuery };

      // Remove filters from merged query if not present in new query
      const currentFilterState = getFilterStateFromQuery(
        currentQuery,
        this.filters,
      );
      const newFilterState = getFilterStateFromQuery(newQuery, this.filters);

      Object.keys(currentFilterState).forEach((key) => {
        if (!newFilterState[key]) delete query[key];
      });

      if (!query.sort) delete query.sort;

      this.$router.replace({ path, query }).catch((_err) => {
        // Avoid duplicate navigation error
        // TODO remove in Vue 3
      });
    },
  },
};
</script>
