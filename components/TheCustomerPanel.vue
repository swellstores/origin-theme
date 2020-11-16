<template>
  <transition name="customerLogin" :duration="700">
    <div class="z-40 fixed inset-0">
      <!-- Overlay -->
      <div
        class="overlay absolute w-full h-full bg-primary-darker hidden md:block"
        @click="$emit('click-close')"
      ></div>

      <!-- Panel -->
      <div class="panel absolute w-full h-full right-0 max-w-112">
        <div class="w-full h-full bg-primary-lighter overflow-y-scroll">
          <!-- Header -->
          <div class="relative container py-5">
            <div class="flex justify-between items-center">
              <h3 class="text-xl" v-if="customerLoggedIn">Account</h3>
              <h3 v-else>Sign in</h3>
              <button @click.prevent="$emit('click-close')">
                <BaseIcon icon="uil:multiply" />
              </button>
            </div>
          </div>

          <div v-if="customerLoggedIn" class="text-xl">
            <div class="container py-6">
              <ul>
                <li>
                  <NuxtLink
                    class="w-full flex items-center py-4"
                    to="/account/orders/"
                    @click.native="$emit('click-close')"
                    >Orders & Returns <BaseIcon class="ml-auto" icon="uil:angle-right" size="lg"
                  /></NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    class="w-full flex items-center py-4"
                    to="/account/addresses/"
                    @click.native="$emit('click-close')"
                    >Addresses <BaseIcon class="ml-auto" icon="uil:angle-right" size="lg"
                  /></NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    class="w-full flex items-center py-4"
                    to="/account/payment/"
                    @click.native="$emit('click-close')"
                    >Payment methods <BaseIcon class="ml-auto" icon="uil:angle-right" size="lg"
                  /></NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    class="w-full flex items-center py-4"
                    to="/account/support/"
                    @click.native="$emit('click-close')"
                    >Support <BaseIcon class="ml-auto" icon="uil:angle-right" size="lg"
                  /></NuxtLink>
                </li>
              </ul>
            </div>

            <div class="border-t">
              <div class="container">
                <button class="w-full flex items-center py-6" @click="logout()">
                  <BaseIcon class="mr-2" icon="uil:signout" size="lg" />Log out
                </button>
              </div>
            </div>
          </div>

          <div v-else class="relative container pt-6">
            <label class="label-xs-bold-faded mb-2 inline-block" for="customerEmail">Email</label>
            <input
              id="customerEmail"
              ref="searchInput"
              v-model="customerEmail"
              type="email"
              placeholder="Your email"
              class="w-full px-4 py-2 mb-4 rounded bg-primary-lightest text-primary-darkest"
            />

            <label class="label-xs-bold-faded mb-2 inline-block" for="customerPassword"
              >Password</label
            >
            <input
              id="customerPassword"
              ref="searchInput"
              v-model="customerPassword"
              type="password"
              placeholder="Your password"
              class="w-full px-4 py-2 mb-2 rounded bg-primary-lightest text-primary-darkest"
            />

            <a class="text-xs font-semibold leading-tight text-primary-dark" href="#"
              >Did you forget your password?</a
            >

            <button class="btn btn--lg w-full mt-6 mb-4" type="button" @click="login()">
              Login
            </button>

            <button class="btn btn--lg light w-full" type="button">
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  name: 'TheCustomerPanel',

  data() {
    return {
      customerEmail: null,
      customerPassword: null
    }
  },

  computed: {
    ...mapState(['customerLoggedIn'])
  },

  methods: {
    async login() {
      try {
        const res = await this.$swell.account.login(this.customerEmail, this.customerPassword)

        if (!res || res === null) {
          throw Error('Error')
        }

        this.$store.commit('setState', { key: 'customerLoggedIn', value: true })
      } catch (err) {
        console.log(err)
      }
    },

    async logout() {
      try {
        await this.$swell.account.logout()
        this.$store.commit('setState', { key: 'customerLoggedIn', value: false })
        this.$emit('click-close')
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.overlay {
  @apply opacity-50;
}

.customerLogin-enter-active .overlay,
.customerLogin-leave-active .overlay {
  @apply transition-all duration-500 ease-in-out;
}

.customerLogin-enter .overlay,
.customerLogin-leave-to .overlay {
  @apply opacity-0;
}

.customerLogin-enter-to .overlay,
.customerLogin-leave .overlay {
  @apply opacity-50;
}

.customerLogin-enter-active .panel,
.customerLogin-leave-active .panel {
  @apply transition-all duration-700;
  transition-timing-function: cubic-bezier(0.6, 0.2, 0, 1);
}

.customerLogin-enter .panel,
.customerLogin-leave-to .panel {
  @apply transform translate-x-full;
}

.customerLogin-enter-to .panel,
.customerLogin-leave .overlay {
  @apply transform translate-x-0;
}
</style>
