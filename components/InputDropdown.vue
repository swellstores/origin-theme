<template>
  <div class="relative">
    <div
      ref="dropdown"
      class="relative w-full flex p-2 pr-8 items-center bg-primary-lightest border font-semibold cursor-pointer rounded focus:outline-none focus:shadow-outline"
      :class="{ 'rounded-b-none': dropdownIsActive }"
      @click="toggleDropdown()"
    >
      <span class="ml-2 my-1">{{ selected }}</span>
      <div v-show="dropdownIsActive" class="absolute right-3 mt-px">
        <BaseIcon icon="uil:angle-up" />
      </div>
      <div v-show="!dropdownIsActive" class="absolute right-3 mt-px">
        <BaseIcon icon="uil:angle-down" />
      </div>
    </div>

    <ul
      v-show="dropdownIsActive"
      :class="{ 'rounded-t-none': dropdownIsActive }"
      class="absolute block -mt-px w-full bg-primary-lightest py-2 border rounded z-40
      overflow-scroll"
      role="listbox"
    >
      <li
        v-for="(option, index) in options"
        :key="`option-${index}`"
        class="inline-block mb-0 px-2 flex items-center cursor-pointer hover:bg-primary-lighter"
        role="option"
        @click="selectOption(option)"
      >
        <span class="m-2">
          {{ option.label || option }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
// Helpers
import find from 'lodash/find'

export default {
  name: 'InputDropdown',

  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: String
    }
  },

  data() {
    return {
      dropdownIsActive: false,
      selected: ''
    }
  },

  created() {
    const { value, options } = this

    if (value !== undefined) {
      if (options && options.length > 0) {
        const selected =
          find(options, value) || find(options, { value }) || find(options, { label: value })
        if (selected !== undefined) {
          this.selected = selected.label || selected
          return
        }
      }

      // Fallback
      this.selected = value
    }
  },

  methods: {
    toggleDropdown() {
      this.dropdownIsActive = !this.dropdownIsActive
    },
    selectOption(option) {
      this.selected = option.label || option
      this.dropdownIsActive = false
      this.$emit('change', option.value || option)
    },

    clickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.dropdownIsActive = false
      }
    }
  },

  mounted() {
    // Toggle off dropdown if clicked outside
    window.addEventListener('click', this.clickOutside)
  },

  beforeDestroy() {
    // Remove event listeners
    window.removeEventListener('click', this.clickOutside)
  }
}
</script>

<style lang="postcss" scoped></style>
