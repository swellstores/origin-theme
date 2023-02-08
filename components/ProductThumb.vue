<template>
  <article class="mb-3 px-1 sm:px-2 xl:mb-4 xl:px-3">
    <!-- Skeleton loader -->
    <div v-if="!product.slug" class="pb-5">
      <div
        class="loader-el mb-4 pb-full"
        :style="{ paddingBottom: ratioPadding }"
      />
      <div class="loader-el mb-2 h-4 w-2/3" />
      <div v-if="showPrice" class="loader-el h-3 w-24" />
    </div>

    <div v-else class="relative block h-full rounded">
      <!-- Preview media -->
      <div
        class="group relative"
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
              class="absolute inset-0 hidden h-full w-full opacity-0 transition-opacity duration-150 group-hover:opacity-100 md:block"
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
              class="center-xy absolute text-primary-med"
            />
          </div>
        </NuxtLink>
        <div
          v-if="product.origPrice"
          class="label-tag label-tag--sale absolute top-0 right-0 mr-2 -mt-1"
        >
          {{ $t('products.preview.sale') }}
        </div>

        <template v-if="quickAddIsEnabled && product.price !== null">
          <transition name="fade-up" :duration="300">
            <QuickAdd
              v-if="
                (currentProductId === product.id && quickAddIsVisible) ||
                (currentProductId === product.id && quickAddKeepAlive)
              "
              class="absolute bottom-0 mb-5 hidden w-full px-6 lg:block"
              :product="product"
              @adding-to-cart="productBeingAdded = product.id"
              @keep-alive="keepQuickAddAlive"
            />
          </transition>
        </template>
      </div>
      <!-- Product summary -->
      <div class="py-3" :style="{ 'text-align': textAlign }">
        <NuxtLink
          :to="localePath(resolveUrl({ type: 'product', value: product.slug }))"
          class="inline-block"
        >
          <h4>{{ product.name }}</h4>
        </NuxtLink>
        <!-- Sale price -->
        <template v-if="showPrice">
          <template v-if="displayPrice !== null && displayPrice >= 0">
            <div v-if="product.origPrice">
              <span class="mr-1 text-sm">{{
                formatMoney(displayPrice, currency)
              }}</span>
              <span
                class="whitespace-no-wrap text-xs uppercase text-error-default"
              >
                {{
                  $t('products.preview.save', {
                    amount: formatMoney(
                      product.origPrice - product.price,
                      currency,
                    ),
                  })
                }}
              </span>
            </div>
            <!-- Regular price -->
            <div v-else>
              <span class="text-sm">{{
                formatMoney(displayPrice, currency)
              }}</span>
            </div>
          </template>

          <div v-else>
            <span>{{
              $t('products.preview.unavailableInCurrency', { currency })
            }}</span>
          </div>
        </template>
      </div>
    </div>
  </article>
</template>

<script>
// Helpers
import { mapState } from 'vuex';
import { getPriceInCurrency } from '~/utils/getPriceInCurrency';

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
    };
  },

  async fetch() {
    this.quickAddIsEnabled = await this.$swell.settings.get(
      'productList.enableQuickAdd',
    );

    this.aspectRatio = await this.$swell.settings.get(
      'productPreviews.aspectRatio',
      '1:1',
    );

    // Set ratio padding
    const [x, y] = this.aspectRatio.split(':');

    this.ratioPadding = `${(y / x) * 100}%`;

    // Set widths
    this.widths = [192, 262, 358, 548, 716, 1096];

    // Set srcset sizes
    switch (this.columnCount) {
      case 2:
        this.sizes = '(min-width: 1200px) 548px, 50vw';
        break;
      case 3:
        this.sizes = '(min-width: 1200px) 358px, (min-width: 768px) 33vw, 50vw';
        break;
      case 4:
        this.sizes = '(min-width: 1200px) 262px, (min-width: 768px) 25vw, 50vw';
        break;
    }
  },

  computed: {
    ...mapState(['currency', 'cartIsUpdating']),
    displayPrice() {
      return getPriceInCurrency(this.product, this.currency);
    },
  },

  methods: {
    showQuickAdd(id) {
      // If keep alive is active, don't hide until same product has been moused over again
      // This is so that for dropdown option that extend past the original element, the flow isn't lost.
      if (this.quickAddKeepAlive) {
        if (this.currentProductId !== id) return;
        this.quickAddKeepAlive = false;
      }

      this.quickAddIsVisible = true;
      this.currentProductId = id;
    },

    hideQuickAdd(id) {
      if (this.quickAddKeepAlive) return;
      this.quickAddIsVisible = false;
      this.currentProductId = null;
    },

    openQuickView(product) {
      if (!product) return;
      this.quickViewProduct = product;
      this.quickViewIsVisible = true;
    },

    keepQuickAddAlive(bool) {
      this.quickAddKeepAlive = bool;
    },
  },
};
</script>
