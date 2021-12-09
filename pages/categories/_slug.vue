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
        class="absolute inset-0 w-full h-full bg-primary-darkest"
      />
      <div v-if="category" class="container absolute text-center center-xy">
        <h1
          :class="{
            'text-primary-lightest': settings.textColor === 'light',
            'text-primary-darkest': settings.textColor === 'dark',
          }"
        >
          {{ category.name }}
        </h1>
        <div
          class="mx-auto text-lg max-w-128"
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
          class="w-64 h-10 mt-2 loader-el mb-9"
        />
        <div v-else-if="settings.headingPosition !== 'hero_image'" class="mb-7">
          <h1>{{ category.name }}</h1>
          <div class="text-lg" v-html="category.description" />
        </div>
      </template>

      <!-- Product filtering & sorting controls -->
      <aside class="flex items-center mb-6 text-sm">
        <!-- Filter -->
        <button
          v-if="filters.length > 0"
          class="inline-flex items-center"
          @click="toggleFilterModal()"
        >
          <div
            v-show="activeFilterCount"
            class="flex items-center justify-center w-6 h-6 rounded-full  text-primary-lighter bg-accent-default"
          >
            <span class="block leading-none text-2xs">{{
              activeFilterCount
            }}</span>
          </div>
          <div v-show="!activeFilterCount">
            <BaseIcon icon="uil:filter" />
          </div>
          <span class="ml-1">{{ $t('categories.slug.filters') }}</span>
        </button>
        <span class="hidden ml-1 sm:inline">{{
          $fetchState.pending
            ? ''
            : $tc('categories.slug.productsCount', productsCount, {
                count: productsCount,
              })
        }}</span>
        <!-- Sort -->
        <div class="ml-auto">
          <div class="flex items-center">
            <span class="pr-2">{{ $t('categories.slug.sort') }}&nbsp;</span>
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
        class="py-16 text-center rounded bg-primary-lighter"
      >
        <p>{{ $t('categories.slug.filterProductsNotFound') }}</p>
        <BaseButton
          class="mt-4"
          appearance="light"
          fit="static"
          :label="$t('categories.slug.editFilters')"
          @click.native="toggleFilterModal"
        />
      </div>
      <div v-else class="py-16 text-center rounded bg-primary-lighter">
        <p>{{ $t('categories.slug.categoryProductsNotFound') }}</p>
      </div>

      <!-- Category pagination controls -->
      <div v-if="pages" class="py-2 sm:py-4 md:py-6">
        <PaginationButtons
          :current-page="page"
          :pages="pages"
          :appearance="paginationStyle"
        />
      </div>
    </div>
  </main>
</template>

<script>
// Helpers
import get from 'lodash/get'
import { mapState } from 'vuex'
import pageMeta from '~/mixins/pageMeta'
import { getFilterStateFromQuery } from '~/modules/swell'

// Calculate product limit from category rows/cols
function getProductLimit(category) {
  return (
    ~~get(category, 'content.productRows', 4) *
    ~~get(category, 'content.productCols', 6)
  )
}

export default {
  name: 'CategoryDetailPage',
  mixins: [pageMeta],

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
    }
  },

  async fetch() {
    const { $swell, $route } = this
    this.slug = $route.params.slug

    // Parse URL query params
    this.page = parseInt($route.query.page) || 1
    this.sortMode = $route.query.sort || ''

    // Set data for the skeleton loader (as many products as we're going to fetch)
    this.products = [...Array(this.limit).keys()].map(() => ({}))

    // First fetch both the category and unfiltered products (so we get a complete list of filters)
    const category = await $swell.categories.get(this.slug)

    // Show 404 if category isn't found
    if (!category) {
      this.$nuxt.error({
        statusCode: 404,
        message: this.$t('errors.categoryNotFound'),
      })
    }

    // Set limit from category settings
    this.limit = getProductLimit(category)

    // Fetch unfiltered products
    let products = await this.fetchProducts()

    // Set category and filter data
    this.category = category
    this.filters = await $swell.products.filterableAttributeFilters(products)
    this.filterState = getFilterStateFromQuery($route.query, this.filters)

    // If there's a filter query, get filtered products
    if (this.activeFilterCount) {
      products = await this.fetchProducts(this.filterState, this.filters)
    }

    this.setProducts(products)
    this.paginationStyle = get(category, 'content.paginationStyle')
  },

  computed: {
    ...mapState(['currency']),
    settings() {
      return get(this, 'category.content', {})
    },
    activeFilterCount() {
      return Object.keys(this.filterState).length
    },
  },

  watch: {
    // Call the update method when the URL query changes
    '$route.query': 'updateProductsFiltered',
  },

  created() {
    this.sortModes = [
      {
        value: '',
        label: this.$t('categories.slug.sortModes.latest'),
      },
      {
        value: 'popularity',
        label: this.$t('categories.slug.sortModes.popularity'),
      },
      {
        value: 'price_asc',
        label: this.$t('categories.slug.sortModes.priceAsc'),
      },
      {
        value: 'price_desc',
        label: this.$t('categories.slug.sortModes.priceDesc'),
      },
    ]
  },

  methods: {
    fetchProducts(filterState) {
      const { $swell, page, limit, sortMode, slug } = this
      return $swell.products.list({
        page,
        limit,
        sort: typeof sortMode.value === 'undefined' ? sortMode : sortMode.value,
        categories: slug,
        $filters: filterState,
        expand: ['variants'],
      })
    },
    setProducts(products) {
      this.pages = products.pages
      this.products = products.results
      this.productsCount = products.count
    },
    async updateProductsFiltered() {
      const { $route } = this
      // Parse URL query params
      this.page = parseInt($route.query.page) || 1
      this.sortMode = $route.query.sort || ''
      this.filterState = getFilterStateFromQuery($route.query, this.filters)
      const products = await this.fetchProducts(this.filterState, this.filters)
      this.setProducts(products)
    },
    toggleFilterModal() {
      this.filterModalIsVisible = !this.filterModalIsVisible
    },
    updateFilters(filterState) {
      this.updateRouteQuery(filterState)
      this.toggleFilterModal()
    },
    updateSortMode(option) {
      this.updateRouteQuery({
        ...this.filterState,
        sort: typeof option.value === 'undefined' ? option : option.value,
      })
    },
    updateRouteQuery(newQuery) {
      const { path, query: currentQuery } = this.$route
      const query = { ...currentQuery, ...newQuery }

      // Remove filters from merged query if not present in new query
      const currentFilterState = getFilterStateFromQuery(
        currentQuery,
        this.filters
      )
      const newFilterState = getFilterStateFromQuery(newQuery, this.filters)

      Object.keys(currentFilterState).forEach((key) => {
        if (!newFilterState[key]) delete query[key]
      })

      if (!query.sort) delete query.sort

      this.$router.replace({ path, query }).catch((_err) => {
        // Avoid duplicate navigation error
        // TODO remove in Vue 3
      })
    },
  },
}
</script>
