<template functional>
  <div v-if="props.slug" class="relative block h-full rounded">
    <!-- Preview media -->
    <div class="relative">
      <NuxtLink
        :to="parent.resolveUrl({ type: 'product', value: props.slug })"
        class="block rounded overflow-hidden"
      >
        <!-- Initial image -->
        <VisualMedia :source="props.images[0]" />
        <!-- Hover image -->
        <div
          v-if="props.images[1]"
          class="absolute w-full h-full inset-0 opacity-0 transition-opacity duration-75 hover:opacity-100"
        >
          <VisualMedia :source="props.images[1]" />
        </div>
      </NuxtLink>
      <div
        v-if="props.origPrice"
        class="label-tag label-tag--sale absolute -mt-1 mr-2 top-0 right-0"
      >
        Sale
      </div>
    </div>
    <!-- Product summary -->
    <div class="py-3 font-label font-semibold">
      <NuxtLink
        :to="parent.resolveUrl({ type: 'product', value: props.slug })"
        class="inline-block"
      >
        <h4 v-balance-text>{{ props.name }}</h4>
      </NuxtLink>
      <!-- Sale price -->
      <div v-if="props.origPrice">
        <span class="text-sm mr-1">{{ parent.formatMoney(props.price, currency) }}</span>
        <span class="uppercase text-xs text-error whitespace-no-wrap">
          Save {{ parent.formatMoney(props.origPrice - props.price, currency) }}
        </span>
      </div>
      <!-- Regular price -->
      <div v-else>
        <span class="text-sm">{{ parent.formatMoney(props.price, currency) }}</span>
      </div>
    </div>
  </div>

  <!-- Skeleton loader -->
  <div v-else class="pb-5">
    <div class="loader-el pb-full mb-4"></div>
    <div class="loader-el w-2/3 h-4 mb-2"></div>
    <div class="loader-el w-24 h-3"></div>
  </div>
</template>

<script>
export default {
  name: 'ProductPreview',

  props: {
    slug: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: 'Product name'
    },
    images: {
      type: [Object, Array],
      default: () => []
    },
    aspectRatio: {
      type: String,
      default: '1:1'
    },
    currency: {
      type: String,
      default: null
    },
    price: {
      type: Number,
      default: 99
    },
    origPrice: {
      type: Number,
      default: null
    }
  }
}
</script>
