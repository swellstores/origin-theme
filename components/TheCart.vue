<template>
  <transition name="slide-modal-rtl" :duration="700">
    <div class="z-50 fixed inset-0">
      <!-- Overlay -->
      <div
        class="
          overlay
          opacity-50
          absolute
          w-full
          h-full
          bg-primary-darker
          hidden
          md:block
        "
        @click="closeCart"
      />

      <!-- Panel -->
      <div class="panel absolute w-full h-full right-0 max-w-112">
        <div class="w-full h-full bg-primary-lightest overflow-y-scroll">
          <!-- Header -->
          <div class="relative container py-5 border-b border-primary-med">
            <div class="flex justify-between items-center">
              <h3>
                {{ $t('cart.title') }}
                <span v-if="cart && cart.itemQuantity"
                  >({{ cart.itemQuantity }})</span
                >
              </h3>
              <button @click.prevent="closeCart">
                <BaseIcon icon="uil:multiply" size="lg" />
              </button>
            </div>

            <div
              v-if="$te('cart.infoText')"
              class="mt-4 text-sm"
              v-html="$t('cart.infoText')"
            />
          </div>

          <!-- Items -->
          <div v-if="cart && cart.items && cart.items.length">
            <CartItem
              v-for="(item, index) in cart.items"
              :key="`cartItem_${item.id}`"
              :item="item"
              :index="index"
            />
          </div>
          <div v-else class="container py-10">
            <span class="block mb-4">{{ $t('cart.empty') }}</span>
            <BaseButton
              :link="shopLink"
              :label="$t('cart.backToProducts')"
              fit="static"
            />
          </div>

          <!-- Footer -->
          <div
            v-if="cart && cart.items && cart.items.length"
            class="bg-primary-lighter border-t border-primary-med"
          >
            <div class="container py-6 border-b border-primary-med">
              <div class="flex">
                <input
                  v-model="couponCode"
                  type="text"
                  placeholder="Add coupon or gift card code"
                  class="
                    w-full
                    border border-primary-med
                    rounded
                    font-medium
                    bg-primary-lightest
                    px-4
                    py-2
                    text-sm
                    mr-2
                    focus:outline-none focus:shadow-outline
                  "
                />

                <BaseButton
                  class="flex-shrink-0"
                  :label="$t('cart.applyCoupon')"
                  :disabled="!couponCode"
                  fit="auto"
                  @click.native="applyDiscount"
                />
              </div>

              <!-- Applied discounts -->
              <div v-if="cart">
                <div v-if="cart.couponCode" class="mt-4 flex items-center">
                  <p class="label-xs-bold">{{ cart.couponCode }}</p>
                  <button
                    class="w-7 h-7 relative rounded-full bg-primary-light ml-3"
                    @click="removeDiscount()"
                  >
                    <BaseIcon
                      class="absolute center-xy"
                      icon="uil:multiply"
                      size="sm"
                    />
                  </button>
                </div>
                <div
                  v-for="giftcard in cart.giftcards"
                  :key="giftcard.id"
                  class="mt-4"
                >
                  <p class="label-xs-bold flex items-center">
                    <span>**** **** **** {{ giftcard.last4 }}</span>
                    <button
                      class="
                        w-7
                        h-7
                        relative
                        rounded-full
                        bg-primary-light
                        ml-3
                      "
                      @click="removeDiscount(giftcard.id, currency)"
                    >
                      <BaseIcon
                        class="absolute center-xy"
                        icon="uil:multiply"
                        size="sm"
                      />
                    </button>
                  </p>
                  <p class="text-sm">
                    {{
                      $t('cart.giftCard', {
                        amount: formatMoney(giftcard.amount, currency),
                      })
                    }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="container py-6 border-b border-primary-med">
              <div class="flex justify-between mb-1">
                <span>{{ $t('cart.subtotal') }}</span>
                <span>{{ formatMoney(cart.subTotal, currency) }}</span>
              </div>
              <div class="flex justify-between mb-1">
                <span>{{ $t('cart.shipping') }}</span>
                <span>{{ formatMoney(cart.shipmentTotal, currency) }}</span>
              </div>
              <div
                v-show="cart.discountTotal"
                class="flex justify-between mb-1"
              >
                <span>{{ $t('cart.discounts') }}</span>
                <span>–{{ formatMoney(cart.discountTotal, currency) }}</span>
              </div>
              <div v-show="cart.taxTotal" class="flex justify-between mb-1">
                <span>{{ $t('cart.taxes') }}</span>
                <span>{{ formatMoney(cart.taxTotal, currency) }}</span>
              </div>
              <h3 class="mt-3 flex justify-between text-xl font-semibold">
                <span>{{ $t('cart.total') }}</span>
                <span>{{ formatMoney(cart.grandTotal, currency) }}</span>
              </h3>
              <div
                v-if="account && account.balance && account.balance > 0"
                class="
                  flex
                  justify-between
                  mb-1
                  border-t border-primary-med
                  mt-4
                  pt-4
                "
              >
                <span>{{ $t('cart.accountBalance') }}</span>
                <span>{{ formatMoney(account.balance, currency) }}</span>
              </div>

              <BaseButton
                class="block mt-4 mb-1"
                size="lg"
                :label="$t('cart.checkout')"
                :is-loading="cartIsUpdating"
                :loading-label="$t('cart.updating')"
                :link="cart.checkoutUrl"
                target="_self"
              />
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

  data() {
    return {
      couponCode: null,
      shopLink: null,
    }
  },

  async fetch() {
    // Set component data
    const { $swell } = this
    this.shopLink = await $swell.settings.get('cart.shopLink', '/categories/')
  },

  computed: {
    ...mapState(['cart', 'cartIsUpdating', 'currency']),

    account() {
      if (!this.cart.account) return
      return this.cart.account
    },
  },

  mounted() {
    // Pass a checkout ID as a query string param to recover a specific cart
    const { checkout: checkoutId } = this.$route.query
    this.$store.dispatch('initializeCart', { checkoutId })
  },

  methods: {
    closeCart() {
      this.$store.commit('setState', { key: 'cartIsActive', value: false })
    },

    async applyDiscount() {
      // Try to apply a coupon or gift card code
      await this.$store.dispatch('applyDiscount', this.couponCode)
      // Reset the coupon input
      this.couponCode = null
    },

    removeDiscount(id) {
      this.$store.dispatch('removeDiscount', id)
    },
  },
}
</script>
