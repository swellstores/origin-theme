<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="!reviews.length"
    heading="Customer reviews"
    description="No reviews added"
  />

  <section v-else class="relative container my-14 lg:my-16">
    <!-- Reviews -->
    <div class="flex justify-center flex-col ">
      <h2 v-if="heading" class="text-center lg:text-4xl mb-12">{{ heading }}</h2>
      <div
        v-if="currentReview"
        ref="quote"
        class="relative w-full transition-all ease-in-out duration-300"
      >
        <!-- Arrows -->
        <div v-if="reviews.length > 1" class="absolute inset-0 flex items-center justify-between">
          <button
            title="Previous review"
            class="p-2 rounded-full bg-primary-lighter"
            @click.prevent="prevReview"
          >
            <BaseIcon icon="uil:angle-left" size="lg" />
          </button>

          <button
            title="Next review"
            class="p-2 rounded-full bg-primary-lighter"
            @click.prevent="nextReview"
          >
            <BaseIcon icon="uil:angle-right" size="lg" />
          </button>
        </div>
        <!-- Review content -->
        <transition
          enter-active-class="transition-all duration-200 ease-out"
          :enter-class="
            animationDirection === 'left' ? 'opacity-0 translate-x-5' : 'opacity-0 -translate-x-5'
          "
          enter-to-class="opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-class="opacity-100"
          :leave-to-class="
            animationDirection === 'left' ? 'opacity-0 -translate-x-5' : 'opacity-0 translate-x-5'
          "
          mode="out-in"
          @before-enter="setMaxElHeight"
        >
          <div ref="quoteContent" :key="currentReview.id">
            <div
              class="flex justify-center items-center flex-col text-center px-16 md:px-28 lg:px-48"
            >
              <ReviewStars v-if="currentReview.score" :score="currentReview.score" class="mb-4" />
              <p v-balance-text class="mx-auto mb-4 max-w-128">
                {{ currentReview.quote || 'No quote added' }}
              </p>
              <p class="label-sm-faded">
                <span>{{ currentReview.name }}</span
                ><span v-if="currentReview.location">, {{ currentReview.location }}</span>
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
      default: null
    },
    id: {
      type: String,
      default: null
    },
    heading: {
      type: String,
      default: 'What our customers say'
    },
    reviews: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      currentReviewIndex: 0,
      animationDirection: null
    }
  },

  computed: {
    currentReview() {
      return this.reviews[this.currentReviewIndex]
    }
  },

  mounted() {
    this.setMaxElHeight()
  },

  methods: {
    nextReview() {
      const { reviews } = this
      if (reviews) {
        this.animationDirection = 'left'
        this.currentReviewIndex < reviews.length - 1
          ? this.currentReviewIndex++
          : (this.currentReviewIndex = 0)
      }
    },
    prevReview() {
      const { reviews } = this
      if (reviews) {
        this.animationDirection = 'right'
        this.currentReviewIndex > 0
          ? this.currentReviewIndex--
          : (this.currentReviewIndex = reviews.length - 1)
      }
    },
    setMaxElHeight(el) {
      this.$nextTick(() => {
        const container = this.$refs.quote
        const content = this.$refs.quoteContent
        if (content) container.style.height = `${content.offsetHeight}px`
      })
    }
  }
}
</script>
