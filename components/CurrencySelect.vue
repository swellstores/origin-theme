<template>
  <div class="relative transition-all duration-300 ease-in-out">
    <div
      class="w-full flex p-2 items-center text-center font-medium cursor-pointer focus:outline-none focus:shadow-outline hover:text-accent"
      :class="{
        'font-semibold h-full': appearance === 'popup',
        'rounded bg-primary-lightest': appearance === 'float'
      }"
      @click="toggleDropdown()"
    >
      <div v-if="selected" class="mx-auto transition-all duration-200 ease-out">
        <span class="font-medium" :class="{ 'font-semibold': appearance === 'popup' }">{{
          selected.value
        }}</span>
        <span class="font-semibold">{{ selected.symbol }}</span>
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
        class="mb-0 px-2 items-center cursor-pointer hover:bg-primary-lighter border-b border-primary-light last:border-b-0"
        role="option"
        @click="selectOption(option)"
      >
        <div
          class="w-full m-2"
          :class="{
            'opacity-25': option.label === selected || option === selected,
            'my-2 mx-auto': appearance === 'popup'
          }"
        >
          {{ option.value }}
          <span class="font-semibold">{{ option.symbol }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
// Helpers
import find from 'lodash/find'

export default {
  name: 'CurrencySelect',

  props: {
    appearance: {
      type: String,
      default: 'float'
    },
    currency: {
      type: String,
      default: null
    }
  },

  fetch() {
    // Set component data
    this.options = this.getCurrencyOptions()
  },

  data() {
    return {
      value: null,
      options: [],
      dropdownIsActive: false,
      selected: ''
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

  mounted() {
    // Toggle off dropdown if clicked outside
    window.addEventListener('click', this.clickOutside)
  },

  beforeDestroy() {
    // Remove event listeners
    window.removeEventListener('click', this.clickOutside)
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

      if (!value) return

      // Fallback
      this.selected = value

      if (!options || !options.length) return

      const selected = find(options, { value })

      if (!selected) return

      this.selected = selected
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
  }
}
</script>
