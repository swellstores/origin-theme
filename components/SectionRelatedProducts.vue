<template>
  <section class="container py-10">
    <!-- Heading and controls -->
    <div class="flex-no-wrap mb-4 flex items-center justify-between">
      <h2 class="">
        {{ heading }}
      </h2>
      <div class="ml-4 flex-shrink-0">
        <div class="inline-block rounded bg-primary-light p-2">
          <BaseIcon icon="uil:angle-left" />
        </div>
        <div class="inline-block rounded bg-primary-light p-2">
          <BaseIcon icon="uil:angle-right" />
        </div>
      </div>
    </div>
    <!-- Product previews -->
    <div class="flex-no-wrap -mx-4 flex overflow-hidden">
      <div v-for="product in products" :key="product.id" class="mx-4 w-1/2">
        <ProductPreview v-bind="product" />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionRelatedProducts',

  props: {
    heading: {
      type: String,
      default: 'Other items you may like',
    },
    products: {
      type: Array,
      default: () => [],
    },
  },
}
</script>
