<template>
  <section class="mt-6 -mx-1 flex flex-wrap sm:-mx-2 xl:-mx-3">
    <article
      v-for="product in products"
      :key="product.id"
      :class="[
        { 'w-1/2': columnCount === 2 },
        { 'w-1/2 md:w-1/3': columnCount === 3 },
        { 'w-1/2 md:w-1/4': columnCount === 4 }
      ]"
      class="mb-2 px-1 sm:px-2 xl:px-3 xl:mb-3"
    >
      <!-- Skeleton loader -->
      <div v-if="!product.slug" class="pb-5">
        <div class="loader-el pb-full mb-4" :style="{ paddingBottom: ratioPadding }"></div>
        <div class="loader-el w-2/3 h-4 mb-2"></div>
        <div class="loader-el w-24 h-3"></div>
      </div>

      <div v-else class="relative block h-full rounded">
        <!-- Preview media -->
        <div v-if="product.images" class="relative">
          <NuxtLink
            :to="resolveUrl({ type: 'product', value: product.slug })"
            class="block rounded overflow-hidden"
          >
            <!-- Initial image -->
            <VisualMedia :source="product.images[0]" :aspect-ratio="aspectRatio" />
            <!-- Hover image -->
            <div
              v-if="product.images[1]"
              class="absolute w-full h-full inset-0 opacity-0 transition-opacity duration-75 hover:opacity-100"
            >
              <VisualMedia :source="product.images[1]" :aspect-ratio="aspectRatio" />
            </div>
          </NuxtLink>
          <div
            v-if="product.origPrice"
            class="label-tag label-tag--sale absolute -mt-1 mr-2 top-0 right-0"
          >
            Sale
          </div>
        </div>
        <div
          v-else
          class="relative bg-primary-lighter rounded"
          :style="{ paddingBottom: ratioPadding }"
        >
          <BaseIcon icon="uil:camera-slash" size="lg" class="absolute center-xy text-primary-med" />
        </div>
        <!-- Product summary -->
        <div class="py-3 font-label font-semibold">
          <NuxtLink :to="resolveUrl({ type: 'product', value: product.slug })" class="inline-block">
            <h4 v-balance-text>{{ product.name }}</h4>
          </NuxtLink>
          <!-- Sale price -->
          <div v-if="product.origPrice">
            <span class="text-sm mr-1">{{ formatMoney(product.price) }}</span>
            <span class="uppercase text-xs text-error whitespace-no-wrap">
              Save {{ formatMoney(product.origPrice - product.price) }}
            </span>
          </div>
          <!-- Regular price -->
          <div v-else>
            <span class="text-sm">{{ formatMoney(product.price) }}</span>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script>
// Helpers
import get from 'lodash/get'

export default {
  name: 'ProductPreviews',

  props: {
    products: {
      type: Array,
      default: () => []
    },
    columnCount: {
      type: Number,
      default: 3
    }
  },

  async fetch() {
    this.aspectRatio = this.$swell.settings.get('productPreviews.aspectRatio', '1:1')
  },

  data() {
    return {
      aspectRatio: '1:1'
    }
  },

  computed: {
    ratioPadding() {
      const [x, y] = this.aspectRatio.split(':')
      return `${(y / x) * 100}%`
    }
  }
}
</script>
