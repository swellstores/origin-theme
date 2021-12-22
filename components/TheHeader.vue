<template>
  <div ref="header" data-sw-path="header">
    <!-- Duplicate elements to match header height and push main content down -->
    <div class="opacity-0">
      <ThePromoBar
        v-if="header.showPromo"
        text="|"
        :hidden="header.hideOnScroll && hideHeader"
      />
      <div class="py-3">
        <span
          v-if="logoSrc"
          :style="{ height: header.logoHeight + 'px' }"
          class="block"
        />
        <span v-else class="text-3xl sm:text-4xl">|</span>
      </div>
    </div>

    <!-- Full screen nav for small screens -->
    <TheMobileNav
      v-if="mobileNavIsVisible"
      :menu-items="menu.items"
      v-on="$listeners"
    />

    <!-- Main header -->
    <div class="fixed top-0 z-40 w-full">
      <div
        class="
          fixed
          w-full
          transition-all
          duration-200
          ease-in-out
          transform
          translate-y-0
        "
        :class="[
          'bg-primary-lightest',
          { 'transform -translate-y-full': header.hideOnScroll && hideHeader },
        ]"
      >
        <header
          class="z-40 transition-all duration-300 ease-in-out"
          :class="{
            'shadow-md': !mobileNavIsVisible,
            'border-b border-primary-light': mobileNavIsVisible,
          }"
        >
          <ThePromoBar
            v-if="header.showPromo"
            :url="header.promoUrl"
            :text="header.promoText || '[ Promotional text ]'"
            :hidden="header.hideOnScroll && hideHeader"
          />
          <div
            class="container relative z-20 flex items-stretch justify-between"
          >
            <!-- Logo -->
            <div class="py-3 lg:w-1/4">
              <NuxtLink :to="localePath(resolveUrl({ type: 'home' }))">
                <img
                  v-if="logoSrc"
                  :src="logoSrc"
                  :height="header.logoHeight"
                  :style="{ height: header.logoHeight + 'px' }"
                  class="inline-block w-auto"
                  :alt="storeName"
                />
                <span v-else class="text-3xl whitespace-no-wrap sm:text-4xl">{{
                  storeName
                }}</span>
              </NuxtLink>
            </div>

            <!-- Main nav menu -->
            <nav v-if="menu" class="hidden w-full lg:w-auto lg:flex">
              <ul class="flex justify-center">
                <li
                  v-for="(item, index) in menu.items"
                  :key="item.name"
                  class="mb-0 sw-nav-link-wrapper"
                >
                  <a
                    v-if="item.type === 'url'"
                    class="
                      relative
                      flex
                      items-center
                      h-full
                      px-5
                      pt-1
                      border-b-4 border-transparent
                      rounded-none
                      sw-nav-link
                    "
                    rel="noreferrer noopener"
                    :href="item.value"
                    :target="
                      item.options.target === 'blank' ? '_blank' : '_self'
                    "
                    >{{ item.name }}</a
                  >
                  <NuxtLink
                    v-else
                    :to="localePath(resolveUrl(item))"
                    :title="item.description"
                    class="
                      relative
                      flex
                      items-center
                      h-full
                      px-5
                      pt-1
                      border-b-4 border-transparent
                      rounded-none
                      sw-nav-link
                    "
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
                      :class="{ 'mega-nav hidden fade-in': !mounted }"
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
              <!-- Locale select -->
              <LocaleSelect
                v-if="$i18n.locales.length > 1"
                class="hidden lg:block"
                appearance="float"
              />
              <!-- Currency select -->
              <CurrencySelect
                v-if="currencyList.length > 1"
                :current-currency="currency"
                class="hidden lg:block"
                appearance="float"
              />
              <!-- Search icon -->
              <button
                :aria-label="$t('navigation.search')"
                class="h-10 p-2 text-inherit"
                @click.prevent="$emit('click-search')"
              >
                <BaseIcon icon="uil:search" />
              </button>
              <!-- Account icon -->
              <NuxtLink
                class="hidden h-10 p-2 lg:inline-block"
                :aria-label="$t('navigation.account')"
                :to="
                  localePath(
                    customerLoggedIn ? '/account/orders/' : '/account/login/'
                  )
                "
              >
                <BaseIcon icon="uil:user" />
              </NuxtLink>
              <!-- Cart icon -->
              <button
                class="relative h-10 p-2 text-inherit"
                data-sw-path="cart"
                data-sw-click="true"
                :aria-label="$t('cart.title')"
                @click.prevent="
                  $store.commit('setState', {
                    key: 'cartIsActive',
                    value: true,
                  })
                "
              >
                <BaseIcon icon="uil:cart" />
                <div
                  v-if="cart && cart.itemQuantity"
                  class="
                    absolute
                    top-0
                    flex
                    items-center
                    justify-center
                    w-6
                    h-6
                    rounded-full
                    fade-in
                    left-5
                    bg-accent-default
                    text-primary-lighter
                  "
                >
                  <span class="block mt-px leading-none text-2xs">{{
                    cart.itemQuantity
                  }}</span>
                </div>
              </button>
              <!-- Mobile nav toggle -->
              <button
                :class="{ 'is-active': mobileNavIsVisible }"
                class="
                  relative
                  w-10
                  h-10
                  p-1
                  ml-2
                  rounded
                  outline-none
                  hamburger hamburger--squeeze
                  lg:hidden
                "
                type="button"
                :aria-label="$t('navigation.menu')"
                @click="setMobileNavVisibility"
              >
                <span class="absolute w-6 h-6 center-xy">
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
import debounce from 'lodash/debounce'

