<template>
  <div class="relative">
    <div
      ref="dropdown"
      class="focus:outline-none relative flex w-full cursor-pointer items-center rounded border border-primary-med bg-primary-lightest p-2 pr-10 font-semibold focus:shadow-outline"
      :class="{ 'rounded-b-none': dropdownIsActive }"
      @click="toggleDropdown()"
    >
      <span class="whitespace-no-wrap my-1 ml-2">{{ selectedLabel }}</span>
      <div v-show="dropdownIsActive" class="absolute right-3 mt-px">
        <BaseIcon icon="uil:angle-up" />
      </div>
      <div v-show="!dropdownIsActive" class="absolute right-3 mt-px">
        <BaseIcon icon="uil:angle-down" />
      </div>
    </div>

    <ul
      v-show="dropdownIsActive"
      :class="{ 'rounded-t-none': dropdownIsActive, 'max-h-40': compact }"
      class="absolute z-40 -mt-px block w-full overflow-scroll rounded border border-primary-med bg-primary-lightest py-2"
      role="listbox"
    >
      <li
        v-for="(option, index) in options"
        :key="`option-${index}`"
        class="mb-0 cursor-pointer items-center px-2 py-3 hover:bg-primary-lighter"
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
      default: () => [],
    },
    value: {
      type: String,
      default: '',
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      dropdownIsActive: false,
      selected: '',
    }
  },

  computed: {
    selectedLabel() {
      if (this.selected !== undefined) {
        return this.selected.label || this.selected
      }

      return ''
    },
  },

  watch: {
    value() {
      const { value, options } = this

      if (value !== undefined) {
        if (options && options.length > 0) {
          const selected =
            find(options, value) ||
            find(options, { value }) ||
            find(options, { label: value })
          if (selected !== undefined) {
            this.selected = selected.label || selected
            return
          }
        }

        // Fallback
        this.selected = value
      }
    },
  },

  created() {
    const { value, options } = this

    if (value !== undefined) {
      if (options && options.length > 0) {
        const selected =
          find(options, value) ||
          find(options, { value }) ||
          find(options, { label: value })
        if (selected !== undefined) {
          this.selected = selected.label || selected
          return
        }
      }

      // Fallback
      this.selected = value
    }
  },

  mounted() {
    // Toggle off dropdown if clicked outside
    window.addEventListener('click', this.clickOutside)
  },

  beforeDestroy() {
    // Remove event listeners
    window.removeEventListener('click', this.clickOutside)
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
    },
  },
}
</script>
