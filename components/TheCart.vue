<template>
  <transition name="cart" :duration="700">
    <div class="z-40 fixed inset-0">
      <!-- Overlay -->
      <div
        class="overlay absolute w-full h-full bg-primary-darker hidden md:block"
        @click="$emit('click-close')"
      ></div>

      <!-- Panel -->
      <div class="panel absolute w-full h-full right-0 max-w-112">
        <div class="w-full h-full bg-primary-lightest overflow-y-scroll">
          <!-- Header -->
          <div class="relative container py-5 border-b">
            <div class="flex justify-between items-center">
              <h3>
                Cart <span v-if="cart && cart.itemQuantity">({{ cart.itemQuantity }})</span>
              </h3>
              <button @click.prevent="$emit('click-close')">
                <BaseIcon icon="uil:multiply" size="lg" />
              </button>
            </div>

            <div v-if="infoText" class="mt-4 text-sm" v-html="infoText"></div>
          </div>

          <!-- Items -->
          <div v-if="cart && cart.items">
            <CartItem
              v-for="(item, index) in cart.items"
              :key="`cartItem_${item.id}`"
              :item="item"
              :index="index"
            />
          </div>
          <div v-else class="container py-10">
            <span class="block mb-4">Your cart is empty.</span>
            <NuxtLink :to="resolveUrl({ type: 'product' })" class="btn">Shop now</NuxtLink>
          </div>

          <!-- Footer -->
          <div v-if="cart && cart.items" class="bg-primary-lighter border-t">
            <div class="container pt-6 pb-2">
              <div class="flex">
                <input
                  v-model="couponCode"
                  type="text"
                  placeholder="Add coupon or gift card code"
                  class="w-full border rounded font-medium bg-primary-lightest px-4 py-2 text-sm mr-2"
                />

                <button
                  type="button"
                  :disabled="!couponCode"
                  :class="{ disabled: !couponCode }"
                  class="btn flex-shrink-0"
                  @click="applyDiscount"
                >
                  Apply
                </button>
              </div>

              <!-- Applied discounts -->
              <div v-if="cart">
                <div v-if="cart.couponCode" class="mt-4 flex items-center">
                  <p class="label-xs-bold">{{ cart.couponCode }}</p>
                  <ButtonCross class="ml-3" @click="removeDiscount()" />
                </div>
                <div v-for="giftcard in cart.giftcards" :key="giftcard.id" class="mt-4">
                  <p class="label-xs-bold flex items-center">
                    <span>**** **** **** {{ giftcard.last4 }}</span>
                    <ButtonCross class="ml-3" @click="removeDiscount(giftcard.id)" />
                  </p>
                  <p class="text-sm">{{ formatMoney(giftcard.amount) }} gift card</p>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="container py-6 border-b">
              <div class="cart-line-total">
                <span>Subtotal</span>
                <span>{{ formatMoney(cart.subTotal) }}</span>
              </div>
              <div class="cart-line-total">
                <span>Shipping</span>
                <span>{{ formatMoney(cart.shipmentTotal) }}</span>
              </div>
              <div v-show="cart.discountTotal" class="cart-line-total">
                <span>Discounts</span>
                <span>–{{ formatMoney(cart.discountTotal) }}</span>
              </div>
              <h3 class="mt-3 flex justify-between text-xl font-semibold">
                <span>Total</span>
                <span>{{ formatMoney(cart.grandTotal) }}</span>
              </h3>
              <a
                :href="cart.checkoutUrl"
                :class="{ loading: cartIsUpdating }"
                class="btn btn--lg relative mt-4 mb-1"
              >
                <span v-show="!cartIsUpdating">Checkout</span>
                <div v-show="cartIsUpdating" class>
                  <div class="spinner absolute inset-0 mt-3"></div>
                  <span class="absolute inset-0 mt-5">Updating</span>
                </div>
              </a>
            </div>
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
  name: 'TheCart',

  fetch() {
    const { $swell } = this

    // Set component data
    this.infoText = $swell.settings.get('cart.infoText')
  },

  data() {
    return {
      couponCode: null,
      infoText: null
    }
  },

  computed: {
    ...mapState(['cart', 'cartIsUpdating'])
  },

  mounted() {
    // Pass a checkout ID as a query string param to recover a specific cart
    const { checkout: checkoutId } = this.$route.query
    this.$store.dispatch('initializeCart', { checkoutId })
  },

  methods: {
    async applyDiscount() {
      // Try to apply a coupon or gift card code
      await this.$store.dispatch('applyDiscount', this.couponCode)
      // Reset the coupon input
      this.couponCode = null
    },

    removeDiscount(id) {
      this.$store.dispatch('removeDiscount', id)
    }
  }
}
</script>

<style lang="postcss" scoped>
.cart-line-total {
  @apply flex justify-between mb-1;
}

.overlay {
  @apply opacity-50;
}

.cart-enter-active .overlay,
.cart-leave-active .overlay {
  @apply transition-all duration-500 ease-in-out;
}

.cart-enter .overlay,
.cart-leave-to .overlay {
  @apply opacity-0;
}

.cart-enter-to .overlay,
.cart-leave .overlay {
  @apply opacity-50;
}

.cart-enter-active .panel,
.cart-leave-active .panel {
  @apply transition-all duration-700;
  transition-timing-function: cubic-bezier(0.6, 0.2, 0, 1);
}

.cart-enter .panel,
.cart-leave-to .panel {
  @apply transform translate-x-full;
}

.cart-enter-to .panel,
.cart-leave .overlay {
  @apply transform translate-x-0;
}
</style>
