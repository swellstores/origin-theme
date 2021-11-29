<template>
  <article class="px-1 mb-3 sm:px-2 xl:px-3 xl:mb-4">
    <!-- Skeleton loader -->
    <div v-if="!product.slug" class="pb-5">
      <div
        class="mb-4 loader-el pb-full"
        :style="{ paddingBottom: ratioPadding }"
      />
      <div class="w-2/3 h-4 mb-2 loader-el" />
      <div v-if="showPrice" class="w-24 h-3 loader-el" />
    </div>

    <div v-else class="relative block h-full rounded">
      <!-- Preview media -->
      <div
        class="relative group"
        @mouseenter="showQuickAdd(product.id)"
        @mouseleave="hideQuickAdd(product.id)"
      >
        <!-- TODO: change aria-hidden to aria-label as soon as we support alt text for product images -->
        <NuxtLink
          :to="localePath(resolveUrl({ type: 'product', value: product.slug }))"
          class="relative block overflow-hidden rounded"
          aria-hidden="true"
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
              class="absolute inset-0 hidden w-full h-full transition-opacity duration-150 opacity-0  md:block group-hover:opacity-100"
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
          <div v-else class="relative rounded bg-primary-lighter pb-full">
            <BaseIcon
              icon="uil:camera-slash"
              size="lg"
              class="absolute center-xy text-primary-med"
            />
          </div>
        </NuxtLink>
        <div
          v-if="product.origPrice"
          class="absolute top-0 right-0 mr-2 -mt-1 label-tag label-tag--sale"
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
              class="absolute bottom-0 hidden w-full px-6 mb-5 lg:block"
              :product="product"
              @adding-to-cart="productBeingAdded = product.id"
              @keep-alive="keepQuickAddAlive"
            />
          </transition>
        </template>
      </div>
      <!-- Product summary -->
      <div class="py-3" :class="{ 'text-center': textAlign === 'center' }">
        <NuxtLink
          :to="localePath(resolveUrl({ type: 'product', value: product.slug }))"
          class="inline-block"
        >
          <h4>{{ product.name }}</h4>
        </NuxtLink>
        <!-- Sale price -->
        <template v-if="showPrice">
          <div v-if="product.origPrice">
            <span class="mr-1 text-sm">{{
              formatMoney(product.price, currency)
            }}</span>
            <span
              class="text-xs uppercase whitespace-no-wrap text-error-default"
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
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  props: {
    product: {
      type: Object,
      default: () => {},
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

  async fetch() {
    this.quickAddIsEnabled = await this.$swell.settings.get(
      'productList.enableQuickAdd'
    )

    this.aspectRatio = await this.$swell.settings.get(
      'productPreviews.aspectRatio',
      '1:1'
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
