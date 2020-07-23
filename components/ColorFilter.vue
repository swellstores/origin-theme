<template>
  <div>
    <div v-for="(color, i) in colors" :key="`color-${i}`" class="color-selector">
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
        <span :style="{ backgroundColor: color.hex }" class="w-8 h-8 block rounded"></span>
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
      default: () => []
    },
    colors: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      selectedColors: []
    }
  },

  computed: {
    val() {
      const value = []
      for (let i = 0; i < this.selectedColors.length; i++) {
        const matchedColor = this.colors.filter(color => color.name === this.selectedColors[i])
        if (matchedColor.length) value.push(matchedColor[0])
      }
      return value
    }
  },

  watch: {
    value(val) {
      this.selectedColors = val.map(item => item.name)
    }
  }
}
</script>

<style lang="postcss">
.color-selector {
  @apply flex mr-1;

  & input {
    @apply p-0 m-0 border-0 appearance-none w-0 h-0 invisible;

    &:checked {
      & + label {
        & .indicator {
          transform: translate3d(-50%, -50%, 0) scale(1);
        }
      }
    }
  }

  & label {
    @apply relative cursor-pointer flex justify-center items-center w-10 h-10 rounded;

    & .indicator {
      @apply absolute w-full h-full rounded border top-1/2 left-1/2;
      transform: translate3d(-50%, -50%, 0) scale(0.8);
    }
  }
}
</style>
