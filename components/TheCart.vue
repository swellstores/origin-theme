<template>
  <transition name="slide-modal-rtl" :duration="700">
    <div class="fixed inset-0 z-50">
      <!-- Overlay -->
      <div
        class="overlay absolute hidden h-full w-full bg-primary-darker opacity-50 md:block"
        @click="closeCart"
      />

      <!-- Panel -->
      <div class="panel absolute right-0 h-full w-full max-w-112">
        <div class="h-full w-full overflow-y-scroll bg-primary-lightest">
          <!-- Header -->
          <div class="container relative border-b border-primary-med py-5">
            <div class="flex items-center justify-between">
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
            <span class="mb-4 block">{{ $t('cart.empty') }}</span>
            <BaseButton
              :link="shopLink"
              :label="$t('cart.backToProducts')"
              fit="static"
            />
          </div>

          <!-- Footer -->
          <div
            v-if="cart && cart.items && cart.items.length"
            class="border-t border-primary-med bg-primary-lighter"
          >
            <div class="container border-b border-primary-med py-6">
              <div class="flex">
                <div class="relative mr-2">
                  <input
                    v-model.trim="couponCode"
                    type="text"
                    placeholder="Add coupon or gift card code"
                    class="input-coupon focus:outline-none h-full w-full rounded border border-primary-med bg-primary-lightest px-4 py-2 text-sm font-medium focus:shadow-outline"
                  />
                  <transition name="fade">
                    <div
                      v-show="couponError"
                      class="absolute mt-1 w-full rounded bg-error-faded px-3 py-1 text-sm text-error-default"
                    >
                      {{ couponError }}
                    </div>
                  </transition>
                </div>

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
                    class="relative ml-3 h-7 w-7 rounded-full bg-primary-light"
                    @click="removeDiscount()"
                  >
                    <BaseIcon
                      class="center-xy absolute"
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
                      class="relative ml-3 h-7 w-7 rounded-full bg-primary-light"
                      @click="removeDiscount(giftcard.id, currency)"
                    >
                      <BaseIcon
                        class="center-xy absolute"
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
            <div class="container border-b border-primary-med py-6">
              <div class="mb-1 flex justify-between">
                <span>{{ $t('cart.subtotal') }}</span>
                <span>{{ formatMoney(cart.subTotal, currency) }}</span>
              </div>
              <div class="mb-1 flex justify-between">
                <span>{{ $t('cart.shipping') }}</span>
                <span>{{ formatMoney(cart.shipmentTotal, currency) }}</span>
              </div>
              <div
                v-show="cart.discountTotal"
                class="mb-1 flex justify-between"
              >
                <span>{{ $t('cart.discounts') }}</span>
                <span>–{{ formatMoney(cart.discountTotal, currency) }}</span>
              </div>
              <div
                v-show="cart.giftcardTotal"
                class="mb-1 flex justify-between"
              >
                <span>{{ $t('cart.giftcards') }}</span>
                <span>–{{ formatMoney(cart.giftcardTotal, currency) }}</span>
              </div>
              <div v-show="cart.taxTotal" class="mb-1 flex justify-between">
                <span>{{ $t('cart.taxes') }}</span>
                <span>{{ formatMoney(cart.taxTotal, currency) }}</span>
              </div>
              <h3 class="mt-3 flex justify-between text-xl font-semibold">
                <span>{{ $t('cart.total') }}</span>
                <span>{{ formatMoneyRounded(cart.grandTotal, currency) }}</span>
              </h3>
              <div
                v-if="account && account.balance && account.balance > 0"
                class="mt-4 mb-1 flex justify-between border-t border-primary-med pt-4"
              >
                <span>{{ $t('cart.accountBalance') }}</span>
                <span>{{ formatMoney(account.balance, currency) }}</span>
              </div>

              <BaseButton
                class="mt-4 mb-1 block"
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
import { mapState } from 'vuex';
import { isCouponValid } from '~/utils/coupon';
import { isGiftCardValid } from '~/utils/giftcards';

export default {
  name: 'TheCart',

  data() {
    return {
      couponCode: null,
      couponError: null,
      couponTimeout: null,
      shopLink: null,
    };
  },

  async fetch() {
    // Set component data
    const { $swell } = this;
    this.shopLink = await $swell.settings.get('cart.shopLink', '/categories/');
  },

  computed: {
    ...mapState(['cart', 'cartIsUpdating', 'currency', 'locale']),

    account() {
      if (!this.cart.account) return;
      return this.cart.account;
    },
  },

  watch: {
    currency() {
      this.$store.dispatch('initializeCart', {});
    },
    locale() {
      this.$store.dispatch('initializeCart', {});
    },
  },

  mounted() {
    // Pass a checkout ID as a query string param to recover a specific cart
    const { checkout: checkoutId } = this.$route.query;
    this.$store.dispatch('initializeCart', { checkoutId });
  },

  beforeDestroy() {
    if (this.couponTimeout) {
      clearTimeout(this.couponTimeout);
    }
  },

  methods: {
    closeCart() {
      this.$store.commit('setState', { key: 'cartIsActive', value: false });
    },

    /**
     * Sets the coupon error message and the timeout to clear it
     * @param {string} message - The error message to show
     */
    setCouponError(message) {
      this.couponError = message;
      if (this.couponTimeout) clearTimeout(this.couponTimeout);
      this.couponTimeout = setTimeout(() => {
        this.couponError = null;
      }, 5000);
    },

    async applyDiscount() {
      if (
        !(isGiftCardValid(this.couponCode) || isCouponValid(this.couponCode))
      ) {
        this.setCouponError(this.$i18n.t('errors.invalidGiftCard'));
      } else {
        const error = await this.$store.dispatch(
          'applyDiscount',
          this.couponCode,
        );
        if (error) {
          this.setCouponError(error);
        }
      }
      // Reset the coupon input
      this.couponCode = null;
    },

    removeDiscount(id) {
      this.$store.dispatch('removeDiscount', id);
    },
  },
};
</script>

<style scoped>
.input-coupon::placeholder {
  text-overflow: ellipsis;
}
</style>
