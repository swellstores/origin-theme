<template>
  <div>
    <ClientOnly>
      <vue-slider
        v-model="value"
        :value="value"
        :min="slider.minValue"
        :max="slider.maxValue"
        :interval="filter.interval"
        :clickable="false"
        tooltip="always"
        tooltip-placement="bottom"
        :tooltip-formatter="'${value}'"
        :process-style="slider.processStyle"
        :rail-style="slider.railStyle"
        :dot-size="20"
        @change="updateValue(value)"
      >
        <template v-slot:dot="{ focus }">
          <div :class="['custom-dot', { focus }]"></div>
        </template>

        <template v-slot:tooltip="{ value: rangeValue }">
          <div class="label-sm">${{ rangeValue }}</div>
        </template>
      </vue-slider>
    </ClientOnly>
  </div>
</template>

<script>
// Components
import 'vue-slider-component/dist-css/vue-slider-component.css'
import 'vue-slider-component/theme/default.css'

export default {
  name: 'RangeSlider',

  props: {
    filter: {
      type: Object,
      default: () => ({})
    },
    filterState: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      value: null
    }
  },

  computed: {
    slider() {
      const [min, max] = this.filter.options

      return {
        minValue: min.value,
        maxValue: max.value,
        railStyle: { background: this.$swell.settings.get('colors.primary.light') },
        processStyle: { background: this.$swell.settings.get('colors.primary.darkest') }
      }
    }
  },

  watch: {
    filterState: 'setValue'
  },

  created() {
    this.setValue()
  },

  methods: {
    setValue() {
      const [min, max] = this.filter.options
      const stateValue = this.filterState[this.filter.id]

      // Use the state value if it exists, otherwise the filter's min/max
      this.value = stateValue || [min.value, max.value]
    },

    updateValue(value) {
      const [min, max] = this.filter.options
      let optionValue

      // If the value isn't the same as the filter's min/max, pass it on
      if (value[0] !== min.value || value[1] !== max.value) {
        optionValue = value
      }
      // Otherwise, don't pass anything so the filter gets removed

      this.$emit('change', { filter: this.filter, optionValue })
    }
  }
}
</script>

<style lang="postcss" scoped>
.custom-dot {
  @apply w-full h-full bg-primary-lightest rounded-full border border-primary-med;
  transition: all 0.3s;

  &.focus {
    @apply border-primary-darkest;
  }
}
</style>
