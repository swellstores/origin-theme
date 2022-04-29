<template>
  <div class="relative">
    <div :class="{ 'overflow-y-hidden': searchIsActive || cartIsActive }">
      <TheHeader @click-search="searchIsActive = true" />
      <TheToastNotification
        v-if="notification"
        :message="notification.message"
        :type="notification.type"
        @open-cart="cartIsActive = true"
      />

      <div class="min-h-screen bg-primary-lighter">
        <div
          v-if="customer"
          class="relative w-full pt-6 pb-24 md:container md:flex md:pt-12"
        >
          <!-- Header -->
          <div>
            <div
              class="container mb-6 min-w-56 border-b border-primary-light md:border-b-0 md:border-r md:px-0"
            >
              <div class="pb-6 md:pr-10">
                <h3>{{ customer.firstName }} {{ customer.lastName }}</h3>
                <p>{{ customer.email }}</p>

                <button
                  class="whitespace-no-wrap mt-2 flex cursor-pointer flex-row items-center"
                  @click="editProfilePopupIsActive = true"
                >
                  <BaseIcon icon="uil:edit" size="sm" /><span class="ml-2">{{
                    $t('account.edit')
                  }}</span>
                </button>

                <!-- Log out (Desktop) -->
                <button
                  class="whitespace-no-wrap mt-2 flex cursor-pointer flex-row items-center md:hidden"
                  @click="logoutPopupIsActive = true"
                >
                  <BaseIcon icon="uil:signout" size="sm" /><span class="ml-2">{{
                    $t('account.logout.label')
                  }}</span>
                </button>
              </div>

              <!-- Views (Desktop) -->
              <ul
                class="hidden border-t border-primary-light text-base md:block"
              >
                <li
                  v-for="view in localizedViews"
                  :key="view.value"
                  class="last:mb-0"
                >
                  <NuxtLink
                    class="view-link block rounded-none py-4 pl-3 hover:bg-primary-light"
                    :to="localePath(`/account/${view.value}/`)"
                  >
                    {{ view.label }}
                  </NuxtLink>
                </li>
              </ul>

              <!-- Log out (Mobile) -->
              <div class="hidden border-t border-primary-light pt-6 md:block">
                <button
                  class="whitespace-no-wrap mt-2 flex cursor-pointer flex-row items-center"
                  @click="logoutPopupIsActive = true"
                >
                  <BaseIcon icon="uil:signout" size="sm" /><span class="ml-2">{{
                    $t('account.logout.label')
                  }}</span>
                </button>
              </div>
            </div>
          </div>

          <AccountProfilePopup
            v-if="editProfilePopupIsActive"
            @click-close="editProfilePopupIsActive = false"
          />

          <!-- Views (Mobile) -->
          <div v-if="!hideOnRouteRoot" class="block pb-6 md:hidden">
            <div class="container">
              <InputDropdown
                :options="localizedViews"
                :value="currentRouteValue"
                @change="$router.push(localePath(`/account/${$event}/`))"
              />
            </div>
          </div>

          <div class="w-full">
            <nuxt keep-alive :keep-alive-props="{ max: 10 }" />
          </div>
        </div>
      </div>
    </div>

    <TheFooter />
    <TheCart v-show="cartIsActive" />
    <TheSearch v-if="searchIsActive" @click-close="searchIsActive = false" />
    <AccountConfirmationPopup
      v-if="logoutPopupIsActive"
      :heading="$t('account.logout.label')"
      :prompt-message="$t('account.logout.confirm')"
      :accept-label="$t('account.logout.confirmYes')"
      :refuse-label="$t('account.logout.confirmNo')"
      @accept="logout"
      @click-close="logoutPopupIsActive = false"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      views: [
        {
          label: 'account.orders.title',
          value: 'orders',
        },
        {
          label: 'account.subscriptions.title',
          value: 'subscriptions',
        },
        {
          label: 'account.addresses.title',
          value: 'addresses',
        },
        {
          label: 'account.payments.title',
          value: 'payments',
        },
      ],
      editProfilePopupIsActive: false,
      logoutPopupIsActive: false,
      searchIsActive: false,
      faviconUrl: '',
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
      'notification',
      'cartIsActive',
      'customer',
      'customerLoggedIn',
    ]),

    currentRouteValue() {
      const path = this.$route.path;

      const currentRoot = this.views.filter((view) => {
        return path.includes(view.value);
      });

      if (currentRoot.length) {
        return currentRoot[0].value;
      }

      return '';
    },

    hideOnRouteRoot() {
      const matchedPath = this.$route.matched[0].path;
      const pathsToHideOn = [
        '/account/orders/:id/',
        '/account/subscriptions/:id/',
      ];
      return pathsToHideOn.some((path) => matchedPath.includes(path));
    },

    localizedViews() {
      const { views } = this;
      return views.map(({ label, value }) => ({
        label: this.$t(label),
        value,
      }));
    },
  },

  watch: {
    $route(to) {
      this.searchIsActive = false;
    },
  },

  async mounted() {
    // Initialize customer (if logged in, set customer state)
    const customer = await this.$swell.account.get();

    // Persistent middleware workaround
    if (customer) {
      this.$store.dispatch('initializeCustomer');
    } else {
      this.$store.dispatch('showNotification', {
        message: this.$t('account.login.notLoggedIn'),
        type: 'error',
      });
      this.$router.push(this.localePath('/account/login/'));
    }
  },

  methods: {
    async logout() {
      try {
        await this.$swell.account.logout();
        this.$store.commit('setState', {
          key: 'customerLoggedIn',
          value: false,
        });

        // Close Popup
        this.logoutPopupIsActive = false;
        this.$emit('click-close');
        this.$store.dispatch('showNotification', {
          message: this.$t('account.logout.success'),
        });

        // Re-route if still in accounts
        if (this.$route.path.includes('/account/')) {
          this.$router.replace('/');
        }
      } catch (err) {}
    },
  },
};
</script>

<style lang="postcss">
.min-h-screen {
  min-height: 100vh;
}

.view-link.nuxt-link-active {
  @apply bg-primary-light font-bold;

  &:hover {
    @apply text-primary-darkest;
  }
}
</style>
