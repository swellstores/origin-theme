<template>
  <div>
    <!-- Duplicate elements to match header height and push main content down -->
    <div class="opacity-0">
      <ThePromoBar
        v-if="header.showPromo"
        text="|"
        :hidden="header.hideOnScroll && headerIsHidden"
      />
      <div class="py-3"><StoreLogo /></div>
    </div>

    <!-- Full screen nav for small screens -->
    <TheMobileNav v-if="mobileNavIsVisible" :menu-items="menu.items" />

    <!-- Main header -->
    <div class="z-40 fixed top-0 w-full">
      <ThePromoBar
        v-if="header.showPromo"
        :url="header.promoUrl"
        :text="header.promoText || '[ Promotional text ]'"
        :hidden="header.hideOnScroll && headerIsHidden"
      />

      <div class="w-full fixed transform translate-y-0 transition-all ease-in-out duration-200">
        <header
          class="transition-all duration-300 ease-in-out z-40"
          :class="[
            ' bg-primary-lightest lg:shadow-md',
            { 'transform -translate-y-full': header.hideOnScroll && headerIsHidden }
          ]"
        >
          <div class="relative md:container flex items-stretch justify-between items-stretch z-20">
            <div class="py-3 pl-6"><StoreLogo /></div>
            <!-- Main nav -->
            <nav v-if="menu" class="w-full lg:w-auto hidden lg:flex">
              <ul class="sw-nav-links flex justify-center items-center">
                <li
                  v-for="item in menu.items"
                  :key="item.name"
                  class="has-mega-nav inline-block flex-shrink-0 mb-0"
                >
                  <NuxtLink
                    :to="resolveUrl(item)"
                    :title="item.description"
                    class="sw-nav-link relative block h-full pt-1 px-5 rounded-none border-transparent border-b-4"
                    @click.native="megaNavIsEnabled = false"
                    @mouseleave.native="resetMegaNav"
                  >
                    <span class="relative inline-block top-1/2 transform">
                      {{ item.name }}
                    </span>
                  </NuxtLink>
                  <!-- Show mega nav if item has child items -->
                  <div
                    v-if="item && item.items && megaNavIsEnabled"
                    class="mega-nav fade-in hidden absolute left-0 right-0 min-h-full"
                  >
                    <MegaNav :items="item.items" @click="resetMegaNav" />
                  </div>
                </li>
              </ul>
            </nav>

            <!-- END Main nav -->

            <div class="flex flex-row pr-6 items-center lg:order-2 -mr-2">
              <!-- Search icon -->
              <button class="h-10 p-2" @click.prevent="$emit('click-search')">
                <BaseIcon icon="uil:search" />
              </button>
              <!-- Account icon -->
              <!--TODO awaiting customer account area
              <a class="hidden h-10 p-2 lg:inline-block" href="#">
                <BaseIcon icon="uil:user" />
              </a>
              -->
              <!-- Cart icon -->
              <button class="relative h-10 p-2" @click.prevent="$emit('click-cart')">
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

          <!-- END Main nav -->
        </header>
      </div>
    </div>
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  name: 'TheHeader',

  fetch() {
    const { $swell } = this

    // Get menu settings
    const menuId = $swell.settings.get('header.menu', 'header')

    // Set menu
    this.menu = $swell.settings.menus(menuId)

    // Set component data
    this.header = $swell.settings.get('header', {})

    // Reset scroll listener
    this.setScrollListener(true);
  },

  data() {
    return {
      header: {},
      menu: {},
      mounted: false,
      megaNavIsEnabled: true,
      mobileNavIsVisible: false,
      headerIsHidden: false,
      lastScrollPos: 0,
      scrolled: false,
      scrollRAF: null
    }
  },

  computed: {
    ...mapState(['cart'])
  },

  watch: {
    $route() {
      // Close mega/mobile nav menu when the page changes
      this.headerIsHidden = false
    }
  },

  mounted() {
    this.mounted = true
    this.setScrollListener(true)
  },

  beforeDestroy() {
    this.mounted = false
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

    setHeaderVisibility() {
      this.scrolled = false
      // Check how far page is scrolled
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
      if (currentScrollPosition < 0) return

      // Stop executing this function if the difference between
      // current scroll position and last scroll position is less than some offset
      if (Math.abs(currentScrollPosition - this.lastScrollPos) < 50) return

      this.headerIsHidden = currentScrollPosition > this.lastScrollPos
      this.lastScrollPos = currentScrollPosition
    },

    handleScroll() {
      if (!this.scrolled) {
        this.scrolled = true
        this.scrollRAF = requestAnimationFrame(this.setHeaderVisibility)
      }
    },

    setScrollListener(value) {
      // Ignore if hide on scroll is disabled in settings
      if (!this.mounted || !this.header.hideOnScroll) return

      if (value) {
        window.addEventListener('scroll', this.handleScroll)
      } else {
        window.removeEventListener('scroll', this.handleScroll)
        this.headerIsHidden = false
      }
    },

    resetMegaNav(event) {
      // When a link is clicked, make the mega nav disappear
      if (event.type === 'click') {
        this.megaNavIsEnabled = false
      }

      // Wait for the hover state to be broken then re-enable the nav
      setTimeout(() => {
        this.megaNavIsEnabled = true
      }, 10)
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
.has-mega-nav a:hover + .mega-nav {
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
