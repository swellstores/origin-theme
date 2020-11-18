<template>
  <div class="relative">
    <div :class="{ 'overflow-y-hidden': searchIsActive || customerLoginIsActive || cartIsActive }">
      <TheHeader
        @click-cart="cartIsActive = true"
        @click-search="searchIsActive = true"
        @click-customer-login="customerLoginIsActive = true"
      />

      <div class="min-h-100vh bg-primary-lighter">
        <div v-if="customer" class="relative pt-6 pb-24">
          <!-- Header -->
          <div class="border-b border-primary-med pb-6">
            <div class="container">
              <h3>{{ customer.firstName }} {{ customer.lastName }}</h3>
              <p>{{ customer.email }}</p>
              <button
                class="flex flex-row items-center mt-2 cursor-pointer"
                @click="editProfilePanelIsActive = true"
              >
                <BaseIcon icon="uil:edit" size="sm" /><span class="ml-2"
                  >Edit profile and password</span
                >
              </button>
            </div>
          </div>

          <PanelEditProfile
            v-if="editProfilePanelIsActive"
            @click-close="editProfilePanelIsActive = false"
          />

          <div class="py-6">
            <div class="container">
              <InputDropdown
                :options="views"
                :value="currentRouteValue"
                @change="$router.push(`/account/${$event}/`)"
              />
            </div>
          </div>
          <nuxt keep-alive :keep-alive-props="{ max: 10 }" />
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
    <TheCustomerPanel v-show="customerLoginIsActive" @click-close="customerLoginIsActive = false" />
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
        },
        {
          label: 'Support',
          value: 'support'
        }
      ],
      editProfilePanelIsActive: false,
      cartIsActive: false,
      customerLoginIsActive: false,
      searchIsActive: false
    }
  },

  computed: {
    ...mapState(['notification', 'customer']),
    currentRouteValue() {
      const [path] = this.$route.path
        .split('/')
        .filter(e => e)
        .splice(-1)
      return path
    }
  },

  mounted() {
    // Initialize customer (if logged in, set customer state)
    this.$store.dispatch('initializeCustomer')

    console.log()
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
