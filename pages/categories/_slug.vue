<template>
  <main class="">
    <!-- Product Filter -->
    <FilterPanel
      v-show="filterModalIsVisible"
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
        :style="{ opacity: category.images ? settings.darkenHeroImage / 100 : 1 }"
        class="absolute w-full h-full inset-0 bg-primary-darkest"
      ></div>
      <div v-if="category" class="container absolute text-center center-xy">
        <h1 class="text-primary-lightest">{{ category.name }}</h1>
        <div
          class="mx-auto text-lg text-primary-lightest max-w-128"
          v-html="category.description"
        ></div>
      </div>
    </section>

    <div class="container pt-7 pb-4">
      <!-- Category name & description -->
      <div v-if="!category && $fetchState.pending" class="loader-el w-64 h-10 mt-2 mb-9"></div>
      <div v-else-if="settings.headingPosition !== 'hero_image'" class="mb-7">
        <h1>{{ category.name }}</h1>
        <div class="text-lg" v-html="category.description"></div>
      </div>

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
            class="w-6 h-6 flex justify-center items-center text-primary-lighter bg-accent rounded-full"
          >
            <span class="block text-2xs leading-none">{{ activeFilterCount }}</span>
          </div>
          <div v-show="!activeFilterCount">
            <BaseIcon icon="uil:filter" />
          </div>
          <span class="ml-1">Filters</span>
        </button>
        <span class="hidden ml-1 sm:inline">{{ productCountLabel }}</span>
        <!-- Sort -->
        <div class="ml-auto">
          <div class="flex items-center">
            <span class="pr-2">Sort&nbsp;</span>
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
      <div v-else-if="activeFilterCount > 0" class="py-16 bg-primary-lighter text-center rounded">
        <p>We couldn't find any products matching your criteria.</p>
        <button type="button" name="button" class="btn mt-4" @click="toggleFilterModal">
          Edit filters
        </button>
      </div>
      <div v-else class="py-16 bg-primary-lighter text-center rounded">
        <p>We couldn't find any products in this category.</p>
      </div>

      <!-- Category pagination controls -->
      <div v-if="pages" class="py-2 sm:py-4 md:py-6">
        <PaginationButtons :current-page="page" :pages="pages" />
      </div>
    </div>
  </main>
</template>

<script>
// Helpers
import get from 'lodash/get'
import isObject from 'lodash/isObject'
import pageMeta from '~/mixins/pageMeta'
import { getFilterStateFromQuery } from '~/modules/swell'

// Calculate product limit from category rows/cols
function getProductLimit(category) {
  return ~~get(category, 'content.productRows', 4) * ~~get(category, 'content.productCols', 6)
}

export default {
  name: 'CategoryDetailPage',
  mixins: [pageMeta],

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
      this.$nuxt.error({ statusCode: 404, message: 'Category not found' })
    }

    // Set limit from category settings
    this.limit = getProductLimit(category)

    // Fetch unfiltered products
    let products = await this.fetchProducts()

    // Set category and filter data
    this.category = category
    this.filters = $swell.products.filters(products)
    this.filterState = getFilterStateFromQuery($route.query, this.filters)

    // If there's a filter query, get filtered products
    if (this.activeFilterCount) {
      products = await this.fetchProducts(this.filterState, this.filters)
    }

    this.setProducts(products)
  },

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
      filterModalIsVisible: false
    }
  },

  computed: {
    settings() {
      return get(this, 'category.content', {})
    },
    activeFilterCount() {
      return Object.keys(this.filterState).length
    },
    productCountLabel() {
      const count = this.productsCount
      const isLoading = this.$fetchState.pending

      if (isLoading) {
        return ''
      } else if (count > 1) {
        return `${count} products`
      } else if (count > 0) {
        return '1 product'
      } else {
        return 'No products'
      }
    }
  },

  watch: {
    // Call the update method when the URL query changes
    '$route.query': 'updateProductsFiltered'
  },

  created() {
    this.sortModes = [
      {
        value: '',
        label: 'Latest'
      },
      {
        value: 'popularity',
        label: 'Best selling'
      },
      {
        value: 'price_asc',
        label: 'Price, low to high'
      },
      {
        value: 'price_desc',
        label: 'Price, high to low'
      }
    ]
  },

  methods: {
    fetchProducts(filterState) {
      const { $swell } = this
      return $swell.products.list({
        page: this.page,
        limit: this.limit,
        sort: this.sortMode,
        categories: this.slug,
        $filters: filterState
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
      this.updateRouteQuery({ ...this.filterState, sort: option.value })
    },
    updateRouteQuery(newQuery) {
      const { path, query: currentQuery } = this.$route
      const query = { ...currentQuery, ...newQuery }

      // Remove filters from merged query if not present in new query
      const currentFilterState = getFilterStateFromQuery(currentQuery, this.filters)
      const newFilterState = getFilterStateFromQuery(newQuery, this.filters)
      Object.keys(currentFilterState).map(key => {
        if (!newFilterState[key]) delete query[key]
      })

      this.$router.replace({ path, query }).catch(err => {
        // Avoid duplicate navigation error
        // TODO remove in Vue 3
      })
    }
  }
}
</script>
