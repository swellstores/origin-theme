<template>
  <ClientOnly>
    <div>
      <VueSlider
        ref="slider"
        v-model="value"
        :min="slider.minValue"
        :max="slider.maxValue"
        :step="slider.interval"
        :lazy="true"
        :formatter="'{value}'"
        :dot-size="20"
        tooltip-dir="bottom"
        process-class="!bg-primary-darkest"
        @callback="updateValue(value)"
      >
        <template #dot="{ focus }">
          <div :class="['custom-dot', { focus }]" />
        </template>

        <template #tooltip="{ value: rangeValue }">
          <div class="label-sm">
            {{ formatTooltip(rangeValue) }}
          </div>
        </template>
      </VueSlider>
    </div>
  </ClientOnly>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  name: 'RangeSlider',

  components: {
    VueSlider: () => {
      if (process.client) return import('vue-slider-component')
    },
  },

  props: {
    filter: {
      type: Object,
      default: () => ({}),
    },
    filterState: {
      type: Object,
      default: () => ({}),
    },
    isPrice: {
      type: Boolean,
      default: false,
    },
    withIntervals: {
      type: Boolean,
      default: false,
    },
    show: Boolean,
  },

  data() {
    return {
      value: [0, 1],
    }
  },

  computed: {
    ...mapState(['currency']),

    slider() {
      const { filter, withIntervals } = this
      const [min, max] = filter.options
      let minValue = min.value
      let maxValue = max.value
      let interval = Math.ceil((maxValue - minValue || 1) / 10)

      if (withIntervals) {
        if (interval > 1000) {
          interval = 1000
        } else if (interval > 100) {
          interval = 100
        } else if (interval > 10) {
          interval = 10
        } else {
          interval = 1
        }

        if (maxValue % interval > 0) {
          maxValue = interval + maxValue - (maxValue % interval)
        }

        if (minValue % interval > 0) {
          minValue = minValue - (minValue % interval)
        }

        while (((maxValue - minValue) / interval) % 1 > 0) {
          maxValue++
        }
      }

      return {
        minValue,
        maxValue,
        interval,
      }
    },
  },

  watch: {
    filterState: 'setValue',
    show(state) {
      if (state) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.slider?.refresh()
          }, 750)
        })
      }
    },
  },

  created() {
    this.setValue()
  },

  methods: {
    formatTooltip(value) {
      const { isPrice, currency, formatMoney } = this

      if (isPrice) {
        const { rate } = this.$swell.currency.get(currency)
        const price = rate ? value * rate : value

        return formatMoney(price, currency)
      }

      return value
    },

    setValue() {
      const [min, max] = this.filter.options
      const stateValue = this.filterState[this.filter.id]

      // Use the state value if it exists, otherwise the filter's min/max
      this.value = stateValue || [min.value, max.value]
    },

    updateValue(value) {
      const { filter } = this
      const [min, max] = filter.options
      let optionValue

      // If the value isn't the same as the filter's min/max, pass it on
      if (value[0] !== min.value || value[1] !== max.value) {
        optionValue = value
      }

      // Otherwise, don't pass anything so the filter gets removed
      this.$emit('change', { filter, optionValue })
    },
  },
}
</script>

<style lang="postcss" scoped>
.custom-dot {
  transition: all 0.3s;
  @apply h-full w-full rounded-full border border-primary-med bg-primary-lightest;

  &.focus {
    @apply border-primary-darkest;
  }
}
</style>
