<template>
  <div class="relative">
    <div
      ref="dropdown"
      class="
        relative
        w-full
        flex
        p-2
        pr-10
        items-center
        bg-primary-lightest
        border border-primary-med
        font-semibold
        cursor-pointer
        rounded
        focus:outline-none focus:shadow-outline
      "
      :class="{ 'rounded-b-none': dropdownIsActive }"
      @click="toggleDropdown()"
    >
      <span class="ml-2 my-1 whitespace-no-wrap">{{ selectedLabel }}</span>
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
      class="
        absolute
        block
        -mt-px
        w-full
        bg-primary-lightest
        py-2
        border border-primary-med
        rounded
        z-40
        overflow-scroll
      "
      role="listbox"
    >
      <li
        v-for="(option, index) in options"
        :key="`option-${index}`"
        class="
          mb-0
          px-2
          py-3
          items-center
          cursor-pointer
          hover:bg-primary-lighter
        "
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
