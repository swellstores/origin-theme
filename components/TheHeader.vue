<template>
  <div>
    <!-- Spacer element to mirror header height; if changing
    padding on header logo, change here too -->
    <div class="flex opacity-0">
      <div class="py-3"><StoreLogo /></div>
    </div>
    <div class="z-40 fixed top-0 w-full bg-primary-lightest shadow-md">
      <header class="container flex justify-between items-stretch">
        <div class="py-3"><StoreLogo /></div>
        <!-- Main nav -->
        <nav class="hidden items-stretch lg:flex">
          <ul class="flex flex-row items-center">
            <li
              v-for="item in menu.items"
              :key="item.name"
              class="has-mega-nav inline-block h-full mb-0"
            >
              <NuxtLink
                :to="resolveUrl(item)"
                :title="item.description"
                class="main-nav-link label-sm-bold"
                @click.native="megaNavIsEnabled = false"
                @mouseleave.native="resetMegaNav"
              >
                <span class="center-y relative block">{{ item.name }}</span>
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

        <div class="flex flex-row items-center -mr-2">
          <!-- Search icon -->
          <button class="hidden h-10 p-2 lg:inline-block" @click.prevent="$emit('click-search')">
            <BaseIcon icon="uil:search" />
          </button>
          <!-- Account icon -->
          <a class="hidden h-10 p-2 lg:inline-block" href="#">
            <BaseIcon icon="uil:user" />
          </a>
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
            class="hamburger hamburger--spring h-8 p-1 ml-4 rounded lg:hidden"
            type="button"
            @click="mobileNavIsVisible = !mobileNavIsVisible"
          >
            <span class="hamburger-box">
              <span class="hamburger-inner"></span>
            </span>
          </button>
        </div>
      </header>

      <!-- Full screen nav for small screens -->
      <TheMobileNav v-if="mobileNavIsVisible" :menu="menu" />
    </div>
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  name: 'TheHeader',

  data() {
    return {
      menu: [],
      megaNavIsEnabled: true,
      mobileNavIsVisible: false
    }
  },

  computed: {
    ...mapState(['cart'])
  },

  watch: {
    $route() {
      // Close mega/mobile nav menu when the page changes
      this.mobileNavIsVisible = false
    }
  },

  async fetch() {
    const { $swell } = this
    this.menu = await $swell.settings.menus('header') || {}
  },

  methods: {
    resetMegaNav(event) {
      // When a link is clicked, we want the mega nav to disappear
      if (event.type === 'click') {
        this.megaNavIsEnabled = false
      }

      // We'll wait for the hover state to be broken then re-enable it
      setTimeout(() => {
        this.megaNavIsEnabled = true
      }, 10)
    }
  }
}
</script>

<style lang="postcss">
.main-nav-link {
  @apply relative block h-full pt-1 px-5 uppercase rounded-none border-transparent border-b-4;

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
  cursor: pointer;

  transition-property: opacity, filter;
  transition-duration: 0.15s;
  transition-timing-function: linear;
}

.hamburger-box {
  width: 24px;
  height: 24px;
  display: inline-block;
  position: relative;
}

.hamburger-inner {
  display: block;
  top: 50%;
  margin-top: -1px;

  &,
  &::before,
  &::after {
    width: 24px;
    height: 2px;
    background-color: #000;
    border-radius: 0px;
    position: absolute;
    transition-property: transform;
    transition-duration: 0.15s;
    transition-timing-function: ease;
  }

  &::before,
  &::after {
    content: '';
    display: block;
  }

  &::before {
    top: -8px;
  }

  &::after {
    bottom: -8px;
  }
}

.hamburger--spring {
  & .hamburger-inner {
    top: 4px;
    transition: background-color 0s 0.13s linear;

    &::before {
      top: 8px;
      transition: top 0.1s 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1),
        transform 0.13s cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }

    &::after {
      top: 16px;
      transition: top 0.2s 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1),
        transform 0.13s cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }
  }

  &.is-active {
    & .hamburger-inner {
      transition-delay: 0.22s;
      background-color: transparent;

      &::before {
        top: 0;
        transition: top 0.1s 0.15s cubic-bezier(0.33333, 0, 0.66667, 0.33333),
          transform 0.13s 0.22s cubic-bezier(0.215, 0.61, 0.355, 1);
        transform: translate3d(0, 8px, 0) rotate(45deg);
      }

      &::after {
        top: 0;
        transition: top 0.2s cubic-bezier(0.33333, 0, 0.66667, 0.33333),
          transform 0.13s 0.22s cubic-bezier(0.215, 0.61, 0.355, 1);
        transform: translate3d(0, 8px, 0) rotate(-45deg);
      }
    }
  }
}
</style>