export default {
  name: 'TheHeader',

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
      scrollRAF: null,
      currencyList: [],
    }
  },

  async fetch() {
    const { $swell } = this

    // Get menu ID
    const menuId = await $swell.settings.get('header.menu', 'header')

    // Set component data
    this.header = await $swell.settings.get('header')
    this.menu = await $swell.settings.menus(menuId)
    this.storeName = await $swell.settings.get('store.name', 'ORIGIN')
    this.logoSrc = await $swell.settings.get('header.logo.file.url')
    this.currencyList = await $swell.currency.list()
  },

  computed: {
    ...mapState(['cart', 'customerLoggedIn', 'currency', 'locale']),
  },

  watch: {
    $route() {
      // Close mega/mobile nav menu when the page changes
      this.hideHeader = false
      this.setMobileNavVisibility(false)
    },
    locale() {
      this.$fetch()
    },
  },

  created() {
    // Attach debounce method, to allow it to be cancelled
    this.hideMegaNav = debounce(this.hideMegaNav, 200)
    this.$store.dispatch('selectCurrency')
  },

  mounted() {
    this.mounted = true
    this.setScrollListener(true)
    this.$store.commit('setState', {
      key: 'headerHeight',
      value: this.$refs.header.offsetHeight,
    })
  },

  beforeDestroy() {
    this.setScrollListener(false)
    cancelAnimationFrame(this.scrollRAF)
  },

  methods: {
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
      if (!this.mounted) return true

      // Show MegaNav, depending on which nav link is selected
      if (this.megaNavIsEnabled && this.currentMegaNavIndex === index)
        return true
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
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop
      if (currentScrollPosition < 0) return

      // Stop executing this function if the difference between
      // current scroll position and last scroll position is less than some offset
      if (Math.abs(currentScrollPosition - this.lastScrollPos) < 50) return

      if (currentScrollPosition > this.lastScrollPos) {
        // Stop executing if hide header is already true
        if (this.hideHeader) {
          this.lastScrollPos = currentScrollPosition
          return
        }
        this.hideHeader = true
        this.$store.commit('setState', { key: 'headerIsVisible', value: false })
      } else {
        // Stop executing if hide header is already false
        if (!this.hideHeader) {
          this.lastScrollPos = currentScrollPosition
          return
        }
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
        process.client && window.addEventListener('scroll', this.handleScroll)
      } else {
        process.client &&
          window.removeEventListener('scroll', this.handleScroll)
        this.hideHeader = false
      }
    },
  },
}
</script>

<style lang="postcss">
.sw-nav-link {
  &:focus,
  &.nuxt-link-active {
    @apply shadow-none text-accent-default border-accent-default;
  }
}

.mega-nav:hover,
.sw-nav-link-wrapper a:hover + .mega-nav {
  @apply block;
}

.hamburger {
  @apply cursor-pointer;
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
  transition: bottom 0.075s 0.12s ease,
    transform 0.075s cubic-bezier(0.55, 0.055, 0.675, 0.19);
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
  transition: bottom 0.075s ease,
    transform 0.075s 0.12s cubic-bezier(0.215, 0.61, 0.355, 1);
}
</style>
