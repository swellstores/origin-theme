<template>
  <transition name="slide-modal-ltr" :duration="700">
    <div class="fixed inset-0 z-50">
      <!-- Overlay -->
      <div
        class="overlay absolute hidden h-full w-full bg-primary-darker opacity-50 md:block"
        @click="$emit('click-close')"
      />

      <!-- Filter Panel -->
      <div
        class="panel absolute left-0 h-full w-full overflow-scroll bg-primary-lightest md:max-w-112"
      >
        <div class="flex items-center border-b border-primary-light p-6">
          <h3>{{ $t('categories._slug.refine') }}</h3>
          <button class="ml-auto" @click="$emit('click-close')">
            <BaseIcon icon="uil:times" size="lg" />
          </button>
        </div>

        <!-- Active Filters -->
        <div
          v-show="activeFilters.length"
          class="overflow-hidden border-b border-primary-light bg-primary-lighter py-4 px-6 text-sm"
        >
          <div class="flex items-center justify-between">
            <span class="text-primary-dark">{{ activeFilterCountLabel }}</span>
            <button class="font-semibold" @click="resetFilters">
              {{ $t('categories._slug.clear') }}
            </button>
          </div>

          <ul class="flex w-full flex-wrap pt-3">
            <li
              v-for="filter in activeFilters"
              :key="'activefilter' + filter.id"
            >
              <template v-if="filter.type === 'select'">
                <div
                  v-for="option in filter.options"
                  :key="'activeFilterOption' + option.label"
                  class="mb-2 mr-2 inline-flex items-center rounded bg-primary-light px-1 py-1"
                >
                  <span class="mx-1">{{ option.label }}</span>
                  <button
                    @click="updateFilter({ filter, optionValue: option.value })"
                  >
                    <BaseIcon icon="uil:times" size="sm" />
                  </button>
                </div>
              </template>
              <template v-else-if="filter.type === 'range'">
                <div
                  class="mb-2 mr-2 inline-flex items-center rounded bg-primary-light px-1 py-1"
                >
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
          <div v-for="filter in filters" :key="filter.id">
            <!-- Label -->
            <span class="label-xs-bold-faded uppercase">{{
              filter.label
            }}</span>
            <!-- Price range slider input -->
            <div v-if="filter.type === 'range'" class="w-full pt-4 pb-10">
              <RangeSlider
                :show="show"
                :filter="filter"
                :filter-state="localFilterState"
                :is-price="filter.id === 'price'"
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

          <BaseButton
            appearance="dark"
            size="lg"
            :label="$t('categories._slug.apply')"
            @click.native="applyFilters"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import { mapState } from 'vuex';
import { mergeFilterState } from '~/modules/swell/utils/mergeFilterState';
import { listActiveFilters } from '~/modules/swell/utils/listActiveFilters';

export default {
  name: 'FilterPanel',

  props: {
    filters: {
      type: Array,
      default: () => [],
    },
    filterState: {
      type: Object,
      default: () => ({}),
    },
    show: Boolean,
  },

  data() {
    return {
      localFilterState: {},
    };
  },

  computed: {
    ...mapState(['currency']),

    currencyObj() {
      return this.$swell.currency.get(this.currency);
    },

    activeFilters() {
      return listActiveFilters(this.filters, this.localFilterState);
    },

    activeFilterCountLabel() {
      const count = this.activeFilters.length;
      return `${count} filter${count === 1 ? '' : 's'} active`;
    },
  },

  created() {
    if (Object.keys(this.filterState).length) {
      this.localFilterState = this.filterState;
    }
  },

  methods: {
    updateFilter({ filter, optionValue }) {
      this.localFilterState = mergeFilterState(
        this.localFilterState,
        filter,
        optionValue,
      );
    },

    applyFilters() {
      this.$emit('change', this.localFilterState);
    },

    resetFilters() {
      this.localFilterState = {};
      this.$emit('change');
    },

    activeRangeLabel(filter) {
      const [lower, upper] = filter.options;

      let lowerLabel = lower.label;
      let upperLabel = upper.label;

      if (filter.id === 'price') {
        if (!this.currency) return lowerLabel + ' – ' + upperLabel;

        const { rate } = this.currencyObj;
        const lowerPrice = rate ? lower.value * rate : lower.value;
        const upperPrice = rate ? upper.value * rate : upper.value;

        lowerLabel = this.formatMoney(lowerPrice, this.currency);
        upperLabel = this.formatMoney(upperPrice, this.currency);
      }

      return lowerLabel + ' – ' + upperLabel;
    },
  },
};
</script>
