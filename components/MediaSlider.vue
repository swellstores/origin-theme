<template>
  <div class="relative bg-primary-light">
    <!-- Media -->
    <ClientOnly>
      <VueGlide
        v-if="media.length"
        v-model="activeSlide"
        :options="glideOptions"
      >
        <VueGlideSlide v-for="image in media" :key="image.id">
          <VisualMedia :lazy="false" :source="image" :alt="image.alt" />
        </VueGlideSlide>
      </VueGlide>
    </ClientOnly>

    <!-- Slide indicators -->
    <ul class="absolute bottom-4 flex w-full flex-row justify-center">
      <li
        v-for="index in media.length"
        :key="index"
        class="relative mb-0 p-2"
        @click="setActiveSlide(index - 1)"
      >
        <span
          :class="{
            'bg-primary-lighter':
              indicatorColor === 'light' && activeSlide === index - 1,
            'bg-primary-darkest':
              indicatorColor === 'dark' && activeSlide === index - 1,
            'border-primary-lighter': indicatorColor === 'light',
            'border-primary-darkest': indicatorColor === 'dark',
          }"
          class="transition-color block h-2 w-2 rounded-full border transition"
        />
      </li>
    </ul>
  </div>
</template>

<script>
// Helpers
import 'vue-glide-js/dist/vue-glide.css'

export default {
  name: 'MediaSlider',

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
    media: {
      type: Array,
      default: () => [],
    },
    indicatorColor: {
      type: String,
      default: 'light',
    },
  },

  data() {
    return {
      activeSlide: -1, // setting to -1, allows for first slide to be initial
      glideOptions: {
        type: 'carousel',
        perView: 1,
        gap: 0,
        animationTimingFunc: 'cubic-bezier(0.6, 0.2, 0, 1)',
      },
    }
  },

  methods: {
    setActiveSlide(index) {
      this.activeSlide = index
    },
  },
}
</script>
