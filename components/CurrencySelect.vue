<template>
  <div class="relative cursor-pointer" @click="toggleDropdown()">
    <div
      class="
        whitespace-nowrap
        focus:outline-none focus:shadow-outline
        hover:text-accent-default
        transition-all
        duration-300
        ease-in-out
      "
      :class="{
        'h-full': appearance === 'popup',
        'w-full p-2 rounded bg-primary-lightest': appearance === 'float',
      }"
    >
      <div v-if="appearance === 'popup'" class="grid-icon-label font-semibold">
        <span class="text-center">
          {{ selectedCurrency.symbol }}
        </span>

        <span class="uppercase">{{ selectedCurrency.code }}</span>
      </div>
      <div v-else class="flex items-center">
        <span
          v-if="
            display === 'symbol-code' &&
            selectedCurrency.symbol !== selectedCurrency.code
          "
          class="mr-2"
        >
          {{ selectedCurrency.symbol }}
        </span>
        <span class="uppercase">{{ selectedCurrency.code }}</span>
      </div>
    </div>

    <!-- Overlay -->
    <transition name="popup" appear :duration="500">
      <div v-if="appearance === 'popup' && dropdownIsActive">
        <div
          class="
            overlay
            fixed
            w-full
            h-full
            opacity-50
            top-0
            left-0
            bg-primary-darker
            z-30
          "
          @click="dropdownIsActive = false"
        />
      </div>
    </transition>

    <ul
      v-show="dropdownIsActive"
      :class="{
        'w-max shadow-md absolute border border-primary-med center-x':
          appearance === 'float',
        'w-full max-w-80 mx-auto center-xy fixed': appearance === 'popup',
      }"
      class="block -mt-px bg-primary-lightest rounded z-40"
      role="listbox"
    >
      <li
        v-for="currency in currencyList"
        :key="`option-${currency.code}`"
        :class="{
          'pointer-events-none': currency.code === currentCurrency,
        }"
        class="
          mb-0
          px-2
          flex
          items-center
          cursor-pointer
          hover:bg-primary-lighter
          border-b border-primary-light
          last:border-b-0
        "
        role="option"
        @click="selectCurrency(currency)"
      >
        <div class="w-full p-2">
          <span v-if="!hideSymbolOnList" class="font-semibold mr-2">{{
            currency.symbol
          }}</span>
          <span
            :class="{
              'opacity-25': currency.code === currentCurrency,
              'my-2 mx-auto': appearance === 'popup',
            }"
          >
            {{ currency.name }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'CurrencySelect',

  props: {
    appearance: {
      type: String,
      default: 'float',
    },
    currentCurrency: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      dropdownIsActive: false,
      display: null,
      hideSymbolOnList: false,
      currencyList: [],
    }
  },

  async fetch() {
    // Set component data
    const { $swell } = this

    this.display = await $swell.settings.get(
      'header.currency.display',
      'symbol-code'
    )
    this.currencyList = await $swell.currency.list()
    this.hideSymbolOnList = await $swell.settings.get(
      'header.currency.hideSymbol',
      false
    )
  },

  computed: {
    selectedCurrency() {
      const { currencyList, currentCurrency } = this
      return currencyList.find((currency) => currency.code === currentCurrency)
    },
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

    async selectCurrency(currency) {
      this.dropdownIsActive = false
      await this.$store.dispatch('selectCurrency', currency)
    },

    clickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.dropdownIsActive = false
      }
    },
  },
}
</script>
