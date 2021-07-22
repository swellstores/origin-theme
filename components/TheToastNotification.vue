<template>
  <div v-if="type !== 'product' || product" class="sticky top-0 z-20">
    <!-- Duplicate header element  -->
    <div class="absolute w-full top-0 right-0">
      <div
        :style="{ height: `${headerHeightOffset}px` }"
        class="relative w-full transition-all ease duration-50"
      />

      <div
        class="
          w-full-px-6
          top-0
          right-0
          mx-auto
          md:mr-3 md:max-w-max
          mt-3
          bg-primary-lightest
          shadow-md
          rounded-md
        "
        :class="{
          'md:min-w-96': product,
          'bg-error-faded text-error-default': type === 'error',
          'bg-ok-faded text-lightest': type === 'success',
        }"
      >
        <div
          class="flex items-center p-3 border-primary-light rounded-t-md"
          :class="{ 'border-b mb-3': product }"
        >
          <BaseIcon v-if="type !== 'error'" class="mr-1" icon="uil:check" />
          <BaseIcon v-if="type === 'error'" class="mr-1" icon="uil:times" />
          <span class="pr-3">{{ message }}</span>
          <button
            v-if="product"
            type="button"
            class="w-8 h-8 rounded-full bg-primary-light ml-auto p-1"
            @click="
              $store.commit('setState', { key: 'notification', value: null })
            "
          >
            <BaseIcon icon="uil:times" />
          </button>
        </div>

        <!-- Added product -->
        <template v-if="product">
          <div class="flex px-3">
            <div class="w-24 mr-3">
              <VisualMedia
                v-if="product.images && product.images.length"
                :source="product.images[0]"
                :widths="[96, 192]"
                sizes="96px"
                ratio="1:1"
                class="rounded overflow-hidden"
              />
            </div>

            <!-- Name + options -->
            <div class="pt-1">
              <NuxtLink
                :to="
                  localePath(
                    resolveUrl({ type: 'product', value: product.slug })
                  )
                "
                class="inline-block"
              >
                <h4>{{ product.name }}</h4>
              </NuxtLink>
              <div class="mt-1 text-sm">
                {{ options }}
              </div>

              <!-- Price/quantity + item editor toggle -->
              <div class="label-sm-bold leading-none">
                <div class="inline-block py-1 -mb-1">
                  <span>{{ formatMoney(product.price, currency) }}</span>
                  <span v-if="product.quantity > 1"
                    >&times; {{ product.quantity }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="flex no-wrap p-3">
            <BaseButton
              class="w-1/2 mr-2"
              fit="full"
              :link="cart.checkoutUrl"
              appearance="dark"
              :label="$t('notifications.checkout')"
            />

            <div class="relative w-1/2">
              <BaseButton
                class="w-full"
                fit="full"
                :link="cart.checkoutUrl"
                appearance="lught"
                :label="$t('notifications.cart')"
                @click.native="openCart"
              />

              <div
                v-if="cart && cart.itemQuantity"
                class="
                  fade-in
                  absolute
                  right-0
                  top-0
                  bg-accent-default
                  rounded-full
                  w-6
                  h-6
                  flex
                  justify-center
                  items-center
                  text-primary-lighter
                  transform
                  translate-x-1
                  -translate-y-1
                "
              >
                <span class="block mt-px text-2xs leading-none">{{
                  cart.itemQuantity
                }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  props: {
    message: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      header: null,
      logoSrc: null,
      product: null,
      scrollY: null,
    }
  },

  async fetch() {
    const { $swell } = this

    // Fetch item that has been recently added to the cart
    if (this.addedItem) {
      const baseProduct = await $swell.products.get(this.addedItem.productId)
      const product = await $swell.products.variation(
        baseProduct,
        this.addedItem.options
      )

      this.product = product
    }

    // Set component data
    this.header = $swell.settings.get('header', {})
    this.logoSrc = $swell.settings.get('header.logo.file.url')
  },

  computed: {
    ...mapState([
      'cart',
      'cartIsUpdating',
      'currency',
      'addedItem',
      'headerIsVisible',
      'headerHeight',
      'currency',
    ]),

    options() {
      if (!this.addedItem) return

      const options = Object.values(this.addedItem.options)
      return options.join(', ')
    },

    headerHeightOffset() {
      // Set initial height before scroll initiates
      if (this.scrollY === null) {
        if (!this.headerIsVisible) return 0
        if (this.headerIsVisible) return this.headerHeight
      }

      if (!this.headerIsVisible) return 0

      if (this.scrollY < this.headerHeight) {
        return this.headerHeight - (this.headerHeight - this.scrollY)
      }
      return this.headerHeight
    },
  },

  mounted() {
    this.onScroll()
    window.addEventListener('scroll', this.onScroll)
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  },

  methods: {
    onScroll() {
      this.scrollY = window.scrollY
    },

    openCart() {
      // Open cart and close notification
      this.$emit('open-cart')
      this.$store.commit('setState', { key: 'notification', value: null })
    },
  },
}
</script>
