<template>
  <transition name="fade" appear>
    <div
      class="fixed inset-0 z-40 h-full w-full overflow-y-scroll bg-primary-lightest"
    >
      <transition name="fade-up-out">
        <TheToastNotification
          v-if="notification"
          class="z-10"
          :message="notification.message"
          :type="notification.type"
          @open-cart="cartIsActive = true"
        />
      </transition>
      <div class="container py-10">
        <div class="relative mb-5 flex items-center justify-between">
          <h3>{{ $t('search.title') }}</h3>
          <button @click.prevent="$emit('click-close')">
            <BaseIcon icon="uil:multiply" size="lg" />
          </button>
        </div>
        <input
          ref="searchInput"
          v-model="inputValue"
          type="text"
          :placeholder="placeholder || $t('search.placeholder')"
          class="focus:outline-none w-full rounded bg-primary-lighter px-4 py-2 text-3xl text-primary-darkest focus:shadow-outline"
          @keydown.enter="$fetch"
        />
        <p class="mt-2 mb-16 text-sm">
          {{ $t('search.info') }}
        </p>
        <ProductPreviews :products="products" :column-count="4" />
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import { mapState } from 'vuex';

export default {
  name: 'TheSearch',

  props: {
    placeholder: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      inputValue: '',
      products: [],
    };
  },

  async fetch() {
    const limit = 24;

    // Set preload data
    this.products = [...Array(4).keys()];

    const products = await this.$swell.products.list({
      search: this.inputValue,
      limit,
      sort: 'popularity asc',
      expand: ['variants'],
      $currency: this.$swell.currency.list().map((currency) => currency.code),
    });

    this.products = products.results;
  },

  computed: {
    ...mapState(['notification', 'cookiesWereAccepted']),
  },

  mounted() {
    this.focusInput();
  },

  methods: {
    focusInput() {
      this.$refs.searchInput.focus();
    },
  },
};
</script>
