<template>
  <div>
    <div
      v-for="(color, i) in colors"
      :key="`color-${i}`"
      class="color-selector"
    >
      <input
        :id="`color-${i}`"
        v-model="selectedColors"
        :value="color.name"
        type="checkbox"
        name="color-filter"
        @change="$emit('input', val)"
      />

      <label :for="`color-${i}`">
        <span
          class="indicator transition-all duration-200 ease-in-out"
          :style="{ borderColor: color.hex }"
        />
        <span
          :style="{ backgroundColor: color.hex }"
          class="block h-8 w-8 rounded"
        />
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorFilter',

  props: {
    value: {
      type: Array,
      default: () => [],
    },
    colors: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      selectedColors: [],
    }
  },

  computed: {
    val() {
      const value = []
      for (let i = 0; i < this.selectedColors.length; i++) {
        const matchedColor = this.colors.filter(
          (color) => color.name === this.selectedColors[i]
        )
        if (matchedColor.length) value.push(matchedColor[0])
      }
      return value
    },
  },

  watch: {
    value(val) {
      this.selectedColors = val.map((item) => item.name)
    },
  },
}
</script>

<style lang="postcss">
.color-selector {
  @apply mr-1 flex;

  & label {
    & .indicator {
      transform: translate3d(-50%, -50%, 0) scale(0.8);
      @apply absolute top-1/2 left-1/2 h-full w-full rounded border;
    }
    @apply relative flex h-10 w-10 cursor-pointer items-center justify-center rounded;
  }

  & input {
    &:checked {
      & + label {
        & .indicator {
          transform: translate3d(-50%, -50%, 0) scale(1);
        }
      }
    }
    @apply invisible m-0 h-0 w-0 appearance-none border-0 p-0;
  }
}
</style>
