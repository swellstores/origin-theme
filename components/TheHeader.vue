<template>
  <div data-sw-path="header">
    <!-- Duplicate elements to match header height and push main content down -->
    <div class="opacity-0">
      <ThePromoBar v-if="header.showPromo" text="|" :hidden="header.hideOnScroll && hideHeader" />
      <div class="py-3">
        <span v-if="logoSrc" :style="{ height: header.logoHeight + 'px' }" class="block"></span>
        <span v-else class="text-3xl sm:text-4xl">|</span>
      </div>
    </div>

    <!-- Full screen nav for small screens -->
    <TheMobileNav v-on="$listeners" v-if="mobileNavIsVisible" :menu-items="menu.items" />

    <!-- Main header -->
    <div class="z-40 fixed top-0 w-full">
      <div
        class="w-full fixed transform translate-y-0 transition-all ease-in-out duration-200"
        :class="[
          'bg-primary-lightest',
          { 'transform -translate-y-full': header.hideOnScroll && hideHeader }
        ]"
      >
        <header class="z-40 shadow-md transition-all duration-300 ease-in-out">
          <ThePromoBar
            v-if="header.showPromo"
            :url="header.promoUrl"
            :text="header.promoText || '[ Promotional text ]'"
            :hidden="header.hideOnScroll && hideHeader"
          />
          <div class="relative container flex items-stretch justify-between items-stretch z-20">
            <!-- Logo -->
            <div class="py-3 lg:w-1/4">
              <NuxtLink :to="resolveUrl({ type: 'home' })">
                <img
                  v-if="logoSrc"
                  :src="logoSrc"
                  :height="header.logoHeight"
                  :style="{ height: header.logoHeight + 'px' }"
                  class="inline-block w-auto"
                />
                <span v-else class="text-3xl sm:text-4xl whitespace-no-wrap">{{ storeName }}</span>
              </NuxtLink>
            </div>

            <!-- Main nav menu -->
            <nav v-if="menu" class="w-full lg:w-auto hidden lg:flex">
              <ul class="flex justify-center">
                <li
                  v-for="(item, index) in menu.items"
                  :key="item.name"
                  class="sw-nav-link-wrapper mb-0"
                >
                  <NuxtLink
                    :to="resolveUrl(item)"
                    :title="item.description"
                    class="sw-nav-link relative flex items-center h-full px-5 pt-1 rounded-none border-transparent border-b-4"
                    @click.native="megaNavIsEnabled = false"
                    @mouseleave.native="hideMegaNav"
                    @mouseenter.native="showMegaNav(index)"
                  >
                    <span class="relative">
                      {{ item.name }}
                    </span>
                  </NuxtLink>
                  <!-- Show mega nav if item has child items -->
                  <transition name="fade">
                    <div
                      v-if="megaNavIsActive(item, index)"
                      class="absolute left-0 right-0 min-h-full"
                      :class="{ 'mega-nav hidden fade-in': !isMounted }"
                      @mouseenter="showMegaNav(index)"
                      @mouseleave="hideMegaNav"
                    >
                      <MegaNav :items="item.items" @click="hideMegaNav" />
                    </div>
                  </transition>
                </li>
              </ul>
            </nav>
            <!-- END Main nav menu -->

            <!-- Action menu -->
            <div class="flex flex-row items-center justify-end -mr-2 lg:w-1/4">
              <!-- Currency select -->
              <CurrencySelect
                class="hidden lg:block"
                v-if="currencyOptions && currency"
                :options="currencyOptions"
                :value="currency"
                appearance="float"
                @change="selectCurrency"
              />
              <!-- Search icon -->
              <button class="h-10 p-2" @click.prevent="$emit('click-search')">
                <BaseIcon icon="uil:search" />
              </button>
              <!-- Account icon -->
              <NuxtLink
                class="hidden h-10 p-2 lg:inline-block"
                :to="customerLoggedIn ? '/account/orders/' : '/account/login/'"
              >
                <BaseIcon icon="uil:user" />
              </NuxtLink>
              <!-- Cart icon -->
              <button
                class="relative h-10 p-2"
                data-sw-path="cart"
                data-sw-click="true"
                @click.prevent="$emit('click-cart')"
              >
                <BaseIcon icon="uil:cart" />
                <div
                  v-if="cart && cart.itemQuantity"
                  class="fade-in absolute left-5 top-0 bg-accent rounded-full w-6 h-6 flex justify-center items-center text-primary-lighter"
                >
                  <span class="block mt-px text-2xs leading-none">{{ cart.itemQuantity }}</span>
                </div>
              </button>
              <!-- Mobile nav toggle -->
              <button
                :class="{ 'is-active': mobileNavIsVisible }"
                class="hamburger hamburger--squeeze h-8 p-1 ml-2 rounded lg:hidden"
                type="button"
                @click="setMobileNavVisibility"
              >
                <span class="hamburger-box">
                  <span class="hamburger-inner"></span>
                </span>
              </button>
            </div>
          </div>
        </header>
      </div>
    </div>
    <!-- END Main header -->
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'
import get from 'lodash/get'
import debounce from 'lodash/debounce'

