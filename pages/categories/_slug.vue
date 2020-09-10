<template>
  <main class="">
    <!-- Product Filter -->
    <ProductFilter
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
      <aside class="flex items-center text-sm">
        <!-- Filter -->
        <button class="flex items-center" @click="toggleFilterModal()">
          <div
            v-if="activeFilterCount"
            class="w-6 h-6 flex justify-center items-center text-primary-lighter bg-accent rounded-full"
          >
            <span class="block mt-px text-2xs leading-none">{{ activeFilterCount }}</span>
          </div>
          <div v-else>
            <BaseIcon icon="uil:filter" />
          </div>
          <span class="ml-1">Filter</span>
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
      <ProductPreviews :products="products" />

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
import qs from 'qs'

// Convert filter state object to array for passing to products.list as $filters
function getFilterList(filterState, filters) {
  return Object.keys(filterState).reduce(($filters, id) => {
    const value = filterState[id]
    const filter = filters.find(f => f.id === id)
    const arrayedTypes = ['select']

    if (arrayedTypes.includes(filter.type)) {
      value.map(v => $filters.push({ id, value: v }))
    } else {
      $filters.push({ id, value })
    }

    return $filters
  }, [])
}

// Return a filter state object with active filter IDs and values
function getFilterStateFromQuery(query, filters) {
  const queryKeys = Object.keys(query)
  const filterState = {}
  const arrayedTypes = ['select']

  // Go through filters and check if there's a matching query param
  if (Array.isArray(filters)) {
    filters.map(({ id, type }) => {
      if (queryKeys.includes(id)) {
        const queryValue = query[id]
        const useArray = arrayedTypes.includes(type) && !Array.isArray(queryValue)
        filterState[id] = useArray ? [queryValue] : queryValue
      }
    })
  }

  return filterState
}

export default {
  name: 'CategoryDetailPage',

  async fetch() {
    const { $swell, $route } = this
    const slug = $route.params.slug

    // Parse URL query params
    this.page = parseInt($route.query.page) || 1
    this.sortMode = $route.query.sort || ''

    // Set data for the skeleton loader (as many products as we're going to fetch)
    this.products = [...Array(this.limit).keys()].map(() => ({}))

    const fetchProducts = (filterState, filters) =>
      $swell.products.list({
        page: this.page,
        limit: this.limit,
        sort: this.sortMode,
        categories: slug,
        $filters: filterState ? getFilterList(filterState, filters) : []
      })

    const setProducts = products => {
      this.pages = products.pages
      this.products = products.results
      this.productsCount = products.count
    }

    // If category data doesn't exist, this is our first page load, so we need to fetch
    // both the category and unfiltered products (so we get a complete list of filters).
    if (!this.category) {
      // Fetch category and products
      let [category, products] = await Promise.all([$swell.categories.get(slug), fetchProducts()])

      // Show 404 if category isn't found
      if (!category) {
        this.$nuxt.error({ statusCode: 404, message: 'Category not found' })
      }

      // Set category and filter data
      this.category = category
      this.filters = $swell.products.filters(products)
      this.filterState = getFilterStateFromQuery($route.query, this.filters)

      // If there's a filter query, get filtered products
      if (this.activeFilterCount) {
        products = await fetchProducts(this.filterState, this.filters)
      }

      setProducts(products)
    } else {
      // Fetch products with filters applied
      this.filterState = getFilterStateFromQuery($route.query, this.filters)
      const products = await fetchProducts(this.filterState, this.filters)

      setProducts(products)
    }
  },

  data() {
    return {
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
    activeFilterCount() {
      return Object.keys(this.filterState).length
    },
    settings() {
      return get(this, 'category.content', {})
    },
    productCountLabel() {
      const count = this.productsCount

      if (count > 1) {
        return `${count} products`
      } else if (count > 0) {
        return '1 product'
      } else {
        return 'No products'
      }
    }
  },

  watch: {
    // Call the fetch method when the URL query changes
    '$route.query': '$fetch'
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
    toggleFilterModal() {
      this.filterModalIsVisible = !this.filterModalIsVisible
    },
    updateFilters(filterState) {
      this.updateQueryString(filterState)
      this.toggleFilterModal()
    },
    updateSortMode(option) {
      this.updateQueryString({ sort: option.value })
    },
    updateQueryString(newQuery) {
      const { name, params, query: currentQuery } = this.$route
      const query = { ...currentQuery, ...newQuery }

      // Remove all filter query properties if newQuery is empty
      // TODO do this in a less magical way so the filter reset logic is more obvious
      if (!newQuery || !Object.keys(newQuery).length) {
        const currentQueryFilterState = getFilterStateFromQuery(currentQuery, this.filters)
        Object.keys(currentQueryFilterState).map(key => delete query[key])
      }

      // Update the URL if the resulting query is different
      if (JSON.stringify(currentQuery) !== JSON.stringify(query)) {
        this.$router.replace({ name, params, query })
      }
    }
  }
}
</script>
