<template>
  <transition
    enter-active-class="transition-opacity duration-200"
    enter-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showCookieNotification"
      class="fixed z-20 bottom-6 inset-x-6 px-4 py-3 bg-primary-lightest border border-primary-light rounded shadow-md sm:left-auto sm:max-w-80"
    >
      <div v-if="type === 'compact'" class="flex justify-between items-center">
        <p class="text-sm">
          We use cookies to improve your shopping experience.
          <NuxtLink :to="resolveUrl({ type: 'page', value: 'privacy-policy' })">
            Learn more
          </NuxtLink>
        </p>
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-primary-light ml-3 p-1"
          @click="acceptCookies"
        >
          <BaseIcon icon="uil:times" />
        </button>
      </div>
      <!-- For markets with stricter privacy regulations, requires preference settings editor
      <div v-else>
        <p class="text-sm mb-3">
          We use cookies to store your preferences, and for analytics and marketing purposes.
        </p>
        <div class="flex justify-between items-center">
          <div class="text-sm">
            <NuxtLink to="/privacy-policy" class="mr-4">
              Learn more
            </NuxtLink>
            <NuxtLink to="/account/privacy">
              Settings
            </NuxtLink>
          </div>
          <button type="button" class="btn" @click="acceptCookies">Accept</button>
        </div>
      </div>
    --></div>
  </transition>
</template>

<script>
export default {
  name: 'TheCookieNotification',

  data() {
    return {
      type: 'compact',
      showCookieNotification: false
    }
  },

  mounted() {
    // Check if cookies were accepted previously.
    if (!this.getCookie('cookiesAccepted')) {
      this.showCookieNotification = true
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
    },
    acceptCookies() {
      this.showCookieNotification = false
      this.$store.commit('setState', { key: 'cookiesAreAccepted', value: true })
      const daysToExpire = 365
      document.cookie = `cookiesAccepted=true; max-age=${daysToExpire * 60 * 60 * 1000}; path=/;`
    }
  }
}
</script>
