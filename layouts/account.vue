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
          class="w-full md:container md:flex relative md:pt-12 pt-6 pb-24"
        >
          <!-- Header -->
          <div>
            <div
              class="
                min-w-56
                container
                border-b
                md:border-b-0 md:border-r
                border-primary-light
                md:px-0
                mb-6
              "
            >
              <div class="md:pr-10 pb-6">
                <h3>{{ customer.firstName }} {{ customer.lastName }}</h3>
                <p>{{ customer.email }}</p>

                <button
                  class="
                    flex flex-row
                    whitespace-no-wrap
                    items-center
                    mt-2
                    cursor-pointer
                  "
                  @click="editProfilePopupIsActive = true"
                >
                  <BaseIcon icon="uil:edit" size="sm" /><span class="ml-2">{{
                    $t('account.edit')
                  }}</span>
                </button>

                <!-- Log out (Desktop) -->
                <button
                  class="
                    flex flex-row
                    md:hidden
                    whitespace-no-wrap
                    items-center
                    mt-2
                    cursor-pointer
                  "
                  @click="logoutPopupIsActive = true"
                >
                  <BaseIcon icon="uil:signout" size="sm" /><span class="ml-2">{{
                    $t('account.logout.label')
                  }}</span>
                </button>
              </div>

              <!-- Views (Desktop) -->
              <ul
                class="hidden md:block border-t border-primary-light text-base"
              >
                <li
                  v-for="view in localizedViews"
                  :key="view.value"
                  class="last:mb-0"
                >
                  <NuxtLink
                    class="
                      view-link
                      pl-3
                      py-4
                      block
                      hover:bg-primary-light
                      rounded-none
                    "
                    :to="localePath(`/account/${view.value}/`)"
                  >
                    {{ view.label }}
                  </NuxtLink>
                </li>
              </ul>

              <!-- Log out (Mobile) -->
              <div class="hidden md:block border-t border-primary-light pt-6">
                <button
                  class="
                    flex flex-row
                    whitespace-no-wrap
                    items-center
                    mt-2
                    cursor-pointer
                  "
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
          <div v-if="!hideOnRouteRoot" class="block md:hidden pb-6">
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
import { mapState } from 'vuex'

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
      ],
    }
  },

  computed: {
    ...mapState([
      'notification',
      'cartIsActive',
      'customer',
      'customerLoggedIn',
    ]),

    currentRouteValue() {
      const path = this.$route.path

      const currentRoot = this.views.filter((view) => {
        return path.includes(view.value)
      })

      if (currentRoot.length) {
        return currentRoot[0].value
      }

      return ''
    },

    hideOnRouteRoot() {
      const matchedPath = this.$route.matched[0].path
      const pathsToHideOn = [
        '/account/orders/:id/',
        '/account/subscriptions/:id/',
      ]
      return pathsToHideOn.some((path) => matchedPath.includes(path))
    },

    localizedViews() {
      const { views } = this
      return views.map(({ label, value }) => ({ label: this.$t(label), value }))
    },
  },

  watch: {
    $route(to) {
      this.searchIsActive = false
    },
  },

  async mounted() {
    // Initialize customer (if logged in, set customer state)
    const customer = await this.$swell.account.get()

    // Persistent middleware workaround
    if (customer) {
      this.$store.dispatch('initializeCustomer')
    } else {
      this.$store.dispatch('showNotification', {
        message: this.$t('account.login.notLoggedIn'),
        type: 'error',
      })
      this.$router.push(this.localePath('/account/login/'))
    }
  },

  methods: {
    async logout() {
      try {
        await this.$swell.account.logout()
        this.$store.commit('setState', {
          key: 'customerLoggedIn',
          value: false,
        })

        // Close Popup
        this.logoutPopupIsActive = false
        this.$emit('click-close')
        this.$store.dispatch('showNotification', {
          message: this.$t('account.logout.success'),
        })

        // Re-route if still in accounts
        if (this.$route.path.includes('/account/')) {
          this.$router.replace('/')
        }
      } catch (err) {}
    },
  },
}
</script>

<style lang="postcss">
.min-h-screen {
  min-height: 100vh;
}

.view-link.nuxt-link-active {
  @apply font-bold bg-primary-light;

  &:hover {
    @apply text-primary-darkest;
  }
}
</style>
