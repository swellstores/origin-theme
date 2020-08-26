<template>
  <div>
    <ProductOptionLabel v-bind="option" />

    <!-- Radio input -->
    <!-- The fieldset element doesn't like flexbox, so we're using a div instead https://stackoverflow.com/questions/28078681/why-cant-fieldset-be-flex-containers -->
    <div v-if="inputType === 'radio'" role="group" class="-ml-1 mt-3 flex flex-wrap">
      <div
        v-for="value in option.values"
        :key="value.name"
        :class="{ 'flex-grow': option.values.length <= 2 }"
        class="radio-selector relative inline-block ml-1 mt-1 text-center"
      >
        <input
          :id="value.id"
          :name="option.name"
          :value="value.name"
          :disabled="value.disabled"
          type="radio"
          class="absolute inset-0 opacity-0"
          @input="$emit('value-changed', { option: option.name, value: $event.target.value })"
        />
        <label
          :for="value.id"
          :class="{
            'border-primary-darkest': value.name === currentValue,
            'text-primary-med': value.disabled
          }"
          class="relative block w-full rounded text-sm border font-bold cursor-pointer hover:border-primary-darkest focus:shadow-outline"
        >
          <span
            v-if="value.color"
            :style="`background: ${value.color}`"
            class="block w-8 h-8 m-1 rounded-sm"
          ></span>
          <span v-else class="block p-3 min-w-12">{{ value.name }}</span>
        </label>
      </div>
    </div>

    <!-- Select menu input -->
    <div v-else class="mt-3">
      <div class="relative z-10 text-sm hover:border-primary-darkest">
        <!-- Value/Toggle -->
        <button
          :id="`option-${option.id}-button`"
          :class="{ 'rounded-b-none': dropdownIsActive }"
          :aria-labelledby="`option-${option.id}-label option-${option.id}-button`"
          class="relative w-full flex p-2 items-center border font-bold cursor-pointer rounded focus:outline-none focus:shadow-outline"
          aria-haspopup="listbox"
          @click="toggleDropdown"
        >
          <span
            v-if="swatchColor"
            :style="`background: ${swatchColor}`"
            class="inline-block w-7 h-7 mr-1 rounded-sm"
          ></span>
          <span class="ml-2 my-1">{{ currentValue }}</span>
          <div v-show="dropdownIsActive" class="absolute right-3 mt-px">
            <BaseIcon icon="uil:angle-up" />
          </div>
          <div v-show="!dropdownIsActive" class="absolute right-3 mt-px">
            <BaseIcon icon="uil:angle-down" />
          </div>
        </button>
        <!-- Options -->
        <ul
          v-show="dropdownIsActive"
          :id="`option-${option.id}-menu`"
          :class="{ 'rounded-t-none': dropdownIsActive }"
          :aria-labelledby="`option-${option.id}-label`"
          class="absolute block -mt-px w-full bg-primary-lightest py-2 border rounded"
          role="listbox"
        >
          <li
            v-for="value in option.values"
            :id="`value-${value.name}`"
            :key="value.name"
            class="inline-block mb-0 px-2 flex items-center cursor-pointer hover:bg-primary-lighter"
            :class="{ 'text-primary-med': value.name === currentValue }"
            role="option"
            @click="selectValue(value)"
          >
            <span
              v-if="value.color"
              :style="`background: ${swatchColor}`"
              class="inline-block w-7 h-7 mr-1 rounded-sm"
            ></span>
            <span class="m-2 font-bold">{{ value.name }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OptionInputSelect',

  props: {
    option: {
      type: Object,
      default: () => ({
        values: []
      })
    },
    currentValue: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      dropdownIsActive: false
    }
  },

  computed: {
    inputType() {
      // Determine what input UI is most suitable
      const { values } = this.option
      const valueNamesLength = values.reduce((acc, val) => {
        // Don't count color value names because they're displayed as a swatch,
        // and ignore periods and commas because they're visually small
        const nameLength = val.color ? 0 : val.name.replace(/[.,]/g, '')
        return acc + nameLength
      }, 0)

      if (values.length <= 5) {
        // Use a radio input if there's 1-5 options
        return 'radio'
      } else if (values.length <= 15 && valueNamesLength < 25) {
        // Or if there's 6-15 options but they're compact (e.g. sizes, colors)
        return 'radio'
      } else {
        // Otherwise, use a select menu
        return 'menu'
      }
    },

    swatchColor() {
      const currentValue = this.option.values.find(value => value.name === this.currentValue)
      return currentValue.color
    }
  },

  methods: {
    toggleDropdown() {
      this.dropdownIsActive = !this.dropdownIsActive
    },

    selectValue(value) {
      this.$emit('value-changed', { option: this.option.name, value: value.name })
      this.dropdownIsActive = false
    }
  }
}
</script>

<style lang="postcss">
.radio-selector input {
  &:focus + label {
    @apply shadow-outline;
  }
}
</style>
