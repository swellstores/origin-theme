<template>
  <section class="relative flex flex-wrap sm:-mx-2 xl:-mx-3">
    <template v-if="slider && products.length > columnCount">
      <VueGlide
        type="slider"
        :per-view="columnCount"
        :options="glideOptions"
        @glide:run-start="sliderAtStart = true"
        @glide:run-end="sliderAtEnd = true"
        @glide:run="
          () => {
            ;(sliderAtStart = false), (sliderAtEnd = false)
          }
        "
      >
        <VueGlideSlide v-for="product in products" :key="product.id">
          <ProductThumb :product="product" />
        </VueGlideSlide>

        <template slot="control">
          <button
            ref="prevSlide"
            class="absolute w-0 h-0 invisible"
            data-glide-dir="<"
          />

          <button
            ref="nextSlide"
            class="absolute w-0 h-0 invisible"
            data-glide-dir=">"
          />
        </template>
      </VueGlide>

      <!-- Slider controls -->
      <div class="w-full absolute">
        <!-- Previous slide -->
        <div
          class="absolute top-0 left-0 px-1 sm:px-2 xl:px-3 pointer-events-none"
          :class="[
            { 'w-1/2': columnCount === 2 },
            { 'w-1/2 md:w-1/3': columnCount === 3 },
            { 'w-1/2 md:w-1/4': columnCount === 4 },
            { 'w-1/2 md:w-1/5': columnCount === 5 },
          ]"
        >
          <span class="w-full block" :style="{ paddingBottom: ratioPadding }" />
          <button
            v-show="!sliderAtStart"
            class="
              absolute
              top-1/2
              left-0
              ml-3
              rounded-full
              shadow-md
              w-10
              h-10
              transform
              -translate-x-1/2 -translate-y-1/2
              bg-primary-lightest
              flex
              items-center
              justify-center
              pointer-events-auto
            "
            @click="prevSlide"
          >
            <BaseIcon icon="uil:angle-left" />
          </button>
        </div>

        <!-- Next slide -->
        <div
          class="
            absolute
            top-0
            right-0
            px-1
            sm:px-2
            xl:px-3
            pointer-events-none
          "
          :class="[
            { 'w-1/2': columnCount === 2 },
            { 'w-1/2 md:w-1/3': columnCount === 3 },
            { 'w-1/2 md:w-1/4': columnCount === 4 },
            { 'w-1/2 md:w-1/5': columnCount === 5 },
          ]"
        >
          <span class="w-full block" :style="{ paddingBottom: ratioPadding }" />
          <button
            v-show="!sliderAtEnd"
            class="
              absolute
              top-1/2
              right-0
              mr-3
              rounded-full
              shadow-md
              w-10
              h-10
              transform
              translate-x-1/2
              -translate-y-1/2
              bg-primary-lightest
              flex
              items-center
              justify-center
              pointer-events-auto
            "
            @click="nextSlide"
          >
            <BaseIcon icon="uil:angle-right" />
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <ProductThumb
        v-for="product in products"
        :key="product.id"
        :class="[
          { 'w-1/2': columnCount === 2 },
          { 'w-1/2 md:w-1/3': columnCount === 3 },
          { 'w-1/2 md:w-1/4': columnCount === 4 },
          { 'w-1/2 md:w-1/5': columnCount === 5 },
        ]"
        :product="product"
        :show-price="showPrice"
      />
    </template>
  </section>
</template>

<script>
// Helpers
import 'vue-glide-js/dist/vue-glide.css'

export default {
  name: 'ProductPreviews',

  components: {
    async VueGlide() {
      const { Glide } = await import('vue-glide-js')
      return Glide
    },
    async VueGlideSlide() {
      const { GlideSlide } = await import('vue-glide-js')
      return GlideSlide
    },
  },

  props: {
    products: {
      type: Array,
      default: () => [],
    },
    columnCount: {
      type: Number,
      default: 4,
    },
    slider: {
      type: Boolean,
      default: false,
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
      sliderAtStart: true,
      sliderAtEnd: false,
      aspectRatio: '1:1',
      ratioPadding: null,
      glideOptions: {
        bound: true,
        gap: 0,
        keyboard: false,
        rewind: false,
        swipeThreshold: false,
        dragThreshold: false,
        animationTimingFunc: 'cubic-bezier(0.6, 0.2, 0, 1)',
        breakpoints: {
          768: {
            perView: 2,
          },
        },
      },
    }
  },

  async fetch() {
    const { $swell } = this
    this.aspectRatio = await $swell.settings.get(
      'productPreviews.aspectRatio',
      '1:1'
    )
    this.quickAddIsEnabled = await $swell.settings.get(
      'productList.enableQuickAdd'
    )

    // Set ratio padding
    const [x, y] = this.aspectRatio.split(':')
    this.ratioPadding = `${(y / x) * 100}%`
  },

  methods: {
    prevSlide() {
      if (!this.$refs.prevSlide) return
      this.$refs.prevSlide.click()
    },

    nextSlide() {
      if (!this.$refs.nextSlide) return
      this.$refs.nextSlide.click()
    },
  },
}
</script>
