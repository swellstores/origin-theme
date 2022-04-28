<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="$fetchState.error"
    heading="Collection preview"
    :description="$fetchState.error.message"
  />

  <section v-else class="py-16">
    <div class="container">
      <template v-if="showTitle">
        <div
          v-if="!loaded && $fetchState.pending"
          class="loader-el mb-2 h-8 w-64 md:h-10"
        />
        <NuxtLink
          v-else
          :to="localePath(resolveUrl({ type: 'category', value: slug }))"
        >
          <component
            :is="titleSize === 'lg' ? 'h1' : titleSize === 'md' ? 'h2' : 'h3'"
            :class="{ 'text-center': titleAlign === 'center' }"
            class="mb-2"
          >
            {{ name }}
          </component>
        </NuxtLink>
      </template>

      <!-- Product previews -->
      <ProductPreviews
        :products="products"
        :column-count="productCols"
        :product-text-align="productTextAlign"
        :show-price="showPrice"
      />
    </div>
  </section>
</template>

<script>
// Helpers
import get from 'lodash/get'

export default {
  name: 'SectionCollectionPreview',

  props: {
    type: {
      type: String,
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    categoryId: {
      type: String,
      default: null,
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: '',
    },
    titleSize: {
      type: String,
      default: 'md',
    },
    titleAlign: {
      type: String,
      default: 'left',
    },
    productCols: {
      type: Number,
      default: 3,
    },
    productRows: {
      type: Number,
      default: 1,
    },
    showPrice: {
      type: Boolean,
      default: true,
    },
    productTextAlign: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      name: null,
      slug: null,
      products: [],
      loaded: false,
    }
  },

  async fetch() {
    const { $swell } = this

    // Set preload data
    if (!this.loaded) {
      this.products = [
        ...Array(this.productCols * this.productRows).keys(),
      ].map(() => ({}))
    }

    if (!this.categoryId) {
      return
    }

    // Fetch category and products
    const category = await $swell.categories.get(this.categoryId)
    const products = await $swell.products.list({
      category: this.categoryId,
      expand: ['variants'],
      $currency: $swell.currency.list().map((currency) => currency.code),
    })

    if (!category) {
      throw new Error(`Category "${this.categoryId}" inactive or not found`)
    }

    // Set component data
    this.name = this.title || category.name
    this.slug = category.slug
    this.products = get(products, 'results', []).slice(
      0,
      this.productCols * this.productRows
    )

    this.loaded = true
  },

  activated() {
    // Call fetch again if last fetch more than a minute ago
    if (this.$fetchState.timestamp <= Date.now() - 60000) {
      this.$fetch()
    }
  },
}
</script>
