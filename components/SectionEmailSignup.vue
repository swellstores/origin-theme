<template>
  <section
    :class="[
      {
        'mx-0': outerSpacingX === 'none',
        'mx-2 lg:mx-4': outerSpacingX === 'sm',
        'mx-6 lg:mx-8': outerSpacingX === 'md',
        'mx-8 lg:mx-12 xl:mx-16': outerSpacingX === 'lg'
      },
      {
        'my-0': outerSpacingY === 'none',
        'my-2 lg:my-4': outerSpacingY === 'sm',
        'my-6 lg:my-8': outerSpacingY === 'md',
        'my-8 lg:my-12 xl:my-16': outerSpacingY === 'lg'
      }
    ]"
    class="relative overflow-hidden"
  >
    <VisualMedia
      v-if="image"
      :source="image"
      :is-background="true"
      :use-parallax="{ enabled: useParallax, speed: -14, minW: 768 }"
    />
    <div
      :style="{ opacity: darkenBg / 100 }"
      class="absolute inset w-full h-full bg-primary-darkest"
    ></div>
    <div
      :class="{
        'py-6 sm:py-8': innerSpacing === 'none',
        'py-12 md:py-14 lg:py-16': innerSpacing === 'sm',
        'py-24 lg:py-28 xl:py-32': innerSpacing === 'md',
        'py-32 lg:py-36 xl:py-40': innerSpacing === 'lg'
      }"
      class="relative container"
    >
      <div class="max-w-96 py-10 px-8 md:mx-4 md:px-12 md:py-14 bg-primary-lighter rounded">
        <h2 v-balance-text class="mb-3 text-3xl md:text-4xl lg:text-6xl">
          {{ heading }}
        </h2>
        <p v-balance-text class="mb-6">{{ description }}</p>
        <EmailSignupForm />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionEmailSignup',

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
      default: null
    },
    description: {
      type: String,
      default: null
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
  }
}
</script>
