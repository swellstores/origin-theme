<template>
  <div class="relative">
    <div
      class="flex flex-col min-h-screen"
      :class="{ 'overflow-y-hidden': searchIsActive || cartIsActive }"
    >
      <TheHeader @click-search="searchIsActive = true" />
      <TheToastNotification
        v-if="notification"
        class="z-40"
        :message="notification.message"
        :type="notification.type"
      />
      <div class="flex flex-col flex-grow">
        <nuxt keep-alive :keep-alive-props="{ max: 10 }" />
      </div>
      <TheFooter />
    </div>
    <TheCookieNotification />
    <TheCart v-show="cartIsActive" />
    <TheSearch v-if="searchIsActive" @click-close="searchIsActive = false" />
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  data() {
    return {
      searchIsActive: false,
      cookieNotificationIsActive: false, // TODO set true,
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
          body: true,
        },
        {
          type: 'text/javascript',
          innerHTML: this.$swell.settings.get('scripts.global.head'),
        },
        {
          type: 'text/javascript',
          innerHTML: this.$swell.settings.get('scripts.global.body'),
          body: true,
        },
      ],
    }
  },

  computed: {
    ...mapState(['cartIsActive', 'notification', 'cookiesWereAccepted']),
  },

  watch: {
    $route(to) {
      // Hide cart and search on reroute
      this.$store.commit('setState', { key: 'cartIsActive', value: false })
      this.searchIsActive = false

      // Hide notification on reroute
      this.$store.commit('setState', { key: 'notification', value: null })
    },
  },

  mounted() {
    // Check if cookies are accepted
    if (this.getCookie('cookiesAccepted')) {
      this.$store.commit('setState', {
        key: 'cookiesWereAccepted',
        value: true,
      })
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
    },
  },
}
</script>
