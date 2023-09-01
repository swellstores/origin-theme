<template>
  <section class="relative flex flex-wrap">
    <template v-if="slider && reviews.length > columnCount">
      <VueGlide
        type="slider"
        :per-view="columnCount"
        :options="glideOptions"
        @glide:run-start="sliderAtStart = true"
        @glide:run-end="sliderAtEnd = true"
        @glide:run="
          () => {
            (sliderAtStart = false), (sliderAtEnd = false);
          }
        "
      >
        <VueGlideSlide v-for="review in reviews" :key="review.id" class="">
          <ProductReview :review="review" />
        </VueGlideSlide>

        <template slot="control">
          <button
            ref="prevSlide"
            class="invisible absolute h-0 w-0"
            data-glide-dir="<"
          />

          <button
            ref="nextSlide"
            class="invisible absolute h-0 w-0"
            data-glide-dir=">"
          />
        </template>
      </VueGlide>

      <!-- Slider controls -->
      <div class="">
        <!-- Previous slide -->

        <button
          v-show="!sliderAtStart"
          class="pointer-events-auto absolute left-[-1.5rem] top-1/2 ml-3 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full"
          @click="prevSlide"
        >
          <BaseIcon icon="uil:arrow-left" />
        </button>

        <!-- Next slide -->

        <button
          v-show="!sliderAtEnd"
          class="pointer-events-auto absolute right-[-1.5rem] top-1/2 mr-3 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full"
          @click="nextSlide"
        >
          <BaseIcon icon="uil:arrow-right" />
        </button>
      </div>
    </template>

    <template v-else>
      <div class="flex gap-3">
        <ProductReview
          v-for="review in reviews"
          :key="review.id"
          :class="[
            { 'w-1/2': columnCount === 2 },
            { 'w-1/2 md:w-1/3': columnCount === 3 },
            { 'w-1/2 md:w-1/4': columnCount === 4 },
            { 'w-1/2 md:w-1/5': columnCount === 5 },
          ]"
          :review="review"
        />
      </div>
    </template>
  </section>
</template>

<script>
// Helpers
import 'vue-glide-js/dist/vue-glide.css';
import { dateTimeFormatter } from '~/utils/formatters';

export default {
  name: 'ProductPreviews',

  components: {
    async VueGlide() {
      const { Glide } = await import('vue-glide-js');
      return Glide;
    },
    async VueGlideSlide() {
      const { GlideSlide } = await import('vue-glide-js');
      return GlideSlide;
    },
  },

  props: {
    reviews: {
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
  },

  data() {
    return {
      sliderAtStart: true,
      sliderAtEnd: false,
      aspectRatio: '1:1',
      ratioPadding: null,
      globalAlignment: 'left',
      glideOptions: {
        bound: true,
        gap: 24,
        keyboard: false,
        rewind: false,
        swipeThreshold: false,
        dragThreshold: false,
        animationTimingFunc: 'cubic-bezier(0.6, 0.2, 0, 1)',
        breakpoints: {
          768: {
            perView: 2,
            gap: 48,
          },
          1024: {
            gap: 60,
          },
        },
      },
    };
  },

  methods: {
    prevSlide() {
      if (!this.$refs.prevSlide) return;
      this.$refs.prevSlide.click();
    },

    nextSlide() {
      if (!this.$refs.nextSlide) return;
      this.$refs.nextSlide.click();
    },

    reviewDate(date) {
      if (!process.client || !date) return;

      return dateTimeFormatter({
        date: new Date(date),
        locale: navigator.language,
        options: {
          year: undefined,
          month: 'long', // Change to 'short' for abbreviated month name
          day: '2-digit',
          hour: undefined,
          minute: undefined,
        },
      });
    },
  },
};
</script>
