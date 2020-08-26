<template>
  <div class="relative">
    <div :class="{ 'overflow-y-hidden': searchIsActive }">
      <TheHeader @click-cart="cartIsActive = true" @click-search="searchIsActive = true" />
      <div style="min-height: 100vh">
        <nuxt keep-alive :keep-alive-props="{ max: 10 }" />
      </div>
      <TheFooter />
    </div>
    <transition name="fade-up">
      <TheCookieNotification />
    </transition>
    <transition name="fade-up">
      <TheToastNotification
        v-if="notification"
        :message="notification.message"
        :type="notification.type"
      />
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
      cookieNotificationIsActive: false // TODO set true
    }
  },

  computed: {
    ...mapState(['notification', 'cookiesWereAccepted'])
  },

  watch: {
    $route(to, from) {
      this.cartIsActive = false
      this.searchIsActive = false
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
    if (this.getCookie('cookiesAccepted')) {
      this.$store.commit('setState', { key: 'cookiesWereAccepted', value: true })
    }
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
