<template>
  <div :class="[outerSpacingXClass, outerSpacingYClass]" class="relative overflow-hidden">
    <VisualMedia
      v-if="image"
      :source="image.url"
      :is-background="true"
      :use-parallax="{ enabled: useParallax, speed: -14, minW: 768 }"
    />
    <div
      :style="{ opacity: darkenBg / 100 }"
      class="absolute inset w-full h-full bg-primary-darkest"
    ></div>
    <div :class="innerSpacingClass" class="relative container">
      <div class="max-w-96 py-10 px-8 md:mx-4 md:px-12 md:py-14 bg-primary-lighter rounded">
        <h2 v-balance-text class="mb-3 text-3xl md:text-4xl lg:text-6xl">
          {{ heading }}
        </h2>
        <p v-balance-text class="mb-6">{{ description }}</p>
        <EmailSignupForm />
      </div>
    </div>
  </div>
</template>

<script>
const innerSpacing = {
  none: 'py-6 sm:py-8',
  sm: 'py-12 md:py-14 lg:py-16',
  md: 'py-24 lg:py-28 xl:py-32',
  lg: 'py-32 lg:py-36 xl:py-40'
}

const outerSpacingX = {
  none: 'mx-0',
  sm: 'mx-2 lg:mx-4',
  md: 'mx-6 lg:mx-8',
  lg: 'mx-8 lg:mx-12 xl:mx-16'
}

const outerSpacingY = {
  none: 'my-0',
  sm: 'my-2 lg:my-4',
  md: 'my-6 lg:my-8',
  lg: 'my-8 lg:my-12 xl:my-16'
}

export default {
  name: 'SectionEmailSignup',

  props: {
    heading: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: [Object, String],
      default: () => ({})
    },
    darkenBg: {
      type: Number,
      default: 0
    },
    innerSpacing: {
      type: String,
      default: 'md'
    },
    outerSpacingX: {
      type: String,
      default: 'md'
    },
    outerSpacingY: {
      type: String,
      default: 'lg'
    },
    useParallax: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    innerSpacingClass() {
      return innerSpacing[this.innerSpacing]
    },
    outerSpacingXClass() {
      return outerSpacingX[this.outerSpacingX]
    },
    outerSpacingYClass() {
      return outerSpacingY[this.outerSpacingY]
    }
  }
}
</script>
