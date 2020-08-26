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
              <li
                v-for="(filter, i) in activeFilters"
                :key="`active-category-${filter.id}-${filter.value}`"
                class="active-filter rounded label-sm-bold"
              >
                <span class="mr-3">{{ filterLabel(filter.id, filter.value) }}</span
                ><a href="#" @click.prevent="removeFilter(filter.id, filter.value)"
                  ><svg class="w-2 h-2"><use xlink:href="#cross-sm" /></svg
                ></a>
              </li>
              <!-- TODO: Color attributes
              <li
                v-for="(color, i) in activeColorFilters"
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
              -->
            </ul>
          </div>
        </div>

        <div class="pt-6 pb-10 px-6">
          <div v-for="filter of filters">
            <span class="label-xs-bold-faded uppercase">{{ filter.label }}</span>
            <div v-if="filter.type === 'range'" class="w-full pt-4 pb-10">
              <RangeSlider
                :min="filter.options[0].value"
                :max="filter.options[1].value"
                :interval="filter.interval"
              />
            </div>
            <div v-else class="pt-4 pb-8">
              <InputSelect :options="filter.options" type="checkbox" @input="selectFilter" />
            </div>
          </div>

          <!-- TODO: Colors
          <span class="label-xs-bold-faded uppercase">Color</span>
          <ColorFilter v-model="activeFilters.colors" class="flex pt-4 pb-8" :colors="colors" />
          -->

          <!-- TODO: Sizes
          <span class="label-xs-bold-faded uppercase">Size</span>
          <InputSelect
            v-model="activeFilters.sizes"
            class="flex pt-4 pb-8"
            :options="sizes"
            type="checkbox"
            styling="box"
          />
          -->

          <!--
          <button
            class="w-full px-6 py-3 uppercase tracking-wide bg-primary-darkest text-primary-lighter label-sm-bold rounded"
            type="button"
          >
            Apply filters
          </button>
          -->
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import find from 'lodash/find'
import { mapState } from 'vuex'

export default {
  name: 'ProductFilter',

  props: {
    filters: {
      type: Array,
      default: () => []
    }
  },

  // TODO Temp data, remove later.
  data() {
    return {
      // showFilter: false, // TODO move to content settings
      activeFilters: []
    }
  },

  computed: {
    ...mapState(['productFilterIsActive']),
    filterCount() {
      return this.activeFilters.length
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
      this.activeFilters = []
      this.$emit('change', this.activeFilters)
    },
    selectFilter(option) {
      const active = find(this.activeFilters, { value: option.value })
      if (active) {
        this.removeFilter(active.id, option.value)
      } else {
        for (let filter of this.filters) {
          if (filter.options) {
            for (let filterOption of filter.options) {
              if (filterOption.value === option.value) {
                this.activeFilters.push({
                  id: filter.id,
                  label: filter.label,
                  value: option.value
                })
                this.$emit('change', this.activeFilters)
                return
              }
            }
          }
        }
      }
    },
    removeFilter(id, value) {
      this.activeFilters = this.activeFilters.filter(
        filter => filter.id !== id || filter.value !== value
      )
      this.$emit('change', this.activeFilters)
    },
    filterLabel(id, value) {
      return find(find(this.filters, { id }).options, { value }).label
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
