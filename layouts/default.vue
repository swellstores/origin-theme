<template>
  <div class="relative">
    <div
      class="min-h-screen flex flex-col"
      :class="{ 'overflow-y-hidden': searchIsActive || cartIsActive }"
    >
      <TheHeader @click-search="searchIsActive = true" />
      <TheToastNotification
        v-if="notification"
        class="z-40"
        :message="notification.message"
        :type="notification.type"
      />
      <div class="flex flex-grow flex-col">
        <nuxt keep-alive :keep-alive-props="{ max: 10 }" />
      </div>
      <TheFooter />
    </div>
    <TheCookieNotification />
    <TheCart v-show="cartIsActive" />
    <TheSearch v-if="searchIsActive" @click-close="searchIsActive = false" />
    <MediaPreview v-if="mediaPreviewIsVisible" />
    <QuickViewPopup
      v-if="quickViewIsVisible"
      :product-id="quickViewProductId"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      searchIsActive: false,
      faviconUrl: '',
      cookieNotificationIsActive: false, // TODO set true,
    };
  },

  async fetch() {
    const faviconUrl = await this.$swell.settings.get(
      'header.favicon.file.url',
    );

    if (faviconUrl) {
      const faviconImageTransformation = '?width=64&height=64';
      this.faviconUrl = faviconUrl + faviconImageTransformation;
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
      ],
      link: [
        {
          rel: 'preconnect',
          href: process.env.cdnHost,
          crossorigin: true,
        },
        this.faviconUrl
          ? { rel: 'icon', href: this.faviconUrl, type: 'image/x-icon' }
          : '',
      ],
    };
  },

  computed: {
    ...mapState([
      'cartIsActive',
      'notification',
      'cookiesWereAccepted',
      'quickViewIsVisible',
      'quickViewProductId',
      'mediaPreviewIsVisible',
    ]),
  },

  watch: {
    $route(to) {
      // Hide cart and search on reroute
      this.$store.commit('setState', { key: 'cartIsActive', value: false });
      this.searchIsActive = false;

      // Hide notification on reroute
      this.$store.commit('setState', { key: 'notification', value: null });
    },
  },

  mounted() {
    // Check if cookies are accepted
    if (this.getCookie('cookiesAccepted')) {
      this.$store.commit('setState', {
        key: 'cookiesWereAccepted',
        value: true,
      });
    }

    // Initialize customer (if logged in, set customer state)
    this.$store.dispatch('initializeCustomer');
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
  },
};
</script>
