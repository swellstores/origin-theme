<template>
  <transition name="fade-up" appear>
    <div
      v-if="showCookieNotification"
      class="fixed inset-x-6 bottom-6 z-20 rounded border border-primary-light bg-primary-lightest px-4 py-3 shadow-md sm:left-auto sm:max-w-80"
    >
      <div v-if="type === 'compact'" class="flex items-center justify-between">
        <p class="text-sm">
          {{ $t('notifications.cookies.message') }}
          <NuxtLink
            :to="
              localePath(resolveUrl({ type: 'page', value: 'privacy-policy' }))
            "
          >
            {{ $t('notifications.cookies.privacy') }}
          </NuxtLink>
        </p>
        <button
          type="button"
          class="ml-3 h-8 w-8 rounded-full bg-primary-light p-1"
          :aria-label="$t('notifications.cookies.close')"
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
      showCookieNotification: false,
    };
  },

  mounted() {
    // Check if cookies were accepted previously.
    if (!this.getCookie('cookiesAccepted')) {
      this.showCookieNotification = true;
    }
  },

  methods: {
    getCookie(name) {
      const pattern = RegExp(name + '=.[^;]*');
      const matched = document.cookie.match(pattern);
      if (matched) {
        const cookie = matched[0].split('=');
        return cookie[1];
      }
      return false;
    },
    acceptCookies() {
      this.showCookieNotification = false;
      this.$store.commit('setState', {
        key: 'cookiesAreAccepted',
        value: true,
      });
      const daysToExpire = 365;
      document.cookie = `cookiesAccepted=true; max-age=${
        daysToExpire * 60 * 60 * 1000
      }; path=/;`;
    },
  },
};
</script>
