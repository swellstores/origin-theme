<template>
  <div v-if="currency" class="relative transition-all duration-300 ease-in-out">
    <div
      ref="dropdown"
      class="w-full flex p-2 items-center text-center font-medium cursor-pointer focus:outline-none focus:shadow-outline hover:text-accent"
      :class="{
        'font-semibold h-full': appearance === 'popup',
        'rounded bg-primary-lightest ': appearance === 'float'
      }"
      @click="toggleDropdown()"
    >
      <div v-if="selected" class="mx-auto transition-all duration-200 ease-out">
        <span class="font-semibold">{{ selected.symbol }}</span>

        <span
          class="font-medium"
          :class="{ 'ml-2 font-semibold': appearance === 'popup' }"
          >{{ selected.value }}</span
        >
      </div>
    </div>

    <!-- Overlay -->
    <transition name="popup" appear :duration="500">
      <div v-if="appearance === 'popup' && dropdownIsActive">
        <div
          class="overlay fixed w-full h-full opacity-50 top-0 left-0 bg-primary-darker z-30"
          @click="dropdownIsActive = false"
        ></div>
      </div>
    </transition>

    <ul
      v-show="dropdownIsActive"
      :class="{
        'w-max shadow-md absolute border center-x': appearance === 'float',
        'w-full max-w-80 mx-auto center-xy fixed': appearance === 'popup'
      }"
      class="block -mt-px bg-primary-lightest rounded z-40
      overflow-scroll"
      role="listbox"
    >
      <li
        v-for="(option, index) in options"
        :key="`option-${index}`"
        :class="{ 'pointer-events-none': option.value === selected.value || option === selected }"
        class="inline-block mb-0 px-2 flex items-center cursor-pointer hover:bg-primary-lighter border-b border-primary-light last:border-b-0"
        role="option"
        @click="selectOption(option)"
      >
        <div
          class="m-2"
          :class="{
            'opacity-25': option.label === selected || option === selected,
            'my-2 mx-auto': appearance === 'popup'
          }"
        >
          <span class="font-semibold">{{ option.symbol }}</span>
          {{ option.value }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
// Helpers
import find from 'lodash/find'
import { mapState } from 'vuex'

export default {
  name: 'CurrencySelect',

  fetch() {
    // Set component data
    this.options = this.getCurrencyOptions()
  },

  props: {
    appearance: {
      type: String,
      default: 'float'
    }
  },

  data() {
    return {
      value: null,
      options: [],
      dropdownIsActive: false,
      selected: ''
    }
  },

  computed: {
    ...mapState(['currency']),

    selectedLabel() {
      if (this.selected !== undefined) {
        return this.selected.label || this.selected
      }
    }
  },

  watch: {
    currency() {
      const { currency } = this

      // Set initial value when currency has been fetched
      if (currency === null) return
      this.value = currency
    },

    value() {
      this.setDefaultValue()
    }
  },

  created() {
    if (this.currency) {
      this.value = this.currency
    }

    this.setDefaultValue()
  },

  methods: {
    getCurrencyOptions() {
      const { $swell } = this

      const options = $swell.currency.list().map(currency => ({
        value: currency.code,
        label: `${currency.symbol} ${currency.code}`,
        symbol: currency.symbol
      }))
      return options.length ? options : null
    },

    setDefaultValue() {
      const { value, options } = this

      if (value !== undefined) {
        if (options && options.length > 0) {
          const selected =
            find(options, value) || find(options, { value }) || find(options, { label: value })
          if (selected !== undefined) {
            this.selected = selected
            return
          }
        }

        // Fallback
        this.selected = value
      }
    },

    toggleDropdown() {
      this.dropdownIsActive = !this.dropdownIsActive
    },

    selectOption(option) {
      this.selected = option
      this.dropdownIsActive = false
      this.$store.dispatch('selectCurrency', { code: option.value })
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
