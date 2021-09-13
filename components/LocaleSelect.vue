<template>
  <div class="relative transition-all duration-300 ease-in-out">
    <div
      class="
        w-full
        flex
        p-2
        items-center
        text-center
        cursor-pointer
        whitespace-nowrap
        focus:outline-none focus:shadow-outline
        hover:text-accent-default
      "
      :class="{
        'font-semibold h-full': appearance === 'popup',
        'rounded bg-primary-lightest': appearance === 'float',
      }"
      @click="toggleDropdown()"
    >
      <div
        class="flex items-center mx-auto transition-all duration-200 ease-out"
      >
        <template v-if="appearance === 'popup'">
          <img
            v-if="display === 'flag'"
            class="w-6 mr-2"
            :src="`/flags/${getCountryCodeFromLocale($i18n.locale)}.svg`"
            :alt="`${getCountryCodeFromLocale($i18n.locale)}`"
          />
          <span class="font-semibold uppercase">{{ $i18n.locale }}</span>
        </template>
        <template v-else>
          <img
            v-if="display === 'flag'"
            class="w-6 mr-2"
            :src="`/flags/${getCountryCodeFromLocale($i18n.locale)}.svg`"
            :alt="`${getCountryCodeFromLocale($i18n.locale)}`"
          />
          <span v-else class="uppercase">{{ $i18n.locale }}</span>
        </template>
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
        'w-max shadow-md absolute border  border-primary-med  center-x':
          appearance === 'float',
        'w-full max-w-80 mx-auto center-xy fixed': appearance === 'popup',
      }"
      class="block -mt-px bg-primary-lightest rounded z-40"
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
          @click="toggleDropdown"
        >
          <a
            :href="href"
            class="w-full p-2"
            :class="{
              'opacity-25': locale.code === $i18n.locale,
              'my-2 mx-auto': appearance === 'popup',
            }"
            @click="navigate"
          >
            <img
              v-if="!hideFlagOnList"
              class="inline-block w-6 mr-2"
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

  fetch() {
    // Set component data
    const { $swell } = this

    this.locales = $swell.locale.list()
    this.display = $swell.settings.get('header.locale.display', 'flag')
    this.hideFlagOnList = $swell.settings.get('header.locale.hideFlag', false)
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
