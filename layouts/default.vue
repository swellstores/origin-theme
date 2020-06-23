<template>
  <div class="relative">
    <TheAnnouncementBar />
    <TheHeader @click-cart="cartIsActive = true" @click-search="searchIsActive = true" />
    <div :class="{ 'overflow-y-hidden': searchIsActive }">
      <nuxt />
    </div>
    <TheFooter />
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
import get from 'lodash/get'

export default {
  data() {
    return {
      cartIsActive: false,
      searchIsActive: false,
      cookieNotificationIsActive: false // TODO set true
    }
  },

  computed: {
    ...mapState(['notification'])
  },

  watch: {
    $route() {
      this.cartIsActive = false
      this.searchIsActive = false
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
