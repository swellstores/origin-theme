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
      <div class="flex mx-auto transition-all duration-200 ease-out">
        <img
          class="w-6"
          :src="`/flags/${getCountryCodeFromLocale($i18n.locale)}.svg`"
          :alt="`${getCountryCodeFromLocale($i18n.locale)}`"
        />
        <span
          v-if="appearance === 'popup'"
          class="font-medium"
          :class="{ 'ml-2 font-semibold': appearance === 'popup' }"
          >{{ $i18n.localeProperties.name }}</span
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
      <NuxtLink
        v-for="availableLocale in $i18n.locales"
        :key="availableLocale.code"
        v-slot="{ href, navigate }"
        :to="switchLocalePath(availableLocale.code)"
        custom
      >
        <li
          :class="{ 'pointer-events-none': availableLocale.code === $i18n.locale }"
          class="mb-0 px-2 flex items-center cursor-pointer hover:bg-primary-lighter border-b border-primary-light last:border-b-0"
          role="option"
          @click="toggleDropdown"
        >
          <a
            :href="href"
            class="m-2"
            :class="{
              'opacity-25': availableLocale.code === $i18n.locale,
              'my-2 mx-auto': appearance === 'popup'
            }"
            @click="navigate"
          >
            <img
              class="inline-block w-6 mr-1"
              :src="`/flags/${getCountryCodeFromLocale(availableLocale.code)}.svg`"
              :alt="`${getCountryCodeFromLocale(availableLocale.code)}`"
            />
            {{ availableLocale.name }}
          </a>
        </li>
      </NuxtLink>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'LocaleSelect',

  props: {
    appearance: {
      type: String,
      default: 'float'
    }
  },

  data() {
    return {
      dropdownIsActive: false
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

    clickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.dropdownIsActive = false
      }
    }
  }
}
</script>
