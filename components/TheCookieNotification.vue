<template>
  <transition
    enter-active-class="transition-opacity duration-200"
    enter-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="showCookieNotification" class="container z-20">
      <div :class="{ 'w-4/5': type === 'compact', 'w-full mb-4': type === 'full' }">
        <p class="label-sm">
          We use cookies to store your preferences, for analytics, and to show you ads later.
          <a v-if="type === 'compact'" href="" class="font-bold">Learn more</a>
        </p>
      </div>

      <div :class="{ 'w-full flex items-center': type === 'full' }">
        <a v-if="type === 'full'" href="" class="font-bold mr-4">Learn more</a>
        <a v-if="type === 'full'" href="" class="font-bold">Settings</a>
        <span
          class="relative bg-primary-light"
          :class="{
            'block w-8 h-8 rounded-full': type === 'compact',
            'inline-block ml-auto px-3 py-2 rounded': type === 'full'
          }"
          @click="acceptCookies()"
        >
          <svg v-if="type === 'compact'" class="absolute w-3 h-3 center-xy">
            <use xlink:href="#cross-sm" />
          </svg>
          <p v-else class="label-sm-bold inline uppercase">Accept</p>
        </span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'TheCookieNotification',

  data() {
    return {
      type: 'full',
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

<style lang="postcss" scoped>
.container {
  @apply w-9/10 left-1/2 fixed flex flex-wrap justify-between items-center bottom-0 p-4 mb-6 bg-primary-lightest border border-primary-lightest rounded shadow;
  transform: translateX(-50%);

  @screen md {
    @apply max-w-80 right-0 mr-4;
    transform: unset;
  }
}
</style>
