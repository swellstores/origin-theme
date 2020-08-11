<template>
  <main class="">
    <!-- Product Filter -->
    <ProductFilter v-show="filterModalIsActive" @click-close="toggleFilter()" />

    <!-- Hero image with heading -->
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
      <!-- Heading -->
      <div v-if="$fetchState.pending" class="loader-el w-64 h-10 mt-2 mb-9"></div>
      <div v-else-if="settings.headingPosition !== 'hero_image'" class="mb-7">
        <h1>{{ category.name }}</h1>
        <div class="text-lg" v-html="category.description"></div>
      </div>

      <!-- Filter & sort controls -->
      <aside class="flex items-center text-sm">
        <div>
          <!-- Filter -->
          <a href="#" @click="toggleFilter()">
            <div class="inline-block relative -mb-1 mr-px">
              <BaseIcon icon="uil:filter" />
              <span
                class="absolute top-0 left-0 w-2 h-2 -ml-px -mt-px rounded-full bg-accent"
              ></span>
            </div>
            <span>Filter&nbsp;</span>
          </a>
          <span>{{ filterLabel }}</span>
        </div>
        <!-- Sort -->
        <div class="ml-auto">
          <div class="flex items-center">
            <span class="pr-2">Sort&nbsp;</span>
            <InputDropdown class="w-48" />
          </div>
        </div>
      </aside>

      <!-- Product previews -->
      <ProductListing :products="products" />

      <!-- Pagination controls -->
      <div v-if="pages" class="py-2 sm:py-4 md:py-6">
        <PaginationButtons :current-page="currentPage" :pages="pages" />
      </div>
    </div>
  </main>
</template>

<script>
// Helpers
import get from 'lodash/get'

export default {
  name: 'CategoryDetailPage',

  async fetch() {
    const { $swell, $route } = this
    const slug = $route.params.slug
    const page = parseInt($route.query.page) || 1
    const limit = 24

    // Set preload data
    this.products = [...Array(limit).keys()].map(() => ({}))

    // Fetch category and products assigned to category
    const [category, products] = await Promise.all([
      $swell.categories.get(slug),
      $swell.products.list({ page, limit, category: slug })
    ])

    // Show 404 if category isn't found
    if (!category) {
      this.$nuxt.error({ statusCode: 404, message: 'Category not found' })
    }

    // Set component data
    this.category = category
    this.products = products.results
    this.productsCount = products.count
    this.pages = products.pages
    this.currentPage = page
  },

  data() {
    return {
      category: {},
      products: [],
      productsCount: 0,
      pages: {},
      currentPage: 0,
      filterModalIsActive: false
    }
  },

  computed: {
    settings() {
      return get(this, 'category.content', {})
    },
    filtersAreActive() {
      return false
    },
    filterLabel() {
      if (!this.productsCount) return ''

      if (this.filtersAreActive) {
        return `1 of ${this.productsCount}`
      } else {
        return `${this.productsCount} items`
      }
    }
  },

  methods: {
    toggleFilter() {
      this.filterModalIsActive = !this.filterModalIsActive
    }
  },

  // Watch URL query for pagination changes (triggers fetch method again)
  // https://nuxtjs.org/api/pages-watchquery/
  watchQuery: ['page']
}
</script>
