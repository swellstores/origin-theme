<template>
  <section class="-mx-1 flex flex-wrap sm:-mx-2 xl:-mx-3">
    <article
      v-for="product in products"
      :key="product.id"
      :class="[
        { 'w-1/2': columnCount === 2 },
        { 'w-1/2 md:w-1/3': columnCount === 3 },
        { 'w-1/2 md:w-1/4': columnCount === 4 },
        { 'w-1/2 md:w-1/5': columnCount === 5 },
      ]"
      class="mb-3 px-1 sm:px-2 xl:px-3 xl:mb-4"
    >
      <!-- Skeleton loader -->
      <div v-if="!product.slug" class="pb-5">
        <div
          class="loader-el pb-full mb-4"
          :style="{ paddingBottom: ratioPadding }"
        />
        <div class="loader-el w-2/3 h-4 mb-2" />
        <div v-if="showPrice" class="loader-el w-24 h-3" />
      </div>

      <div v-else class="relative block h-full rounded">
        <!-- Preview media -->
        <div
          class="group relative"
          @mouseenter="showQuickAdd(product.id)"
          @mouseleave="hideQuickAdd(product.id)"
        >
          <NuxtLink
            :to="
              localePath(resolveUrl({ type: 'product', value: product.slug }))
            "
            class="relative block rounded overflow-hidden"
          >
            <div v-if="product.images && product.images.length">
              <!-- Main image -->
              <VisualMedia
                :source="product.images[0]"
                :aspect-ratio="aspectRatio"
                :sizes="sizes"
                :widths="widths"
              />
              <!-- Hover image -->
              <div
                v-if="product.images[1]"
                class="
                  group-hover:opacity-100
                  absolute
                  w-full
                  h-full
                  inset-0
                  opacity-0
                  transition-opacity
                  duration-150
                "
              >
                <VisualMedia
                  :source="product.images[1]"
                  :aspect-ratio="aspectRatio"
                  :sizes="sizes"
                  :widths="widths"
                />
              </div>
            </div>

            <!-- Fallback image -->
            <div v-else class="relative bg-primary-lighter rounded pb-full">
              <BaseIcon
                icon="uil:camera-slash"
                size="lg"
                class="absolute center-xy text-primary-med"
              />
            </div>
          </NuxtLink>
          <div
            v-if="product.origPrice"
            class="label-tag label-tag--sale absolute -mt-1 mr-2 top-0 right-0"
          >
            {{ $t('products.preview.sale') }}
          </div>

          <template v-if="quickAddIsEnabled">
            <transition name="fade-up" :duration="300">
              <QuickAdd
                v-if="
                  (currentProductId === product.id && quickAddIsVisible) ||
                  (currentProductId === product.id && quickAddKeepAlive)
                "
                class="hidden lg:block w-full absolute bottom-0 px-6 mb-5"
                :product="product"
                @open-quick-view="openQuickView(product)"
                @adding-to-cart="productBeingAdded = product.id"
                @keep-alive="keepQuickAddAlive"
              />
            </transition>
          </template>
        </div>
        <!-- Product summary -->
        <div class="py-3" :class="{ 'text-center': textAlign === 'center' }">
          <NuxtLink
            :to="
              localePath(resolveUrl({ type: 'product', value: product.slug }))
            "
            class="inline-block"
          >
            <h4>{{ product.name }}</h4>
          </NuxtLink>
          <!-- Sale price -->
          <template v-if="showPrice">
            <div v-if="product.origPrice">
              <span class="text-sm mr-1">{{
                formatMoney(product.price, currency)
              }}</span>
              <span
                class="uppercase text-xs text-error-default whitespace-no-wrap"
              >
                {{
                  $t('products.preview.save', {
                    amount: formatMoney(
                      product.origPrice - product.price,
                      currency
                    ),
                  })
                }}
              </span>
            </div>
            <!-- Regular price -->
            <div v-else>
              <span class="text-sm">{{
                formatMoney(product.price, currency)
              }}</span>
            </div>
          </template>
        </div>
      </div>
    </article>
    <QuickViewPopup
      v-if="quickViewIsVisible"
      :product-id="quickViewProduct.id"
      @click-close="quickViewIsVisible = false"
    />
  </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ProductPreviews',

  props: {
    products: {
      type: Array,
      default: () => [],
    },
    columnCount: {
      type: Number,
      default: 4,
    },
    textAlign: {
      type: String,
      default: 'left',
    },
    showPrice: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      aspectRatio: '1:1',
      ratioPadding: null,
      sizes: null,
      widths: null,
      quickAddIsEnabled: false,
      quickAddKeepAlive: false,
      quickAddIsVisible: false,
      currentProductId: null,
      quickViewIsVisible: false,
      quickViewProduct: null,
      productBeingAdded: null,
    }
  },

  fetch() {
    this.aspectRatio = this.$swell.settings.get(
      'productPreviews.aspectRatio',
      '1:1'
    )
    this.quickAddIsEnabled = this.$swell.settings.get(
      'productList.enableQuickAdd'
    )

    // Set ratio padding
    const [x, y] = this.aspectRatio.split(':')
    this.ratioPadding = `${(y / x) * 100}%`

    // Set widths
    this.widths = [192, 262, 358, 548, 716, 1096]

    // Set srcset sizes
    switch (this.columnCount) {
      case 2:
        this.sizes = '(min-width: 1200px) 548px, 50vw'
        break
      case 3:
        this.sizes = '(min-width: 1200px) 358px, (min-width: 768px) 33vw, 50vw'
        break
      case 4:
        this.sizes = '(min-width: 1200px) 262px, (min-width: 768px) 25vw, 50vw'
        break
    }
  },

  computed: {
    ...mapState(['currency', 'cartIsUpdating']),
  },

  methods: {
    showQuickAdd(id) {
      // If keep alive is active, don't hide until same product has been moused over again
      // This is so that for dropdown option that extend past the original element, the flow isn't lost.
      if (this.quickAddKeepAlive) {
        if (this.currentProductId !== id) return
        this.quickAddKeepAlive = false
      }
      this.quickAddIsVisible = true
      this.currentProductId = id
    },

    hideQuickAdd(id) {
      if (this.quickAddKeepAlive) return
      this.quickAddIsVisible = false
      this.currentProductId = null
    },

    openQuickView(product) {
      if (!product) return
      this.quickViewProduct = product
      this.quickViewIsVisible = true
    },

    keepQuickAddAlive(bool) {
      this.quickAddKeepAlive = bool
    },
  },
}
</script>
