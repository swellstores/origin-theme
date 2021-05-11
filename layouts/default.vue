<template>
  <div class="relative">
    <div
      class="flex flex-col min-h-screen"
      :class="{ 'overflow-y-hidden': searchIsActive || cartIsActive }"
    >
      <TheHeader @click-cart="cartIsActive = true" @click-search="searchIsActive = true" />
      <transition name="fade-up-out">
        <TheToastNotification
          v-if="notification"
          :message="notification.message"
          :type="notification.type"
          @open-cart="cartIsActive = true"
        />
      </transition>
      <div class="flex flex-col flex-grow">
        <nuxt keep-alive :keep-alive-props="{ max: 10 }" />
      </div>
      <TheFooter />
    </div>
    <transition name="fade-up">
      <TheCookieNotification />
    </transition>

    <TheCart v-show="cartIsActive" @click-close="cartIsActive = false" />
    <transition name="fade">
      <TheSearch v-if="searchIsActive" @click-close="searchIsActive = false" />
    </transition>
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  data() {
    return {
      cartIsActive: false,
      searchIsActive: false,
      cookieNotificationIsActive: false // TODO set true,
    }
  },

  computed: {
    ...mapState(['notification', 'cookiesWereAccepted'])
  },

  watch: {
    $route(to, from) {
      // Hide cart and search on reroute
      this.cartIsActive = false
      this.searchIsActive = false

      // Hide notification on reroute
      this.$store.commit('setState', { key: 'notification', value: null })

      // Track page
      if (this.$swellAnalytics) {
        this.$swellAnalytics.trackPage(to.path)
      }
    },
    cookiesWereAccepted(accepted) {
      if (accepted && this.$swellAnalytics) {
        this.$swellAnalytics.enable()
      }
    }
  },

  mounted() {
    // Check if cookies are accepted
    if (this.getCookie('cookiesAccepted')) {
      this.$store.commit('setState', { key: 'cookiesWereAccepted', value: true })
    }

    // Initialize customer (if logged in, set customer state)
    this.$store.dispatch('initializeCustomer')
  },

  methods: {
    getCookie(name) {
      const pattern = RegExp(name + '=.[^;]*')
      const matched = document.cookie.match(pattern)
      if (matched) {
        const cookie = matched[0].split('=')
        return cookie[1]
      }
      return false
    }
  },

  head() {
    return {
      script: [
        // Iconify API script for loading SVG icons on demand
        {
          type: 'text/javascript',
          src: 'https://code.iconify.design/1/1.0.1/iconify.min.js',
          async: true,
          body: true
        }
      ]
    }
  }
}
</script>
