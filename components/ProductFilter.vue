<template>
  <transition name="filter" :duration="700">
    <div class="z-50 fixed inset-0">
      <!-- Overlay -->
      <div
        ref="overlay"
        class="overlay absolute w-full h-full bg-primary-darker opacity-50 hidden md:block"
        @click="$emit('click-close')"
      ></div>

      <!-- Filter Panel -->
      <div
        ref="panel"
        class="panel absolute w-full h-full left-0 bg-primary-lightest overflow-scroll md:max-w-112"
      >
        <div class="flex items-center p-6">
          <span class="text-lg font-bold">Filter</span>
          <a class="ml-auto" href="#" @click="$emit('click-close')">
            <svg class="w-5 h-5"><use xlink:href="#cross-lg" /></svg>
          </a>
        </div>
        <!-- Active Filters -->
        <div
          ref="activeFilters"
          class="bg-primary-lighter border-primary-light max-h-0 overflow-hidden"
          :class="{ 'border-t': !filterCount, 'border-t border-b': filterCount }"
        >
          <div ref="activeFiltersContent" class="flex flex-wrap items-center  py-4 px-6">
            <span class="text-primary-dark">{{ filterCount }} filters active</span>
            <a class="flex ml-auto" href="#" @click="clearFilters()">
              <span class="label-sm-bold pr-2">Clear all</span>
              <span class="relative inline-block w-6 h-6 rounded-full bg-primary-light">
                <svg class="absolute w-2 h-2 center-xy"><use xlink:href="#cross-sm" /></svg>
              </span>
            </a>

            <ul class="w-full flex flex-wrap pt-3">
              <!-- Active Categories -->
              <li
                v-for="(category, i) in activeFilters.categories"
                :key="`active-category-${i}`"
                class="active-filter rounded label-sm-bold"
              >
                <span class="mr-3">{{ category }}</span
                ><a href="#" @click.prevent="removeFilter('categories', category)"
                  ><svg class="w-2 h-2"><use xlink:href="#cross-sm" /></svg
                ></a>
              </li>
              <!-- Active Colors -->
              <li
                v-for="(color, i) in activeFilters.colors"
                :key="`active-color-${i}`"
                class="active-filter rounded-full label-sm-bold"
              >
                <span
                  class="block rounded-full w-4 h-4 -ml-1 mr-2"
                  :style="{ backgroundColor: color.hex }"
                />
                <span class="mr-3">{{ color.name }}</span
                ><a href="#" @click.prevent="removeFilter('colors', color.name)"
                  ><svg class="w-2 h-2"><use xlink:href="#cross-sm" /></svg
                ></a>
              </li>
              <!-- Active Sizes -->
              <li
                v-for="(size, i) in activeFilters.sizes"
                :key="`active-size-${i}`"
                class="active-filter rounded label-sm-bold"
              >
                <span class="mr-3">{{ size }}</span
                ><a href="#" @click.prevent="removeFilter('sizes', size)"
                  ><svg class="w-2 h-2"><use xlink:href="#cross-sm" /></svg
                ></a>
              </li>
              <!-- Active Price Range -->
              <li
                v-if="
                  priceRange.values[0] > priceRange.min || priceRange.values[1] < priceRange.max
                "
                class="active-filter rounded label-sm-bold"
              >
                <span class="mr-3">${{ priceRange.values[0] }} - ${{ priceRange.values[1] }}</span
                ><svg class="w-2 h-2"><use xlink:href="#cross-sm" /></svg>
              </li>
            </ul>
          </div>
        </div>

        <div class="pt-6 pb-10 px-6">
          <!-- Price Range -->
          <span class="label-xs-bold-faded uppercase">Price</span>
          <div class="w-full pt-4 pb-10">
            <RangeSlider
              v-model="priceRange.values"
              :min="priceRange.min"
              :max="priceRange.max"
              :interval="priceRange.interval"
            />
          </div>

          <!-- Categories -->
          <span class="label-xs-bold-faded uppercase">Category</span>
          <div class="pt-4 pb-8">
            <InputSelect v-model="activeFilters.categories" :options="categories" type="checkbox" />
          </div>

          <!-- Colors -->
          <span class="label-xs-bold-faded uppercase">Color</span>
          <ColorFilter v-model="activeFilters.colors" class="flex pt-4 pb-8" :colors="colors" />

          <!-- Size -->
          <span class="label-xs-bold-faded uppercase">Size</span>
          <InputSelect
            v-model="activeFilters.sizes"
            class="flex pt-4 pb-8"
            :options="sizes"
            type="checkbox"
            styling="box"
          />

          <button
            class="w-full px-6 py-3 uppercase tracking-wide bg-primary-darkest text-primary-lighter label-sm-bold rounded"
            type="button"
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  name: 'ProductFilter',

  // TODO Temp data, remove later.
  data() {
    return {
      // sortMethod: 'Best selling', // TODO set first from content settings
      sortOptions: ['Best selling', 'Lowest to Highest ($)', 'Highest to Lowest ($)'], // TODO move to content settings
      // popularity asc, price desc, name asc, price asc
      // showFilter: false, // TODO move to content settings
      // filters: {} // TODO move to content settings
      activeFilters: {
        categories: [],
        colors: [],
        sizes: []
      },
      priceRange: {
        min: 10,
        max: 200,
        values: [10, 200],
        interval: 10
      },
      categories: [
        'Best sellers',
        'Suits',
        'Pants',
        'Shirts',
        'Shorts',
        'Sweats',
        'Outerwear',
        'Swimwear',
        'Underwear'
      ],
      colors: [
        {
          name: 'Maroon',
          hex: '#780116'
        },
        {
          name: 'Purple',
          hex: '#3e1559'
        },
        {
          name: 'Aqua',
          hex: '#21b1a6'
        },
        {
          name: 'Amber',
          hex: '#f7b538'
        },
        {
          name: 'Orange',
          hex: '#d8572a'
        }
      ],
      sizes: ['S', 'M', 'L', 'XL']
    }
  },

  computed: {
    ...mapState(['productFilterIsActive']),
    filterCount() {
      let count =
        this.activeFilters.categories.length +
        this.activeFilters.colors.length +
        this.activeFilters.sizes.length
      count +=
        this.priceRange.values[0] > this.priceRange.min ||
        this.priceRange.values[1] < this.priceRange.max
          ? 1
          : 0
      return count
    }
  },

  watch: {
    // change height of module when filters are added/removed
    filterCount: function(count) {
      if (count) this.expandActiveFilters()
      else this.closeActiveFilters()
    },
    // open filter
    productFilterIsActive(active) {
      if (active) this.openFilter()
    }
  },

  methods: {
    clearFilters() {
      this.activeFilters.categories = []
      this.activeFilters.sizes = []
      this.activeFilters.colors = []
      this.priceRange.values = [this.priceRange.min, this.priceRange.max]
    },
    removeFilter(type, value) {
      if (Array.isArray(this.activeFilters[type])) {
        this.activeFilters[type] = this.activeFilters[type].filter(filter => filter !== value)
      }

      if (type === 'colors') {
        for (let i = 0; i < this.activeFilters.colors.length; i++) {
          if (this.activeFilters.colors[i].name === value) {
            this.activeFilters.colors.splice(i, 1)
            break
          }
        }
      }
    },
    expandActiveFilters() {
      /* const container = this.$refs.activeFilters
      const contents = this.$refs.activeFiltersContent
      const tl = this.$anime.timeline()

      setTimeout(() => {
        const contentsHeight = contents.offsetHeight

        tl.add({
          targets: container,
          maxHeight: contentsHeight,
          duration: 300,
          easing: 'cubicBezier(0.6, 0.2, 0, 1)'
        })
      }, 20) */
    },
    closeActiveFilters() {
      /* const container = this.$refs.activeFilters
      const tl = this.$anime.timeline()

      setTimeout(() => {
        tl.add({
          targets: container,
          maxHeight: 0,
          duration: 600,
          easing: 'cubicBezier(0.6, 0.2, 0, 1)'
        })
      }, 20) */
    }
  }
}
</script>

<style lang="postcss" scoped>
.active-filter {
  @apply flex items-center bg-primary-light px-3 py-1 mb-2 mr-2;
}

.filter-enter-active .overlay,
.filter-leave-active .overlay {
  @apply transition-all duration-500 ease-in-out;
}

.filter-enter .overlay,
.filter-leave-to .overlay {
  @apply opacity-0;
}

.filter-enter-to .overlay,
.filter-leave .overlay {
  @apply opacity-50;
}

.filter-enter-active .panel,
.filter-leave-active .panel {
  @apply transition-all duration-700;
  transition-timing-function: cubic-bezier(0.6, 0.2, 0, 1);
}

.filter-enter .panel,
.filter-leave-to .panel {
  @apply transform -translate-x-full;
}

.filter-enter-to .panel,
.filter-leave .overlay {
  @apply transform translate-x-0;
}
</style>
