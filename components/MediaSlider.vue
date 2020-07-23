<template>
  <div class="relative bg-primary-light">
    <!-- Media -->
    <ClientOnly>
      <VueGlide v-if="media.length" v-model="activeSlide" :options="glideOptions">
        <VueGlideSlide v-for="image in media" :key="image.id">
          <VisualMedia :lazy="false" :source="image" :alt="image.alt" />
        </VueGlideSlide>
      </VueGlide>
    </ClientOnly>

    <!-- Slide indicators -->
    <ul class="absolute flex flex-row justify-center bottom-4 w-full">
      <li
        v-for="index in media.length"
        :key="index"
        class="relative p-2 mb-0"
        @click="setActiveSlide(index - 1)"
      >
        <span
          :class="{
            'bg-primary-lighter': indicatorColor === 'light' && activeSlide === index - 1,
            'bg-primary-darkest': indicatorColor === 'dark' && activeSlide === index - 1,
            'border-primary-lighter': indicatorColor === 'light',
            'border-primary-darkest': indicatorColor === 'dark'
          }"
          class="transition transition-color block w-2 h-2 border rounded-full"
        ></span>
      </li>
    </ul>
  </div>
</template>

<script>
// Helpers
import { Glide, GlideSlide } from 'vue-glide-js'
import 'vue-glide-js/dist/vue-glide.css'

export default {
  name: 'MediaSlider',

  components: {
    [Glide.name]: Glide,
    [GlideSlide.name]: GlideSlide
  },

  props: {
    media: {
      type: Array,
      default: () => []
    },
    indicatorColor: {
      type: String,
      default: 'light'
    }
  },

  data() {
    return {
      activeSlide: 0,
      glideOptions: {
        type: 'carousel',
        perView: 1,
        gap: 0,
        animationTimingFunc: 'cubic-bezier(0.6, 0.2, 0, 1)'
      }
    }
  },

  methods: {
    setActiveSlide(index) {
      this.activeSlide = index
    }
  }
}
</script>