export default {
  name: 'TheHeader',

  fetch() {
    const { $swell } = this

    // Get menu ID
    const menuId = $swell.settings.get('header.menu', 'header')

    // Set component data
    this.header = $swell.settings.get('header', {})
    this.menu = $swell.settings.menus(menuId)
    this.storeName = $swell.settings.get('store.name', 'ORIGIN')
    this.logoSrc = $swell.settings.get('header.logo.file.url')
    this.currencyOptions = this.getCurrencyOptions()
  },

  data() {
    return {
      header: {},
      menu: {},
      storeName: null,
      logoSrc: null,
      mounted: false,
      megaNavIsEnabled: true,
      currentMegaNavIndex: null,
      mobileNavIsVisible: false,
      hideHeader: false,
      lastScrollPos: 0,
      isScrolled: false,
      isMounted: false,
      scrollRAF: null,
      currencyOptions: null
    }
  },

  computed: {
    ...mapState(['cart', 'customerLoggedIn', 'currency']),
  },

  watch: {
    $route() {
      // Close mega/mobile nav menu when the page changes
      this.hideHeader = false
      this.setMobileNavVisibility(false)
    }
  },

  created() {
    // Attach debounce method, to allow it to be cancelled
    this.hideMegaNav = debounce(this.hideMegaNav, 200)
  },

  mounted() {
    this.isMounted = true
    this.setScrollListener(true)
    this.$store.dispatch('selectCurrency')
  },

  beforeDestroy() {
    this.setScrollListener(false)
    cancelAnimationFrame(this.scrollRAF)
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

    selectCurrency(value) {
      const { $swell } = this
      this.$store.dispatch('selectCurrency', { code: value })
    },

    setMobileNavVisibility(value) {
      if (typeof value === 'boolean') {
        // Explicitly set visibility
        this.mobileNavIsVisible = value
      } else {
        // Toggle visibility
        this.mobileNavIsVisible = !this.mobileNavIsVisible
      }

      // Ensure the header is visible when mobile nav is open
      if (this.mobileNavIsVisible) {
        this.setScrollListener(false)
      } else {
        this.setScrollListener(true)
      }
    },

    megaNavIsActive(item, index) {
      const { items } = item

      // Don't show if there are no items set within the MegaNav
      if (!item || !items || !items.length) return

      // Before mounted, allow for CSS to override and show the MegaNav 
      if (!this.isMounted) return true

      // Show MegaNav, depending on which nav link is selected
      if (this.megaNavIsEnabled && this.currentMegaNavIndex === index) return true
    },

    showMegaNav(index) {
      this.hideMegaNav.cancel()
      this.megaNavIsEnabled = true
      this.currentMegaNavIndex = index
    },

    hideMegaNav() {
      this.megaNavIsEnabled = false
      this.currentMegaNavIndex = null
    },

    setHeaderVisibility() {
      this.isScrolled = false
      // Check how far page has scrolled
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
      if (currentScrollPosition < 0) return

      // Stop executing this function if the difference between
      // current scroll position and last scroll position is less than some offset
      if (Math.abs(currentScrollPosition - this.lastScrollPos) < 50) return

      if (currentScrollPosition > this.lastScrollPos) {
        this.hideHeader = true
        this.$store.commit('setState', { key: 'headerIsVisible', value: false })
      } else {
        this.hideHeader = false
        this.$store.commit('setState', { key: 'headerIsVisible', value: true })
      }
      this.lastScrollPos = currentScrollPosition
    },

    handleScroll() {
      if (!this.isScrolled) {
        this.isScrolled = true
        this.scrollRAF = requestAnimationFrame(this.setHeaderVisibility)
      }
    },

    setScrollListener(value) {
      // Ignore if hide on scroll is disabled in settings
      if (!this.header.hideOnScroll) return

      if (value) {
        window.addEventListener('scroll', this.handleScroll)
      } else {
        window.removeEventListener('scroll', this.handleScroll)
        this.hideHeader = false
      }
    }
  }
}
</script>

<style lang="postcss">
.sw-nav-link {
  &:focus,
  &.nuxt-link-active {
    @apply shadow-none text-accent border-accent;
  }
}

.mega-nav:hover,
.sw-nav-link-wrapper a:hover + .mega-nav {
  @apply block;
}

.hamburger {
  @apply cursor-pointer;
}

.hamburger-box {
  @apply relative inline-block w-6 h-6;
}

.hamburger-inner {
  @apply block -mt-px top-1/2;

  &,
  &:before,
  &:after {
    @apply absolute w-6 h-2px bg-current rounded;
  }

  &:before,
  &:after {
    content: '';
    display: block;
  }

  &:before {
    top: -8px;
  }

  &:after {
    bottom: -8px;
  }
}

.hamburger--squeeze .hamburger-inner {
  transition-duration: 0.075s;
  transition-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
}
.hamburger--squeeze .hamburger-inner::before {
  transition: top 0.075s 0.12s ease, opacity 0.075s ease;
}
.hamburger--squeeze .hamburger-inner::after {
  transition: bottom 0.075s 0.12s ease, transform 0.075s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.hamburger--squeeze.is-active .hamburger-inner {
  transform: rotate(45deg);
  transition-delay: 0.12s;
  transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
}
.hamburger--squeeze.is-active .hamburger-inner::before {
  top: 0;
  opacity: 0;
  transition: top 0.075s ease, opacity 0.075s 0.12s ease;
}
.hamburger--squeeze.is-active .hamburger-inner::after {
  bottom: 0;
  transform: rotate(-90deg);
  transition: bottom 0.075s ease, transform 0.075s 0.12s cubic-bezier(0.215, 0.61, 0.355, 1);
}
</style>
