<template>
  <section class="mt-6 -mx-1 flex flex-wrap sm:-mx-2 xl:-mx-3">
    <div v-if="!$fetchState.pending && products.length === 0">
      No products found.
    </div>

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
      <ProductPreview v-bind="product" :aspect-ratio="aspectRatio" />
    </article>
  </section>
</template>

<script>
export default {
  name: 'ProductListing',

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

  computed: {
    $fetchState() {
      return this.$parent.$fetchState ? this.$parent.$fetchState : {}
    },

    aspectRatio() {
      return this.$swell.settings.get('productPreviews.aspectRatio', '1:1')
    }
  }
}
</script>
