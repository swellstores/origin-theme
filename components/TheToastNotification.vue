<template>
  <div v-if="type !== 'product' || product" class="sticky top-0 z-20">
    <!-- Duplicate header element  -->
    <div class="absolute w-full top-0 right-0">
      <div
        v-if="header"
        ref="header"
        class="relative opacity-0 transition-all ease-in-out duration-200"
        :class="{
          'max-h-0': (header.hideOnScroll && !headerIsVisible) || reachedTop,
          'max-h-40': header.hideOnScroll && headerIsVisible && !reachedTop
        }"
      >
        <ThePromoBar v-if="header.showPromo" text="|" :hidden="header.hideOnScroll && hideHeader" />
        <div class="py-3">
          <span v-if="logoSrc" :style="{ height: header.logoHeight + 'px' }" class="block"></span>
          <span v-else class="text-3xl sm:text-4xl">|</span>
        </div>
      </div>

      <div
        class="w-full-px-6 top-0 right-0 mx-auto md:mr-3 md:max-w-max mt-3 bg-primary-lightest shadow-md rounded-md"
        :class="{
          'md:min-w-96': product,
          'bg-primary-med': type !== 'error',
          'bg-error-faded text-error': type === 'error'
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
            @click="$store.commit('setState', { key: 'notification', value: null })"
          >
            <BaseIcon icon="uil:times" />
          </button>
        </div>

        <!-- Added product -->
        <template v-if="product">
          <div class="flex px-3">
            <div class="w-24 mr-3">
              <VisualMedia
                :widths="[96, 192]"
                sizes="96px"
                ratio="1:1"
                class="rounded overflow-hidden"
              />
            </div>

            <!-- Name + options -->
            <div class="pt-1">
              <NuxtLink
                :to="resolveUrl({ type: 'product', value: product.slug })"
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
                  <span>${{ product.price.toFixed(2) }}</span>
                  <span v-if="product.quantity > 1">&times; {{ product.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex no-wrap p-3">
            <a
              :href="cart.checkoutUrl"
              :class="{ loading: cartIsUpdating }"
              class="w-full btn dark mr-2"
            >
              Checkout
            </a>

            <button class="w-full relative btn light" @click="openCart" type="button">
              View cart
              <div
                v-if="cart && cart.itemQuantity"
                class="fade-in absolute right-0 top-0 bg-accent rounded-full w-6 h-6 flex justify-center items-center text-primary-lighter transform translate-x-1 -translate-y-1"
              >
                <span class="block mt-px text-2xs leading-none">{{ cart.itemQuantity }}</span>
              </div>
            </button>
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
  async fetch() {
    const { $swell } = this

    // Fetch item that ahs been recently added to the cart
    if (this.addedItem) {
      const product = await $swell.products.get(this.addedItem.productId)
      this.product = product
    }

    // Set component data
    this.header = $swell.settings.get('header', {})
    this.logoSrc = $swell.settings.get('header.logo.file.url')
  },

  props: {
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      header: null,
      logoSrc: null,
      product: null,
      scrollY: 0
    }
  },

  computed: {
    ...mapState(['cart', 'cartIsUpdating', 'addedItem', 'headerIsVisible']),

    options() {
      if (!this.addedItem) return

      const options = Object.values(this.addedItem.options)
      return options.join(', ')
    },

    reachedTop() {
      return this.scrollY < 50
    }
  },

  methods: {
    onScroll() {
      this.scrollY = window.top.scrollY
    },

    openCart() {
      // Open cart and close notification
      this.$emit('open-cart')
      this.$store.commit('setState', { key: 'notification', value: null })
    }
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  }
}
</script>
