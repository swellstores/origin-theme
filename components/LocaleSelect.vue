<template>
  <div class="relative cursor-pointer" @click="toggleDropdown()">
    <div
      class="focus:outline-none whitespace-nowrap transition-all duration-300 ease-in-out hover:text-accent-default focus:shadow-outline"
      :class="{
        'h-full': appearance === 'popup',
        'w-full rounded bg-primary-lightest p-2': appearance === 'float',
      }"
    >
      <div v-if="appearance === 'popup'" class="grid-icon-label">
        <img
          :src="`/flags/${getCountryCodeFromLocale($i18n.locale)}.svg`"
          :alt="`${getCountryCodeFromLocale($i18n.locale)}`"
        />
        <span class="font-semibold uppercase">{{ $i18n.locale }}</span>
      </div>
      <div v-else>
        <img
          v-if="display === 'flag'"
          class="w-6"
          :src="`/flags/${getCountryCodeFromLocale($i18n.locale)}.svg`"
          :alt="`${getCountryCodeFromLocale($i18n.locale)}`"
        />
        <span v-else class="uppercase">{{ $i18n.locale }}</span>
      </div>
    </div>

    <!-- Overlay -->
    <transition name="popup" appear :duration="500">
      <div v-if="appearance === 'popup' && dropdownIsActive">
        <div
          class="overlay fixed top-0 left-0 z-30 h-full w-full bg-primary-darker opacity-50"
          @click="dropdownIsActive = false"
        />
      </div>
    </transition>

    <ul
      v-show="dropdownIsActive"
      :class="{
        'center-x absolute w-max border  border-primary-med  shadow-md':
          appearance === 'float',
        'center-xy fixed mx-auto w-full max-w-80': appearance === 'popup',
      }"
      class="z-40 -mt-px block rounded bg-primary-lightest"
      role="listbox"
    >
      <NuxtLink
        v-for="locale in locales"
        :key="locale.code"
        v-slot="{ href, navigate }"
        :to="switchLocalePath(locale.code)"
        custom
      >
        <li
          :class="{
            'pointer-events-none': locale.code === $i18n.locale,
          }"
          class="mb-0 flex cursor-pointer items-center border-b border-primary-light px-2 last:border-b-0 hover:bg-primary-lighter"
          role="option"
          @click="toggleDropdown"
        >
          <a
            :href="href"
            class="w-full p-2"
            :class="{
              'opacity-25': locale.code === $i18n.locale,
              'mx-auto': appearance === 'popup',
            }"
            @click="navigate"
          >
            <img
              v-if="!hideFlagOnList"
              class="mr-2 inline-block w-6"
              :src="`/flags/${getCountryCodeFromLocale(locale.code)}.svg`"
              :alt="`${getCountryCodeFromLocale(locale.code)}`"
            />
            {{ locale.name }}
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
      default: 'float',
    },
  },

  data() {
    return {
      locales: null,
      display: null,
      hideFlagOnList: false,
      dropdownIsActive: false,
    }
  },

  async fetch() {
    // Set component data
    const { $swell } = this

    this.locales = await $swell.locale.list()
    this.display = await $swell.settings.get('header.locale.display', 'flag')
    this.hideFlagOnList = await $swell.settings.get(
      'header.locale.hideFlag',
      false
    )
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
    },
  },
}
</script>
