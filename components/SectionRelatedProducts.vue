<template>
  <section class="container py-10">
    <!-- Heading and controls -->
    <div class="mb-4 flex flex-no-wrap justify-between items-center">
      <h2 class="">{{ heading }}</h2>
      <div class="ml-4 flex-shrink-0">
        <div class="p-2 inline-block bg-primary-light rounded">
          <BaseIcon icon="uil:angle-left" />
        </div>
        <div class="p-2 inline-block bg-primary-light rounded">
          <BaseIcon icon="uil:angle-right" />
        </div>
      </div>
    </div>
    <!-- Product previews -->
    <div class="-mx-4 flex flex-no-wrap overflow-hidden">
      <div v-for="product in products" :key="product.id" class="w-1/2 mx-4">
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
      default: 'Other items you may like'
    },
    products: {
      type: Array,
      default: () => []
    }
  }
}
</script>
