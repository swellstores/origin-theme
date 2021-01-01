<template>
  <div class="relative">
    <div :class="{ 'overflow-y-hidden': searchIsActive || cartIsActive }">
      <TheHeader
        @click-cart="cartIsActive = true"
        @click-search="searchIsActive = true"
      />

      <div class="min-h-screen bg-primary-lighter">
        <div v-if="customer" class="w-full md:container md:flex relative md:pt-12 pt-6 pb-24">
          <!-- Header -->
          <div>
            <div
              class="min-w-56 container border-b md:border-b-0 md:border-r border-primary-light md:px-0"
            >
              <div class="md:pr-10 pb-6">
                <h3>{{ customer.firstName }} {{ customer.lastName }}</h3>
                <p>{{ customer.email }}</p>

                <button
                  class="flex flex-row whitespace-no-wrap items-center mt-2 cursor-pointer"
                  @click="editProfilePanelIsActive = true"
                >
                  <BaseIcon icon="uil:edit" size="sm" /><span class="ml-2">Edit profile</span>
                </button>

                <button
                  class="flex flex-row whitespace-no-wrap items-center mt-2 cursor-pointer"
                  @click="logoutPanelIsActive = true"
                >
                  <BaseIcon icon="uil:signout" size="sm" /><span class="ml-2">Log out </span>
                </button>
              </div>

              <!-- Views (Desktop) -->
              <ul class="hidden md:block border-t border-primary-light text-base">
                <li v-for="view in views" :key="view.value">
                  <NuxtLink
                    class="pl-3 py-4 block hover:bg-primary-light rounded-none"
                    :to="`/account/${view.value}/`"
                    >{{ view.label }}</NuxtLink
                  >
                </li>
              </ul>
            </div>
          </div>

          <PanelEditProfile
            v-if="editProfilePanelIsActive"
            @click-close="editProfilePanelIsActive = false"
          />

          <!-- Views (Mobile) -->
          <div class="block md:hidden py-6">
            <div class="container">
              <InputDropdown
                :options="views"
                :value="currentRouteValue"
                @change="$router.push(`/account/${$event}/`)"
              />
            </div>
          </div>

          <div class="w-full">
            <nuxt keep-alive :keep-alive-props="{ max: 10 }" />
          </div>
        </div>
      </div>

      <TheFooter />
    </div>

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

    <PanelConfirmation
      v-if="logoutPanelIsActive"
      heading="Logout"
      promptMessage="Are you sure you want to logout?"
      acceptLabel="Yes"
      refuseLabel="No"
      @accept="logout"
      @click-close="logoutPanelIsActive = false"
    />
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
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
  },

  data() {
    return {
      views: [
        {
          label: 'Orders & Returns',
          value: 'orders'
        },
        {
          label: 'Addresses',
          value: 'addresses'
        },
        {
          label: 'Payment methods',
          value: 'payments'
        }
      ],
      editProfilePanelIsActive: false,
      logoutPanelIsActive: false,
      cartIsActive: false,
      searchIsActive: false
    }
  },

  computed: {
    ...mapState(['notification', 'customer', 'customerLoggedIn']),
    currentRouteValue() {
      const path = this.$route.path

      const currentRoot = this.views.filter(view => {
        return path.includes(view.value)
      })

      if (currentRoot.length) {
        return currentRoot[0].value
      }
    }
  },

  watch: {
    $route(to, from) {
      this.cartIsActive = false
      this.searchIsActive = false
      if (this.$swellAnalytics) {
        this.$swellAnalytics.trackPage(to.path)
      }
    }
  },

  methods: {
    async logout() {
      try {
        await this.$swell.account.logout()
        this.$store.commit('setState', { key: 'customerLoggedIn', value: false })

        // Close panel
        this.$emit('click-close')
        this.$store.dispatch('showNotification', { message: 'You’ve succesfully logged out.' })

        // Re-route if still in accounts
        if (this.$route.path.includes('/account/')) {
          this.$router.push('/')
        }
      } catch (err) {
        console.log(err)
      }
    }
  },

  async mounted() {
    // Initialize customer (if logged in, set customer state)
    const customer = await this.$swell.account.get()

    // Persistent middleware workaround
    if (customer) {
      this.$store.dispatch('initializeCustomer')
    } else {
      this.$store.dispatch('showNotification', {
        message: 'You are currently not loogged in. Please log in to continue.',
        type: 'error'
      })
      this.$router.push('/account/login/')
    }
  }
}
</script>

<style lang="postcss">
.min-h-screen {
  min-height: 100vh;
}
</style>
