<template>
  <section class="relative mx-6 my-14 lg:mx-8 lg:my-16">
    <!-- Arrows -->
    <div class="absolute inset-x-0 bottom-0 md:inset-0 flex items-center justify-between">
      <button href="#" title="Previous review" class="rounded-full" @click.prevent="prevReview">
        <svg class="w-12 h-12 rotate-180">
          <use xlink:href="#arrow-angle" />
        </svg>
      </button>

      <button title="Next review" class="rounded-full" @click.prevent="nextReview">
        <svg class="w-12 h-12">
          <use xlink:href="#arrow-angle" />
        </svg>
      </button>
    </div>

    <!-- Reviews -->
    <div class="flex justify-center flex-col px-8 md:px-28 lg:px-48">
      <h2 class="text-center lg:text-4xl mb-14">{{ heading }}</h2>

      <div v-if="currentReview" ref="quote" class="transition-all ease-in-out duration-300">
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
          <div ref="quoteContent" :key="currentReview.quote">
            <div class="flex justify-center items-center flex-col">
              <ReviewStars :score="currentReview.score" />
              <p v-balance-text class="mx-auto text-center pt-6 pb-4 max-w-128">
                {{ currentReview.quote }}
              </p>
              <span class="label-sm-faded text-center"
                >{{ currentReview.name }}, {{ currentReview.location }}</span
              >
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
    heading: {
      type: String,
      default: 'Place heading here.'
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
      const { reviews } = this
      return reviews && reviews[this.currentReviewIndex]
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
