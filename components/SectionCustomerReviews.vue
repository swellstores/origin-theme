<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="!heading && !reviews.length"
    heading="Customer reviews"
    description="No heading or reviews added"
  />

  <section v-else class="container relative my-14 lg:my-16">
    <!-- Reviews -->
    <div class="flex flex-col justify-center">
      <h2 v-if="heading" class="mb-12 text-center lg:text-4xl">
        {{ heading }}
      </h2>
      <div
        v-if="currentReview"
        ref="quote"
        class="relative w-full transition-all duration-300 ease-in-out"
      >
        <!-- Arrows -->
        <div
          v-if="reviews.length > 1"
          class="absolute inset-0 flex items-center justify-between"
        >
          <button
            title="Previous review"
            class="rounded-full bg-primary-lighter p-2"
            @click.prevent="prevReview"
          >
            <BaseIcon icon="uil:angle-left" size="lg" />
          </button>

          <button
            title="Next review"
            class="rounded-full bg-primary-lighter p-2"
            @click.prevent="nextReview"
          >
            <BaseIcon icon="uil:angle-right" size="lg" />
          </button>
        </div>
        <!-- Review content -->
        <transition
          enter-active-class="transition-all duration-200 ease-out"
          :enter-class="
            animationDirection === 'left'
              ? 'opacity-0 translate-x-5'
              : 'opacity-0 -translate-x-5'
          "
          enter-to-class="opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-class="opacity-100"
          :leave-to-class="
            animationDirection === 'left'
              ? 'opacity-0 -translate-x-5'
              : 'opacity-0 translate-x-5'
          "
          mode="out-in"
          @before-enter="setMaxElHeight"
        >
          <div ref="quoteContent" :key="currentReview.id">
            <div
              class="flex flex-col items-center justify-center px-16 text-center md:px-28 lg:px-48"
            >
              <ReviewStars
                v-if="currentReview.score"
                :score="currentReview.score"
                class="mb-4"
              />
              <p class="mx-auto mb-4 max-w-128 whitespace-pre-line">
                {{ currentReview.quote || 'No quote added' }}
              </p>
              <p class="label-sm-faded">
                <span>{{ currentReview.name }}</span
                ><span v-if="currentReview.location"
                  >, {{ currentReview.location }}</span
                >
              </p>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionCustomerReviews',

  props: {
    type: {
      type: String,
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    heading: {
      type: String,
      default: 'What our customers say',
    },
    reviews: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      currentReviewIndex: 0,
      animationDirection: null,
    };
  },

  computed: {
    currentReview() {
      return this.reviews[this.currentReviewIndex];
    },
  },

  mounted() {
    this.setMaxElHeight();
  },

  methods: {
    nextReview() {
      const { reviews } = this;
      if (reviews) {
        this.animationDirection = 'left';
        this.currentReviewIndex < reviews.length - 1
          ? this.currentReviewIndex++
          : (this.currentReviewIndex = 0);
      }
    },
    prevReview() {
      const { reviews } = this;
      if (reviews) {
        this.animationDirection = 'right';
        this.currentReviewIndex > 0
          ? this.currentReviewIndex--
          : (this.currentReviewIndex = reviews.length - 1);
      }
    },
    setMaxElHeight(el) {
      this.$nextTick(() => {
        const container = this.$refs.quote;
        const content = this.$refs.quoteContent;
        if (content) container.style.height = `${content.offsetHeight}px`;
      });
    },
  },
};
</script>
