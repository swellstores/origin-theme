<template>
  <ClientOnly>
    <vue-slider
      v-model="val"
      :value="val"
      :min="min"
      :max="max"
      :interval="interval"
      :clickable="false"
      tooltip="always"
      tooltip-placement="bottom"
      :tooltip-formatter="'${value}'"
      :process-style="{ backgroundColor: sliderProcessColor }"
      :rail-style="{ backgroundColor: sliderRailColor }"
      :dot-size="20"
      @change="$emit('input', val)"
    >
      <template v-slot:dot="{ value, focus }">
        <div :class="['custom-dot', { focus }]"></div>
      </template>

      <template v-slot:tooltip="{ value, focus }">
        <div class="label-sm">${{ value }}</div>
      </template>
    </vue-slider>
  </ClientOnly>
</template>

<script>
// Helpers
import get from 'lodash/get'
import settings from '~/config/settings'

// Components
import 'vue-slider-component/dist-css/vue-slider-component.css'
import 'vue-slider-component/theme/default.css'

export default {
  name: 'RangeSlider',

  props: {
    value: {
      type: Array,
      default: null
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    interval: {
      type: Number,
      default: 1
    }
  },

  data() {
    return {
      val: this.value
    }
  },

  computed: {
    sliderProcessColor() {
      return get(settings, 'colors.primary.darkest')
    },
    sliderRailColor() {
      return get(settings, 'colors.primary.lighter')
    }
  },

  watch: {
    value(val) {
      if (val[0] === this.min && val[1] === this.max) this.val = [this.min, this.max]
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
