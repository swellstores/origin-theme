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
          <div class="relative container py-5 border-b">
            <div class="flex justify-between items-center">
              <h3>Sign in</h3>
              <button @click.prevent="$emit('click-close')">
                <BaseIcon icon="uil:multiply" size="lg" />
              </button>
            </div>
          </div>

          <div class="relative container py-10">
            <label class="label-xs-bold-faded mb-2 inline-block" for="customerEmail">Email</label>
            <input
              id="customerEmail"
              ref="searchInput"
              v-model="inputValue"
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
              v-model="inputValue"
              type="email"
              placeholder="Your email"
              class="w-full px-4 py-2 mb-2 rounded bg-primary-lightest text-primary-darkest"
            />
            
            <a class="text-xs font-semibold leading-tight text-primary-dark" href="#"
              >Did you forget your password?</a
            >

            <button class="btn btn--lg w-full my-4" type="button">
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
  name: 'TheCustomerLogin',

  data() {
    return {
      couponCode: null
    }
  },

  mounted() {},

  methods: {}
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
