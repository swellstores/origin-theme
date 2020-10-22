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
        <div class="flex items-center p-6 border-b border-primary-light">
          <h3>Refine results</h3>
          <button class="ml-auto" @click="$emit('click-close')">
            <BaseIcon icon="uil:times" size="lg" />
          </button>
        </div>

        <!-- Active Filters -->
        <div
          v-show="activeFilters.length"
          class="py-4 px-6 bg-primary-lighter border-b border-primary-light text-sm overflow-hidden"
        >
          <div class="flex items-center justify-between">
            <span class="text-primary-dark">{{ activeFilterCountLabel }}</span>
            <button class="font-semibold" @click="resetFilters">Clear all</button>
          </div>

          <ul class="w-full flex flex-wrap pt-3">
            <li v-for="filter in activeFilters" :key="'activefilter' + filter.id">
              <template v-if="filter.type === 'select'">
                <div
                  v-for="option in filter.options"
                  :key="'activeFilterOption' + option.label"
                  class="inline-flex items-center bg-primary-light px-1 py-1 mb-2 mr-2 rounded"
                >
                  <span class="mx-1">{{ option.label }}</span>
                  <button @click="updateFilter({ filter, optionValue: option.value })">
                    <BaseIcon icon="uil:times" size="sm" />
                  </button>
                </div>
              </template>
              <template v-else-if="filter.type === 'range'">
                <div class="inline-flex items-center bg-primary-light px-1 py-1 mb-2 mr-2 rounded">
                  <span class="mx-1">{{ activeRangeLabel(filter) }}</span>
                  <button @click="updateFilter({ filter })">
                    <BaseIcon icon="uil:times" size="sm" />
                  </button>
                </div>
              </template>
            </li>
            <!-- TODO: Color attributes
              <li
                v-for="(color, i) in activeColorFilters"
                :key="`active-color-${i}`"
                class="active-filter rounded-full text-sm font-semibold"
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

        <div class="p-6">
          <div v-for="filter in filters">
            <!-- Label -->
            <span class="label-xs-bold-faded uppercase">{{ filter.label }}</span>
            <!-- Range slider input -->
            <div v-if="filter.type === 'range'" class="w-full pt-4 pb-10">
              <RangeSlider
                :filter="filter"
                :filter-state="localFilterState"
                @change="updateFilter"
              />
            </div>
            <!-- Checkbox input -->
            <div v-else class="pt-4 pb-8">
              <InputSelect
                :filter="filter"
                :filter-state="localFilterState"
                type="checkbox"
                @change="updateFilter"
              />
            </div>
          </div>

          <!-- TODO: Colors
          <span class="label-xs-bold-faded uppercase">Color</span>
          <ColorFilter v-model="filterState.colors" class="flex pt-4 pb-8" :colors="colors" />
          -->

          <!-- TODO: Sizes
          <span class="label-xs-bold-faded uppercase">Size</span>
          <InputSelect
            v-model="filterState.sizes"
            class="flex pt-4 pb-8"
            :options="sizes"
            type="checkbox"
            styling="box"
          />
          -->

          <button class="btn btn--lg w-full" type="button" @click="applyFilters">
            Apply filters
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import { mergeFilterState, listActiveFilters } from '~/modules/swell'

export default {
  name: 'FilterPanel',

  props: {
    filters: {
      type: Array,
      default: () => []
    },
    filterState: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      localFilterState: {}
    }
  },

  computed: {
    activeFilters() {
      return listActiveFilters(this.filters, this.localFilterState)
    },
    activeFilterCountLabel() {
      const count = this.activeFilters.length
      return `${count} filter${count === 1 ? '' : 's'} active`
    }
  },

  created() {
    if (Object.keys(this.filterState).length) {
      this.localFilterState = this.filterState
    }
  },

  methods: {
    updateFilter({ filter, optionValue }) {
      this.localFilterState = mergeFilterState(this.localFilterState, filter, optionValue)
    },

    applyFilters() {
      this.$emit('change', this.localFilterState)
    },

    resetFilters() {
      this.localFilterState = {}
      this.$emit('change')
    },

    activeRangeLabel(filter) {
      const [lower, upper] = filter.options
      const prefix = filter.id === 'price' ? '$' : ''
      return prefix + lower.label + '–' + upper.label
    }
  }
}
</script>

<style lang="postcss" scoped>
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
