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
              <h3 v-else-if="flow === 'login'">Sign in</h3>
              <h3 v-else-if="flow === 'forgot-password'">Forgot your password?</h3>
              <h3 v-else>Sign up</h3>
              <button @click.prevent="$emit('click-close')">
                <BaseIcon icon="uil:multiply" />
              </button>
            </div>
          </div>

          <div v-if="customerLoggedIn" class="text-lg">
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
                    to="/account/payments/"
                    @click.native="$emit('click-close')"
                    >Payment methods <BaseIcon class="ml-auto" icon="uil:angle-right" size="lg"
                  /></NuxtLink>
                </li>
                <!--  <li>
                  <NuxtLink
                    class="w-full flex items-center py-4"
                    to="/account/support/"
                    @click.native="$emit('click-close')"
                    >Support <BaseIcon class="ml-auto" icon="uil:angle-right" size="lg"
                  /></NuxtLink>
                </li> -->
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

          <template v-else>
            <!-- Login -->
            <div v-if="flow === 'login'" class="relative container pt-6">
              <InputText
                class="mb-6"
                label="Email"
                placeholder="Your email address"
                v-model="customerEmail"
              />
              <InputText
                class="mb-6"
                label="Password"
                type="password"
                placeholder="Your password"
                v-model="customerPassword"
              />

              <button
                class="text-xs font-semibold leading-tight text-primary-dark"
                @click="flow = 'forgot-password'"
              >
                Did you forget your password?
              </button>

              <ButtonLoading
                class="dark w-full mt-6 mb-4"
                @click.native="login()"
                label="Login"
                loadingLabel="Logging in"
                :isLoading="isProcessing"
              />

              <button
                class="btn light w-full"
                type="button"
                @click=";(flow = 'signup'), (customerPassword = '')"
              >
                Create an account
              </button>
            </div>

            <!-- Sign up -->
            <div v-if="flow === 'signup'" class="relative container pt-6">
              <InputText class="mb-6" label="First Name" v-model="customerFirstName" />
              <InputText class="mb-6" label="Last Name" v-model="customerLastName" />

              <InputText
                class="mb-6"
                label="Email"
                placeholder="Your email address"
                v-model="customerEmail"
              />
              <InputText
                class="mb-6"
                label="Password"
                type="password"
                placeholder="Enter a password"
                v-model="customerPassword"
              />

              <button class="btn dark w-full mt-6 mb-4" type="button" @click="createAccount()">
                Create account
              </button>

              <button class="btn light w-full" type="button" @click="flow = 'login'">
                Login
              </button>
            </div>

            <!-- Forgot password -->
            <div v-if="flow === 'forgot-password'" class="relative container pt-6">
              <p class="text-sm mb-10">
                Enter your email address and we’ll send you an email on how to reset your password.
              </p>

              <InputText
                class="mb-6"
                label="Email"
                placeholder="Your email address"
                v-model="customerEmail"
              />

              <ButtonLoading
                class="dark w-full mt-6 mb-4"
                @click.native="sendPasswordReset()"
                label="Reset"
                loadingLabel="Processing"
                :isLoading="isProcessing"
              />
            </div>
          </template>
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
      flow: 'login',
      customerEmail: '',
      customerPassword: '',
      customerFirstName: '',
      customerLastName: '',
      isProcessing: false
    }
  },

  computed: {
    ...mapState(['customerLoggedIn'])
  },

  methods: {
    async createAccount() {
      try {
        const account = await this.$swell.account.create({
          email: this.customerEmail,
          first_name: this.customerFirstName,
          last_name: this.customerLastName,
          password: this.customerPassword,
          email_optin: true
        })

        if (account.id) {
          this.$store.commit('setState', { key: 'customerLoggedIn', value: true })
        }
      } catch (err) {
        // TODO: Error handling
        console.log(err)
      }
    },

    async sendPasswordReset() {
      try {
        this.isProcessing = true

        const res = await this.$swell.account.recover({
          email: this.customerEmail,
          reset_url: `http://localhost:3333/reset-password/?key={key}`
        })

        this.isProcessing = false

        if (res.success) {
          this.flow = 'login'
          this.$store.dispatch('showNotification', {
            message: 'An email has been sent to reset your password.'
          })
        }
      } catch (err) {
        // TODO: Error handling
        console.log(err)
      }
    },

    async login() {
      try {
        this.isProcessing = true

        const res = await this.$swell.account.login(this.customerEmail, this.customerPassword)

        this.isProcessing = false

        if (!res || res === null) {
          throw Error('Error')
        }

        this.$store.commit('setState', { key: 'customerLoggedIn', value: true })
      } catch (err) {
        // TODO: Error handling
        console.log(err)
      }
    },

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
