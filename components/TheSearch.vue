<template>
  <div class="z-50 fixed inset-0 w-full h-full bg-primary-lightest overflow-y-scroll">
    <div class="container py-10">
      <div class="relative flex justify-between items-center mb-5">
        <h3>Search products</h3>
        <button @click.prevent="$emit('click-close')">
          <BaseIcon icon="uil:multiply" size="lg" />
        </button>
      </div>
      <input
        ref="searchInput"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-2 rounded bg-primary-lighter text-primary-darkest text-3xl"
        @keydown.enter="$fetch"
      />
      <p class="mt-2 mb-16 text-sm">Press enter to search</p>
      <ProductPreviews :products="products" :column-count="4" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TheSearch',

  props: {
    placeholder: {
      type: String,
      default: 'e.g. espresso'
    }
  },

  async fetch() {
    const limit = 24

    // Set preload data
    this.products = [...Array(4).keys()]

    const products = await this.$swell.products.list({
      search: this.inputValue,
      limit,
      sort: 'popularity asc'
    })

    this.products = products.results
  },

  data() {
    return {
      inputValue: '',
      products: []
    }
  },

  mounted() {
    this.focusInput()
  },

  methods: {
    focusInput() {
      this.$refs.searchInput.focus()
    }
  }
}
</script>
